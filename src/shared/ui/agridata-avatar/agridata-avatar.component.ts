import { Component, effect, input, signal } from '@angular/core';

import { AvatarSize, AvatarSkin, BG_COLORS } from './agridata-avatar.model';

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
  readonly name = input<string | undefined>(undefined);
  readonly imageUrl = input<string | undefined>(undefined);
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

  private hash32(str: string): number {
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  randomBg(): string {
    const idx = this.hash32(this.name() ?? '') % BG_COLORS.length;
    return BG_COLORS[idx];
  }
}
