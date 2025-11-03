import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DebugLogSource, DebugLogStatus } from '@/features/debug/debug.model';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

import { DebugService } from './debug.service';

describe('DebugService', () => {
  let service: DebugService;
  let mockErrorService: MockErrorHandlerService;
  let agridataStateService: MockAgridataStateService;

  beforeEach(() => {
    mockErrorService = createMockErrorHandlerService();

    agridataStateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        DebugService,
        { provide: ErrorHandlerService, useValue: mockErrorService },
        { provide: AgridataStateService, useValue: agridataStateService },
      ],
    });
    service = TestBed.inject(DebugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addRequest', () => {
    it('should add a request', () => {
      service.addRequest('/api/users', 'GET');

      const requests = service.getRequests();
      expect(requests.length).toBe(1);
      expect(requests[0].url).toBe('/api/users');
      expect(requests[0].method).toBe('GET');
      expect(requests[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add multiple requests', () => {
      service.addRequest('/api/users', 'GET');
      service.addRequest('/api/products', 'POST');

      const requests = service.getRequests();
      expect(requests.length).toBe(2);
      expect(requests[0].url).toBe('/api/users');
      expect(requests[1].url).toBe('/api/products');
    });

    it('should not add request with empty url', () => {
      service.addRequest('', 'GET');

      const requests = service.getRequests();
      expect(requests.length).toBe(0);
    });

    it('should not add request with empty method', () => {
      service.addRequest('/api/users', '');

      const requests = service.getRequests();
      expect(requests.length).toBe(0);
    });
  });

  describe('addResponse', () => {
    it('should add a successful response', () => {
      service.addResponse('/api/users', 'GET', 200, 'OK', false);

      const responses = service.getResponses();
      expect(responses.length).toBe(1);
      expect(responses[0].url).toBe('/api/users');
      expect(responses[0].method).toBe('GET');
      expect(responses[0].status).toBe(200);
      expect(responses[0].statusText).toBe('OK');
      expect(responses[0].isError).toBe(false);
      expect(responses[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add an error response', () => {
      service.addResponse('/api/users', 'GET', 404, 'Not Found', true);

      const responses = service.getResponses();
      expect(responses.length).toBe(1);
      expect(responses[0].status).toBe(404);
      expect(responses[0].statusText).toBe('Not Found');
      expect(responses[0].isError).toBe(true);
    });

    it('should add response with requestId', () => {
      service.addResponse('/api/users', 'GET', 500, 'Internal Server Error', true, 'req-123');

      const responses = service.getResponses();
      expect(responses.length).toBe(1);
      expect(responses[0].requestId).toBe('req-123');
    });

    it('should add multiple responses', () => {
      service.addResponse('/api/users', 'GET', 200, 'OK', false);
      service.addResponse('/api/products', 'POST', 201, 'Created', false);

      const responses = service.getResponses();
      expect(responses.length).toBe(2);
    });

    it('should not add response with empty url', () => {
      service.addResponse('', 'GET', 200, 'OK', false);

      const responses = service.getResponses();
      expect(responses.length).toBe(0);
    });

    it('should not add response with empty method', () => {
      service.addResponse('/api/users', '', 200, 'OK', false);

      const responses = service.getResponses();
      expect(responses.length).toBe(0);
    });
  });

  describe('getRequests', () => {
    it('should return a copy of requests array', () => {
      service.addRequest('/api/users', 'GET');

      const requests1 = service.getRequests();
      const requests2 = service.getRequests();

      expect(requests1).not.toBe(requests2);
      expect(requests1).toEqual(requests2);
    });

    it('should return empty array when no requests', () => {
      const requests = service.getRequests();
      expect(requests).toEqual([]);
    });
  });

  describe('getResponses', () => {
    it('should return a copy of responses array', () => {
      service.addResponse('/api/users', 'GET', 200, 'OK', false);

      const responses1 = service.getResponses();
      const responses2 = service.getResponses();

      expect(responses1).not.toBe(responses2);
      expect(responses1).toEqual(responses2);
    });

    it('should return empty array when no responses', () => {
      const responses = service.getResponses();
      expect(responses).toEqual([]);
    });
  });

  describe('debugLogs', () => {
    it('should return combined logs from all sources', () => {
      service.addRequest('/api/users', 'GET');
      service.addResponse('/api/users', 'GET', 200, 'OK', false);

      const logs = service.debugLogs();
      expect(logs.length).toBe(2);
    });

    it('should sort logs by timestamp descending', () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      service.addRequest('/api/first', 'GET');
      // Manually set timestamp to earlier
      service['requests'][0].timestamp = earlier;

      service.addRequest('/api/second', 'GET');
      service['requests'][1].timestamp = now;

      const logs = service.debugLogs();
      expect(logs[0].message).toContain('/api/second');
      expect(logs[1].message).toContain('/api/first');
    });

    it('should include request logs with correct properties', () => {
      service.addRequest('/api/users', 'GET');

      const logs = service.debugLogs();
      const requestLog = logs.find((log) => log.source === DebugLogSource.REQUEST);

      expect(requestLog).toBeDefined();
      expect(requestLog?.message).toBe('GET: /api/users');
      expect(requestLog?.status).toBe(DebugLogStatus.INFO);
      expect(requestLog?.timestamp).toBeInstanceOf(Date);
    });

    it('should include successful response logs with correct properties', () => {
      service.addResponse('/api/users', 'GET', 200, 'OK', false);

      const logs = service.debugLogs();
      const responseLog = logs.find((log) => log.source === DebugLogSource.RESPONSE);

      expect(responseLog).toBeDefined();
      expect(responseLog?.message).toBe('200 OK - /api/users');
      expect(responseLog?.status).toBe(DebugLogStatus.SUCCESS);
      expect(responseLog?.timestamp).toBeInstanceOf(Date);
    });

    it('should include error response logs with correct properties', () => {
      service.addResponse('/api/users', 'GET', 404, 'Not Found', true);

      const logs = service.debugLogs();
      const responseLog = logs.find((log) => log.source === DebugLogSource.RESPONSE);

      expect(responseLog).toBeDefined();
      expect(responseLog?.message).toBe('404 Not Found - /api/users');
      expect(responseLog?.status).toBe(DebugLogStatus.ERROR);
    });

    it('should include requestId in response message when provided', () => {
      service.addResponse('/api/users', 'GET', 500, 'Error', true, 'req-123');

      const logs = service.debugLogs();
      const responseLog = logs.find((log) => log.source === DebugLogSource.RESPONSE);

      expect(responseLog?.message).toContain('requestId: req-123');
    });

    it('should return empty array when no logs', () => {
      const logs = service.debugLogs();
      expect(logs).toEqual([]);
    });
  });

  describe('removeOldEntries', () => {
    it('should keep only last 10 requests', () => {
      // Add 15 requests
      for (let i = 0; i < 15; i++) {
        service.addRequest(`/api/request-${i}`, 'GET');
      }

      expect(service.getRequests().length).toBe(15);

      service['removeOldEntries']();

      const requests = service.getRequests();
      expect(requests.length).toBe(10);
    });

    it('should keep only last 10 responses', () => {
      // Add 15 responses
      for (let i = 0; i < 15; i++) {
        service.addResponse(`/api/response-${i}`, 'GET', 200, 'OK', false);
      }

      expect(service.getResponses().length).toBe(15);

      service['removeOldEntries']();

      const responses = service.getResponses();
      expect(responses.length).toBe(10);
    });

    it('should keep newest requests and remove oldest', () => {
      const now = Date.now();

      // Add 15 requests with incrementing timestamps
      for (let i = 0; i < 15; i++) {
        service.addRequest(`/api/request-${i}`, 'GET');
        service['requests'][i].timestamp = new Date(now + i * 1000);
      }

      service['removeOldEntries']();

      const requests = service.getRequests();
      expect(requests.length).toBe(10);
      // Should keep requests 5-14 (newest 10)
      expect(requests[0].url).toContain('request-14');
      expect(requests[9].url).toContain('request-5');
    });

    it('should keep newest responses and remove oldest', () => {
      const now = Date.now();

      // Add 15 responses with incrementing timestamps
      for (let i = 0; i < 15; i++) {
        service.addResponse(`/api/response-${i}`, 'GET', 200, 'OK', false);
        service['responses'][i].timestamp = new Date(now + i * 1000);
      }

      service['removeOldEntries']();

      const responses = service.getResponses();
      expect(responses.length).toBe(10);
      // Should keep responses 5-14 (newest 10)
      expect(responses[0].url).toContain('response-14');
      expect(responses[9].url).toContain('response-5');
    });

    it('should not modify arrays with 10 or fewer items', () => {
      // Add exactly 10 requests
      for (let i = 0; i < 10; i++) {
        service.addRequest(`/api/request-${i}`, 'GET');
      }

      service['removeOldEntries']();

      expect(service.getRequests().length).toBe(10);
    });

    it('should handle empty arrays', () => {
      service['removeOldEntries']();

      expect(service.getRequests()).toEqual([]);
      expect(service.getResponses()).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully when adding invalid data', () => {
      // Service should not throw even with invalid inputs
      expect(() => {
        service.addRequest(null as any, 'GET');
      }).not.toThrow();

      expect(() => {
        service.addResponse(undefined as any, 'GET', 200, 'OK', false);
      }).not.toThrow();
    });

    it('should return empty logs if error service fails', () => {
      mockErrorService.getAllErrors = jest.fn().mockImplementation(() => {
        throw new Error('Service error');
      });

      const logs = service.debugLogs();
      expect(logs).toEqual([]);
    });

    it('should handle cleanup errors gracefully', () => {
      // Add some requests
      service.addRequest('/api/test', 'GET');

      // Corrupt the array to cause an error
      service['requests'] = null as any;

      // Should not throw
      expect(() => {
        service['removeOldEntries']();
      }).not.toThrow();
    });
  });
});
