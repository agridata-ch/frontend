import { Component, input } from '@angular/core';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
})
export class PopoverComponent {
  readonly isOpen = input<boolean>(false);
  readonly class = input<string>('');
}
