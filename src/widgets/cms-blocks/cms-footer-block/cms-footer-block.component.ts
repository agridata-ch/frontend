import { Component, input } from '@angular/core';
import { faArrowRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { FooterBlock } from '@/entities/cms';
import { ButtonComponent, ButtonVariants, HrefTarget } from '@/shared/ui/button';

/**
 * Component for rendering the footer block of the CMS.
 *
 * CommentLastReviewed: 2025-09-09
 */
@Component({
  selector: 'app-cms-footer-block',
  imports: [ButtonComponent, FontAwesomeModule],
  templateUrl: './cms-footer-block.component.html',
})
export class CmsFooterBlockComponent {
  readonly block = input.required<FooterBlock>();

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly HrefTarget = HrefTarget;
  protected readonly buttonIcon = faArrowRight;
}
