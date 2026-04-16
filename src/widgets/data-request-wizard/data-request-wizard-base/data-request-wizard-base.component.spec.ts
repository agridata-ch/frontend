import { Component, ComponentRef, Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockDataRequestService,
  createMockI18nService,
  MockDataRequestService,
} from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import { dataRequestFormsModel, FORM_GROUP_NAMES, FormModel } from '@/widgets/data-request-wizard';

import { DataRequestWizardBaseComponent } from './data-request-wizard-base.component';

@Component({
  selector: 'app-test-data-request-wizard',
  imports: [AgridataWizardComponent, ReactiveFormsModule],
  template: `<app-agridata-wizard [steps]="formControlSteps()"></app-agridata-wizard>`,
})
class TestDataRequestWizardComponent extends DataRequestWizardBaseComponent {
  protected override readonly formsModel: FormModel[] = dataRequestFormsModel;
  protected override readonly listRoutePath = 'data-requests';
  protected override readonly stepLabelMap: Record<string, Signal<string | undefined>> = {
    [FORM_GROUP_NAMES.COMPLETION]: signal('Completion'),
    [FORM_GROUP_NAMES.CONSUMER]: signal('Consumer'),
    [FORM_GROUP_NAMES.CONTRACT]: signal('Contract'),
    [FORM_GROUP_NAMES.PREVIEW]: signal('Preview'),
    [FORM_GROUP_NAMES.PRODUCER]: signal('Producer'),
    [FORM_GROUP_NAMES.REQUEST]: signal('Request'),
  };

  protected override checkExternalCompletion(_formGroupName: string): boolean {
    return false;
  }

  protected override getInitialStepDisabled(_formGroupName: string): boolean {
    return false;
  }

  protected override getStepDisabled(_stepId: string, _stateCode: string | undefined): boolean {
    return false;
  }
}

