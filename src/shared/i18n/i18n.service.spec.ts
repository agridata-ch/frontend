import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { TranslationDto } from '@/entities/openapi';
import { installMockLocalStorage } from '@/shared/testing/mocks/mock-local-store';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { I18nService } from './i18n.service';

const LANG_STORAGE_KEY = 'lang';

describe('I18nService', () => {
  let service: I18nService;
  let translocoService: TranslocoService;
  let localStore: ReturnType<typeof installMockLocalStorage>;
  const translationKey = 'greeting';
  beforeEach(() => {
    localStore = installMockLocalStorage();

    TestBed.configureTestingModule({
      imports: [
        createTranslocoTestingModule({
          langs: {
            de: { [translationKey]: 'hallo {{name}}' },
          },
        }),
      ],
    });

    service = TestBed.inject(I18nService);
    translocoService = TestBed.inject(TranslocoService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializes lang from localStorage when present', () => {
    localStore.setItem(LANG_STORAGE_KEY, 'fr');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [createTranslocoTestingModule()],
    });
    service = TestBed.inject(I18nService);

    expect(service.lang()).toBe('fr');
  });

  it('falls back to getActiveLang() if localStorage is empty', () => {
    expect(service.lang()).toBe('de');
    expect(localStore.setItem).toHaveBeenCalledWith(LANG_STORAGE_KEY, 'de');
  });

  it('syncs lang signal and localStorage on langChanges$', () => {
    translocoService.setActiveLang('it');
    expect(service.lang()).toBe('it');
    expect(localStore.setItem).toHaveBeenCalledWith(LANG_STORAGE_KEY, 'it');
  });

  it('setActiveLang delegates to TranslocoService.setActiveLang()', () => {
    const spy = jest.spyOn(translocoService, 'setActiveLang');

    service.setActiveLang('fr');
    expect(spy).toHaveBeenCalledWith('fr');
  });

  it('should translate keys using TranslocoService', () => {
    const params = { name: 'John' };
    const translateSpy = jest.spyOn(translocoService, 'translate');
    const result = service.translate(translationKey, params);
    expect(translateSpy).toHaveBeenCalledWith(translationKey, params);
    expect(result).toBe('hallo John');
  });

  describe('useObjectTranslation()', () => {
    it('returns the matching translation', () => {
      const dto: TranslationDto = { de: 'Hallo', fr: 'Salut', it: 'Ciao' };
      service.lang.set('de');
      expect(service.useObjectTranslation(dto)).toBe('Hallo');
      service.lang.set('fr');
      expect(service.useObjectTranslation(dto)).toBe('Salut');
      service.lang.set('it');
      expect(service.useObjectTranslation(dto)).toBe('Ciao');
    });

    it('returns empty for null/undefined or missing key', () => {
      expect(service.useObjectTranslation(null)).toBe('');
      expect(service.useObjectTranslation(undefined)).toBe('');
      const dto: TranslationDto = { de: 'Hallo' };
      service.lang.set('fr');
      expect(service.useObjectTranslation(dto)).toBe('');
    });
  });
});
