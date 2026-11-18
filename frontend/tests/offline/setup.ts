import 'fake-indexeddb/auto';

// Minimal localStorage for sessionGate / deviceId in Node tests
const store = new Map<string, string>();

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    },
    configurable: true,
  });
}

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    configurable: true,
  });
}

const sessionStore = new Map<string, string>();
if (typeof globalThis.sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: {
      getItem: (k: string) => (sessionStore.has(k) ? sessionStore.get(k)! : null),
      setItem: (k: string, v: string) => {
        sessionStore.set(k, String(v));
      },
      removeItem: (k: string) => {
        sessionStore.delete(k);
      },
      clear: () => sessionStore.clear(),
    },
    configurable: true,
  });
}
