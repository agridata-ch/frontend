export * from './consentRequestController.service';
import { ConsentRequestControllerService } from './consentRequestController.service';
export * from './dataRequestController.service';
import { DataRequestControllerService } from './dataRequestController.service';
export const APIS = [ConsentRequestControllerService, DataRequestControllerService];
