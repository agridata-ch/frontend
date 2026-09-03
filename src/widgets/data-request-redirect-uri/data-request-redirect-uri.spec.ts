import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockI18nService,
  createMockDataRequestService,
  MockDataRequestService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';
import { ButtonComponent } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';

import { DataRequestRedirectUriComponent } from './data-request-redirect-uri.component';

describe('DataRequestRedirectUriComponent', () => {
  let fixture: ComponentFixture<DataRequestRedirectUriComponent>;
  let component: DataRequestRedirectUriComponent;
  let componentRef: ComponentRef<DataRequestRedirectUriComponent>;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [DataRequestRedirectUriComponent],
      providers: [
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestRedirectUriComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('dataRequest', {
      id: 'test-id',
      dataProviderId: 'test-provider',
      stateCode: DataRequestStateEnum.Draft,
    } as DataRequestDto);

    fixture.detectChanges();
  });

  describe('computed signals', () => {
    it('should sync the valid redirect URI regex into the input field', () => {
      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: DataRequestStateEnum.Draft,
        validRedirectUriRegex: '^https://example\\.ch/.*$',
      } as DataRequestDto);
      fixture.detectChanges();

      expect(component['redirectUriForm'].get('validRedirectUriRegex')?.value).toBe(
        '^https://example\\.ch/.*$',
      );
    });
  });

  describe('handleSubmit', () => {
    beforeEach(() => {
      componentRef.setInput('isValidRedirectUriRegexEditable', true);
      component['isViewMode'].set(false);
      fixture.detectChanges();
      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '^https://example\\.ch$' });
    });

    it('should call the service with the correct id and form value', () => {
      component['handleSubmit']();

      expect(dataRequestService.updateDataRequestValidRedirectUriRegex).toHaveBeenCalledWith(
        'test-id',
        { validRedirectUriRegex: '^https://example\\.ch$' },
      );
    });

    it('should set isSavingValidRedirectUriRegex to true during save and reset it after', async () => {
      component['handleSubmit']();
      expect(component['isSavingValidRedirectUriRegex']()).toBe(true);

      await fixture.whenStable();
      expect(component['isSavingValidRedirectUriRegex']()).toBe(false);
    });

    it('should show the save button as loading while the update is in flight', async () => {
      const formControlComp = fixture.debugElement.query(By.directive(FormControlComponent));

      component['handleSubmit']();
      fixture.detectChanges();
      expect(formControlComp.componentInstance.loading()).toBe(true);

      // Two ticks: the render above settles the fixture before the promise's finally() has run.
      await fixture.whenStable();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(formControlComp.componentInstance.loading()).toBe(false);
    });

    it('should forward errors to errorService and reset loading state', async () => {
      const testError = new Error('Update failed');
      dataRequestService.updateDataRequestValidRedirectUriRegex.mockRejectedValueOnce(testError);

      component['handleSubmit']();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['isSavingValidRedirectUriRegex']()).toBe(false);
    });

    it('should stay in edit mode when the save fails', async () => {
      dataRequestService.updateDataRequestValidRedirectUriRegex.mockRejectedValueOnce(
        new Error('Update failed'),
      );

      component['handleSubmit']();
      await fixture.whenStable();

      expect(component['isViewMode']()).toBe(false);
    });
  });

  describe('valid redirect URI regex field', () => {
    it('should disable the form field and hide the save button when not editable', () => {
      componentRef.setInput('isValidRedirectUriRegexEditable', false);
      fixture.detectChanges();

      const formControlComp = fixture.debugElement.query(By.directive(FormControlComponent));
      const saveButton = fixture.debugElement.query(By.directive(ButtonComponent));

      expect(formControlComp.componentInstance.disabled()).toBe(true);
      expect(saveButton).toBeNull();
    });

    it('should not call the service when the regex is invalid', () => {
      componentRef.setInput('isValidRedirectUriRegexEditable', true);
      component['isViewMode'].set(false);
      fixture.detectChanges();

      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '([invalid-regex' });
      component['handleSubmit']();

      expect(dataRequestService.updateDataRequestValidRedirectUriRegex).not.toHaveBeenCalled();
    });

    it('should not submit on enter while in view mode', () => {
      componentRef.setInput('isValidRedirectUriRegexEditable', true);
      fixture.detectChanges();
      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '^https://example\\.ch$' });

      fixture.debugElement.query(By.css('form')).nativeElement.dispatchEvent(new Event('submit'));

      expect(dataRequestService.updateDataRequestValidRedirectUriRegex).not.toHaveBeenCalled();
    });

    it('should discard the pending edit when leaving edit mode', () => {
      componentRef.setInput('dataRequest', {
        id: 'test-id',
        stateCode: DataRequestStateEnum.Draft,
        validRedirectUriRegex: '^https://example\\.ch$',
      } as DataRequestDto);
      componentRef.setInput('isValidRedirectUriRegexEditable', true);
      fixture.detectChanges();

      component['toggleViewMode']();
      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '^https://changed\\.ch$' });
      component['toggleViewMode']();

      expect(component['redirectUriForm'].get('validRedirectUriRegex')?.value).toBe(
        '^https://example\\.ch$',
      );
    });

    it('should restore the last saved value when a later edit is cancelled', async () => {
      // The dataRequest input is not refreshed after a save, so restoring from it would bring
      // back the value the panel was opened with instead of the saved one.
      componentRef.setInput('isValidRedirectUriRegexEditable', true);
      fixture.detectChanges();

      component['toggleViewMode']();
      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '^https://saved\\.ch$' });
      component['handleSubmit']();
      await fixture.whenStable();

      component['toggleViewMode']();
      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '^https://dropped\\.ch$' });
      component['toggleViewMode']();

      expect(component['redirectUriForm'].get('validRedirectUriRegex')?.value).toBe(
        '^https://saved\\.ch$',
      );
    });
  });
});
