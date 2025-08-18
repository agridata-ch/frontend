import { Component, input } from '@angular/core';

import { List } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

@Component({
  selector: 'app-list-block',
  imports: [],
  templateUrl: './list-block.component.html',
})
export class ListBlockComponent {
  readonly list = input.required<List>();

  protected readonly generateMediaUrl = generateMediaUrl;
}
