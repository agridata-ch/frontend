import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';

import { TitleService } from '@/app/title.service';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';

describe('TitleService', () => {
  let service: TitleService;
  let i18nService: MockI18nService;
  let title: { setTitle: jest.Mock };

  beforeEach(() => {
    i18nService = createMockI18nService();
    title = {
      setTitle: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: I18nService, useValue: i18nService },
        { provide: Title, useValue: title },
      ],
    });
    service = TestBed.inject(TitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set translated title when setTranslatedTitle is called', () => {
    service.setTranslatedTitle('Test Title');

    expect(service.roTranslatedTitle()).toBe('Test Title');
  });

  it('should not set title when undefined is passed to setTranslatedTitle', () => {
    service.setTranslatedTitle('Initial Title');
    service.setTranslatedTitle(undefined);

    expect(service.roTranslatedTitle()).toBe('Initial Title');
  });

  it('should update i18n title and translate it when setI18nTitle is called', () => {
    const translatedTitle = 'Translated Title';
    i18nService.selectTranslate = jest.fn().mockReturnValue(of(translatedTitle));

    service.setI18nTitle('test.title');

    expect(service.ro18nTitle()).toBe('test.title');
    expect(i18nService.selectTranslate).toHaveBeenCalledWith('test.title');
    expect(service.roTranslatedTitle()).toBe(translatedTitle);
  });

  it('should not translate when setI18nTitle is called with undefined', () => {
    i18nService.selectTranslate = jest.fn().mockReturnValue(of('Title'));

    service.setI18nTitle(undefined);

    expect(service.ro18nTitle()).toBeUndefined();
    expect(i18nService.selectTranslate).not.toHaveBeenCalled();
  });

  it('should set route and i18n title when setPageTitleByRoute is called', () => {
    const translatedTitle = 'Page Title';
    i18nService.selectTranslate = jest.fn().mockReturnValue(of(translatedTitle));

    service.setPageTitleByRoute('/test-route', 'test.page.title');

    expect(service.roRoute()).toBe('/test-route');
    expect(service.ro18nTitle()).toBe('test.page.title');
    expect(i18nService.selectTranslate).toHaveBeenCalledWith('test.page.title');
  });

  it('should set route as translated title when i18n title is undefined', () => {
    service.setPageTitleByRoute('/test-route', undefined);

    expect(service.roRoute()).toBe('/test-route');
    expect(service.roTranslatedTitle()).toBe('/test-route');
  });

  it('should not set title for CMS routes', () => {
    i18nService.selectTranslate = jest.fn().mockReturnValue(of('CMS Title'));

    service.setPageTitleByRoute('/cms/test-page', 'cms.title');

    expect(service.roRoute()).toBe('/cms/test-page');
    expect(i18nService.selectTranslate).not.toHaveBeenCalled();
  });

  it('should update html title when translated title changes', () => {
    service['route'].set('/test');
    service.setTranslatedTitle('New Title');

    TestBed.tick();

    expect(title.setTitle).toHaveBeenCalledWith('New Title - agridata.ch');
  });

  it('should not update html title when route is not set', () => {
    service.setTranslatedTitle('New Title');

    TestBed.tick();

    expect(title.setTitle).not.toHaveBeenCalled();
  });

  it('should retranslate title when language changes', () => {
    const translatedTitleDe = 'German Title';
    const translatedTitleFr = 'French Title';
    i18nService.selectTranslate = jest
      .fn()
      .mockReturnValueOnce(of(translatedTitleDe))
      .mockReturnValueOnce(of(translatedTitleFr));

    service.setI18nTitle('test.title');
    expect(service.roTranslatedTitle()).toBe(translatedTitleDe);

    // Simulate language change
    i18nService.lang.set('fr');
    TestBed.tick();

    expect(i18nService.selectTranslate).toHaveBeenCalledTimes(2);
    expect(service.roTranslatedTitle()).toBe(translatedTitleFr);
  });
});
