import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  resource,
  signal,
} from '@angular/core';

import { ConsentRequestService, DataRequestService } from '@/entities/api';
import { UserService } from '@/entities/api/user.service';
import {
  ConsentRequestFundamentalViewDto,
  ConsentRequestStateEnum,
  DataRequestDto,
} from '@/entities/openapi';
import { getConsentRequestBadgeVariant } from '@/shared/consent-request';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { ViewSectionDirective } from '@/shared/view-section';

/** Consent request states from which a consent request can still be withdrawn. */
export const WITHDRAWABLE_CONSENT_STATES: readonly ConsentRequestStateEnum[] = [
  ConsentRequestStateEnum.Granted,
  ConsentRequestStateEnum.Opened,
  ConsentRequestStateEnum.Declined,
];

interface BurEntry {
  bur: string;
  consentRequest?: ConsentRequestFundamentalViewDto;
  withdrawable: boolean;
}

/**
 * Modal for withdrawing consent requests of a data request. It shows the producer UID with the
 * state of the consent request the modal was opened from, and, when the data request has BUR
 * products, one selectable entry per BUR of that UID. Only BURs with a withdrawable consent
 * request can be selected; the preselection is the BUR of the row, or every withdrawable BUR when
 * opened from the UID. Without BUR products the UID's consent request is withdrawn as a whole.
 *
 * CommentLastReviewed: 2026-10-13
 */
@Component({
  selector: 'app-data-request-withdraw-request',
  imports: [
    AgridataBadgeComponent,
    ButtonComponent,
    I18nDirective,
    I18nPipe,
    ModalComponent,
    ViewSectionDirective,
  ],
  templateUrl: './data-request-withdraw-request.component.html',
})
export class DataRequestWithdrawRequestComponent {
  // Injects
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly toastService = inject(ToastService);
  private readonly userService = inject(UserService);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly getConsentRequestBadgeVariant = getConsentRequestBadgeVariant;

  // Input properties
  readonly consentRequest = input.required<ConsentRequestFundamentalViewDto>();
  readonly dataRequest = input.required<DataRequestDto>();

  // Model properties
  readonly open = model<boolean>(false);

  // Output properties
  readonly handleWithdrawn = output<void>();

  // Signals
  protected readonly isSubmitting = signal(false);
  // Preselects the BUR of the row, or every withdrawable BUR when opened from the UID.
  private readonly selected = linkedSignal<
    { entries: BurEntry[]; bur?: string },
    ReadonlySet<string>
  >({
    source: () => ({ entries: this.entries(), bur: this.consentRequest().dataProducerBur }),
    computation: ({ entries, bur }) =>
      new Set(
        entries
          .filter((entry) => entry.withdrawable && (!bur || entry.bur === bur))
          .map((entry) => entry.bur),
      ),
  });

  // Computed signals
  protected readonly lookupResource = resource({
    params: () => {
      const uid = this.consentRequest().dataProducerUid;
      return this.open() && uid ? { id: this.dataRequest().id, uid } : undefined;
    },
    loader: async ({ params }) => {
      const [burs, existing] = await Promise.all([
        this.userService.getAuthorizedBursByUid(params.uid),
        this.dataRequestService.getConsentRequestsOfDataRequestAndUid(params.id, params.uid),
      ]);
      return { burs, existing };
    },
    defaultValue: { burs: [], existing: [] },
  });

  // BUR-based requests get a BUR section; otherwise the UID's consent request is withdrawn as a whole.
  protected readonly showBurSection = computed(
    () =>
      this.dataRequest().burPresent &&
      this.existingConsents().some((consent) => !!consent.dataProducerBur),
  );

