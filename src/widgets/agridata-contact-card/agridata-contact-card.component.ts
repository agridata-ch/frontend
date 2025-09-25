import { Component, input } from '@angular/core';

import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';

/**
 * Displays an avatar and some contact information
 *
 * CommentLastReviewed: 2025-09-24
 */
@Component({
  selector: 'app-agridata-contact-card',
  imports: [AgridataAvatarComponent],
  templateUrl: './agridata-contact-card.component.html',
})
export class AgridataContactCardComponent {
  readonly name = input<string | undefined>();
  readonly secondaryName = input<string | undefined>();
  readonly imageUrl = input<string | undefined>();
  readonly size = input<AvatarSize>(AvatarSize.LARGE);
  readonly skin = input<AvatarSkin>(AvatarSkin.DEFAULT);
}
