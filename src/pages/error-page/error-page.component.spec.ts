import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ErrorDto } from '@/shared/error/error-dto';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockErrorHandlerService,
  DummyComponent,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';

import { ErrorPage } from './error-page.component';

function createError(id: string, isHandled: boolean): ErrorDto {
  return {
    id,
    i18nTitle: { i18n: 'title' },
    i18nReason: { i18n: 'reason' },
    originalError: new Error('boom'),
    timestamp: new Date(),
    isHandled,
  };
}

describe('ErrorPageComponent', () => {
  let component: ErrorPage;
  let fixture: ComponentFixture<ErrorPage>;
  let errorService: MockErrorHandlerService;
  let errorsSignal: ReturnType<typeof signal<ErrorDto[]>>;
  let router: Router;

  beforeEach(async () => {
    errorService = createMockErrorHandlerService();
    errorsSignal = signal<ErrorDto[]>([]);
    errorService.getAllErrors.mockReturnValue(errorsSignal);

    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      providers: [
        { provide: ErrorHandlerService, useValue: errorService },
        provideRouter([{ path: '', component: DummyComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes only unhandled errors', () => {
    errorsSignal.set([createError('1', false), createError('2', true)]);

    expect(component['errors']()).toHaveLength(1);
    expect(component['errors']()[0].id).toBe('1');
  });

  it('marks all errors as handled when closing', () => {
    component['closeErrors']();

    expect(errorService.markAllAsHandled).toHaveBeenCalledTimes(1);
  });

  it('marks errors handled and navigates home on back', () => {
    const navSpy = vi.spyOn(router, 'navigate');

    component['back']();

    expect(errorService.markAllAsHandled).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });
});
