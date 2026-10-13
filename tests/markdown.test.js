// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderMarkdown, validateFile, countStats } from '../src/markdown.js';

describe('renderMarkdown', () => {
  it('renderiza elementos GFM', () => {
    const html = renderMarkdown('# T\n\n- [x] feito\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n> c\n\n```js\nx\n```');
    expect(html).toContain('<h1');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<table>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<pre><code');
  });

  it('remove scripts e manipuladores perigosos', () => {
    const html = renderMarkdown('<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">x</a><iframe src="https://x"></iframe>');
    expect(html).not.toMatch(/<script|onerror|javascript:|<iframe/i);
  });

  it('abre links externos com segurança', () => {
    const html = renderMarkdown('[a](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});

describe('validateFile', () => {
  const f = (name, size) => ({ name, size });
  it('aceita .md', () => expect(validateFile(f('a.md', 10))).toBeNull());
  it('rejeita extensão incompatível', () => expect(validateFile(f('a.pdf', 10))).toMatch(/não parece/));
  it('rejeita vazio', () => expect(validateFile(f('a.md', 0))).toMatch(/vazio/));
});

it('countStats conta palavras', () => {
  expect(countStats('um dois  três').words).toBe(3);
  expect(countStats('   ').words).toBe(0);
});
