import { Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

import { I18nDirective } from '@/shared/i18n';
import { DataRequestNewComponent } from '@/widgets/data-request-new/data-request-new.component';

@Component({
  selector: 'app-data-requests-consumer-page',
  imports: [FontAwesomeModule, I18nDirective, DataRequestNewComponent],
  templateUrl: './data-requests-consumer.page.html',
})
export class DataRequestsConsumerPage {
  // binds to the route parameter :dataRequestId
  readonly dataRequestId = input<string>();
  readonly icon = faDatabase;
}
