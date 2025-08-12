import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { MockDataRequestService } from '@/shared/testing/mocks';

import { DataRequestsConsumerPage } from './data-requests-consumer.page';

describe('DataRequestsConsumerPage - component behavior', () => {
  let fixture: ComponentFixture<DataRequestsConsumerPage>;
  let component: DataRequestsConsumerPage;
  let openComponent: any;
  let mockLocation: jest.Mocked<Location>;

  const sampleRequests: DataRequestDto[] = [
    {
      id: '1',
      stateCode: DataRequestStateEnum.Draft,
      requestDate: '2025-05-01',
      dataRequest: {
        dataConsumer: { name: 'Alice' },
        title: { de: 'Antrag A' },
        stateCode: DataRequestStateEnum.Draft,
      },
    } as DataRequestDto,
  ];

  beforeEach(async () => {
    mockLocation = {
      go: jest.fn(),
    } as unknown as jest.Mocked<Location>;

    await TestBed.configureTestingModule({
      providers: [
        DataRequestsConsumerPage,
        { provide: DataRequestService, useClass: MockDataRequestService },
        { provide: Location, useValue: mockLocation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestsConsumerPage);
    component = fixture.componentInstance;
    openComponent = component as any;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(openComponent).toBeTruthy();
  });

  it('should handleOpen', () => {
    openComponent.handleOpen();
    expect(openComponent.showPanel()).toBe(true);
  });

  it('should handleClose', () => {
    openComponent.handleClose();
    expect(openComponent.showPanel()).toBe(false);
  });

  it('should setSelectedRequest', () => {
    const request = sampleRequests[0];
    openComponent.setSelectedRequest(request);
    expect(openComponent.selectedRequest()).toEqual(request);
  });

  it('should setSelectedRequest to null', () => {
    openComponent.setSelectedRequest(null);
    expect(openComponent.selectedRequest()).toBeNull();
  });
});
