import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import {
  createMockContractRevisionService,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

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
    expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('cr-1');
  });
});
