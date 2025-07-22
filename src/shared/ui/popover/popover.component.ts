import { NgClass } from '@angular/common';
import { Component, HostBinding, Input, input } from '@angular/core';

@Component({
  selector: 'app-popover',
  imports: [NgClass],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.css',
})
export class PopoverComponent {
  open = input<boolean>(false);
  @Input('class') popoverClass: string = '';

  @HostBinding('style.display') display = 'contents';

  get stateClass() {
    return this.open()
      ? 'popup-animate-in scale-y-100 opacity-100 pointer-events-auto'
      : 'scale-y-0 opacity-0 pointer-events-none transition-all duration-200';
  }
}
