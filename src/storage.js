// Persistência local com fallback em memória quando localStorage não está disponível.

const PREFIX = 'preview-md:';

export function createStorage(backend = safeLocalStorage()) {
  const memory = new Map();
  let persistent = Boolean(backend);

  function get(key, fallback) {
    const full = PREFIX + key;
    let raw = memory.has(full) ? memory.get(full) : null;
    if (persistent) {
      try {
        raw = backend.getItem(full);
      } catch {
        persistent = false;
      }
    }
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    const full = PREFIX + key;
    const raw = JSON.stringify(value);
    memory.set(full, raw);
    if (!persistent) return false;
    try {
      backend.setItem(full, raw);
      return true;
    } catch {
      // Quota excedida ou bloqueio: continua só em memória durante a sessão.
      persistent = false;
      return false;
    }
  }

  return { get, set, get persistent() { return persistent; } };
}

function safeLocalStorage() {
  try {
    const ls = globalThis.localStorage;
    const probe = `${PREFIX}__probe`;
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}
