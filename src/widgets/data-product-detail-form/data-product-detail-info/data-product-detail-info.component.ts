import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DataProductDtoStateCode } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { AgridataRadioGroupOption } from '@/shared/ui/agridata-radio-group';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { LinkedTextComponent } from '@/shared/ui/linked-text';
import { parseLinkedText } from '@/shared/utils';
import { ViewSectionDirective } from '@/shared/view-section';

import { availableLangs } from '../../../../transloco.config';

/**
 * Tab component for the system configuration and name/description fields of a data product.
 *
 * CommentLastReviewed: 2026-09-07
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
  private readonly injector = inject(Injector);

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
  protected readonly paymentRequired = signal(false);
  protected readonly availableLangs = availableLangs;
  private readonly costSection = viewChild<ElementRef>('costSection');

  // Computed
  protected readonly nameDisabledMessageParts = computed(() =>
    parseLinkedText(
      this.i18nService.translate('data-products.detailForm.name.disabledInfo.message'),
    ),
  );

  protected readonly readonlyValue = computed(() => {
    return this.radioOptionsConsentRequired().find(
      (v) => v.value === this.getFormControl('consentRequired')?.value,
    )?.subtitle;
  });

  protected readonly radioOptionsConsentRequired = computed(() =>
    this.buildBooleanRadioOptions('consentRequired'),
  );

  protected readonly radioOptionsPaymentRequired = computed(() =>
    this.buildBooleanRadioOptions('paymentRequired', [false, true]),
  );

  // Effects
  private readonly syncNameDisabledEffect = effect((onCleanup) => {
    const nameGroup = this.form().get('name');
    const update = () => this.nameDisabled.set(nameGroup?.disabled ?? false);
    update();
    const subscription = nameGroup?.events.subscribe(update);
    onCleanup(() => subscription?.unsubscribe());
  });

  private readonly syncPaymentRequiredEffect = effect((onCleanup) => {
    const control = this.getFormControl('paymentRequired');
    let previousValue = control?.value ?? false;
    this.paymentRequired.set(previousValue);
    const subscription = control?.events.subscribe(() => {
      const value = control.value ?? false;
      this.paymentRequired.set(value);
      if (value && !previousValue) this.scrollToPricingBasis();
      previousValue = value;
    });
    onCleanup(() => subscription?.unsubscribe());
  });

  private readonly syncPricingBasisDisabledEffect = effect(() => {
    const required = this.paymentRequired();
    for (const lang of this.availableLangs) {
      const control = this.getFormControl(`pricingBasis.${lang}`);
      if (!control) continue;
      if (required && control.disabled) control.enable();
      else if (!required && control.enabled) control.disable();
    }
  });

  protected getFormControl(path: string) {
    return getFormControl(this.form(), path);
  }

  private buildBooleanRadioOptions(
    key: string,
    order: readonly [boolean, boolean] = [true, false],
  ): readonly AgridataRadioGroupOption[] {
    return order.map((value) => ({
      subtitle: this.i18nService.translate(`data-products.detailForm.${key}.${value}.subtitle`),
      title: this.i18nService.translate(`data-products.detailForm.${key}.${value}.title`),
      value,
    }));
  }

  private scrollToPricingBasis(): void {
    afterNextRender(
      () =>
        this.costSection()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
      { injector: this.injector },
    );
  }
}
