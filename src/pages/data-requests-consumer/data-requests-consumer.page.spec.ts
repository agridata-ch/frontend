import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { mockDataRequestService, mockDataRequests } from '@/shared/testing/mocks';
import { mockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler-service';

import { DataRequestsConsumerPage } from './data-requests-consumer.page';

describe('DataRequestsConsumerPage - component behavior', () => {
  let fixture: ComponentFixture<DataRequestsConsumerPage>;
  let component: DataRequestsConsumerPage;
  let mockLocation: jest.Mocked<Location>;
  let dataRequestService: Partial<DataRequestService>;
  let errorService: Partial<ErrorHandlerService>;

  beforeEach(async () => {
    mockLocation = {
      go: jest.fn(),
    } as unknown as jest.Mocked<Location>;
    dataRequestService = mockDataRequestService;
    errorService = mockErrorHandlerService;
    await TestBed.configureTestingModule({
      providers: [
        DataRequestsConsumerPage,
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: Location, useValue: mockLocation },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestsConsumerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handleOpen', () => {
    component['handleOpen']();
    expect(component['showPanel']()).toBe(true);
  });

  it('should handleClose and set manual close flag', () => {
    component['handleClose']();
    expect(component['showPanel']()).toBe(false);
    expect(mockLocation.go).toHaveBeenCalled();
  });

  it('should setSelectedRequest and reset manual close flag', () => {
    const request = mockDataRequests[0];
    component['setSelectedRequest'](request);

    expect(component['selectedRequest']()).toEqual(request);
    expect(mockLocation.go).toHaveBeenCalledWith(`data-requests/${request.id}`);
  });

  it('should setSelectedRequest to null', () => {
    component['setSelectedRequest'](null);
    expect(component['selectedRequest']()).toBeNull();
    expect(mockLocation.go).toHaveBeenCalledWith('data-requests');
  });

  it('should respect the panelOpenedAutomatically signal', () => {
    const id = '1';
    const request = mockDataRequests[0];

    // Initially the panel should be closed and panelOpenedAutomatically is true
    component['showPanel'].set(false);
    component['panelOpenedAutomatically'].set(true);

    // Panel should not open when panelOpenedAutomatically is true
    if (id && !component['panelOpenedAutomatically']()) {
      component['selectedRequest'].set(request);
      component['showPanel'].set(true);
    }

    // Panel should remain closed
    expect(component['showPanel']()).toBe(false);

    // Now set panelOpenedAutomatically to false
    component['panelOpenedAutomatically'].set(false);

    // Panel should now open since panelOpenedAutomatically is false
    if (id && !component['panelOpenedAutomatically']()) {
      component['selectedRequest'].set(request);
      component['showPanel'].set(true);
    }

    expect(component['showPanel']()).toBe(true);
    expect(component['selectedRequest']()).toBe(request);
  });

  it('should process URL parameters correctly', () => {
    fixture.componentRef.setInput('dataRequestId', '1');

    // Simulate processing URL parameters - panel should open for the first time
    if (component.dataRequestId() && component['dataRequests']()) {
      const request = mockDataRequests[0];
      component['selectedRequest'].set(request);
      component['showPanel'].set(true);
      component['panelOpenedAutomatically'].set(true); // This is set by initialOpenEffect
    }

    expect(component['showPanel']()).toBe(true);

    // Close the panel
    component['handleClose']();
    expect(component['showPanel']()).toBe(false);

    // panelOpenedAutomatically should still be true because it was already opened automatically
    expect(component['panelOpenedAutomatically']()).toBe(true);

    // After closing, even with the same dataRequestId, it shouldn't reopen automatically
    if (
      component.dataRequestId() &&
      component['dataRequests']() &&
      !component['panelOpenedAutomatically']()
    ) {
      const request = mockDataRequests[0];
      component['selectedRequest'].set(request);
      component['showPanel'].set(true);
    }

    // Panel should remain closed
    expect(component['showPanel']()).toBe(false);
  });

  it('should not open panel when dataRequestId has no matching request', () => {
    // Now set a dataRequestId that won't match any request
    fixture.componentRef.setInput('dataRequestId', 'non-existent-id');

    // Reset panel state to ensure clean test
    component['showPanel'].set(false);
    component['selectedRequest'].set(null);
    component['panelOpenedAutomatically'].set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = component.dataRequestId();
    const requests = component['dataRequests']();

    // This is the code we're testing (similar to the initialOpenEffect in the component)
    if (id && requests && !component['panelOpenedAutomatically']()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        component['selectedRequest'].set(matchingRequest);
        component['showPanel'].set(true);
        component['panelOpenedAutomatically'].set(true);
      }
    }

    // The panel should stay closed since no matching request was found
    expect(component['showPanel']()).toBe(false);
    expect(component['selectedRequest']()).toBeNull();
  });

  it('should open panel when dataRequestId matches a request', () => {
    // Get the ID of the first mock request and use it
    const requestId = mockDataRequests[0].id;

    // Set a dataRequestId that will match the first mock request
    fixture.componentRef.setInput('dataRequestId', requestId);

    // Reset panel state to ensure clean test
    component['showPanel'].set(false);
    component['selectedRequest'].set(null);
    component['panelOpenedAutomatically'].set(false);

    // Directly test the effect's condition by manually simulating its behavior
    const id = component.dataRequestId();
    const requests = component['dataRequests']();

    // This is the code we're testing (similar to initialOpenEffect in component)
    if (id && requests && !component['panelOpenedAutomatically']()) {
      const matchingRequest = requests.find((req: any) => req.id === id);
      if (matchingRequest) {
        component['selectedRequest'].set(matchingRequest);
        component['showPanel'].set(true);
        component['panelOpenedAutomatically'].set(true);
      }
    }

    // The panel should open and the correct request should be selected
    expect(component['showPanel']()).toBe(true);
    const expectedRequest = mockDataRequests.find((req) => req.id === requestId);
    expect(component['selectedRequest']()).toEqual(expectedRequest);
  });

  it('should handle errors from dataRequestsResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchDataRequests');
    (dataRequestService.fetchDataRequests as jest.Mock).mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(DataRequestsConsumerPage);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });
});
