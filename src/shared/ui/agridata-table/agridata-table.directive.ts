import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective {
  @Input('stCell') header!: string;
  constructor(public template: TemplateRef<unknown>) {}
}
