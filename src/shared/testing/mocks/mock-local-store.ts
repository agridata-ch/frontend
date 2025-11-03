export type LocalStore = Record<string, string>;

export function installMockLocalStorage(initial: LocalStore = {}) {
  let store: LocalStore = { ...initial };

  const mock = {
    getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
    setItem: jest.fn((k: string, v: string) => {
      store[k] = String(v);
    }),
    removeItem: jest.fn((k: string) => {
      delete store[k];
    }),
    clear: jest.fn(() => {
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
  jest.spyOn(window, 'localStorage', 'get').mockReturnValue(mock as unknown as Storage);

  return mock;
}
