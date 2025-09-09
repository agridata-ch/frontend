import { Component, input } from '@angular/core';

import { HeroBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { ButtonComponent, ButtonVariants, HrefTarget } from '@/shared/ui/button';

/**
 * Implements hero block logic, including background image rendering, heading and subheading
 * display, and CTA button integration.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-hero-block',
  templateUrl: './hero-block.component.html',
  imports: [ButtonComponent],
})
export class HeroBlockComponent {
  readonly block = input.required<HeroBlock>();

  readonly generateMediaUrl = generateMediaUrl;
  readonly ButtonVariants = ButtonVariants;
  readonly HrefTarget = HrefTarget;

  // protected readonly cmsData = computed(() => {
  //   return this.block() as HeroBlock;
  // });
}
