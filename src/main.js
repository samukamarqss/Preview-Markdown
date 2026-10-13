import '@fontsource-variable/inter';
import './style.css';
import { renderMarkdown, validateFile, countStats, SAMPLE } from './markdown.js';
import { createStorage } from './storage.js';
import {
  BUILTIN_THEMES, DEFAULT_THEME_ID, FONTS, THEME_FIELDS,
  themeToCssVars, normalizeCustomTheme, contrastRatio,
} from './themes.js';

const $ = (sel) => document.querySelector(sel);
const store = createStorage();

const state = {
  content: store.get('content', null) ?? SAMPLE,
  fileName: store.get('fileName', ''),
  themeId: store.get('themeId', DEFAULT_THEME_ID),
  view: store.get('view', 'split'),
  customThemes: (store.get('customThemes', []) || []).map((t) => normalizeCustomTheme(t)).filter(Boolean),
};

const els = {
  editor: $('#editor'),
  preview: $('#preview'),
  previewScroll: $('#preview-scroll'),
  workspace: $('#workspace'),
  fileName: $('#file-name'),
  fileInput: $('#file-input'),
  stats: $('#stats'),
  persist: $('#persist-badge'),
  themeName: $('#theme-name'),
  themeDot: $('#theme-dot'),
  themeDialog: $('#theme-dialog'),
  editorDialog: $('#editor-dialog'),
  themeForm: $('#theme-form'),
  toasts: $('#toasts'),
  overlay: $('#drop-overlay'),
};

/* ---------- Utilidades ---------- */

function allThemes() {
  return [...BUILTIN_THEMES, ...state.customThemes];
}

function findTheme(id) {
  return allThemes().find((t) => t.id === id) || BUILTIN_THEMES[0];
}

function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = message;
  els.toasts.append(el);
  setTimeout(() => el.remove(), type === 'error' ? 6000 : 3200);
}

function applyVars(target, theme) {
  for (const [k, v] of Object.entries(themeToCssVars(theme))) target.style.setProperty(k, v);
}

function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

/* ---------- Editor e prévia ---------- */

function render() {
  const text = els.editor.value;
  els.preview.innerHTML = text.trim()
    ? renderMarkdown(text)
    : '<p class="empty-state">A prévia aparecerá aqui. Cole Markdown no editor ou arraste um arquivo <strong>.md</strong>.</p>';
  const { words, chars, minutes } = countStats(text);
  els.stats.textContent = `${words.toLocaleString('pt-BR')} palavras · ${chars.toLocaleString('pt-BR')} caracteres · ~${minutes} min`;
}

const saveContent = debounce(() => store.set('content', els.editor.value), 300);

function setContent(text, fileName = '') {
  els.editor.value = text;
  state.fileName = fileName;
  store.set('content', text);
  store.set('fileName', fileName);
  updateFileName();
  render();
}

function updateFileName() {
  els.fileName.textContent = state.fileName || 'Documento sem título';
  els.fileName.classList.toggle('has-file', Boolean(state.fileName));
}

let renderQueued = false;
els.editor.addEventListener('input', () => {
  if (!renderQueued) {
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; render(); });
  }
  saveContent();
});

// Tab insere indentação; Esc libera o foco para quem navega por teclado.
els.editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    const { selectionStart: s, selectionEnd: end } = els.editor;
    els.editor.setRangeText('  ', s, end, 'end');
    els.editor.dispatchEvent(new Event('input'));
  } else if (e.key === 'Escape') {
    els.previewScroll.focus();
  }
});

/* ---------- Arquivos ---------- */

async function openFile(file) {
  const error = validateFile(file);
  if (error) return toast(error, 'error');
  try {
    const text = await file.text();
    if (!text.trim()) return toast(`“${file.name}” não tem conteúdo para exibir.`, 'error');
    if (text.includes('\u0000')) return toast(`“${file.name}” parece ser um arquivo binário.`, 'error');
    setContent(text, file.name);
    toast(`“${file.name}” aberto.`);
  } catch {
    toast(`Não foi possível ler “${file.name}”.`, 'error');
  }
}

