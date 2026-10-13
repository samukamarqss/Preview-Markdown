import { Marked } from 'marked';
import DOMPurify from 'dompurify';

const marked = new Marked({ gfm: true, breaks: false });

// Links externos abrem em nova aba sem expor a página de origem.
let hookInstalled = false;
function installHooks(purify) {
  if (hookInstalled) return;
  hookInstalled = true;
  purify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      const href = node.getAttribute('href');
      if (!href.startsWith('#')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
    if (node.tagName === 'INPUT' && node.getAttribute('type') === 'checkbox') {
      node.setAttribute('disabled', '');
      node.setAttribute('aria-label', node.hasAttribute('checked') ? 'Tarefa concluída' : 'Tarefa pendente');
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      if (!node.hasAttribute('alt')) node.setAttribute('alt', '');
    }
  });
}

/** Converte Markdown em HTML sanitizado. */
export function renderMarkdown(source, purify = DOMPurify) {
  installHooks(purify);
  const html = marked.parse(String(source ?? ''), { async: false });
  return purify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['style', 'form', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
}

export const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown', '.mkd', '.txt'];

/** Valida um arquivo antes de lê-lo. Retorna mensagem de erro ou null. */
export function validateFile(file, maxBytes = 5 * 1024 * 1024) {
  if (!file) return 'Nenhum arquivo foi selecionado.';
  const name = file.name.toLowerCase();
  if (!MARKDOWN_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return `“${file.name}” não parece ser um arquivo Markdown. Use arquivos .md ou .markdown.`;
  }
  if (file.size === 0) return `“${file.name}” está vazio.`;
  if (file.size > maxBytes) return `“${file.name}” é grande demais (limite de 5 MB).`;
  return null;
}

export function countStats(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  return { words, chars: text.length, minutes: Math.max(1, Math.round(words / 200)) };
}

export const SAMPLE = `# Bem-vindo ao Preview Markdown

Cole seu texto aqui, **arraste um arquivo \`.md\`** para a página ou use o botão *Abrir arquivo*.
A prévia ao lado atualiza enquanto você digita.

## O que dá para usar

- Listas, **negrito**, *itálico* e ~~riscado~~
- [Links](https://commonmark.org/help/) e \`código inline\`
- [x] Checklists
- [ ] Tabelas e citações

> Dica: escolha um tema na barra superior ou crie o seu em **Criar tema**.

| Recurso | Atalho |
| ------- | :----: |
| Abrir arquivo | Ctrl + O |
| Alternar visualização | Ctrl + Shift + P |

\`\`\`js
function ola(nome) {
  return \`Olá, \${nome}!\`;
}
\`\`\`
`;
