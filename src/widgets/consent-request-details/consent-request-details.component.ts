import { ConsentRequestDto } from '@/shared/api/openapi';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose, faPenSquare, faLock, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { AgridataAccordionComponent } from '@widgets/agridata-accordion/agridata-accordion.component';
import { ConsentRequestService } from '@shared/services/consent-request.service';
import { ToastService } from '@/shared/services/toast.service';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
} from '@pages/consent-request-producer/ui/consent-request-producer.page';

@Component({
  selector: 'app-consent-request-details',
  imports: [FontAwesomeModule, AgridataAccordionComponent],
  templateUrl: './consent-request-details.component.html',
  styleUrl: './consent-request-details.component.css',
})
export class ConsentRequestDetailsComponent {
  private readonly toastService = inject(ToastService);

  @Input()
  set request(value: ConsentRequestDto | null) {
    this._requestSignal.set(value ? { ...value } : null);
  }
  @Output() onCloseDetail = new EventEmitter<string | null>();

  readonly showSuccessToast = signal<boolean>(false);
  readonly showErrorToast = signal<boolean>(false);
  readonly _requestSignal = signal<ConsentRequestDto | null>(null);
  readonly requestId = computed(() => this._requestSignal()?.id ?? '');
  readonly closeIcon = faClose;
  readonly editIcon = faPenSquare;
  readonly lockIcon = faLock;
  readonly repeatIcon = faRepeat;
  readonly formattedRequestDate = computed(() => {
    const requestDate = this._requestSignal()?.requestDate;
    return requestDate ? format(requestDate, 'dd.MM.yyyy') : '';
  });
  readonly showDetails = signal(false);
  readonly dataConsumerName = computed(
    () => this._requestSignal()?.dataRequest?.dataConsumer?.name,
  );
  readonly requestTitle = computed(() => this._requestSignal()?.dataRequest?.titleDe);
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

  constructor(private readonly consentRequestService: ConsentRequestService) {
    effect(() => {
      if (this._requestSignal()) {
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
    this.onCloseDetail.emit();
  }

  async acceptRequest() {
    this.toastService.show(
      getToastTitle('GRANTED'),
      getToastMessage('GRANTED', this.requestTitle()),
      getToastType('GRANTED'),
    );
    this.handleCloseDetails();
    this.consentRequestService.updateConsentRequestStatus(this.requestId(), 'GRANTED').then(() => {
      this.consentRequestService.reload();
    });
  }

  async rejectRequest() {
    this.toastService.show(
      getToastTitle('DECLINED'),
      getToastMessage('DECLINED', this.requestTitle()),
      getToastType('DECLINED'),
    );
    this.handleCloseDetails();
    this.consentRequestService.updateConsentRequestStatus(this.requestId(), 'DECLINED').then(() => {
      this.consentRequestService.reload();
    });
  }
}
