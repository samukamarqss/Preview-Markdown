import { describe, it, expect } from 'vitest';
import { BUILTIN_THEMES, THEME_FIELDS, normalizeCustomTheme, contrastRatio, themeToCssVars } from '../src/themes.js';
import { createStorage } from '../src/storage.js';

describe('temas', () => {
  it('tem pelo menos 15 temas nativos com ids únicos', () => {
    expect(BUILTIN_THEMES.length).toBeGreaterThanOrEqual(15);
    expect(new Set(BUILTIN_THEMES.map((t) => t.id)).size).toBe(BUILTIN_THEMES.length);
  });

  it.each(BUILTIN_THEMES)('$name define todas as cores e tem contraste legível', (t) => {
    for (const { key } of THEME_FIELDS) expect(t[key]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(contrastRatio(t.text, t.contentBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t.link, t.contentBg)).toBeGreaterThanOrEqual(3);
    expect(Object.values(themeToCssVars(t)).every(Boolean)).toBe(true);
  });

  it('normaliza tema personalizado inválido', () => {
    const t = normalizeCustomTheme({ id: 'x', name: '  ', text: 'red;}', fontSize: 99, bodyFont: 'nope' });
    expect(t.name).toBe('Tema sem nome');
    expect(t.text).toBe(BUILTIN_THEMES[0].text);
    expect(t.fontSize).toBe(24);
    expect(t.bodyFont).toBe('sans');
    expect(t.builtin).toBe(false);
    expect(normalizeCustomTheme(null)).toBeNull();
  });
});

describe('storage', () => {
  it('persiste em backend disponível', () => {
    const map = new Map();
    const s = createStorage({ getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) });
    s.set('a', { b: 1 });
    expect(s.get('a')).toEqual({ b: 1 });
    expect(s.persistent).toBe(true);
  });

  it('cai para memória quando o backend falha', () => {
    const s = createStorage({ getItem: () => { throw new Error(); }, setItem: () => { throw new Error('quota'); } });
    expect(s.set('a', 1)).toBe(false);
    expect(s.get('a')).toBe(1);
    expect(s.persistent).toBe(false);
  });

  it('funciona sem backend', () => {
    const s = createStorage(null);
    s.set('k', 'v');
    expect(s.get('k')).toBe('v');
    expect(s.get('none', 'def')).toBe('def');
  });
});
