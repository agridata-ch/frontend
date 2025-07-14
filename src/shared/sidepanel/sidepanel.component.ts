import { Component, HostListener, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidepanel',
  imports: [FontAwesomeModule],
  templateUrl: './sidepanel.component.html',
})
export class SidepanelComponent {
  title = input<string>('');
  maxWidth = input<string>('100%');
  backgroundColor = input<string>();
  isOpen = input<boolean>(false);
  onClose = output<void>();

  readonly closeIcon = faClose;

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen()) {
      this.onClose.emit();
    }
  }

  handleClose() {
    this.onClose.emit();
  }
}