  protected readonly entries = computed<BurEntry[]>(() => {
    if (!this.showBurSection()) return [];

    const existing = this.existingConsents();

    // Existing BURs are listed even when the UID has no (more) authorized BURs.
    const allBurs = new Set([
      ...this.authorizedBurs(),
      ...existing.flatMap(({ dataProducerBur }) => (dataProducerBur ? [dataProducerBur] : [])),
    ]);
    return [...allBurs].map((bur) => {
      const consentRequest = existing.find((entry) => entry.dataProducerBur === bur);
      return { bur, consentRequest, withdrawable: this.isWithdrawable(consentRequest) };
    });
  });

  protected readonly selectedCount = computed(() => this.selectedConsentIds().length);

  protected readonly withdrawableCount = computed(() =>
    this.showBurSection()
      ? this.entries().filter((entry) => entry.withdrawable).length
      : this.withdrawableConsents().length,
  );

  // Drives the dynamic confirm label: everything withdrawable selected means a complete withdrawal.
  protected readonly isComplete = computed(
    () => this.selectedCount() > 0 && this.selectedCount() === this.withdrawableCount(),
  );

  // The resource is idle while closed; value() rethrows while errored, surfaced by the error handler.
  private readonly lookupReady = computed(
    () => !this.lookupResource.isLoading() && !this.lookupResource.error(),
  );

  private readonly authorizedBurs = computed(() =>
    this.lookupReady()
      ? this.lookupResource.value().burs.flatMap(({ bur }) => (bur ? [bur] : []))
      : [],
  );

  private readonly existingConsents = computed(() =>
    this.lookupReady() ? this.lookupResource.value().existing : [],
  );

  private readonly withdrawableConsents = computed(() =>
    this.existingConsents().filter((consent) => this.isWithdrawable(consent)),
  );

  private readonly selectedConsentIds = computed(() =>
    this.showBurSection()
      ? this.entries()
          .filter((entry) => entry.withdrawable && this.selected().has(entry.bur))
          .flatMap((entry) => (entry.consentRequest ? [entry.consentRequest.id] : []))
      : this.withdrawableConsents().map((consent) => consent.id),
  );

  // Effects
  private readonly errorHandler = createResourceErrorHandlerEffect(
    this.lookupResource,
    this.errorService,
  );

  protected isSelected(bur: string): boolean {
    return this.selected().has(bur);
  }

  protected toggle(bur: string): void {
    const next = new Set(this.selected());
    if (next.has(bur)) {
      next.delete(bur);
    } else {
      next.add(bur);
    }
    this.selected.set(next);
  }

  protected toggleAll(): void {
    this.selected.set(
      this.isComplete()
        ? new Set()
        : new Set(this.entries().flatMap((entry) => (entry.withdrawable ? [entry.bur] : []))),
    );
  }

  protected async withdraw(): Promise<void> {
    const ids = this.selectedConsentIds();
    if (ids.length === 0 || this.isSubmitting()) return;

    const prefix = 'data-request.details.producer.modal.withdraw';
    const successMessageKey = this.isComplete()
      ? 'success.messageComplete'
      : 'success.messagePartial';
    this.isSubmitting.set(true);

    await this.consentRequestService
      .updateConsentRequestStatuses(ids, ConsentRequestStateEnum.Withdrawn)
      .then(() => {
        this.toastService.show(
          this.i18nService.translate(`${prefix}.success.title`),
          this.i18nService.translate(`${prefix}.${successMessageKey}`, { count: ids.length }),
          ToastType.Success,
        );
      })
      .catch((error: Error) => {
        this.toastService.show(
          this.i18nService.translate(`${prefix}.error.title`),
          this.i18nService.translate(`${prefix}.error.message`, { error: error.message }),
          ToastType.Error,
        );
      })
      .finally(() => {
        // Also on failure: Promise.all rejects on the first error while other withdrawals may have
        // gone through, so the views must reload either way.
        this.handleWithdrawn.emit();
        this.isSubmitting.set(false);
        this.open.set(false);
      });
  }

  private isWithdrawable(consent?: ConsentRequestFundamentalViewDto): boolean {
    return !!consent?.stateCode && WITHDRAWABLE_CONSENT_STATES.includes(consent.stateCode);
  }
}
