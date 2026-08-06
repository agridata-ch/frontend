import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DataProductDtoStateCode } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { LinkedTextComponent } from '@/shared/ui/linked-text';
import { parseLinkedText } from '@/shared/utils';
import { ViewSectionDirective } from '@/shared/view-section';
import { AlertComponent, AlertType } from '@/widgets/alert';

import { availableLangs } from '../../../../transloco.config';

/**
 * Tab component for the system configuration and name/description fields of a data product.
 *
 * CommentLastReviewed: 2026-06-16
 */
@Component({
  selector: 'app-data-product-detail-info',
  imports: [
    AlertComponent,
    FormControlComponent,
    I18nDirective,
    LinkedTextComponent,
    ViewSectionDirective,
  ],
  templateUrl: './data-product-detail-info.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailInfoComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ControlTypes = ControlTypes;
  protected readonly DataProductDtoStateCode = DataProductDtoStateCode;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);
  readonly stateCode = input<DataProductDtoStateCode>();

  // Signals
  protected readonly nameDisabled = signal(false);

  protected readonly availableLangs = availableLangs;

  // Computed
  protected readonly nameDisabledMessageParts = computed(() =>
    parseLinkedText(
      this.i18nService.translate('data-products.detailForm.name.disabledInfo.message'),
    ),
  );

  // Effects
  private readonly syncNameDisabledEffect = effect((onCleanup) => {
    const nameGroup = this.form().get('name');
    const update = () => this.nameDisabled.set(nameGroup?.disabled ?? false);
    update();
    const subscription = nameGroup?.events.subscribe(update);
    onCleanup(() => subscription?.unsubscribe());
  });

  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }
}
