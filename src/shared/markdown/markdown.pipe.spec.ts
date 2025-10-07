import { TestBed } from '@angular/core/testing';

import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe],
    });

    pipe = TestBed.inject(MarkdownPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform markdown to HTML', () => {
    const markdown = '# Hello';
    const result = pipe.transform(markdown);
    expect(result).toContain('Hello');
  });

  it('should handle empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should handle links with titles', () => {
    const markdown = '[Example](https://example.com "Example Title")';
    const result = pipe.transform(markdown);
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('title="Example Title"');
    expect(result).toContain('>Example</a>');
  });

  it('should handle links without titles', () => {
    const markdown = '[No Title](https://example.com)';
    const result = pipe.transform(markdown);
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('title=""');
    expect(result).toContain('>No Title</a>');
  });

  it('should preserve link markup in multi-paragraph content', () => {
    const markdown = 'First paragraph\n\n[Link text](https://example.com)\n\nLast paragraph';
    const result = pipe.transform(markdown);
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('>Link text</a>');
    expect(result).toContain('<p>First paragraph</p>');
    expect(result).toContain('<p>Last paragraph</p>');
  });
});
