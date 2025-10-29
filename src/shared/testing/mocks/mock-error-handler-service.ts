import { ErrorHandlerService } from '@/app/error/error-handler.service';

export const mockErrorHandlerService: Partial<ErrorHandlerService> = {
  handleError: jest.fn(),
  getGlobalErrors: jest.fn(),
  markAllGlobalAsHandled: jest.fn(),
  getAllErrors: jest.fn(),
  registerHandler: jest.fn().mockReturnValue('1'),
  getErrorsForHandler: jest.fn(),
  markAllErrorsOfHandlerAsHandled: jest.fn(),
  unregisterHandler: jest.fn(),
};
