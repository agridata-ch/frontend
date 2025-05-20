export * from './dataConsentResource.service';
import { DataConsentResourceService } from './dataConsentResource.service';
export * from './dataRequestResource.service';
import { DataRequestResourceService } from './dataRequestResource.service';
export const APIS = [DataConsentResourceService, DataRequestResourceService];
