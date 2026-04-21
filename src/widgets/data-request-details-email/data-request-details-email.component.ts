import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { DataRequestDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';

import { EMAIL_TEMPLATE_HTML } from './data-request-details-email.model';

/**
 * Component for displaying email details in the data request details view.
 *
 * CommentLastReviewed: 2026-04-14
 */
@Component({
  selector: 'app-data-request-details-email',
  imports: [],
  templateUrl: './data-request-details-email.component.html',
})
export class DataRequestDetailsEmailComponent {
  private readonly i18nService = inject(I18nService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly dataRequest = input.required<DataRequestDto>();

  private readonly resolvedHtml = computed(
    () => {
      return EMAIL_TEMPLATE_HTML.replace(
        '{{ dataprovider }}',
        this.i18nService.useObjectTranslation(
          this.dataRequest()?.dataSourceSystem?.dataProvider.name,
        ),
      )
        .replace('{{ dataconsumer }}', this.dataRequest().dataConsumerDisplayName || '')
        .replace(
          '{{ dataRequestName }}',
          this.i18nService.useObjectTranslation(this.dataRequest().title),
        );
    },
    // ...other replacements
  );

  protected readonly previewHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.resolvedHtml()),
  );

  protected download(): void {
    const boundary = '----=_BOUNDARY';
    const eml = [
      'MIME-Version: 1.0',
      'X-Unsent: 1',
      'Subject: Your Template',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      this.resolvedHtml(), // same source
      '',
      `--${boundary}--`,
    ].join('\r\n');

    const blob = new Blob([eml], { type: 'message/rfc822' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'template.eml';
    a.click();
  }
}
