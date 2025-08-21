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
});
