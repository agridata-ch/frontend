export * from './consentRequests.service';
import { ConsentRequestsService } from './consentRequests.service';
export * from './dataRequests.service';
import { DataRequestsService } from './dataRequests.service';
export * from './infoResource.service';
import { InfoResourceService } from './infoResource.service';
export * from './testData.service';
import { TestDataService } from './testData.service';
export const APIS = [ConsentRequestsService, DataRequestsService, InfoResourceService, TestDataService];
