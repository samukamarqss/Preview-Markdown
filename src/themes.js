// Temas da prévia. Cada tema é um conjunto de tokens aplicados como variáveis CSS.

export const FONTS = {
  sans: { label: 'SF Pro (Apple)', stack: '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter Variable", system-ui, "Segoe UI", sans-serif' },
  humanist: { label: 'Humanista', stack: '"Segoe UI", "Gill Sans", "Trebuchet MS", Calibri, sans-serif' },
  serif: { label: 'Serifada clássica', stack: 'Georgia, Cambria, "Times New Roman", serif' },
  bookish: { label: 'Livro', stack: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif' },
  mono: { label: 'Monoespaçada', stack: 'ui-monospace, "Cascadia Code", "SF Mono", Consolas, "Liberation Mono", monospace' },
  rounded: { label: 'SF Pro Rounded', stack: 'ui-rounded, "SF Pro Rounded", "Inter Variable", "Segoe UI", system-ui, sans-serif' },
  condensed: { label: 'Condensada', stack: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif' },
};

export const THEME_FIELDS = [
  { key: 'pageBg', label: 'Fundo da página', type: 'color', group: 'Fundo' },
  { key: 'contentBg', label: 'Fundo do conteúdo', type: 'color', group: 'Fundo' },
  { key: 'text', label: 'Texto principal', type: 'color', group: 'Texto' },
  { key: 'muted', label: 'Texto secundário', type: 'color', group: 'Texto' },
  { key: 'heading', label: 'Títulos', type: 'color', group: 'Texto' },
  { key: 'link', label: 'Links', type: 'color', group: 'Texto' },
  { key: 'codeBg', label: 'Fundo do código', type: 'color', group: 'Código' },
  { key: 'codeText', label: 'Texto do código', type: 'color', group: 'Código' },
  { key: 'codeBorder', label: 'Borda do código', type: 'color', group: 'Código' },
  { key: 'quoteBg', label: 'Fundo da citação', type: 'color', group: 'Citações e tabelas' },
  { key: 'quoteBorder', label: 'Barra da citação', type: 'color', group: 'Citações e tabelas' },
  { key: 'tableHeaderBg', label: 'Cabeçalho da tabela', type: 'color', group: 'Citações e tabelas' },
  { key: 'tableBorder', label: 'Bordas da tabela', type: 'color', group: 'Citações e tabelas' },
];

const base = {
  bodyFont: 'sans',
  headingFont: 'sans',
  fontSize: 16,
  lineHeight: 1.7,
  codeRadius: 8,
};

const t = (id, name, tokens) => ({ id, name, builtin: true, ...base, ...tokens });

export const BUILTIN_THEMES = [
  t('claro', 'Claro minimalista', {
    pageBg: '#f4f5f7', contentBg: '#ffffff', text: '#24292f', muted: '#6b7280', heading: '#111827', link: '#2563eb',
    codeBg: '#f3f4f6', codeText: '#1f2937', codeBorder: '#e5e7eb', quoteBg: '#f9fafb', quoteBorder: '#d1d5db',
    tableHeaderBg: '#f3f4f6', tableBorder: '#e5e7eb',
  }),
  t('escuro', 'Escuro elegante', {
    pageBg: '#0f1115', contentBg: '#171a21', text: '#d6d9e0', muted: '#8b93a7', heading: '#f5f6f8', link: '#8ab4ff',
    codeBg: '#0f1218', codeText: '#e6e9ef', codeBorder: '#2a2f3a', quoteBg: '#1d212a', quoteBorder: '#c9a86a',
    tableHeaderBg: '#20242e', tableBorder: '#2d3240', headingFont: 'serif',
  }),
  t('github-claro', 'GitHub claro', {
    pageBg: '#f6f8fa', contentBg: '#ffffff', text: '#1f2328', muted: '#59636e', heading: '#1f2328', link: '#0969da',
    codeBg: '#f6f8fa', codeText: '#1f2328', codeBorder: '#d1d9e0', quoteBg: '#ffffff', quoteBorder: '#d1d9e0',
    tableHeaderBg: '#f6f8fa', tableBorder: '#d1d9e0', lineHeight: 1.5, codeRadius: 6,
  }),
  t('github-escuro', 'GitHub escuro', {
    pageBg: '#010409', contentBg: '#0d1117', text: '#e6edf3', muted: '#9198a1', heading: '#f0f6fc', link: '#4493f8',
    codeBg: '#151b23', codeText: '#e6edf3', codeBorder: '#3d444d', quoteBg: '#0d1117', quoteBorder: '#3d444d',
    tableHeaderBg: '#151b23', tableBorder: '#3d444d', lineHeight: 1.5, codeRadius: 6,
  }),
  t('nord', 'Nord', {
    pageBg: '#242933', contentBg: '#2e3440', text: '#d8dee9', muted: '#a3abbb', heading: '#eceff4', link: '#88c0d0',
    codeBg: '#3b4252', codeText: '#a3be8c', codeBorder: '#434c5e', quoteBg: '#353c4a', quoteBorder: '#81a1c1',
    tableHeaderBg: '#3b4252', tableBorder: '#4c566a', bodyFont: 'humanist', headingFont: 'humanist',
  }),
  t('solarized-claro', 'Solarized claro', {
    pageBg: '#eee8d5', contentBg: '#fdf6e3', text: '#586e75', muted: '#7b8a8b', heading: '#073642', link: '#268bd2',
    codeBg: '#eee8d5', codeText: '#b03a2e', codeBorder: '#e0d8c0', quoteBg: '#f5eedb', quoteBorder: '#b58900',
    tableHeaderBg: '#eee8d5', tableBorder: '#ddd6c1',
  }),
  t('solarized-escuro', 'Solarized escuro', {
    pageBg: '#001e26', contentBg: '#002b36', text: '#93a1a1', muted: '#839496', heading: '#eee8d5', link: '#2aa1e6',
    codeBg: '#073642', codeText: '#2aa198', codeBorder: '#0f4654', quoteBg: '#05313d', quoteBorder: '#b58900',
    tableHeaderBg: '#073642', tableBorder: '#0f4654',
  }),
  t('dracula', 'Dracula', {
    pageBg: '#1e1f29', contentBg: '#282a36', text: '#f8f8f2', muted: '#a4a9c8', heading: '#ff79c6', link: '#8be9fd',
    codeBg: '#21222c', codeText: '#50fa7b', codeBorder: '#44475a', quoteBg: '#2f3241', quoteBorder: '#bd93f9',
    tableHeaderBg: '#343746', tableBorder: '#44475a',
  }),
  t('monokai', 'Monokai', {
    pageBg: '#1e1f1a', contentBg: '#272822', text: '#f8f8f2', muted: '#a6a28c', heading: '#a6e22e', link: '#66d9ef',
    codeBg: '#1e1f1a', codeText: '#e6db74', codeBorder: '#3e3d32', quoteBg: '#2f302a', quoteBorder: '#f92672',
    tableHeaderBg: '#3e3d32', tableBorder: '#49483e', bodyFont: 'mono', headingFont: 'mono', fontSize: 15,
  }),
  t('sepia', 'Sépia de leitura', {
    pageBg: '#e9dfc9', contentBg: '#f5ecd7', text: '#4a3b2a', muted: '#7a6650', heading: '#3a2a18', link: '#9a4d1c',
    codeBg: '#ebdfc3', codeText: '#5b3a1e', codeBorder: '#d8c8a6', quoteBg: '#efe4cb', quoteBorder: '#b08a5a',
    tableHeaderBg: '#ebdfc3', tableBorder: '#d8c8a6', bodyFont: 'bookish', headingFont: 'bookish', fontSize: 18, lineHeight: 1.8,
  }),
  t('oceano', 'Oceano', {
    pageBg: '#e3f1f6', contentBg: '#f6fcfe', text: '#17384a', muted: '#4e6f80', heading: '#0b4f6c', link: '#0a7ea4',
    codeBg: '#e6f4f8', codeText: '#0b4f6c', codeBorder: '#bfe0ea', quoteBg: '#eaf6fa', quoteBorder: '#20a4c8',
    tableHeaderBg: '#d6edf4', tableBorder: '#bfe0ea', bodyFont: 'humanist', headingFont: 'rounded', codeRadius: 12,
  }),
  t('floresta', 'Floresta', {
    pageBg: '#13201a', contentBg: '#1a2b22', text: '#d7e4d9', muted: '#97ad9d', heading: '#b5e3a8', link: '#7fd1a0',
    codeBg: '#13221a', codeText: '#d9c98a', codeBorder: '#2c4535', quoteBg: '#20352a', quoteBorder: '#8fbf6a',
    tableHeaderBg: '#24392d', tableBorder: '#2f4a3a', headingFont: 'serif',
  }),
  t('lavanda', 'Lavanda', {
    pageBg: '#eeeaf8', contentBg: '#fbfaff', text: '#3b3552', muted: '#6e678a', heading: '#4c2f8f', link: '#7046d6',
    codeBg: '#f1edfb', codeText: '#4c2f8f', codeBorder: '#ddd4f3', quoteBg: '#f5f1fd', quoteBorder: '#a98be8',
    tableHeaderBg: '#ece6fa', tableBorder: '#ddd4f3', bodyFont: 'rounded', headingFont: 'rounded', codeRadius: 14,
  }),
  t('cyberpunk', 'Cyberpunk', {
    pageBg: '#07040f', contentBg: '#0e0a1f', text: '#e4e1ff', muted: '#9a95c9', heading: '#fcee0a', link: '#00f0ff',
    codeBg: '#140e2e', codeText: '#ff4fd8', codeBorder: '#ff2a6d', quoteBg: '#150f2c', quoteBorder: '#00f0ff',
    tableHeaderBg: '#1e1540', tableBorder: '#3b2a7a', bodyFont: 'mono', headingFont: 'condensed', fontSize: 15, codeRadius: 0,
  }),
  t('jornal', 'Jornal', {
    pageBg: '#e8e6e1', contentBg: '#faf9f6', text: '#1a1a1a', muted: '#5c5c5c', heading: '#000000', link: '#8b0000',
    codeBg: '#f0eee9', codeText: '#1a1a1a', codeBorder: '#1a1a1a', quoteBg: '#faf9f6', quoteBorder: '#1a1a1a',
    tableHeaderBg: '#e8e6e1', tableBorder: '#1a1a1a', bodyFont: 'serif', headingFont: 'bookish', fontSize: 17, lineHeight: 1.65, codeRadius: 0,
  }),
];

export const DEFAULT_THEME_ID = 'claro';

export function fontStack(key) {
  return (FONTS[key] || FONTS.sans).stack;
}

/** Converte um tema em variáveis CSS para a prévia. */
export function themeToCssVars(theme) {
  return {
    '--md-page-bg': theme.pageBg,
    '--md-content-bg': theme.contentBg,
    '--md-text': theme.text,
    '--md-muted': theme.muted,
    '--md-heading': theme.heading,
    '--md-link': theme.link,
    '--md-code-bg': theme.codeBg,
    '--md-code-text': theme.codeText,
    '--md-code-border': theme.codeBorder,
    '--md-quote-bg': theme.quoteBg,
    '--md-quote-border': theme.quoteBorder,
    '--md-table-head-bg': theme.tableHeaderBg,
    '--md-table-border': theme.tableBorder,
    '--md-body-font': fontStack(theme.bodyFont),
    '--md-heading-font': fontStack(theme.headingFont),
    '--md-font-size': `${theme.fontSize}px`,
    '--md-line-height': String(theme.lineHeight),
    '--md-code-radius': `${theme.codeRadius ?? 8}px`,
  };
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Normaliza um tema personalizado vindo do armazenamento, preenchendo lacunas com o tema base. */
export function normalizeCustomTheme(raw, fallback = BUILTIN_THEMES[0]) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string') return null;
  const theme = { ...fallback, id: raw.id, builtin: false };
  theme.name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 40) : 'Tema sem nome';
  for (const { key } of THEME_FIELDS) {
    if (typeof raw[key] === 'string' && HEX.test(raw[key])) theme[key] = raw[key];
  }
  if (raw.bodyFont in FONTS) theme.bodyFont = raw.bodyFont;
  if (raw.headingFont in FONTS) theme.headingFont = raw.headingFont;
  theme.fontSize = clamp(Number(raw.fontSize), 12, 24, fallback.fontSize);
  theme.lineHeight = clamp(Number(raw.lineHeight), 1.2, 2.2, fallback.lineHeight);
  theme.codeRadius = clamp(Number(raw.codeRadius), 0, 20, fallback.codeRadius);
  return theme;
}

function clamp(n, min, max, def) {
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

/** Luminância relativa (WCAG) de uma cor hexadecimal. */
export function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