$('#open-btn').addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', () => {
  const [file] = els.fileInput.files;
  if (file) openFile(file);
  els.fileInput.value = '';
});
els.fileInput.addEventListener('change', () => setTimeout(celebrate, 50));

let dragDepth = 0;
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
const dropSub = $('#drop-sub');
const BAD_TYPES = /^(image|video|audio|application\/(pdf|zip|vnd))/;

// Durante o arraste o navegador só expõe o tipo MIME (não o nome); usamos isso para um aviso antecipado.
function dragVerdict(e) {
  const items = [...(e.dataTransfer?.items || [])].filter((i) => i.kind === 'file');
  if (items.length > 1) return { ok: true, text: `${items.length} arquivos — o primeiro será aberto` };
  if (items[0] && BAD_TYPES.test(items[0].type)) return { ok: false, text: 'Esse tipo de arquivo não é Markdown' };
  return { ok: true, text: 'Arquivos .md, .markdown ou .txt' };
}

function hideOverlay(success = false) {
  dragDepth = 0;
  els.overlay.classList.toggle('dropped', success);
  els.overlay.classList.remove('active', 'invalid');
  setTimeout(() => els.overlay.classList.remove('dropped'), 600);
}

window.addEventListener('dragenter', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  if (dragDepth++ === 0) {
    const v = dragVerdict(e);
    dropSub.textContent = v.text;
    els.overlay.classList.toggle('invalid', !v.ok);
    els.overlay.classList.add('active');
  }
});
window.addEventListener('dragover', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = els.overlay.classList.contains('invalid') ? 'none' : 'copy';
  // Brilho que segue o cursor.
  els.overlay.style.setProperty('--mx', `${e.clientX}px`);
  els.overlay.style.setProperty('--my', `${e.clientY}px`);
});
window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) hideOverlay();
});
window.addEventListener('drop', async (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  const files = [...e.dataTransfer.files];
  const ok = !validateFile(files[0]);
  hideOverlay(ok);
  if (files.length > 1) toast('Apenas o primeiro arquivo foi aberto.');
  await openFile(files[0]);
  if (ok) celebrate();
});

function celebrate() {
  const target = els.workspace.dataset.view === 'editor' ? els.editor : els.preview;
  target.classList.remove('just-loaded');
  void target.offsetWidth;
  target.classList.add('just-loaded');
}

$('#clear-btn').addEventListener('click', () => {
  if (els.editor.value.trim() && !confirm('Limpar todo o conteúdo do editor?')) return;
  setContent('');
  els.editor.focus();
});

$('#sample-btn').addEventListener('click', () => {
  if (els.editor.value.trim() && els.editor.value !== SAMPLE && !confirm('Substituir o conteúdo atual pelo exemplo?')) return;
  setContent(SAMPLE);
});

/* ---------- Modo de visualização ---------- */

const viewButtons = [...document.querySelectorAll('[data-view]')].filter((b) => b.tagName === 'BUTTON');

const VIEW_NAMES = { editor: 'Somente editor', split: 'Dividido', preview: 'Somente prévia' };
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const segmented = document.querySelector('.segmented');

function moveIndicator() {
  const active = viewButtons.find((b) => b.dataset.view === state.view);
  if (!active) return;
  segmented.style.setProperty('--seg-x', `${active.offsetLeft}px`);
  segmented.style.setProperty('--seg-w', `${active.offsetWidth}px`);
}

function setView(view, { animate = false } = {}) {
  if (!['editor', 'split', 'preview'].includes(view)) view = 'split';
  const prev = state.view;
  const apply = () => {
    state.view = view;
    els.workspace.dataset.view = view;
    viewButtons.forEach((b) => {
      const on = b.dataset.view === view;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    moveIndicator();
  };
  store.set('view', view);
  if (!animate || prev === view || reducedMotion()) return apply();

  // Direção da animação: editor ← dividido → prévia.
  const order = { editor: 0, split: 1, preview: 2 };
  els.workspace.dataset.dir = order[view] > order[prev] ? 'forward' : 'back';
  $('#announcer').textContent = `Modo de visualização: ${VIEW_NAMES[view]}`;
  if (document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    apply();
    els.workspace.classList.remove('view-anim');
    void els.workspace.offsetWidth;
    els.workspace.classList.add('view-anim');
  }
}

window.addEventListener('resize', debounce(moveIndicator, 100));
document.fonts?.ready.then(moveIndicator);

viewButtons.forEach((b, i) => {
  b.addEventListener('click', () => setView(b.dataset.view, { animate: true }));
  b.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const next = viewButtons[(i + dir + viewButtons.length) % viewButtons.length];
    setView(next.dataset.view, { animate: true });
    next.focus();
  });
});

