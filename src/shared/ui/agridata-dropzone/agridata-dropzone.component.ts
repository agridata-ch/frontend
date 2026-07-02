import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { faUpload } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Generic drag-and-drop / click file picker. Surfaces the raw selected files via the
 * filesSelected output and performs no validation itself, so consumers own the rules
 * (type, size, count) and any user-facing error messaging.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Component({
  selector: 'app-agridata-dropzone',
  templateUrl: './agridata-dropzone.component.html',
  imports: [FontAwesomeModule],
  host: { class: 'contents' },
})
export class AgridataDropzoneComponent {
  // Constants
  protected readonly faUpload = faUpload;

  // Input properties
  readonly accept = input<string>('');
  readonly ariaDescribedBy = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly multiple = input<boolean>(true);
  readonly label = input<string>();
  readonly hint = input<string>();

  // Output properties
  readonly filesSelected = output<File[]>();

  // Signals
  protected readonly isDragOver = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected handleDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.isDragOver.set(true);
  }

  protected handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.disabled()) return;
    this.emitFiles(event.dataTransfer?.files ?? null);
  }

  protected handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emitFiles(input.files);
    input.value = '';
  }

  protected openFilePicker(): void {
    if (this.disabled()) return;
    this.fileInput().nativeElement.click();
  }

  private emitFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return;
    this.filesSelected.emit(Array.from(fileList));
  }
}
