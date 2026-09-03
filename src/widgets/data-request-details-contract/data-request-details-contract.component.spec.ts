import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import {
  createMockAgridataStateService,
  createMockContractRevisionService,
  MockContractRevisionService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';

import { DataRequestDetailsContractComponent } from './data-request-details-contract.component';

describe('DataRequestDetailsContractComponent', () => {
  let componentRef: ComponentRef<DataRequestDetailsContractComponent>;
  let component: DataRequestDetailsContractComponent;
  let contractRevisionService: MockContractRevisionService;
  let errorService: MockErrorHandlerService;
  let fixture: ComponentFixture<DataRequestDetailsContractComponent>;

  const dataRequest: DataRequestDto = {
    currentContractRevisionId: 'cr-1',
    id: 'dr-1',
    stateCode: DataRequestStateEnum.ToBeSignedByProvider,
    advantages: [],
  };

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    errorService = createMockErrorHandlerService();

    TestBed.overrideComponent(DataRequestDetailsContractComponent, {
      set: {
        imports: [],
        template: '<div></div>',
      },
    });

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsContractComponent],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsContractComponent);
    componentRef = fixture.componentRef;
    component = fixture.componentInstance;
    componentRef.setInput('dataRequest', dataRequest);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch contract for the current revision id', async () => {
    await fixture.whenStable();
    expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('cr-1', undefined);
  });

  it('should emit handleSeal immediately and reload the contract after the success delay', async () => {
    vi.useFakeTimers();
    const reloadSpy = vi.spyOn(component.contractResource, 'reload');
    const sealedSpy = vi.fn();
    component.handleSeal.subscribe(sealedSpy);

    component['sealContract']();
    await Promise.resolve();
    await Promise.resolve();

    expect(contractRevisionService.sealContract).toHaveBeenCalledWith('cr-1');
    expect(component['sealSucceeded']()).toBe(true);
    expect(component['isSealing']()).toBe(false);
    // The admin gate signal fires as soon as the backend confirms the seal,
    // not on the cosmetic success-feedback timer, so it cannot be lost on destroy.
    expect(sealedSpy).toHaveBeenCalledTimes(1);
    expect(reloadSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);

    // The local view refresh that hides the seal button stays on the timer.
    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(sealedSpy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