const VIEW_ORDER = ['split', 'editor', 'preview'];
window.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    els.fileInput.click();
  } else if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    setView(VIEW_ORDER[(VIEW_ORDER.indexOf(state.view) + 1) % VIEW_ORDER.length], { animate: true });
  }
});

/* ---------- Temas ---------- */

function applyTheme(id) {
  const theme = findTheme(id);
  state.themeId = theme.id;
  applyVars(document.documentElement, theme);
  els.themeName.textContent = theme.name;
  els.themeDot.style.background = `linear-gradient(135deg, ${theme.contentBg} 50%, ${theme.link} 50%)`;
  store.set('themeId', theme.id);
  document.querySelectorAll('.theme-card').forEach((c) => {
    c.setAttribute('aria-checked', String(c.dataset.id === theme.id));
  });
}

function swatchHTML(theme) {
  const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `
    <span class="swatch" style="background:${theme.contentBg};color:${theme.text};font-family:${esc(themeToCssVars(theme)['--md-body-font'])}">
      <span class="sw-title" style="color:${theme.heading};font-family:${esc(themeToCssVars(theme)['--md-heading-font'])}">Aa Título</span>
      <span class="sw-line" style="background:${theme.text};width:85%"></span>
      <span class="sw-line" style="background:${theme.link};width:45%;opacity:1"></span>
      <span class="sw-code" style="background:${theme.codeBg};border-color:${theme.codeBorder}"></span>
      <span class="sw-palette" aria-hidden="true">
        <i style="background:${theme.pageBg}"></i><i style="background:${theme.link}"></i><i style="background:${theme.quoteBorder}"></i>
      </span>
    </span>`;
}

