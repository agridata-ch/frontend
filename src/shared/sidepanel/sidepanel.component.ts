import {
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  output,
  viewChild,
} from '@angular/core';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ButtonComponent, ButtonVariants } from '../ui/button';

/**
 * Implements the logic and structure for the sliding panel. It supports configurable title, width,
 * and background color, and manages open/close state with smooth transitions. It includes keyboard
 * accessibility, closing on Escape key press or via a close button. Content is projected into the
 * panel for flexibility.
 *
 * CommentLastReviewed: 2026-02-12
 */
@Component({
  selector: 'app-sidepanel',
  imports: [FontAwesomeModule, ButtonComponent],
  templateUrl: './sidepanel.component.html',
})
export class SidepanelComponent {
  readonly backgroundColor = input<string>();
  readonly isOpen = input<boolean>(false);
  readonly maxWidth = input<string>('100%');
  readonly preventManualClose = input<boolean>(false);
  readonly title = input<string>('');

  readonly closeSidepanel = output<void>();

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly closeIcon = faClose;
  protected readonly sidepanelContent = viewChild<ElementRef>('sidepanelContent');

  protected readonly focusEffect = effect(() => {
    // for this effect to work properly, we need to have tabindex="-1"
    // on the sidepanelContent div and set focus to it when the sidepanel opens.
    if (this.isOpen()) {
      this.sidepanelContent()?.nativeElement.focus();
    }
  });

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
