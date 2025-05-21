import { ConsentRequestDto } from '@/shared/api/openapi';
import {
  Component,
  computed,
  effect,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose, faPenSquare, faLock, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { AgridataAccordionComponent } from '../agridata-accordion/agridata-accordion.component';

@Component({
  selector: 'app-consent-request-details',
  imports: [FontAwesomeModule, AgridataAccordionComponent],
  templateUrl: './consent-request-details.component.html',
  styleUrl: './consent-request-details.component.css',
})
export class ConsentRequestDetailsComponent {
  @Input()
  set request(value: ConsentRequestDto | null) {
    this._requestSignal.set(value);
  }
  @Output() onCloseDetail = new EventEmitter<string | null>();

  readonly _requestSignal = signal<ConsentRequestDto | null>(null);
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
    { icon: this.repeatIcon, title: 'Wiederrufsmöglichkeit', description: 'Hier fehlt noch Text' },
  ]);

  constructor() {
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
}
