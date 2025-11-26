import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BackendInfoService } from '@/entities/api';
import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Displays a simple 404 error message when users navigate to invalid routes.
 *
 * CommentLastReviewed: 2025-10-27
 */
@Component({
  selector: 'app-maintenance',
  imports: [I18nPipe, ButtonComponent],
  templateUrl: './maintenance.page.html',
})
export class MaintenancePage {
  protected readonly ButtonVariants = ButtonVariants;
  private readonly backendVersionService = inject(BackendInfoService);
  private readonly router = inject(Router);
  checkIfMaintenanceActive = effect(() => {
    this.backendVersionService
      .fetchBackendInfo()
      .then(() => {
        // if we get a valid answer from the backend, we can assume that the maintenance is over
        void this.router.navigate(['/']);
      })
      .catch((e) => console.warn('Maintenance mode still active', e));
  });

  protected reloadPage() {
    globalThis.location.reload();
  }
}
