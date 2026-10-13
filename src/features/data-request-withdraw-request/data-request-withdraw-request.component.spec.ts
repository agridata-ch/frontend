import { provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService, DataRequestService } from '@/entities/api';
import { UserService } from '@/entities/api/user.service';
import {
  ConsentRequestFundamentalViewDto,
  ConsentRequestStateEnum,
  DataRequestDto,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockConsentRequestService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockToastService,
  createMockUserService,
  MockConsentRequestService,
  MockDataRequestService,
  MockToastService,
  MockUserService,
  mockDataRequests,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';

import { DataRequestWithdrawRequestComponent } from './data-request-withdraw-request.component';

describe('DataRequestWithdrawRequestComponent', () => {
  let fixture: ComponentFixture<DataRequestWithdrawRequestComponent>;
  let component: DataRequestWithdrawRequestComponent;
  let componentRef: ComponentRef<DataRequestWithdrawRequestComponent>;
  let userService: MockUserService;
  let dataRequestService: MockDataRequestService;
  let consentRequestService: MockConsentRequestService;
  let toastService: MockToastService;

  const UID = 'CHE111111111';
  const withBur: DataRequestDto = { ...mockDataRequests[0], burPresent: true };
  const withoutBur: DataRequestDto = { ...mockDataRequests[0], burPresent: false };

  const consent = (
    bur: string | undefined,
    stateCode?: ConsentRequestStateEnum,
  ): ConsentRequestFundamentalViewDto => ({
    id: `cr-${bur ?? 'uid'}`,
    dataRequestId: '1',
    dataProducerUid: UID,
    dataProducerBur: bur,
    stateCode,
  });

  const burs = [
    { uid: UID, bur: '11111' },
    { uid: UID, bur: '22222' },
    { uid: UID, bur: '33333' },
  ];

  const createComponent = async (
    dataRequest: DataRequestDto,
    row: ConsentRequestFundamentalViewDto,
    existing: ConsentRequestFundamentalViewDto[],
    authorizedBurs = burs,
  ) => {
    userService.getAuthorizedBursByUid.mockResolvedValue(
      dataRequest.burPresent ? authorizedBurs : [],
    );
    dataRequestService.getConsentRequestsOfDataRequestAndUid.mockResolvedValue(existing);

    fixture = TestBed.createComponent(DataRequestWithdrawRequestComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    componentRef.setInput('dataRequest', dataRequest);
    componentRef.setInput('consentRequest', row);
    componentRef.setInput('open', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    userService = createMockUserService();
    dataRequestService = createMockDataRequestService();
    consentRequestService = createMockConsentRequestService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataRequestWithdrawRequestComponent, createTranslocoTestingModule()],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: ErrorHandlerService, useValue: createMockErrorHandlerService() },
        { provide: ToastService, useValue: toastService },
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  describe('with BUR products', () => {
    const existing = [
      consent('11111', ConsentRequestStateEnum.Granted),
      consent('22222', ConsentRequestStateEnum.Opened),
    ];

    it('should preselect only the BUR of the row', async () => {
      await createComponent(withBur, existing[0], existing);

      expect(component['isSelected']('11111')).toBe(true);
      expect(component['isSelected']('22222')).toBe(false);
      expect(component['selectedCount']()).toBe(1);
    });

    it('should preselect every BUR with a request when opened from the UID', async () => {
      await createComponent(withBur, consent(undefined, ConsentRequestStateEnum.Granted), existing);

      expect(component['isSelected']('11111')).toBe(true);
      expect(component['isSelected']('22222')).toBe(true);
      expect(component['isSelected']('33333')).toBe(false);
    });

    it('should list existing BURs even when none are authorized', async () => {
      await createComponent(withBur, existing[0], existing, []);

      expect(component['showBurSection']()).toBe(true);
      expect(component['entries']().map((entry) => entry.bur)).toEqual(['11111', '22222']);
      expect(component['isSelected']('11111')).toBe(true);

      component['toggle']('22222');

      expect(component['isSelected']('22222')).toBe(true);
      expect(component['isComplete']()).toBe(true);
    });

    it('should not allow selecting a BUR without a request', async () => {
      await createComponent(withBur, existing[0], existing);

      const withoutRequest = component['entries']().find((entry) => entry.bur === '33333');

      expect(withoutRequest?.withdrawable).toBe(false);
    });

    it('should show the partial label while not all requests are selected', async () => {
      await createComponent(withBur, existing[0], existing);

      expect(component['isComplete']()).toBe(false);
      expect(component['selectedCount']()).toBe(1);
    });

    it('should be complete once every BUR with a request is selected', async () => {
      await createComponent(withBur, existing[0], existing);

      component['toggle']('22222');

      expect(component['isComplete']()).toBe(true);
    });

    it('should be complete when the only BUR with a request is selected', async () => {
      await createComponent(withBur, existing[0], [existing[0]]);

      expect(component['isComplete']()).toBe(true);
    });

    it('should deselect everything with toggleAll when complete', async () => {
      await createComponent(withBur, consent(undefined), existing);

      component['toggleAll']();

      expect(component['selectedCount']()).toBe(0);
    });

    it('should withdraw the selected consent requests and close', async () => {
      await createComponent(withBur, existing[0], existing);
      const withdrawn = vi.fn();
      component.handleWithdrawn.subscribe(withdrawn);
      consentRequestService.updateConsentRequestStatuses.mockResolvedValue([]);

      await component['withdraw']();

      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
        ['cr-11111'],
        ConsentRequestStateEnum.Withdrawn,
      );
      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Success,
      );
      expect(withdrawn).toHaveBeenCalledTimes(1);
      expect(component.open()).toBe(false);
    });

    it('should show an error toast and still emit withdrawn when withdrawing fails', async () => {
      await createComponent(withBur, existing[0], existing);
      const withdrawn = vi.fn();
      component.handleWithdrawn.subscribe(withdrawn);
      consentRequestService.updateConsentRequestStatuses.mockRejectedValue(new Error('boom'));

      await component['withdraw']();

      expect(withdrawn).toHaveBeenCalledTimes(1);
      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Error,
      );
    });
  });

  describe('BUR section visibility', () => {
    it('should hide the BUR section and withdraw the UID request when the request has no BUR', async () => {
      const uidRequest = consent(undefined, ConsentRequestStateEnum.Granted);

      await createComponent(withBur, uidRequest, [uidRequest]);

      expect(component['showBurSection']()).toBe(false);
      expect(component['selectedCount']()).toBe(1);
      expect(component['isComplete']()).toBe(true);
    });

    it('should be complete right after opening when the UID has a single BUR', async () => {
      const single = consent('11111', ConsentRequestStateEnum.Granted);
      await createComponent(withBur, single, [single], [burs[0]]);

      expect(component['showBurSection']()).toBe(true);
      expect(component['entries']()).toHaveLength(1);
      expect(component['isComplete']()).toBe(true);
    });
  });

  describe('without BUR products', () => {
    const row = consent(undefined, ConsentRequestStateEnum.Granted);

    it('should hide the BUR section and withdraw the UID request completely', async () => {
      await createComponent(withoutBur, row, [row]);

      expect(component['showBurSection']()).toBe(false);
      expect(component['isComplete']()).toBe(true);
      expect(component['selectedCount']()).toBe(1);
    });
  });
});
