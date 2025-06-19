import { Component, input, output } from '@angular/core';

import { ButtonVariants } from './button.model';

@Component({
  selector: 'app-agridata-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  variant = input<ButtonVariants>(ButtonVariants.Primary);
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  tabindex = input<number>(0);
  ariaLabel = input<string>('');
  class = input<string>('');
  selected = input<boolean>(false);
  onClick = output<Event>();

  handleClick(event: Event) {
    this.onClick.emit(event);
  }
}
