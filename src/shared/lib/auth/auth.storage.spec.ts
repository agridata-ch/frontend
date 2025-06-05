import { AgridataOIDCStorage } from '@/shared/lib/auth';

describe('AgridataOIDCStorage', () => {
  let storage: AgridataOIDCStorage;

  beforeEach(() => {
    storage = new AgridataOIDCStorage();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should read a value from localStorage', () => {
    localStorage.setItem('testKey', 'testValue');
    expect(storage.read('testKey')).toBe('testValue');
  });

  it('should write a value to localStorage', () => {
    storage.write('testKey', 'testValue');
    expect(localStorage.getItem('testKey')).toBe('testValue');
  });

  it('should remove a value from localStorage', () => {
    localStorage.setItem('testKey', 'testValue');
    storage.remove('testKey');
    expect(localStorage.getItem('testKey')).toBeNull();
  });

  it('should clear all values from localStorage', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');
    storage.clear();
    expect(localStorage.getItem('key1')).toBeNull();
    expect(localStorage.getItem('key2')).toBeNull();
  });
});
