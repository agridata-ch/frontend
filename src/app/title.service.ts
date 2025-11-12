import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { first } from 'rxjs';

import { environment } from '@/environments/environment';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';

/**
 * Service to manage and set the document title based on the current route and language.
 * CommentLastReviewed: 2025-11-12
 */
@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private readonly htmlTitle = inject(Title);
  private readonly i18nService = inject(I18nService);
  private readonly route = signal<string | undefined>(undefined);
  // used to store current translation key, so it can be translated on language change
  private readonly i18nTitle = signal<string | undefined>(undefined);
  private readonly translatedTitle = signal<string | undefined>(undefined);
  roTranslatedTitle = this.translatedTitle.asReadonly();
  ro18nTitle = this.i18nTitle.asReadonly();
  roRoute = this.route.asReadonly();

  private readonly updateTitleOnLangChangeEffect = effect(() => {
    if (this.i18nService.lang()) {
      this.updateTranslatedTitle();
    }
  });

  private readonly updateHtmlTitleEffect = effect(() => {
    const title = this.translatedTitle();
    const route = untracked(() => this.route());
    if (!route) {
      // if no route is loaded it is impossible that the title has been set already
      return;
    }
    if (title) {
      this.htmlTitle.setTitle(`${environment.titleEnvPrefix}${title} - agridata.ch`);
    } else {
      console.warn(`No translated title available for route: ${this.route()}`);
    }
  });

  setPageTitleByRoute(url: string, i18nTitle: string | undefined) {
    this.route.set(url);

    // cms will set title based on page content
    if (this.route()?.startsWith(`/${ROUTE_PATHS.CMS_PATH}`)) {
      return;
    }

    if (!i18nTitle) {
      console.warn(`No translated title available for route: ${this.route()} }`);
      this.setTranslatedTitle(this.route());
    }
    this.setI18nTitle(i18nTitle);
  }

  setI18nTitle(i18n: string | undefined) {
    this.i18nTitle.set(i18n);
    this.updateTranslatedTitle();
  }

  setTranslatedTitle(title: string | undefined) {
    if (!title) {
      return;
    }
    this.translatedTitle.set(title);
  }

  private updateTranslatedTitle() {
    const i18nTitle = this.i18nTitle();
    if (!i18nTitle) {
      return;
    }
    this.i18nService
      .selectTranslate(i18nTitle)
      .pipe(first())
      .subscribe((title) => this.translatedTitle.set(title));
  }
}
