import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';

import { UidMissingAlertComponent } from './uid-missing-alert.component';

describe('UidMissingAlertComponent', () => {
  let fixture: ComponentFixture<UidMissingAlertComponent>;
  let component: UidMissingAlertComponent;
  let i18nService: MockI18nService;

  function render() {
    fixture = TestBed.createComponent(UidMissingAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [UidMissingAlertComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();
  });

  it('builds the warning with the support phone number', () => {
    i18nService.translateSignal.mockReturnValue(signal('+41 58 000 00 00'));
    render();

    expect(component['uidMissingWarning']()).toBe('producer.uidMissingWarning');
    expect(i18nService.translate).toHaveBeenCalledWith('producer.uidMissingWarning', {
      phoneNumber: '+41 58 000 00 00',
    });
  });

  it('returns an empty warning while the phone number is not loaded', () => {
    i18nService.translateSignal.mockReturnValue(signal(''));
    render();

    expect(component['uidMissingWarning']()).toBe('');
    expect(i18nService.translate).not.toHaveBeenCalled();
  });
});
