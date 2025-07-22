import { NgClass } from '@angular/common';
import { Component, HostBinding, Input, input, output } from '@angular/core';

import { ButtonVariants } from './button.model';

@Component({
  selector: 'app-agridata-button',
  imports: [NgClass],
  templateUrl: './button.component.html',
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
  @Input('class') buttonClass = '';

  @HostBinding('style.display') display = 'contents';

  handleClick(event: Event) {
    this.onClick.emit(event);
  }
}
