import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ButtonVariants, HrefTarget } from './button.model';

/**
 * Implements the button’s logic. It defines inputs for type, variant, disabled state, tabindex,
 * ARIA label, selection state, custom classes, and optional hyperlink mode. It emits click events
 * and ensures accessibility through keyboard interaction support.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-button',
  templateUrl: './button.component.html',
  imports: [CommonModule],
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  variant = input<ButtonVariants>(ButtonVariants.Primary);
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  tabindex = input<number>(0);
  ariaLabel = input<string>('');
  selected = input<boolean>(false);
  onClick = output<Event>();
  additionalClass = input<string>('');
  href = input<string>('');
  target = input<HrefTarget>(HrefTarget.Self);

  handleClick(event: Event) {
    this.onClick.emit(event);
  }
}
