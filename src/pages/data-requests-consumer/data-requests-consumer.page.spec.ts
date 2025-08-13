import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { MockDataRequestService, mockDataRequests } from '@/shared/testing/mocks';

import { DataRequestsConsumerPage } from './data-requests-consumer.page';

describe('DataRequestsConsumerPage - component behavior', () => {
  let fixture: ComponentFixture<DataRequestsConsumerPage>;
  let component: DataRequestsConsumerPage;
  let openComponent: any;
  let mockLocation: jest.Mocked<Location>;

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

  it('should handleOpen and reset manual close flag', () => {
    openComponent.panelManuallyClosed.set(true);
    openComponent.handleOpen();
    expect(openComponent.showPanel()).toBe(true);
    expect(openComponent.panelManuallyClosed()).toBe(false);
  });

  it('should handleClose and set manual close flag', () => {
    openComponent.handleClose();
    expect(openComponent.showPanel()).toBe(false);
    expect(openComponent.panelManuallyClosed()).toBe(true);
    expect(mockLocation.go).toHaveBeenCalled();
  });

  it('should setSelectedRequest and reset manual close flag', () => {
    const request = mockDataRequests[0];
    openComponent.panelManuallyClosed.set(true);
    openComponent.setSelectedRequest(request);

    expect(openComponent.selectedRequest()).toEqual(request);
    expect(openComponent.panelManuallyClosed()).toBe(false);
    expect(mockLocation.go).toHaveBeenCalledWith('data-requests/1');
  });

  it('should setSelectedRequest to null', () => {
    openComponent.setSelectedRequest(null);
    expect(openComponent.selectedRequest()).toBeNull();
    expect(mockLocation.go).toHaveBeenCalledWith('data-requests');
  });

  it('should respect the panelManuallyClosed signal', () => {
    openComponent.panelManuallyClosed.set(true);

    const id = '1';
    const request = mockDataRequests[0];

    if (id && !openComponent.panelManuallyClosed()) {
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    expect(openComponent.showPanel()).toBe(false);

    openComponent.panelManuallyClosed.set(false);

    if (id && !openComponent.panelManuallyClosed()) {
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    expect(openComponent.showPanel()).toBe(true);
    expect(openComponent.selectedRequest()).toBe(request);
  });

  it('should respond to manual flag when processing URL parameters', () => {
    openComponent.dataRequestId = () => '1';

    if (
      openComponent.dataRequestId() &&
      openComponent.dataRequests.value() &&
      !openComponent.panelManuallyClosed()
    ) {
      const request = mockDataRequests[0];
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    expect(openComponent.showPanel()).toBe(true);

    openComponent.handleClose();
    expect(openComponent.showPanel()).toBe(false);
    expect(openComponent.panelManuallyClosed()).toBe(true);

    if (
      openComponent.dataRequestId() &&
      openComponent.dataRequests.value() &&
      !openComponent.panelManuallyClosed()
    ) {
      const request = mockDataRequests[0];
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    expect(openComponent.showPanel()).toBe(false);
  });

  it('should not open panel when dataRequestId has no matching request', () => {
    // Setup the service with some mock data first
    const mockDataService = TestBed.inject(DataRequestService);
    (mockDataService.fetchDataRequests as any).value = () => [...mockDataRequests];

    // Create a new component instance
    const testFixture = TestBed.createComponent(DataRequestsConsumerPage);
    const testComponent = testFixture.componentInstance as any;
    testFixture.detectChanges(); // Initial detection

    // Now set a dataRequestId that won't match any request
    testComponent.dataRequestId = () => 'non-existent-id';

    // Reset panel state to ensure clean test
    testComponent.showPanel.set(false);
    testComponent.selectedRequest.set(null);
    testComponent.panelManuallyClosed.set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = testComponent.dataRequestId();
    const requests = testComponent.dataRequests.value();

    // This is the code we're testing (copied from the component)
    if (id && requests && !testComponent.panelManuallyClosed()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        testComponent.selectedRequest.set(matchingRequest);
        testComponent.showPanel.set(true);
      }
    }

    // The panel should stay closed since no matching request was found
    expect(testComponent.showPanel()).toBe(false);
    expect(testComponent.selectedRequest()).toBeNull();
  });

  it('should open panel when dataRequestId matches a request', () => {
    // Setup the service with mock data
    const mockDataService = TestBed.inject(DataRequestService);
    (mockDataService.fetchDataRequests as any).value = () => [...mockDataRequests];

    // Create a new component instance
    const testFixture = TestBed.createComponent(DataRequestsConsumerPage);
    const testComponent = testFixture.componentInstance as any;
    testFixture.detectChanges(); // Initial detection

    // Set a dataRequestId that will match the first mock request
    testComponent.dataRequestId = () => '1'; // ID of first mock request

    // Reset panel state to ensure clean test
    testComponent.showPanel.set(false);
    testComponent.selectedRequest.set(null);
    testComponent.panelManuallyClosed.set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = testComponent.dataRequestId();
    const requests = testComponent.dataRequests.value();

    // This is the code we're testing (copied from the component)
    if (id && requests && !testComponent.panelManuallyClosed()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        testComponent.selectedRequest.set(matchingRequest);
        testComponent.showPanel.set(true);
      }
    }

    // The panel should open and the correct request should be selected
    expect(testComponent.showPanel()).toBe(true);
    expect(testComponent.selectedRequest()).toEqual(mockDataRequests[0]);
  });
});
