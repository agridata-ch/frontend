import { Component, computed, inject, input, model } from '@angular/core';

import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AgridataBadgeComponent } from '@/shared/ui/badge';

/**
 * Component for inputting the contract signature.
 *
 * CommentLastReviewed: 2026-03-17
 */
@Component({
  selector: 'app-contract-signature-input',
  imports: [AgridataBadgeComponent, I18nDirective, AgridataToggleComponent],
  templateUrl: './contract-signature-input.component.html',
})
export class ContractSignatureInputComponent {
  private readonly i18nService = inject(I18nService);
  private readonly authService = inject(AuthService);

  readonly position = input<number>(1);
  readonly locked = input<boolean>(false);

  // Model properties
  readonly agbChecked = model<boolean>(false);

  protected readonly isDataConsumer = this.authService.isConsumer();

  protected readonly agbParts = computed(() => {
    const translated = this.i18nService.translate(
      'data-request.contractSigning.signatureInput.agbText',
    );
    const open = translated.indexOf('[');
    const close = translated.indexOf(']', open);
    if (open === -1 || close === -1) return { before: translated, linkText: null, after: '' };
    return {
      before: translated.slice(0, open),
      linkText: translated.slice(open + 1, close),
      after: translated.slice(close + 1),
    };
  });
}
