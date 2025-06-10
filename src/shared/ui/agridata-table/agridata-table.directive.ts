import {
  AfterViewInit,
  Directive,
  DoCheck,
  ElementRef,
  Input,
  Renderer2,
  TemplateRef,
  inject,
} from '@angular/core';

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective {
  @Input('stCell') header!: string;
  constructor(public template: TemplateRef<unknown>) {}
}

@Directive({
  selector: '[agridataFlipRow]',
  standalone: true,
})
export class AgridataFlipRowDirective implements AfterViewInit, DoCheck {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @Input() rowId!: string;
  @Input() totalRows!: number;

  private previousTop: number | null = null;
  private previousRowId: string | null = null;
  private previousTotalRows: number | null = null;
  private firstCheck = true;

  ngAfterViewInit() {
    this.setPrevState(this.element.nativeElement.getBoundingClientRect().top);
  }

  private setPrevState(top: number) {
    this.previousTop = top;
    this.previousRowId = this.rowId;
    this.previousTotalRows = this.totalRows;
    this.firstCheck = false;
  }

  ngDoCheck() {
    const element = this.element.nativeElement;
    const newTop = element.getBoundingClientRect().top;

    // FLIP animation for move (only if totalRows did not change to prevent unnecessary animations when filter changes)
    if (
      !this.firstCheck &&
      this.previousTop !== null &&
      newTop !== this.previousTop &&
      this.previousRowId === this.rowId &&
      this.previousTotalRows === this.totalRows
    ) {
      const delta = this.previousTop - newTop;
      if (delta !== 0) {
        element.style.transition = 'none';
        element.style.transform = `translateY(${delta}px)`;
        requestAnimationFrame(() => {
          element.style.transition = 'transform 800ms cubic-bezier(.4,0,.2,1)';
          element.style.transform = '';
        });
      }
    }

    this.setPrevState(newTop);
  }
}
