import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { UserService } from '@/entities/api/user.service';
import {
  BurDto,
  ConsentRequestAggregationStateEnum,
  ConsentRequestFundamentalViewDto,
  ConsentRequestStateEnum,
  DataRequestDto,
  ExceptionEnum,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockToastService,
  createMockUserService,
  MockDataRequestService,
  MockErrorHandlerService,
  MockToastService,
  MockUserService,
  mockDataRequests,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataRequestAddProducersComponent } from './data-request-add-producers.component';

describe('DataRequestAddProducersComponent', () => {
  let fixture: ComponentFixture<DataRequestAddProducersComponent>;
  let component: DataRequestAddProducersComponent;
  let componentRef: ComponentRef<DataRequestAddProducersComponent>;
  let userService: MockUserService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let toastService: MockToastService;

  const UID = 'CHE111111111';
  const withBur: DataRequestDto = { ...mockDataRequests[0], burPresent: true };

  const burs: BurDto[] = [
    { uid: UID, bur: '11111' },
    { uid: UID, bur: '99999' },
  ];

  const consent = (
    bur: string,
    stateCode?: ConsentRequestStateEnum,
  ): ConsentRequestFundamentalViewDto => ({
    id: `cr-${bur}`,
    dataRequestId: '1',
    dataProducerUid: UID,
    dataProducerBur: bur,
    stateCode,
  });

  const createComponent = async (dataRequest: DataRequestDto) => {
    fixture = TestBed.createComponent(DataRequestAddProducersComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    componentRef.setInput('dataRequest', dataRequest);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const search = async (uid: string) => {
    component['searchValue'].set(uid);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    userService = createMockUserService();
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataRequestAddProducersComponent, createTranslocoTestingModule()],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    await createComponent(withBur);

    expect(component).toBeTruthy();
  });

  describe('UID validity', () => {
    it('should not trigger a lookup for an invalid UID and flag the format', async () => {
      await createComponent(withBur);
      await search('CHE-11');

      expect(component['searchedUid']()).toBeUndefined();
      expect(component['showUidInvalid']()).toBe(true);
      expect(userService.getAuthorizedBursByUid).not.toHaveBeenCalled();
    });

    it('should trigger a lookup for a valid UID', async () => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
      await createComponent(withBur);
      await search(UID);

      expect(component['showUidInvalid']()).toBe(false);
      expect(userService.getAuthorizedBursByUid).toHaveBeenCalledWith(UID);
    });
  });

  describe('with BUR products', () => {
    beforeEach(() => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([
        consent('11111', ConsentRequestStateEnum.Granted),
      ]);
    });

    it('should load one entry per BUR and flag the ones that already exist', async () => {
      await createComponent(withBur);
      await search(UID);

      const entries = component['entries']();
      expect(entries).toHaveLength(2);
      expect(entries.find((entry) => entry.bur === '11111')?.existing).toBe(true);
      expect(entries.find((entry) => entry.bur === '99999')?.existing).toBe(false);
    });

    it('should carry the consent stateCode of each existing entry', async () => {
      await createComponent(withBur);
      await search(UID);

      const entries = component['entries']();
      expect(entries.find((entry) => entry.bur === '11111')?.stateCode).toBe(
        ConsentRequestStateEnum.Granted,
      );
      expect(entries.find((entry) => entry.bur === '99999')?.stateCode).toBeUndefined();
    });

    it('should count only selected, non-existing entries', async () => {
      await createComponent(withBur);
      await search(UID);

      component['toggle']('99999');
      expect(component['selectedCount']()).toBe(1);

      // Existing entries never count even if toggled.
      component['toggle']('11111');
      expect(component['selectedCount']()).toBe(1);
    });

    it('should select and deselect all selectable entries via toggleAll', async () => {
      await createComponent(withBur);
      await search(UID);

      component['toggleAll']();
      expect(component['allSelectableSelected']()).toBe(true);
      expect(component['selectedCount']()).toBe(1);

      component['toggleAll']();
      expect(component['selectedCount']()).toBe(0);
    });
  });

  describe('badge state derivation', () => {
    beforeEach(() => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
    });

    it('should be Granted when all existing consents are granted', async () => {
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([
        consent('11111', ConsentRequestStateEnum.Granted),
      ]);
      await createComponent(withBur);
      await search(UID);

      expect(component['badgeState']()).toBe(ConsentRequestAggregationStateEnum.Granted);
    });

    it('should be PartiallyGranted for a decided mix', async () => {
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([
        consent('11111', ConsentRequestStateEnum.Granted),
        consent('99999', ConsentRequestStateEnum.Declined),
      ]);
      await createComponent(withBur);
      await search(UID);

      expect(component['badgeState']()).toBe(ConsentRequestAggregationStateEnum.PartiallyGranted);
    });

    it('should be undefined when there are no existing consents', async () => {
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
      await createComponent(withBur);
      await search(UID);

      expect(component['badgeState']()).toBeUndefined();
    });
  });

  describe('UID without BURs', () => {
    beforeEach(() => {
      userService.getAuthorizedBursByUid.mockResolvedValue([]);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
    });

    it('should flag the missing BURs and offer the UID itself as the entry', async () => {
      await createComponent(withBur);
      await search(UID);

      expect(component['hasNoBurs']()).toBe(true);
      expect(component['entries']()).toEqual([{ key: UID, existing: false, stateCode: undefined }]);
      expect(component['selectedCount']()).toBe(1);
    });

    it('should send the UID with an empty BUR list', async () => {
      await createComponent(withBur);
      await search(UID);

      await component['addProducers']();

      expect(dataRequestService.createConsentRequestsForDataRequest).toHaveBeenCalledWith(
        withBur.id,
        { uid: UID, burs: [] },
      );
    });

    it('should not offer the UID when it was already added', async () => {
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([
        consent('', ConsentRequestStateEnum.Opened),
      ]);
      await createComponent(withBur);
      await search(UID);

      expect(component['entries']()[0].existing).toBe(true);
      expect(component['selectedCount']()).toBe(0);
    });

    it('should not flag missing BURs when the data request has no BUR products', async () => {
      await createComponent(mockDataRequests[0]);
      await search(UID);

      expect(component['hasNoBurs']()).toBe(false);
    });
  });

  describe('opening', () => {
    it('should seed the search field from initialUid and reset state', async () => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
      await createComponent(withBur);

      componentRef.setInput('initialUid', UID);
      componentRef.setInput('open', true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['searchValue']()).toBe(UID);
      expect(userService.getAuthorizedBursByUid).toHaveBeenCalledWith(UID);
    });

    it('should refetch the lookup when reopened with the same UID', async () => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
      await createComponent(withBur);
      componentRef.setInput('initialUid', UID);

      for (const open of [true, false, true]) {
        componentRef.setInput('open', open);
        fixture.detectChanges();
        await fixture.whenStable();
      }

      expect(userService.getAuthorizedBursByUid).toHaveBeenCalledTimes(2);
      expect(dataRequestService.getConsentRequestsOfDataRequestAndUid).toHaveBeenCalledTimes(2);
    });
  });

  describe('adding producers', () => {
    beforeEach(() => {
      userService.getAuthorizedBursByUid.mockResolvedValue(burs);
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([
        consent('11111', ConsentRequestStateEnum.Granted),
      ]);
    });

    it('should send only the selected, non-existing BURs', async () => {
      await createComponent(withBur);
      await search(UID);
      component['toggleAll']();

      await component['addProducers']();

      expect(dataRequestService.createConsentRequestsForDataRequest).toHaveBeenCalledWith(
        withBur.id,
        { uid: UID, burs: ['99999'] },
      );
    });

    it('should send an empty BUR list when the data request has no BUR products', async () => {
      dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue([]);
      await createComponent(mockDataRequests[0]);
      await search(UID);

      await component['addProducers']();

      expect(dataRequestService.createConsentRequestsForDataRequest).toHaveBeenCalledWith(
        mockDataRequests[0].id,
        { uid: UID, burs: [] },
      );
    });

    it('should show a success toast, emit handleAdd and close the modal on success', async () => {
      await createComponent(withBur);
      componentRef.setInput('open', true);
      fixture.detectChanges();
      await fixture.whenStable();
      await search(UID);
      component['toggleAll']();
      const addSpy = vi.fn();
      component.reloadProducers.subscribe(addSpy);

      await component['addProducers']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Success,
      );
      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(component.open()).toBe(false);
      expect(component['isSubmitting']()).toBe(false);
    });

    it('should show an error toast, not emit and close the modal on error', async () => {
      dataRequestService.createConsentRequestsForDataRequest.mockRejectedValue(new Error('boom'));
      await createComponent(withBur);
      componentRef.setInput('open', true);
      fixture.detectChanges();
      await fixture.whenStable();
      await search(UID);
      component['toggleAll']();
      const addSpy = vi.fn();
      component.reloadProducers.subscribe(addSpy);

      await component['addProducers']();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Error,
      );
      expect(addSpy).not.toHaveBeenCalled();
      expect(component.open()).toBe(false);
      expect(component['isSubmitting']()).toBe(false);
    });

    it('should be submitting while the request is in flight', async () => {
      let resolve: (value: []) => void = () => {};
      dataRequestService.createConsentRequestsForDataRequest.mockReturnValue(
        new Promise((r) => (resolve = r)),
      );
      await createComponent(withBur);
      await search(UID);
      component['toggleAll']();

      const pending = component['addProducers']();
      expect(component['isSubmitting']()).toBe(true);

      resolve([]);
      await pending;
      expect(component['isSubmitting']()).toBe(false);
    });
  });

  describe('errors', () => {
    it('should forward lookup errors to the error handler', async () => {
      const error = new Error('boom');
      userService.getAuthorizedBursByUid.mockRejectedValue(error);
      await createComponent(withBur);
      await search(UID);

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });

    it('should flag the UID as not found and not forward EXTERNAL_SERVICE_ERROR', async () => {
      userService.getAuthorizedBursByUid.mockRejectedValue(
        new HttpErrorResponse({
          error: { type: ExceptionEnum.ExternalServiceError, requestId: 'r1' },
          status: 502,
        }),
      );
      await createComponent(withBur);
      await search(UID);

      expect(component['uidNotFound']()).toBe(true);
      expect(component['hasUidError']()).toBe(true);
      expect(errorService.handleError).not.toHaveBeenCalled();
    });
  });
});
