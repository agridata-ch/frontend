import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';

import { DebugService } from '@/features/debug/debug.service';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

/**
 * Debug component to display error information, requests, and route navigation in a unified log.
 * Activated by pressing Ctrl + Alt + D.
 * Uses ErrorHandlerService, DebugService, and AgridataStateService to fetch and display information.
 *
 * CommentLastReviewed: 2025-10-13
 **/
@Component({
  selector: 'app-debug',
  imports: [ModalComponent, AgridataDatePipe],
  templateUrl: './debug-modal.component.html',
})
export class DebugModalComponent {
  private readonly debugService = inject(DebugService);
  private readonly document = inject(DOCUMENT);

  public debugEnabled = signal(false);

  readonly shortcutListener = effect((onCleanup) => {
    this.document.addEventListener('keydown', this.handleKeyDown.bind(this));
    onCleanup(() => {
      this.document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    });
  });

  protected logs = this.debugService.debugLogs;

  protected browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screenResolution: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };

  toggleDebugMode(): void {
    this.debugEnabled.update((current) => !current);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    if (isCtrlOrCmd && event.altKey && event.code === 'KeyD') {
      event.preventDefault();
      this.toggleDebugMode();
    }
  }
}
