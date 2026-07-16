import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, input, model, output } from '@angular/core';
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
  // Injects
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  // Input properties
  readonly title = input<string>('title');
  readonly showCloseButton = input<boolean>(true);
  readonly dataTestId = input<string | undefined>();

  // Model properties
  readonly open = model();

  // Output properties
  readonly closed = output<boolean>();

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly closeIcon = faClose;

  private readonly escapeHandler = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.open()) {
      return;
    }
    // Swallow Escape so it cannot reach global listeners behind the modal
    // (e.g. the sidepanel's document keydown handler that would close the panel).
    event.stopImmediatePropagation();
    event.preventDefault();
    if (this.showCloseButton()) {
      this.close();
    }
  };

  // Register a capture-phase listener so it runs before any bubble-phase document listener
  // (such as the sidepanel's), letting us stop the event before it propagates behind the modal.
  private readonly registerEscape = ((): void => {
    this.document.addEventListener('keydown', this.escapeHandler, { capture: true });
    this.destroyRef.onDestroy(() =>
      this.document.removeEventListener('keydown', this.escapeHandler, { capture: true }),
    );
  })();

  close() {
    this.open.set(false);
    this.closed.emit(true);
  }
}
