import { Component, input } from '@angular/core';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { AlertType, AlertComponent } from '@/widgets/alert';

/**
 * Component for the contract step in the data request form.
 *
 * CommentLastReviewed: 2026-01-20
 */
@Component({
  selector: 'app-data-request-form-contract',
  imports: [AlertComponent, I18nDirective],
  templateUrl: './data-request-form-contract.component.html',
})
export class DataRequestFormContractComponent {
  readonly dataRequest = input.required<DataRequestDto>();

  protected readonly AlertType = AlertType;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
}
