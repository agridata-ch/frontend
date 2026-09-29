import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  resource,
  signal,
  untracked,
} from '@angular/core';

import { DataRequestService } from '@/entities/api';
import { UserService } from '@/entities/api/user.service';
import {
  BurDto,
  ConsentRequestAggregationStateEnum,
  ConsentRequestStateEnum,
  DataRequestDto,
} from '@/entities/openapi';
import {
  getAggregationBadgeVariant,
  getConsentRequestBadgeVariant,
} from '@/shared/consent-request';
import { UID_REGEX } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { isExternalServiceError } from '@/shared/error/http-error-method';
import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { ViewSectionDirective } from '@/shared/view-section';

interface ProducerEntry {
  key: string;
  bur?: string;
  existing: boolean;
  stateCode?: ConsentRequestStateEnum;
}

/**
 * Modal for adding producers to a data request. The consumer enters a UID, the modal loads its
 * authorized BURs alongside the consent requests that already exist for that UID, and shows one
 * selectable entry per still-missing producer. When the data request has no BUR products the entry
 * is the UID itself and an "already added" error is shown if it exists. Submitting is deferred until
 * the backend add endpoint is finalized.
 *
 * CommentLastReviewed: 2026-09-29
 */
@Component({
  selector: 'app-data-request-add-producers',
  imports: [
    ModalComponent,
    AgridataInputComponent,
    AgridataBadgeComponent,
    ButtonComponent,
    I18nDirective,
    I18nPipe,
    ViewSectionDirective,
  ],
  templateUrl: './data-request-add-producers.component.html',
})
export class DataRequestAddProducersComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly userService = inject(UserService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly BadgeSize = BadgeSize;
  protected readonly getConsentRequestBadgeVariant = getConsentRequestBadgeVariant;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly initialUid = input<string>();

  // Model properties
  readonly open = model<boolean>(false);

  // Signals
  protected readonly searchValue = signal<string>('');
  // Cleared whenever the searched UID changes so stale BUR keys never linger.
  private readonly selected = linkedSignal<string | undefined, ReadonlySet<string>>({
    source: () => this.searchedUid(),
    computation: () => new Set(),
  });

  // Computed signals
  protected readonly isValidUid = computed(() => UID_REGEX.test(this.searchValue()));
  // Stay editable while the UID is flagged as already added, so the user can correct it.
  protected readonly isUidViewMode = computed(() => this.entries().length > 0);

  // Only a complete, valid UID triggers the lookup.
  protected readonly searchedUid = computed(() =>
    this.isValidUid() ? this.searchValue() : undefined,
  );

  protected readonly lookupResource = resource({
    params: () => {
      const uid = this.searchedUid();
      if (!uid) return undefined;
      return { id: this.dataRequest().id, uid };
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

  // value() rethrows while loading or errored; the error is surfaced by the error handler effect.
  private readonly ready = computed(
    () => !!this.searchedUid() && !this.lookupResource.isLoading() && !this.lookupResource.error(),
  );

  protected readonly entries = computed<ProducerEntry[]>(() => {
    if (!this.ready()) return [];

    const uid = this.searchedUid()!;
    const { burs, existing } = this.lookupResource.value();

    if (!this.dataRequest().burPresent) {
      return [{ key: uid, existing: existing.length > 0, stateCode: existing[0]?.stateCode }];
    }

    return burs
      .filter((bur): bur is BurDto & { bur: string } => !!bur.bur)
      .map((bur) => {
        const consent = existing.find((entry) => entry.dataProducerBur === bur.bur);
        return {
          key: bur.bur,
          bur: bur.bur,
          existing: !!consent,
          stateCode: consent?.stateCode,
        };
      });
  });

  protected readonly selectableEntries = computed(() =>
    this.entries().filter((entry) => !entry.existing),
  );

  protected readonly allSelectableSelected = computed(() => {
    const selectable = this.selectableEntries();
    return selectable.length > 0 && selectable.every((entry) => this.selected().has(entry.key));
  });

  // Without BUR products the single UID entry is implicitly selected.
  protected readonly selectedCount = computed(() => {
    const selectable = this.selectableEntries();
    return this.dataRequest().burPresent
      ? selectable.filter((entry) => this.selected().has(entry.key)).length
      : selectable.length;
  });

  protected readonly showUidInvalid = computed(
    () => this.searchValue().length > 0 && !this.isValidUid(),
  );

  // The lookup answers with EXTERNAL_SERVICE_ERROR when the entered UID does not exist.
  protected readonly uidNotFound = computed(() =>
    isExternalServiceError(this.lookupResource.error()),
  );

  protected readonly hasUidError = computed(() => this.showUidInvalid() || this.uidNotFound());

  // Consent state shown as a badge next to the UID, derived from the existing consent requests.
  protected readonly badgeState = computed<ConsentRequestAggregationStateEnum | undefined>(() => {
    if (!this.ready()) return undefined;

    const states = this.lookupResource
      .value()
      .existing.map((consent) => consent.stateCode)
      .filter((state): state is ConsentRequestStateEnum => !!state);
    if (states.length === 0) return undefined;

    const isGranted = (state: ConsentRequestStateEnum) =>
      state === ConsentRequestStateEnum.Granted ||
      state === ConsentRequestStateEnum.LegallyPermitted;
    const isOpen = (state: ConsentRequestStateEnum) => state === ConsentRequestStateEnum.Opened;

    if (states.every(isOpen)) return ConsentRequestAggregationStateEnum.Opened;
    if (states.every(isGranted)) return ConsentRequestAggregationStateEnum.Granted;
    if (states.every((state) => state === ConsentRequestStateEnum.Declined)) {
      return ConsentRequestAggregationStateEnum.Declined;
    }
    return states.some(isOpen)
      ? ConsentRequestAggregationStateEnum.PartiallyOpened
      : ConsentRequestAggregationStateEnum.PartiallyGranted;
  });

  protected readonly badgeVariant = computed(() => getAggregationBadgeVariant(this.badgeState()));

  // Effects
  // Reset the field and selection each time the modal opens, seeding the UID from a row action.
  private readonly resetOnOpenEffect = effect(() => {
    if (!this.open()) return;
    untracked(() => {
      this.searchValue.set(this.initialUid() ?? '');
      this.selected.set(new Set());
    });
  });

  // Surface lookup errors globally, except EXTERNAL_SERVICE_ERROR (unknown UID) shown inline.
  private readonly errorHandler = effect(() => {
    const error = this.lookupResource.error();
    if (error && !isExternalServiceError(error)) {
      this.errorService.handleError(error);
    }
  });

  protected isSelected(key: string): boolean {
    return this.selected().has(key);
  }

  protected toggle(key: string): void {
    const next = new Set(this.selected());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selected.set(next);
  }

  protected toggleAll(): void {
    this.selected.set(
      this.allSelectableSelected()
        ? new Set()
        : new Set(this.selectableEntries().map((entry) => entry.key)),
    );
  }
}
