export type LocalStore = Record<string, string>;

export function installMockLocalStorage(initial: LocalStore = {}) {
  let store: LocalStore = { ...initial };

  const mock = {
    getItem: vi.fn((k: string) => (k in store ? store[k] : null)),
    setItem: vi.fn((k: string, v: string) => {
      store[k] = String(v);
    }),
    removeItem: vi.fn((k: string) => {
      delete store[k];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    // test helpers:
    __setStore(next: LocalStore) {
      store = { ...next };
    },
    __getStore(): LocalStore {
      return { ...store };
    },
  };

  // Replace the window.localStorage getter (JSDOM exposes it as a property)
  vi.spyOn(globalThis, 'localStorage', 'get').mockReturnValue(mock as unknown as Storage);

  return mock;
}
