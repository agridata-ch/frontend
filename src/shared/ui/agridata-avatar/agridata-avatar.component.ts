import { Component, effect, input, signal } from '@angular/core';

import { AvatarSize, AvatarSkin } from './agridata-avatar.model';

/**
 * Implements the logic and rendering for avatars. It accepts name, image URL, size, and skin as
 * inputs. When no image is provided, it generates initials from the name. It uses Angular signals
 * and effects to reactively update displayed content.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-agridata-avatar',
  imports: [],
  templateUrl: './agridata-avatar.component.html',
  styleUrls: ['./agridata-avatar.component.css'],
})
export class AgridataAvatarComponent {
  readonly name = input<string | null>(null);
  readonly imageUrl = input<string | null>(null);
  readonly size = input<AvatarSize>(AvatarSize.LARGE);
  readonly skin = input<AvatarSkin>(AvatarSkin.DEFAULT);

  readonly initials = signal<string>('');

  readonly initialsEffect = effect(() => {
    const name = this.name();
    if (name) {
      this.initials.set(
        name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((namePart: string) => namePart.charAt(0).toUpperCase())
          .join(''),
      );
    } else {
      this.initials.set('');
    }
  });
}
