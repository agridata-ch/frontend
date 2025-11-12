import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { TitleService } from '@/app/title.service';

/**
 * Service to manage and set the document title based on the current route and language.
 * CommentLastReviewed: 2025-11-12
 */
@Injectable({
  providedIn: 'root',
})
export class AgridataTitleStrategy extends TitleStrategy {
  private readonly titleService = inject(TitleService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.titleService.setPageTitleByRoute(snapshot.url, this.buildTitle(snapshot));
  }
}
