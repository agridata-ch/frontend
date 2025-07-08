import { Component, inject, input } from '@angular/core';

import { DataRequestDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { DataRequestContactComponent } from '@/widgets/data-request-contact/data-request-contact.component';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos/data-request-privacy-infos.component';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

import { availableLangs } from '../../../transloco.config';

@Component({
  selector: 'app-data-request-preview',
  imports: [
    I18nDirective,
    DataRequestPurposeAccordionComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestContactComponent,
  ],
  templateUrl: './data-request-preview.component.html',
})
export class DataRequestPreviewComponent {
  readonly i18nService = inject(I18nService);
  readonly dataRequest = input<DataRequestDto>();
  readonly availableLangs = availableLangs;

  getFieldFromLang = <K extends keyof DataRequestDto>(field: K, lang: string) => {
    const dataRequest = this.dataRequest();
    const fieldValue = dataRequest?.[field];
    return (fieldValue as Record<string, string>)?.[lang] ?? '';
  };
}
