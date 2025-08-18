import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { ButtonVariants, HrefTarget } from './button.model';

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
