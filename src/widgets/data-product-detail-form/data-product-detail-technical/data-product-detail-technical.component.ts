import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { I18nDirective } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';

import { FLOW_CODE_OPTIONS } from '../data-product-detail-form.model';

/**
 * Tab component for the technical configuration fields of a data product.
 *
 * CommentLastReviewed: 2026-06-09
 */
@Component({
  selector: 'app-data-product-detail-technical',
  imports: [FormControlComponent, I18nDirective],
  templateUrl: './data-product-detail-technical.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailTechnicalComponent {
  // Constants
  protected readonly ControlTypes = ControlTypes;
  protected readonly flowCodeOptions = FLOW_CODE_OPTIONS;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);

  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }
}
