import { Component, computed, input } from '@angular/core';

import { Block, HeroBlock } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { ButtonComponent, ButtonVariants, HrefTarget } from '@/shared/ui/button';

@Component({
  selector: 'app-hero-block',
  templateUrl: './hero-block.component.html',
  imports: [ButtonComponent],
})
export class HeroBlockComponent {
  readonly block = input.required<Block>();

  readonly generateMediaUrl = generateMediaUrl;
  readonly ButtonVariants = ButtonVariants;
  readonly HrefTarget = HrefTarget;

  protected readonly cmsData = computed(() => {
    return this.block() as HeroBlock;
  });
}
