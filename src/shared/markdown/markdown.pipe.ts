import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked, Tokens } from 'marked';

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

    // Store the original list renderer
    const originalListRenderer = renderer.list.bind(renderer);

    // Override the list renderer to add our custom classes
    renderer.list = function (token: Tokens.List): string {
      const html = originalListRenderer(token);

      // Add our custom classes to the generated HTML
      return token.ordered
        ? html.replaceAll('<ol>', '<ol class="list-decimal pl-5">')
        : html.replaceAll('<ul>', '<ul class="list-disc pl-5">');
    };

    // Disable HTML in markdown
    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
    });

    // Pre-process the content to handle multiple consecutive line breaks
    const processedValue = value.replace(/\n(?=\n)/g, '\n\n<br/>\n');

    const html = marked(processedValue);

    // Let Angular sanitize the HTML (this removes scripts and other dangerous content)
    // while still allowing safe HTML elements
    return this.sanitizer.sanitize(1, html) as string;
  }
}
