import { Component, input } from '@angular/core';

import { ContractRevisionSignatureDto } from '@/entities/openapi';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective } from '@/shared/i18n';
import { AgridataBadgeComponent } from '@/shared/ui/badge';
import { AlertComponent, AlertType } from '@/widgets/alert';

/**
 * Component to display a single signature in the data request completion component.
 * It shows the details of a signature, including the signer, signing date, and any relevant information.
 *
 * CommentLastReviewed: 2026-04-14
 */
@Component({
  selector: 'app-data-request-completion-signature',
  imports: [AgridataBadgeComponent, AlertComponent, AgridataDatePipe, I18nDirective],
  templateUrl: './data-request-completion-signature.component.html',
})
export class DataRequestCompletionSignatureComponent {
  readonly signature = input.required<ContractRevisionSignatureDto>();
  readonly position = input.required<number>();

  protected readonly AlertType = AlertType;
}
