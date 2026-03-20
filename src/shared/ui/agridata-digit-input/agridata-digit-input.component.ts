import { Component, ElementRef, effect, input, viewChildren } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Renders a row of single-character digit input boxes. Handles auto-advance, backspace
 * navigation and paste. Syncs the combined value back to the provided AbstractControl.
 * Clears all boxes when the control value is reset to an empty value.
 *
 * CommentLastReviewed: 2026-03-20
 */
@Component({
  selector: 'app-agridata-digit-input',
  template: `
    <div class="flex gap-3 justify-center">
      @for (i of digitIndices; track i) {
        <input
          #digitBox
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="w-10 h-12 text-center text-xl font-semibold border-b-2 border-agridata-stroke bg-transparent outline-none focus:border-agridata-primary-600 placeholder:text-agridata-secondary-text caret-transparent"
          placeholder="_"
          [class.border-red-500]="hasError()"
          (input)="onDigitInput(i, $event)"
          (keydown)="onDigitKeydown(i, $event)"
          (paste)="onDigitPaste($event)"
        />
      }
    </div>
  `,
})
export class AgridataDigitInputComponent {
  // Input properties
  readonly control = input.required<AbstractControl>();
  readonly length = input<number>(6);

  // Signals
  private readonly digitBoxes = viewChildren<ElementRef<HTMLInputElement>>('digitBox');

  valueChangeEffect = effect((onCleanup) => {
    const sub = this.control().valueChanges.subscribe((value: string | null) => {
      if (!value) {
        this.digitBoxes().forEach((ref) => (ref.nativeElement.value = ''));
      }
    });
    onCleanup(() => sub.unsubscribe());
  });

  // Computed
  protected get digitIndices(): number[] {
    return Array.from({ length: this.length() }, (_, i) => i);
  }

  protected hasError(): boolean {
    return (this.control().touched && this.control().invalid) ?? false;
  }

  protected onDigitInput(index: number, event: Event): void {
    const el = event.target as HTMLInputElement;
    const digit = el.value.replaceAll(/\D/g, '').slice(-1);
    el.value = digit;
    this.sync();
    if (digit && index < this.length() - 1) {
      this.digitBoxes()[index + 1]?.nativeElement.focus();
    }
  }

  protected onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).closest('form')?.requestSubmit();
      return;
    }
    if (event.key === 'Backspace') {
      const el = event.target as HTMLInputElement;
      if (!el.value && index > 0) {
        this.digitBoxes()[index - 1]?.nativeElement.focus();
      }
      el.value = '';
      this.sync();
    }
  }

  protected onDigitPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted =
      event.clipboardData?.getData('text').replaceAll(/\D/g, '').slice(0, this.length()) ?? '';
    this.digitBoxes().forEach((ref, i) => {
      ref.nativeElement.value = pasted[i] ?? '';
    });
    this.sync();
    const focusIndex = Math.min(pasted.length, this.length() - 1);
    this.digitBoxes()[focusIndex]?.nativeElement.focus();
  }

  private sync(): void {
    const value = this.digitBoxes()
      .map((ref) => ref.nativeElement.value)
      .join('');
    this.control().setValue(value, { emitEvent: true });
    this.control().markAsDirty();
  }
}
