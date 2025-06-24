import { Component, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase, faPlus } from '@fortawesome/free-solid-svg-icons';

import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel/sidepanel.component';
import { ButtonVariants } from '@/shared/ui/button';
import { ButtonComponent } from '@/shared/ui/button/button.component';
import { DataRequestNewComponent } from '@/widgets/data-request-new/data-request-new.component';

@Component({
  selector: 'app-data-requests-consumer-page',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    DataRequestNewComponent,
    ButtonComponent,
    I18nPipe,
    SidepanelComponent,
  ],
  templateUrl: './data-requests-consumer.page.html',
})
export class DataRequestsConsumerPage {
  // binds to the route parameter :dataRequestId
  readonly dataRequestId = input<string>();

  readonly showPanel = signal<boolean>(false);

  readonly ButtonVariants = ButtonVariants;
  readonly buttonIcon = faPlus;
  readonly icon = faDatabase;

  handleOpen() {
    this.showPanel.set(true);
  }

  handleClose() {
    this.showPanel.set(false);
  }
}
