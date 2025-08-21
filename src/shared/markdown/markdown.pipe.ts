import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

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

    // Disable HTML in markdown
    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
    });

    const html = marked(value);

    // Let Angular sanitize the HTML (this removes scripts and other dangerous content)
    // while still allowing safe HTML elements
    return this.sanitizer.sanitize(1, html) as string;
  }
}
