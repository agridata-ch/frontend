import { Component, computed, ErrorHandler, inject, signal } from '@angular/core';

import { environment } from '@/environments/environment';
import { AgbModalService } from '@/features/agb-modal';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import { contractAgbUrl } from '@/shared/lib/cms';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { LinkedTextComponent } from '@/shared/ui/linked-text';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { parseLinkedText } from '@/shared/utils';

/**
 * Site-wide modal that shows the current AGB (terms & conditions) to PROVIDER/CONSUMER users after
 * sign-in. Presentational only — visibility, skippability, and acceptance are owned by
 * {@link AgbModalService}. When the modal is skippable (returning user with a newer revision, before
 * the enforce deadline) the close/remind-later buttons are shown and the deadline info text is
 * displayed; otherwise the user must accept.
 *
 * CommentLastReviewed: 2026-07-28
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
  private readonly errorHandler = inject(ErrorHandler);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly appBaseUrl = environment.appBaseUrl;
  protected readonly contractAgbUrl = contractAgbUrl;

  // Signals
  protected readonly consentChecked = signal(false);
  protected readonly enforceConsentFrom = this.agbModalService.enforceConsentFrom;
  protected readonly isSkippable = this.agbModalService.isSkippable;
  protected readonly isAgbConsentEnforced = this.agbModalService.isAgbConsentEnforced;
  protected readonly hasAcceptedPreviousAgb = this.agbModalService.hasAcceptedPreviousAgb;
  protected readonly open = this.agbModalService.open;

  // Computed Signals
  protected readonly agbParts = computed(() =>
    parseLinkedText(this.i18nService.translate('agb.modal.toggleText')),
  );

  protected readonly consentLabel = computed(() => {
    const parts = this.agbParts();
    return `${parts.before} ${parts.linkText} ${parts.after}`.replaceAll(/\s+/g, ' ').trim();
  });

  protected readonly generalAgbInfoparts = computed(() => {
    return this.hasAcceptedPreviousAgb()
      ? parseLinkedText(this.i18nService.translate('agb.modal.updatedInfo'))
      : parseLinkedText(
          this.i18nService.translate('agb.modal.generalInfo', {
            enforceConsentFrom: formatDate(this.enforceConsentFrom()),
          }),
        );
  });

  protected readonly deadlineInfoParts = computed(() =>
    this.enforceConsentFrom()
      ? parseLinkedText(
          this.i18nService.translate('agb.modal.deadlineInfo', {
            enforceConsentFrom: formatDate(this.enforceConsentFrom()),
          }),
        )
      : parseLinkedText(this.i18nService.translate('agb.modal.updatedInfo')),
  );

  protected readonly enforcedInfoParts = computed(() =>
    parseLinkedText(
      this.i18nService.translate('agb.modal.blockingInfo', {
        enforceConsentFrom: formatDate(this.enforceConsentFrom()),
      }),
    ),
  );

  protected accept(): void {
    this.agbModalService.accept().catch((error) => this.errorHandler.handleError(error));
  }

  protected dismiss(): void {
    this.agbModalService.dismiss();
  }
}
