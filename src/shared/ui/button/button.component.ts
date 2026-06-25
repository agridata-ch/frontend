import { CommonModule } from '@angular/common';
import { Component, HostBinding, booleanAttribute, computed, input, output } from '@angular/core';
import { faSpinner } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';

import { ButtonVariants, HrefTarget, IconPosition } from './button.model';

/**
 * Implements the button’s logic. It defines inputs for type, variant, disabled state, tabindex,
 * ARIA label, selection state, custom classes, and optional hyperlink mode. It emits click events
 * and ensures accessibility through keyboard interaction support.
 * The IconLink variant renders an icon (left or right) alongside content; during loading the icon
 * is replaced by a spinner and the button is disabled.
 * The optional `success` input renders a transient green success state with a drawn checkmark and
 * keeps the button disabled. The parent owns when success shows and for how long — the button holds
 * no timer.
 *
 * CommentLastReviewed: 2026-06-25
 */
@Component({
  selector: 'app-agridata-button',
  templateUrl: './button.component.html',
  imports: [CommonModule, FaIconComponent],
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  // Input properties
  variant = input<ButtonVariants>(ButtonVariants.Primary);
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false, { transform: booleanAttribute });
  tabindex = input<number>(0);
  ariaLabel = input<string>('');
  selected = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  success = input(false, { transform: booleanAttribute });
  disabledInfo = input<string>('');
  additionalClass = input<string>('');
  href = input<string>('');
  target = input<HrefTarget>(HrefTarget.Self);
  dataTestId = input<string | undefined>();
  icon = input<IconDefinition>();
  iconPosition = input<IconPosition>(IconPosition.Left);

  // Output properties
  handleClick = output<Event>();

  @HostBinding('style.display') display = 'contents';

  // Constants
  protected readonly faSpinner = faSpinner;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly IconPosition = IconPosition;

  // Computed signals
  protected readonly isIconLink = computed(
    () => this.variant() === ButtonVariants.IconLink || this.icon() !== undefined,
  );
  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading() || this.success(),
  );
  protected readonly showSuccess = computed(() => this.success() && !this.loading());

  onButtonClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.handleClick.emit(event);
  }
}
