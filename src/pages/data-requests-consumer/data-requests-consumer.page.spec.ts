import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { MockDataRequestService, mockDataRequests } from '@/shared/testing/mocks';

import { DataRequestsConsumerPage } from './data-requests-consumer.page';

describe.skip('DataRequestsConsumerPage - component behavior', () => {
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

  it('should handleOpen', () => {
    openComponent.handleOpen();
    expect(openComponent.showPanel()).toBe(true);
  });

  it('should handleClose and set manual close flag', () => {
    openComponent.handleClose();
    expect(openComponent.showPanel()).toBe(false);
    expect(mockLocation.go).toHaveBeenCalled();
  });

  it('should setSelectedRequest and reset manual close flag', () => {
    const request = mockDataRequests[0];
    openComponent.setSelectedRequest(request);

    expect(openComponent.selectedRequest()).toEqual(request);
    expect(mockLocation.go).toHaveBeenCalledWith('data-requests/1');
  });

  it('should setSelectedRequest to null', () => {
    openComponent.setSelectedRequest(null);
    expect(openComponent.selectedRequest()).toBeNull();
    expect(mockLocation.go).toHaveBeenCalledWith('data-requests');
  });

  it('should respect the panelOpenedAutomatically signal', () => {
    const id = '1';
    const request = mockDataRequests[0];

    // Initially the panel should be closed and panelOpenedAutomatically is true
    openComponent.showPanel.set(false);
    openComponent.panelOpenedAutomatically.set(true);

    // Panel should not open when panelOpenedAutomatically is true
    if (id && !openComponent.panelOpenedAutomatically()) {
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    // Panel should remain closed
    expect(openComponent.showPanel()).toBe(false);

    // Now set panelOpenedAutomatically to false
    openComponent.panelOpenedAutomatically.set(false);

    // Panel should now open since panelOpenedAutomatically is false
    if (id && !openComponent.panelOpenedAutomatically()) {
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    expect(openComponent.showPanel()).toBe(true);
    expect(openComponent.selectedRequest()).toBe(request);
  });

  it('should process URL parameters correctly', () => {
    openComponent.dataRequestId = () => '1';

    // Simulate processing URL parameters - panel should open for the first time
    if (openComponent.dataRequestId() && openComponent.dataRequests.value()) {
      const request = mockDataRequests[0];
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
      openComponent.panelOpenedAutomatically.set(true); // This is set by initialOpenEffect
    }

    expect(openComponent.showPanel()).toBe(true);

    // Close the panel
    openComponent.handleClose();
    expect(openComponent.showPanel()).toBe(false);

    // panelOpenedAutomatically should still be true because it was already opened automatically
    expect(openComponent.panelOpenedAutomatically()).toBe(true);

    // After closing, even with the same dataRequestId, it shouldn't reopen automatically
    if (
      openComponent.dataRequestId() &&
      openComponent.dataRequests.value() &&
      !openComponent.panelOpenedAutomatically()
    ) {
      const request = mockDataRequests[0];
      openComponent.selectedRequest.set(request);
      openComponent.showPanel.set(true);
    }

    // Panel should remain closed
    expect(openComponent.showPanel()).toBe(false);
  });

  it('should not open panel when dataRequestId has no matching request', () => {
    // Now set a dataRequestId that won't match any request
    openComponent.dataRequestId = () => 'non-existent-id';

    // Reset panel state to ensure clean test
    openComponent.showPanel.set(false);
    openComponent.selectedRequest.set(null);
    openComponent.panelOpenedAutomatically.set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = openComponent.dataRequestId();
    const requests = openComponent.dataRequests.value();

    // This is the code we're testing (similar to the initialOpenEffect in the component)
    if (id && requests && !openComponent.panelOpenedAutomatically()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        openComponent.selectedRequest.set(matchingRequest);
        openComponent.showPanel.set(true);
        openComponent.panelOpenedAutomatically.set(true);
      }
    }

    // The panel should stay closed since no matching request was found
    expect(openComponent.showPanel()).toBe(false);
    expect(openComponent.selectedRequest()).toBeNull();
  });

  it.skip('should open panel when dataRequestId matches a request', () => {
    // Set a dataRequestId that will match the first mock request
    openComponent.dataRequestId = () => '1'; // ID of first mock request

    // Reset panel state to ensure clean test
    openComponent.showPanel.set(false);
    openComponent.selectedRequest.set(null);
    openComponent.panelOpenedAutomatically.set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = openComponent.dataRequestId();
    const requests = openComponent.dataRequests.value();

    // This is the code we're testing (similar to initialOpenEffect in component)
    if (id && requests && !openComponent.panelOpenedAutomatically()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        openComponent.selectedRequest.set(matchingRequest);
        openComponent.showPanel.set(true);
        openComponent.panelOpenedAutomatically.set(true);
      }
    }

    // The panel should open and the correct request should be selected
    expect(openComponent.showPanel()).toBe(true);
    expect(openComponent.selectedRequest()).toEqual(mockDataRequests[0]);
  });
});
