import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Defines a custom Angular pipe for converting Markdown text into sanitized HTML. It leverages
 * the marked library for parsing and the Angular DomSanitizer to strip unsafe content, ensuring
 * both rich formatting and application security.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  protected readonly sanitizer = inject(DomSanitizer);

  transform(value: string) {
    if (!value) {
      return '';
    }

    // Configure marked to be more secure
    const renderer = new marked.Renderer();

    renderer.link = function ({ href, title, text }) {
      return `<a href="${href}" title="${title || ''}" class="underline hover:text-agridata-primary-600">${text}</a>`;
    };

    // Disable HTML in markdown
    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
    });

    // Pre-process the content to handle multiple consecutive line breaks
    const processedValue = value.replaceAll(/\n(?=\n)/g, '\n\n<br/>\n');

    const html = marked(processedValue);

    // Let Angular sanitize the HTML (this removes scripts and other dangerous content)
    // while still allowing safe HTML elements
    const sanitized = this.sanitizer.sanitize(1, html) as string;

    // Render into the markdown scope so list markers Tailwind's preflight resets are
    // restored and vary per nesting depth.
    return `<div class="markdown-content">${sanitized}</div>`;
  }
}
