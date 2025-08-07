import { Directive, ElementRef, OnDestroy, OnInit, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  readonly appClickOutside = output<Event>();
  private readonly elementRef = inject(ElementRef);
  private boundClickHandler!: (event: Event) => void;

  ngOnInit() {
    // Create a bound handler once and store the reference
    this.boundClickHandler = this.onDocumentClick.bind(this);

    // Using event capturing phase (true as third parameter) to detect clicks before they're stopped
    document.addEventListener('click', this.boundClickHandler, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.boundClickHandler, true);
  }

  onDocumentClick(event: Event) {
    try {
      // Safety check to ensure the element reference still exists
      // This prevents errors when the component is being destroyed
      if (!this.elementRef?.nativeElement) {
        return;
      }

      const target = event.target as HTMLElement;

      // Check if the click was outside our element
      if (!this.elementRef.nativeElement.contains(target)) {
        this.appClickOutside.emit(event);
      }
    } catch (error) {
      // Silently handle any errors that might occur during destruction
      // This prevents console errors when the component is being destroyed
      console.debug('Click outside handler caught error:', error);
    }
  }
}
