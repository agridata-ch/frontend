import { Component, input, model, output } from '@angular/core';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * A reusable modal component that can display content in a modal dialog. It includes a title,
 * a close button, and emits an event when the popup is closed. The visibility of the popup
 * is controlled by an input model.
 *
 * CommentLastReviewed: 2025-10-13
 */
@Component({
  selector: 'app-modal',
  imports: [FaIconComponent, ButtonComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  readonly title = input<string>('title');
  readonly showCloseButton = input<boolean>(true);
  readonly open = model();
  readonly closed = output<boolean>();

  protected readonly closeIcon = faClose;
  protected readonly ButtonVariants = ButtonVariants;

  close() {
    this.open.set(false);
    this.closed.emit(true);
  }
}
