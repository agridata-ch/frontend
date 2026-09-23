import { Component, input } from '@angular/core';
import { faGlobe } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { I18nPipe } from '@/shared/i18n';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';

/**
 * Displays an avatar and some contact information
 *
 * CommentLastReviewed: 2025-09-24
 */
@Component({
  selector: 'app-agridata-contact-card',
  imports: [AgridataAvatarComponent, AgridataBadgeComponent, I18nPipe],
  templateUrl: './agridata-contact-card.component.html',
})
export class AgridataContactCardComponent {
  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly iconGlobe = faGlobe;

  // Input properties
  readonly name = input<string | undefined>();
  readonly secondaryName = input<string | undefined>();
  readonly imageUrl = input<string | undefined>();
  readonly size = input<AvatarSize>(AvatarSize.LARGE);
  readonly skin = input<AvatarSkin>(AvatarSkin.DEFAULT);
  readonly showForeignBadge = input<boolean>(false);
}
