import { Component, computed, Resource } from '@angular/core';
import { version } from '../../../package.json';
import { TestDataApiService } from '@shared/services/test-data.service';
import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ConsentRequestDto } from '@shared/api/openapi';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-footer-widget',
  imports: [],
  templateUrl: './footer-widget.component.html',
  styleUrl: './footer-widget.component.css',
})
export class FooterWidgetComponent {
  public version;
  readonly consentRequestResult!: Resource<ConsentRequestDto[]>;
  readonly isDevMode = computed(() => !environment.production);

  constructor(
    private readonly testDataService: TestDataApiService,
    private readonly consentRequestService: ConsentRequestService,
  ) {
    this.version = version;
  }

  // remove this method for production
  // it is only for testing purposes to reset the test data
  resetData = () => {
    this.testDataService
      .resetTestData()
      .then(() => this.consentRequestService.fetchConsentRequests());
  };
}
