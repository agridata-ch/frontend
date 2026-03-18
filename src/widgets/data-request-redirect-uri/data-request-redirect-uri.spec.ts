import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import {
  createMockDataRequestService,
  MockDataRequestService,
} from '@/shared/testing/mocks/mock-data-request-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
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
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    } as DataRequestDto);

    fixture.detectChanges();
  });

  describe('computed signals', () => {
    it('should sync the valid redirect URI regex into the input field', () => {
      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
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

    it('should forward errors to errorService and reset loading state', async () => {
      const testError = new Error('Update failed');
      dataRequestService.updateDataRequestValidRedirectUriRegex.mockRejectedValueOnce(testError);

      component['handleSubmit']();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['isSavingValidRedirectUriRegex']()).toBe(false);
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
      fixture.detectChanges();

      component['redirectUriForm'].patchValue({ validRedirectUriRegex: '([invalid-regex' });
      component['handleSubmit']();

      expect(dataRequestService.updateDataRequestValidRedirectUriRegex).not.toHaveBeenCalled();
    });
  });
});
