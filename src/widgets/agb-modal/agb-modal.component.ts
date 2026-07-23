import { Component, computed, inject, signal } from '@angular/core';

import { environment } from '@/environments/environment';
import { AgbModalService } from '@/features/agb-modal';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import { contractAgbUrl } from '@/shared/lib/cms';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { LinkedTextComponent } from '@/shared/ui/linked-text';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { parseLinkedText } from '@/shared/utils';

/**
 * Site-wide modal that shows the current AGB (terms & conditions) to PROVIDER/CONSUMER users after
 * sign-in. Presentational only — visibility and acceptance are owned by {@link AgbModalService}.
 * The isBlocking flag is hardcoded to false for now (consent enforcement is deferred); the modal is
 * therefore always dismissible. When isBlocking is true the close button is hidden and the user
 * must accept.
 *
 * CommentLastReviewed: 2026-07-23
 */
@Component({
  selector: 'app-agb-modal',
  imports: [
    ModalComponent,
    ButtonComponent,
    I18nDirective,
    I18nPipe,
    AgridataToggleComponent,
    LinkedTextComponent,
  ],
  templateUrl: './agb-modal.component.html',
})
export class AgbModalComponent {
  // Injects
  private readonly agbModalService = inject(AgbModalService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly appBaseUrl = environment.appBaseUrl;
  protected readonly contractAgbUrl = contractAgbUrl;

  // Signals
  protected readonly consentChecked = signal(false);
  protected readonly enforceConsentFrom = this.agbModalService.enforceConsentFrom;
  protected readonly isBlocking = signal(false);
  protected readonly open = this.agbModalService.open;

  // Computed Signals
  protected readonly agbParts = computed(() =>
    parseLinkedText(this.i18nService.translate('agb.modal.toggleText')),
  );

  protected readonly consentLabel = computed(() => {
    const parts = this.agbParts();
    return `${parts.before} ${parts.linkText} ${parts.after}`.replaceAll(/\s+/g, ' ').trim();
  });

  protected readonly isBlockingParts = computed(() =>
    parseLinkedText(
      this.i18nService.translate('agb.modal.blockingInfo', {
        enforceConsentFrom: this.enforceConsentFrom(),
      }),
    ),
  );

  protected accept(): void {
    this.agbModalService.accept();
  }

  protected dismiss(): void {
    this.agbModalService.dismiss();
  }
}
