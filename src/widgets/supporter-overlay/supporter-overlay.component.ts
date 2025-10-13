import { Component, computed, inject } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';

/**
 * Implements a site-wide overlay component while using support mode
 *
 * CommentLastReviewed: 2025-10-02
 */
@Component({
  selector: 'app-supporter-overlay',
  imports: [I18nPipe],
  templateUrl: './supporter-overlay.component.html',
})
export class SupporterOverlayComponent {
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);

  protected userName = computed(() => {
    const user = this.authService.userData();
    if (!user) {
      return '';
    }
    return [user.givenName, user.familyName].filter(Boolean).join(' ');
  });

  isImpersonating(): boolean {
    return this.agridataStateService.isImpersonating();
  }

  disableSupportMode() {
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);
    window.close();
  }
}
