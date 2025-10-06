import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorAlertComponent } from '@/widgets/error-alert/error-alert.component';

import { ErrorAlertList } from './error-alert-list.component';

describe('ErrorAlertList', () => {
  let fixture: ComponentFixture<ErrorAlertList>;
  let componentRef: ComponentRef<ErrorAlertList>;
  let component: ErrorAlertList;

  const mockErrors: ErrorDto[] = [
    {
      id: '1',
      isFrontendError: true,
      i18nTitle: { i18n: 'error.title' },
      i18nReason: { i18n: 'error.reason' },
      originalError: new Error('Test error'),
      timestamp: new Date(),
      isHandled: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorAlertList],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorAlertList);

    componentRef = fixture.componentRef;
    componentRef.setInput('errors', mockErrors);
    component = fixture.componentInstance;
  });

  it('should render error alerts when errors are provided', () => {
    componentRef.setInput('errors', mockErrors);
    fixture.detectChanges();
    const alerts = fixture.debugElement.queryAll(By.directive(ErrorAlertComponent));
    expect(alerts.length).toBe(mockErrors.length);
  });

  it('should emit closeErrors when an error alert is closed', () => {
    componentRef.setInput('errors', mockErrors);
    fixture.detectChanges();
    jest.spyOn(component.closeErrors, 'emit');
    // Simulate close event from child
    component.closeErrors.emit(true);
    expect(component.closeErrors.emit).toHaveBeenCalledWith(true);
  });

  it('should not render error alerts when errors input is empty', () => {
    componentRef.setInput('errors', []);
    fixture.detectChanges();
    const alerts = fixture.debugElement.queryAll(By.directive(ErrorAlertComponent));
    expect(alerts.length).toBe(0);
  });
});
