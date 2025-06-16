import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';

import { TranslationDto } from '@/entities/openapi';

import { I18nService } from './i18n.service';

const LANG_STORAGE_KEY = 'lang';

describe('I18nService', () => {
  let service: I18nService;
  let mockTransloco: Partial<TranslocoService>;
  let langChanges$: Subject<string>;
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    langChanges$ = new Subject<string>();

    mockTransloco = {
      getActiveLang: jest.fn().mockReturnValue('de'),
      setActiveLang: jest.fn(),
      translateObject: jest
        .fn()
        .mockImplementation(
          (_key: string, _params: unknown, lang: string) =>
            ({ [lang]: `value-${lang}` }) as unknown as TranslationDto,
        ),
      langChanges$: langChanges$,
      load: jest.fn().mockReturnValue({
        toPromise: () => Promise.resolve({}),
      }),
      translate: jest.fn().mockReturnValue('translated-value'),
    };

    TestBed.configureTestingModule({
      providers: [I18nService, { provide: TranslocoService, useValue: mockTransloco }],
    });

    service = TestBed.inject(I18nService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializes lang from localStorage when present', () => {
    getItemSpy.mockReturnValue('fr');
    TestBed.resetTestingModule();
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('fr');
    TestBed.configureTestingModule({
      providers: [I18nService, { provide: TranslocoService, useValue: mockTransloco }],
    });
    const svc2 = TestBed.inject(I18nService);
    expect(getItemSpy).toHaveBeenCalledWith(LANG_STORAGE_KEY);
    expect(svc2.lang()).toBe('fr');
  });

  it('falls back to getActiveLang() if localStorage is empty', () => {
    expect(service.lang()).toBe('de');
    expect(mockTransloco.getActiveLang as jest.Mock).toHaveBeenCalled();
  });

  it('syncs lang signal and localStorage on langChanges$', () => {
    langChanges$.next('it');
    expect(service.lang()).toBe('it');
    expect(setItemSpy).toHaveBeenCalledWith(LANG_STORAGE_KEY, 'it');
  });

  it('setActiveLang delegates to TranslocoService.setActiveLang()', () => {
    service.setActiveLang('fr');
    expect(mockTransloco.setActiveLang as jest.Mock).toHaveBeenCalledWith('fr');
  });

  it('should translate keys using TranslocoService', () => {
    const key = 'greeting';
    const params = { name: 'John' };
    const result = service.translate(key, params);
    expect(mockTransloco.translate).toHaveBeenCalledWith(key, params, 'de');
    expect(result).toBe('translated-value');
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
