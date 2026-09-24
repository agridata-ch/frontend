import { Component } from '@angular/core';

import { I18nDirective } from '@/shared/i18n';
import { NewsArticleListComponent } from '@/widgets/news-article-list';

/**
 * News blog section: renders the section heading above the article list. Owns the section chrome so
 * the list stays a pure, reusable component
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-news-blog',
  imports: [I18nDirective, NewsArticleListComponent],
  templateUrl: './news-blog.component.html',
})
export class NewsBlogComponent {}