function themeCard(theme) {
  const card = document.createElement('div');
  card.className = 'theme-card';
  card.dataset.id = theme.id;
  card.setAttribute('aria-checked', String(theme.id === state.themeId));

  const pick = document.createElement('button');
  pick.type = 'button';
  pick.className = 'pick';
  pick.setAttribute('role', 'radio');
  pick.setAttribute('aria-checked', String(theme.id === state.themeId));
  pick.innerHTML = swatchHTML(theme);
  const meta = document.createElement('span');
  meta.className = 'card-meta';
  const name = document.createElement('span');
  name.textContent = theme.name;
  meta.append(name);
  meta.insertAdjacentHTML('beforeend', '<span class="check">✓ Ativo</span>');
  pick.append(meta);
  pick.addEventListener('click', () => {
    const go = () => { applyTheme(theme.id); refreshGridChecks(); };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(go);
    } else go();
  });
  card.append(pick);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const mk = (label, cls, fn, aria) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn btn-sm ${cls}`;
    b.textContent = label;
    b.setAttribute('aria-label', `${aria} ${theme.name}`);
    b.addEventListener('click', fn);
    actions.append(b);
  };
  mk('Duplicar', '', () => duplicateTheme(theme), 'Duplicar tema');
  if (!theme.builtin) {
    mk('Editar', '', () => openCreator(theme), 'Editar tema');
    mk('Excluir', 'btn-danger', () => deleteTheme(theme), 'Excluir tema');
  }
  card.append(actions);
  return card;
}

function refreshGridChecks() {
  document.querySelectorAll('.theme-card').forEach((c) => {
    const on = c.dataset.id === state.themeId;
    c.setAttribute('aria-checked', String(on));
    c.querySelector('.pick').setAttribute('aria-checked', String(on));
  });
}

function renderThemeGrids() {
  const builtin = $('#builtin-grid');
  const custom = $('#custom-grid');
  builtin.replaceChildren(...BUILTIN_THEMES.map(themeCard));
  custom.replaceChildren(...state.customThemes.map(themeCard));
  $('#custom-empty').hidden = state.customThemes.length > 0;
  document.querySelectorAll('.theme-card').forEach((c, i) => c.style.setProperty('--i', i));
}

function saveCustomThemes() {
  store.set('customThemes', state.customThemes.map(({ builtin, ...rest }) => rest));
}

function uid() {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function uniqueName(base) {
  const names = new Set(allThemes().map((t) => t.name));
  if (!names.has(base)) return base;
  let i = 2;
  while (names.has(`${base} ${i}`)) i++;
  return `${base} ${i}`;
}

function duplicateTheme(theme) {
  const copy = normalizeCustomTheme({ ...theme, id: uid(), name: uniqueName(`${theme.name} (cópia)`) }, theme);
  state.customThemes.push(copy);
  saveCustomThemes();
  renderThemeGrids();
  toast(`Tema “${copy.name}” criado.`);
}

function deleteTheme(theme) {
  if (theme.builtin) return;
  if (!confirm(`Excluir o tema “${theme.name}”? Esta ação não pode ser desfeita.`)) return;
  state.customThemes = state.customThemes.filter((t) => t.id !== theme.id);
  saveCustomThemes();
  if (state.themeId === theme.id) applyTheme(DEFAULT_THEME_ID);
  renderThemeGrids();
  toast(`Tema “${theme.name}” excluído.`);
}

$('#theme-btn').addEventListener('click', () => {
  renderThemeGrids();
  els.themeDialog.showModal();
  els.themeDialog.querySelector('.pick[aria-checked="true"]')?.focus();
});

$('#create-theme-btn').addEventListener('click', () => openCreator(null));

document.querySelectorAll('[data-close]').forEach((b) => {
  b.addEventListener('click', () => b.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach((d) => {
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
});

/* ---------- Criador de temas ---------- */

const form = els.themeForm;
let editingId = null;
let draft = null;

function buildCreatorFields() {
  const groups = {};
  for (const f of THEME_FIELDS) (groups[f.group] ||= []).push(f);
  const container = $('#color-fields');
  container.innerHTML = '';
  for (const [group, fields] of Object.entries(groups)) {
    const fs = document.createElement('fieldset');
    fs.className = 'group';
    fs.innerHTML = `<legend>${group}</legend>`;
    for (const f of fields) {
      const row = document.createElement('div');
      row.className = 'color-row';
      row.innerHTML = `
        <label for="c-${f.key}">${f.label}</label>
        <span class="color-inputs">
          <input type="color" id="c-${f.key}" name="${f.key}" />
          <input type="text" name="${f.key}Hex" aria-label="${f.label} (hexadecimal)" maxlength="7" spellcheck="false" />
        </span>`;
      fs.append(row);
    }
    container.append(fs);
  }
  form.querySelectorAll('[data-font]').forEach((sel) => {
    sel.innerHTML = Object.entries(FONTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  });
  $('#base-select').innerHTML = BUILTIN_THEMES.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
}

function fillForm(theme) {
  for (const f of THEME_FIELDS) {
    form.elements[f.key].value = theme[f.key];
    form.elements[`${f.key}Hex`].value = theme[f.key];
    form.elements[`${f.key}Hex`].removeAttribute('aria-invalid');
  }
  form.elements.bodyFont.value = theme.bodyFont;
  form.elements.headingFont.value = theme.headingFont;
  form.elements.fontSize.value = theme.fontSize;
  form.elements.lineHeight.value = theme.lineHeight;
  form.elements.codeRadius.value = theme.codeRadius;
  updateOutputs();
}

function readForm() {
  const t = { ...draft };
  for (const f of THEME_FIELDS) t[f.key] = form.elements[f.key].value;
  t.name = form.elements.name.value;
  t.bodyFont = form.elements.bodyFont.value;
  t.headingFont = form.elements.headingFont.value;
  t.fontSize = Number(form.elements.fontSize.value);
  t.lineHeight = Number(form.elements.lineHeight.value);
  t.codeRadius = Number(form.elements.codeRadius.value);
  return t;
}

function updateOutputs() {
  form.elements.fontSizeOut.value = `${form.elements.fontSize.value}px`;
  form.elements.lineHeightOut.value = Number(form.elements.lineHeight.value).toFixed(2);
  form.elements.codeRadiusOut.value = `${form.elements.codeRadius.value}px`;
}

function updateCreatorPreview() {
  draft = readForm();
  applyVars($('#sample-page'), draft);
  updateOutputs();
  const ratio = contrastRatio(draft.text, draft.contentBg);
  const note = $('#contrast-note');
  note.textContent = `Contraste texto/fundo: ${ratio.toFixed(1)}:1 ${ratio >= 4.5 ? '✓ adequado' : '— abaixo do recomendado (4,5:1)'}`;
  note.classList.toggle('warn', ratio < 4.5);
}

function openCreator(theme) {
  editingId = theme && !theme.builtin ? theme.id : null;
  const source = theme || findTheme(state.themeId);
  draft = { ...source };
  $('#editor-dialog-title').textContent = editingId ? `Editar “${theme.name}”` : 'Criar tema';
  $('#save-theme-btn').textContent = editingId ? 'Salvar alterações' : 'Salvar tema';
  form.elements.name.value = editingId ? theme.name : uniqueName(source.builtin ? `${source.name} personalizado` : source.name);
  form.elements.base.closest('.field').hidden = Boolean(editingId);
  form.elements.base.value = source.builtin ? source.id : BUILTIN_THEMES[0].id;
  fillForm(source);
  $('#sample-md').innerHTML = renderMarkdown(SAMPLE);
  updateCreatorPreview();
  els.editorDialog.showModal();
  form.elements.name.focus();
  form.elements.name.select();
}

form.addEventListener('input', (e) => {
  const el = e.target;
  if (el.name === 'base') return;
  if (el.name?.endsWith('Hex')) {
    const key = el.name.slice(0, -3);
    let v = el.value.trim();
    if (!v.startsWith('#')) v = `#${v}`;
    const ok = /^#[0-9a-f]{6}$/i.test(v);
    el.setAttribute('aria-invalid', String(!ok));
    if (ok) form.elements[key].value = v.toLowerCase();
    else return;
  } else if (el.type === 'color') {
    form.elements[`${el.name}Hex`].value = el.value;
    form.elements[`${el.name}Hex`].removeAttribute('aria-invalid');
  }
  updateCreatorPreview();
});

