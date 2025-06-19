import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

import { I18nDirective } from '@/shared/i18n';

@Component({
  selector: 'app-data-requests-consumer-page',
  imports: [FontAwesomeModule, I18nDirective],
  templateUrl: './data-requests-consumer.page.html',
})
export class DataRequestsConsumerPage {
  // binds to the route parameter :dataRequestId
  readonly dataRequestId = input<string>();
  readonly icon = faDatabase;
}
