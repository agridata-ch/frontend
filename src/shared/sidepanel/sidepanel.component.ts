import { Component, HostListener, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

import { ButtonComponent, ButtonVariants } from '../ui/button';

/**
 * Implements the logic and structure for the sliding panel. It supports configurable title, width,
 * and background color, and manages open/close state with smooth transitions. It includes keyboard
 * accessibility, closing on Escape key press or via a close button. Content is projected into the
 * panel for flexibility.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-sidepanel',
  imports: [FontAwesomeModule, ButtonComponent],
  templateUrl: './sidepanel.component.html',
})
export class SidepanelComponent {
  readonly title = input<string>('');
  readonly maxWidth = input<string>('100%');
  readonly backgroundColor = input<string>();
  readonly isOpen = input<boolean>(false);
  readonly preventManualClose = input<boolean>(false);
  readonly closeSidepanel = output<void>();

  readonly ButtonVariants = ButtonVariants;
  readonly closeIcon = faClose;

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen() && !this.preventManualClose()) {
      this.closeSidepanel.emit();
    }
  }

  handleClose() {
    this.closeSidepanel.emit();
  }
}
