import {
  Component,
  HostListener,
  Signal,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose, faLock, faPenSquare, faRepeat } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { ToastService } from '@/shared/toast';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';

@Component({
  selector: 'app-consent-request-details',
  imports: [FontAwesomeModule, AgridataAccordionComponent, AgridataBadgeComponent],
  templateUrl: './consent-request-details.component.html',
})
export class ConsentRequestDetailsComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);

  readonly request = input<ConsentRequestDto | null>(null);
  readonly onReloadConsentRequests = output<void>();
  readonly onCloseDetail = output<string | null>();

  readonly showSuccessToast = signal<boolean>(false);
  readonly showErrorToast = signal<boolean>(false);
  readonly requestId = computed(() => this.request()?.id ?? '');
  readonly closeIcon = faClose;
  readonly editIcon = faPenSquare;
  readonly lockIcon = faLock;
  readonly repeatIcon = faRepeat;
  readonly badgeSize = BadgeSize;
  readonly consentRequestStateEnum = ConsentRequestStateEnum;
  readonly formattedRequestDate = computed(() => formatDate(this.request()?.requestDate));
  readonly showDetails = signal(false);
  readonly dataConsumerName = computed(() => this.request()?.dataRequest?.dataConsumer?.name);
  readonly requestTitle = computed(() => this.request()?.dataRequest?.titleDe);
  readonly requestStateCode: Signal<string> = computed(() => String(this.request()?.stateCode));
  readonly privacySections = computed(() => [
    {
      icon: this.editIcon,
      title: 'Einwilligung',
      description: `Mit deiner Zustimmung erlaubst du, dass die Daten gemäss Liste deiner zugeordneten Betriebe an den Antragsteller ${this.dataConsumerName()}  übermittelt werden`,
    },
    {
      icon: this.lockIcon,
      title: 'Datenschutz',
      description: `${this.dataConsumerName()} ist für den datenschutzkonformen Umgang mit diesen Informationen verantwortlich. Wende dich direkt an ${this.dataConsumerName()}, wenn du möchtest, dass deine Daten gelöscht werden.`,
    },
    {
      icon: this.repeatIcon,
      title: 'Wiederrufsmöglichkeit',
      description: 'Du kannst deine Einwilligung jederzeit widerrufen oder anpassen',
    },
  ]);
  readonly badgeText = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened) return 'Offen';
    if (stateCode === ConsentRequestStateEnum.Granted)
      return this.formattedRequestDate()
        ? `Eingewilligt am ${this.formattedRequestDate()}`
        : 'Eingewilligt';
    if (stateCode === ConsentRequestStateEnum.Declined)
      return this.formattedRequestDate()
        ? `Abgelehnt am ${this.formattedRequestDate()}`
        : 'Abgelehnt';
    return 'Unknown';
  });
  readonly badgeVariant = computed(() => {
    const stateCode = this.request()?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  });

  constructor() {
    effect(() => {
      if (this.request()) {
        this.showDetails.set(true);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.showDetails()) {
      this.handleCloseDetails();
    }
  }

  handleCloseDetails() {
    this.showDetails.set(false);
    this.onCloseDetail.emit(null);
  }

  async acceptRequest() {
    this.toastService.show(
      getToastTitle(ConsentRequestStateEnum.Granted),
      getToastMessage(ConsentRequestStateEnum.Granted, this.requestTitle()),
      getToastType(ConsentRequestStateEnum.Granted),
      this.prepareUndoAction(this.requestId(), this.requestStateCode()),
    );
    this.updateAndReloadConsentRequestState(this.requestId(), ConsentRequestStateEnum.Granted);
  }

  async rejectRequest() {
    const toastTitle = getToastTitle(ConsentRequestStateEnum.Declined);
    const toastMessage = getToastMessage(ConsentRequestStateEnum.Declined, this.requestTitle());
    const toastType = getToastType(ConsentRequestStateEnum.Declined);
    this.toastService.show(
      toastTitle,
      toastMessage,
      toastType,
      this.prepareUndoAction(this.requestId(), this.requestStateCode()),
    );
    this.updateAndReloadConsentRequestState(this.requestId(), ConsentRequestStateEnum.Declined);
  }

  prepareUndoAction(id: string, stateCode: string) {
    return getUndoAction(() => {
      this.toastService.show(getToastTitle(''), '');
      this.updateAndReloadConsentRequestState(id, stateCode);
    });
  }

  async updateAndReloadConsentRequestState(id: string, stateCode: string) {
    this.consentRequestService.updateConsentRequestStatus(id, stateCode).then(() => {
      this.onReloadConsentRequests.emit();
    });
    this.handleCloseDetails();
  }
}
