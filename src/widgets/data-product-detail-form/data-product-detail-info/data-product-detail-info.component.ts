import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { I18nDirective } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { ViewSectionDirective } from '@/shared/view-section';
import { AlertComponent, AlertType } from '@/widgets/alert';

/**
 * Tab component for the system configuration and name/description fields of a data product.
 *
 * CommentLastReviewed: 2026-06-16
 */
@Component({
  selector: 'app-data-product-detail-info',
  imports: [AlertComponent, FormControlComponent, I18nDirective, ViewSectionDirective],
  templateUrl: './data-product-detail-info.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailInfoComponent {
  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ControlTypes = ControlTypes;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);

  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }
}