describe('DataRequestWizardBaseComponent', () => {
  let fixture: ComponentFixture<TestDataRequestWizardComponent>;
  let component: TestDataRequestWizardComponent;
  let componentRef: ComponentRef<TestDataRequestWizardComponent>;
  let authService: MockAuthService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let router: Router;

  beforeEach(async () => {
    authService = createMockAuthService();
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();

    await TestBed.configureTestingModule({
      imports: [
        TestDataRequestWizardComponent,
        ReactiveFormsModule,
        AgridataWizardComponent,
        createTranslocoTestingModule(),
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        provideRouter([{ path: '**', component: TestDataRequestWizardComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDataRequestWizardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    router = TestBed.inject(Router);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formDisabled', () => {
    it('should return false when no dataRequest is set', () => {
      component['dataRequest'].set(undefined);
      expect(component['formDisabled']()).toBe(false);
    });

    it('should return false when stateCode is Draft', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.Draft,
      } as DataRequestDto);
      expect(component['formDisabled']()).toBe(false);
    });

    it('should return true when stateCode is not Draft', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      expect(component['formDisabled']()).toBe(true);
    });

    it('should return true when stateCode is ToBeSignedByConsumer', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.ToBeSignedByConsumer,
      } as DataRequestDto);
      expect(component['formDisabled']()).toBe(true);
    });
  });

  describe('formGroupDisabledEffect', () => {
    it('should disable the form when stateCode is not Draft', async () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['form'].disabled).toBe(true);
    });

    it('should re-enable the form when stateCode changes back to Draft', async () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      fixture.detectChanges();
      await fixture.whenStable();

      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.Draft,
      } as DataRequestDto);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['form'].disabled).toBe(false);
    });
  });

  describe('updateDataRequestFromInputEffect', () => {
    it('should set dataRequest signal when initialDataRequest with id is provided', async () => {
      const dr = { id: 'dr-1', stateCode: DataRequestStateEnum.Draft } as DataRequestDto;
      componentRef.setInput('initialDataRequest', dr);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['dataRequest']()).toEqual(dr);
    });

    it('should not update dataRequest when initialDataRequest has no id', async () => {
      componentRef.setInput('initialDataRequest', {
        stateCode: DataRequestStateEnum.Draft,
      } as DataRequestDto);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['dataRequest']()).toBeUndefined();
    });
  });

  describe('handleClose', () => {
    it('should navigate to listRoutePath with forceReload false by default', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith(['data-requests'], {
        state: { forceReload: false },
      });
    });

    it('should navigate with forceReload true when refreshListNeeded is set', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      component['refreshListNeeded'].set(true);

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith(['data-requests'], {
        state: { forceReload: true },
      });
    });
  });

  describe('handleReloadDataRequest', () => {
    it('should fetch data request and update dataRequest signal', async () => {
      const dr = { id: 'reloaded', stateCode: DataRequestStateEnum.Draft } as DataRequestDto;
      dataRequestService.fetchDataRequest.mockResolvedValue(dr);
      component['currentDataRequestId'].set('reloaded');

      await component['handleReloadDataRequest']();

      expect(dataRequestService.fetchDataRequest).toHaveBeenCalledWith('reloaded');
      expect(component['dataRequest']()).toEqual(dr);
      expect(component['refreshListNeeded']()).toBe(true);
    });

    it('should do nothing when currentDataRequestId is not set', async () => {
      await component['handleReloadDataRequest']();

      expect(dataRequestService.fetchDataRequest).not.toHaveBeenCalled();
    });

    it('should call errorService.handleError when fetch fails', async () => {
      const error = new Error('Fetch failed');
      dataRequestService.fetchDataRequest.mockRejectedValue(error);
      component['currentDataRequestId'].set('fail-id');

      await component['handleReloadDataRequest']();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('handleNextStep', () => {
    it('should call handleSave when form is not disabled', () => {
      const saveSpy = jest.spyOn(component as any, 'handleSave');

      component['handleNextStep']();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should not call handleSave when form is disabled', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      const saveSpy = jest.spyOn(component as any, 'handleSave');

      component['handleNextStep']();

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should call wizard.nextStep when next step is not disabled', () => {
      const wizard = component['wizard']()!;
      const nextStepSpy = jest.spyOn(wizard, 'nextStep');
      jest.spyOn(component as any, 'handleSave').mockImplementation();
      jest.spyOn(component as any, 'isNextStepDisabled').mockReturnValue(false);

      component['handleNextStep']();

      expect(nextStepSpy).toHaveBeenCalled();
    });

    it('should not call wizard.nextStep when next step is disabled', () => {
      const wizard = component['wizard']()!;
      const nextStepSpy = jest.spyOn(wizard, 'nextStep');
      jest.spyOn(component as any, 'handleSave').mockImplementation();
      jest.spyOn(component as any, 'isNextStepDisabled').mockReturnValue(true);

      component['handleNextStep']();

      expect(nextStepSpy).not.toHaveBeenCalled();
    });
  });

  describe('handlePreviousStep', () => {
    it('should call handleSave when form is not disabled', () => {
      const saveSpy = jest.spyOn(component as any, 'handleSave');

      component['handlePreviousStep']();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should call wizard.previousStep', () => {
      const wizard = component['wizard']()!;
      const previousStepSpy = jest.spyOn(wizard, 'previousStep');
      jest.spyOn(component as any, 'handleSave').mockImplementation();

      component['handlePreviousStep']();

      expect(previousStepSpy).toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should return early without calling updateFormSteps when formDisabled', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      const updateSpy = jest.spyOn(component as any, 'updateFormSteps');

      component['handleSave']();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should call updateFormSteps when form is not disabled and wizard has a current step', () => {
      const updateSpy = jest.spyOn(component as any, 'updateFormSteps');

      component['handleSave']();

      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('handleStepChange', () => {
    it('should call handleSave when form is not disabled', () => {
      const saveSpy = jest.spyOn(component as any, 'handleSave');

      component['handleStepChange']();

      expect(saveSpy).toHaveBeenCalled();
    });

    it('should not call handleSave when form is disabled', () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      const saveSpy = jest.spyOn(component as any, 'handleSave');

      component['handleStepChange']();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateFormSteps', () => {
    it('should populate formControlSteps from formsModel', () => {
      const steps = component['formControlSteps']();

      expect(steps.length).toBe(dataRequestFormsModel.length);
      expect(steps.map((s) => s.id)).toEqual(dataRequestFormsModel.map((m) => m.formGroupName));
    });

    it('should update the isValid flag for a specific step', () => {
      component['updateFormSteps'](FORM_GROUP_NAMES.CONSUMER, true);

      const step = component['formControlSteps']().find((s) => s.id === FORM_GROUP_NAMES.CONSUMER);
      expect(step?.isValid).toBe(true);
    });

    it('should mark disabled form group steps not as completed', async () => {
      component['dataRequest'].set({
        id: '1',
        stateCode: DataRequestStateEnum.InReview,
      } as DataRequestDto);
      fixture.detectChanges();
      await fixture.whenStable();

      component['updateFormSteps']();

      const steps = component['formControlSteps']();
      expect(steps.every((s) => s.completed)).toBe(false);
    });
  });
});
