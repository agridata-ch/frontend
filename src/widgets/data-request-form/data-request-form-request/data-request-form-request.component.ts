import { Component, effect, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { DataRequestService } from '@/entities/api';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

@Component({
  selector: 'app-data-request-form-request',
  imports: [ReactiveFormsModule, FormControlComponent, I18nDirective],
  templateUrl: './data-request-form-request.component.html',
})
export class DataRequestFormRequestComponent {
  readonly dataRequestService = inject(DataRequestService);
  readonly i18nService = inject(I18nService);
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  readonly dataProductsResource = this.dataRequestService.fetchDataProducts;
  readonly products = signal<MultiSelectOption[]>([]);

  readonly ControlTypes = ControlTypes;
  readonly getFormControl = getFormControl;

  readonly updateProductsEffect = effect(() => {
    const products = this.dataProductsResource.value() ?? [];
    this.products.set(
      products.map((p) => ({
        value: p.id,
        label: p.name?.[this.i18nService.lang() as keyof typeof p.name] ?? '',
      })),
    );
  });
}