form.elements.base.addEventListener('change', () => {
  fillForm(findTheme(form.elements.base.value));
  updateCreatorPreview();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = readForm();
  if (!data.name.trim()) {
    form.elements.name.setAttribute('aria-invalid', 'true');
    form.elements.name.focus();
    return toast('Dê um nome ao tema antes de salvar.', 'error');
  }
  form.elements.name.removeAttribute('aria-invalid');
  const id = editingId || uid();
  const theme = normalizeCustomTheme({ ...data, id }, data);
  if (editingId) {
    state.customThemes = state.customThemes.map((t) => (t.id === id ? theme : t));
  } else {
    state.customThemes.push(theme);
  }
  saveCustomThemes();
  applyTheme(id);
  renderThemeGrids();
  els.editorDialog.close();
  toast(editingId ? `Tema “${theme.name}” atualizado.` : `Tema “${theme.name}” salvo e aplicado.`);
});

/* ---------- Inicialização ---------- */

buildCreatorFields();
els.editor.value = state.content;
updateFileName();
setView(state.view);
applyTheme(state.themeId);
render();

els.persist.textContent = store.persistent ? '● Salvo neste navegador' : '○ Sem salvamento local nesta sessão';
els.persist.title = store.persistent
  ? 'Conteúdo, tema e preferências ficam guardados no localStorage deste navegador.'
  : 'O armazenamento local não está disponível; as alterações valem só enquanto a página estiver aberta.';
