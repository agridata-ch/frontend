import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { AgridataWysiwygComponent } from './agridata-wysiwyg.component';

describe('AgridataWysiwygComponent', () => {
  let fixture: ComponentFixture<AgridataWysiwygComponent>;
  let component: AgridataWysiwygComponent;
  let componentRef: ComponentRef<AgridataWysiwygComponent>;
  let control: FormControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataWysiwygComponent, ReactiveFormsModule, createTranslocoTestingModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataWysiwygComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    control = new FormControl('');
    componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  it('should create and mount the editor', () => {
    expect(component).toBeTruthy();
  });

  describe('value sync', () => {
    it('should write the editor content back to the control on change', () => {
      component['editor']?.commands.setContent('<p>hello world</p>');

      expect(control.value).toContain('hello world');
    });

    it('should normalise empty content to an empty string', () => {
      component['editor']?.commands.setContent('<p>something</p>');
      component['editor']?.commands.clearContent();

      expect(control.value).toBe('');
    });

    it('should load an existing control value into the editor', () => {
      const presetFixture = TestBed.createComponent(AgridataWysiwygComponent);
      presetFixture.componentRef.setInput('control', new FormControl('<p>preset text</p>'));
      presetFixture.detectChanges();

      expect(presetFixture.nativeElement.textContent).toContain('preset text');
    });
  });

  describe('view mode', () => {
    it('should render the stored HTML read-only without a toolbar', () => {
      const viewFixture = TestBed.createComponent(AgridataWysiwygComponent);
      viewFixture.componentRef.setInput('control', new FormControl('<p><strong>Bold</strong></p>'));
      viewFixture.componentRef.setInput('isViewMode', true);
      viewFixture.detectChanges();

      const content = viewFixture.nativeElement.querySelector('.rich-text-content');
      expect(content.innerHTML).toContain('<strong>Bold</strong>');
      expect(viewFixture.nativeElement.querySelector('fieldset')).toBeNull();
    });
  });

  describe('view <-> edit toggle', () => {
    const editableHost = () =>
      fixture.nativeElement.querySelector('[contenteditable="true"]') as HTMLElement | null;

    it('should recreate a live, editable editor after toggling view mode off and on', () => {
      // Starts in edit mode (isViewMode defaults to false): editor is mounted and editable.
      expect(component['editor']).toBeTruthy();
      expect(editableHost()).not.toBeNull();

      // View mode tears down the edit chrome and the editor.
      componentRef.setInput('isViewMode', true);
      fixture.detectChanges();
      expect(component['editor']).toBeUndefined();
      expect(fixture.nativeElement.querySelector('fieldset')).toBeNull();

      // Re-entering edit mode must recreate the editor into the fresh host, not leave it empty.
      componentRef.setInput('isViewMode', false);
      fixture.detectChanges();
      expect(component['editor']).toBeTruthy();
      expect(editableHost()).not.toBeNull();
    });

    it('should preserve content across a view/edit round trip', () => {
      component['editor']?.commands.setContent('<p>round trip</p>');
      expect(control.value).toContain('round trip');

      componentRef.setInput('isViewMode', true);
      fixture.detectChanges();
      componentRef.setInput('isViewMode', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('round trip');
    });
  });

  describe('toolbar', () => {
    it.each([
      ['wrap the selection in bold', 'toggleBold', '<strong>'],
      ['underline the selection', 'toggleUnderline', '<u>'],
      ['turn the selection into a bullet list', 'toggleBulletList', '<ul>'],
      ['turn the selection into a numbered list', 'toggleOrderedList', '<ol>'],
    ] as const)('should %s', (_description, method, expectedTag) => {
      const editor = component['editor'];
      editor?.commands.setContent('<p>abc</p>');
      editor?.commands.selectAll();

      component[method]();

      expect(control.value).toContain(expectedTag);
    });

    it('should strip all marks and reset the block to a paragraph', () => {
      const editor = component['editor'];
      editor?.commands.setContent('<ul><li><strong><u>styled</u></strong></li></ul>');
      editor?.commands.selectAll();

      component['resetFormat']();

      const html = editor?.getHTML() ?? '';
      expect(html).toContain('<p>');
      expect(html).toContain('styled');
      expect(html).not.toContain('<ul>');
      expect(html).not.toContain('<strong>');
      expect(html).not.toContain('<u>');
    });
  });

  describe('unsupported formatting', () => {
    it.each([
      ['<h1>Heading</h1>', 'Heading'],
      ['<blockquote><p>Quote</p></blockquote>', 'Quote'],
      ['<pre><code>code</code></pre>', 'code'],
      ['<p><s>struck</s></p>', 'struck'],
      ['<p><a href="https://example.com">link</a></p>', 'link'],
    ])('should collapse %s to a plain paragraph', (input, text) => {
      const editor = component['editor'];
      editor?.commands.setContent(input);

      const html = editor?.getHTML() ?? '';
      expect(html).toContain(text);
      expect(html).toContain('<p>');
      expect(html).not.toMatch(/<(h1|blockquote|pre|code|s|a)\b/);
    });

    it.each([
      ['<p><strong>bold</strong></p>', '<strong>'],
      ['<p><em>italic</em></p>', '<em>'],
      ['<p><u>underline</u></p>', '<u>'],
      ['<ul><li>bullet</li></ul>', '<ul>'],
      ['<ol><li>ordered</li></ol>', '<ol>'],
    ])('should preserve supported formatting %s', (input, expected) => {
      const editor = component['editor'];
      editor?.commands.setContent(input);

      expect(editor?.getHTML()).toContain(expected);
    });
  });
});
