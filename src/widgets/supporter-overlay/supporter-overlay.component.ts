import { Component, computed, inject } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AGATE_LOGIN_ID_IMPERSONATION_HEADER } from '@/shared/constants/constants';
import { I18nPipe } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { formatFullName } from '@/shared/utils';

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

  protected userName = computed(() => formatFullName(this.authService.userInfo()));

  isImpersonating(): boolean {
    return this.agridataStateService.isImpersonating();
  }

  disableSupportMode() {
    sessionStorage.removeItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER);
    window.close();
  }
}
