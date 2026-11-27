import { Component, computed, DOCUMENT, inject, input } from '@angular/core';
import { faExternalLink } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';

/**
 * Lets the producer return to the data consumer's application via an explicit click. Shows the
 * target host so the destination is transparent, states in the same line when the address could
 * not be verified against the data request, and only accepts http(s) URLs (no `javascript:` or `data:` targets).
 *
 * CommentLastReviewed: 2026-11-25
 */
@Component({
  selector: 'app-return-to-app',
  imports: [ButtonComponent, I18nDirective],
  templateUrl: './return-to-app.component.html',
})
export class ReturnToAppComponent {
  // Injects
  private readonly document = inject(DOCUMENT);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faExternalLink = faExternalLink;
  protected readonly IconPosition = IconPosition;

  // Input properties
  readonly url = input.required<string>();
  readonly verified = input.required<boolean>();

  // Computed Signals
  protected readonly target = computed(() => {
    try {
      const url = new URL(this.url());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
    } catch {
      return null;
    }
  });

  protected returnToApp(): void {
    const target = this.target();
    if (target) {
      this.document.location.href = target.href;
    }
  }
}
