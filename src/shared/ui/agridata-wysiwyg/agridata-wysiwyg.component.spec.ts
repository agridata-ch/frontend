import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages } from '@/shared/lib/form.helper';
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

    it.each([
      ['a br between items', '<ul><li>a</li><br><li>b</li></ul>'],
      ['an empty item', '<ul><li><p>a</p></li><li><p><br></p></li><li><p>b</p></li></ul>'],
      [
        'an img-only item',
        '<ul><li><p>a</p></li><li><p><img src="x"><br><br></p></li><li><p>b</p></li></ul>',
      ],
    ])(
      'should turn %s into a break between two lists instead of an empty bullet',
      (_label, stored) => {
        const listFixture = TestBed.createComponent(AgridataWysiwygComponent);
        listFixture.componentRef.setInput('control', new FormControl(stored));
        listFixture.detectChanges();

        const html: string = listFixture.componentInstance['editor']?.getHTML() ?? '';
        expect(html).toBe('<ul><li><p>a</p></li></ul><p></p><ul><li><p>b</p></li></ul>');
      },
    );

    it.each([
      ['paragraphs', '<p>a</p><br><p>b</p>', '<p>a</p><p></p><p>b</p>'],
      [
        'an ul and a paragraph',
        '<ul><li>a</li></ul><br><p>b</p>',
        '<ul><li><p>a</p></li></ul><p></p><p>b</p>',
      ],
      [
        'an ol and a heading',
        '<ol><li>a</li></ol><br><p>b</p>',
        '<ol><li><p>a</p></li></ol><p></p><p>b</p>',
      ],
      ['inline text', 'a<br>b', '<p>a<br>b</p>'],
      ['inline text with a double br', 'a<br><br>b', '<p>a<br><br>b</p>'],
    ])('should handle a top-level br between %s', (_label, stored, expected) => {
      const brFixture = TestBed.createComponent(AgridataWysiwygComponent);
      brFixture.componentRef.setInput('control', new FormControl(stored));
      brFixture.detectChanges();

      expect(brFixture.componentInstance['editor']?.getHTML()).toBe(expected);
    });

    it('should clean list html written to the control after init', () => {
      control.setValue('<ul><li>a</li><br><li>b</li></ul>');

      // TipTap appends a trailing paragraph after a final list once a transaction runs.
      expect(component['editor']?.getHTML()).toBe(
        '<ul><li><p>a</p></li></ul><p></p><ul><li><p>b</p></li></ul><p></p>',
      );
    });

    it('should write an empty paragraph to the control as <p><br></p> so the break survives saving', () => {
      component['editor']?.commands.setContent('<p>a</p><br><p>b</p>');

      expect(control.value).toBe('<p>a</p><p><br></p><p>b</p>');
    });

    it('should keep numbering across a break inside an ordered list', () => {
      const olFixture = TestBed.createComponent(AgridataWysiwygComponent);
      olFixture.componentRef.setInput(
        'control',
        new FormControl('<ol><li>a</li><li>b</li><br><li>c</li></ol>'),
      );
      olFixture.detectChanges();

      expect(olFixture.componentInstance['editor']?.getHTML()).toContain('<ol start="3">');
    });

    it('should keep numbering across two breaks inside an ordered list', () => {
      const olFixture = TestBed.createComponent(AgridataWysiwygComponent);
      olFixture.componentRef.setInput(
        'control',
        new FormControl('<ol><li>a</li><br><li>b</li><br><li>c</li></ol>'),
      );
      olFixture.detectChanges();

      expect(olFixture.componentInstance['editor']?.getHTML()).toContain('<ol start="3">');
    });

    it('should keep the trailing breaks of a list item and drop its img', () => {
      const listFixture = TestBed.createComponent(AgridataWysiwygComponent);
      listFixture.componentRef.setInput(
        'control',
        new FormControl('<ul><li><p>a<img src="x"><br><br></p></li></ul>'),
      );
      listFixture.detectChanges();

      const html: string = listFixture.componentInstance['editor']?.getHTML() ?? '';
      expect(html).toContain('<br>');
      expect(html).not.toContain('<img');
    });

    it('should keep intentional line breaks inside a list item', () => {
      const listFixture = TestBed.createComponent(AgridataWysiwygComponent);
      listFixture.componentRef.setInput(
        'control',
        new FormControl('<ul><li><p>a<br>b</p></li></ul>'),
      );
      listFixture.detectChanges();

      expect(listFixture.componentInstance['editor']?.getHTML()).toContain('a<br>b');
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

    it('should render the heading group only when headings are allowed', () => {
      const groupCount = () => fixture.nativeElement.querySelectorAll('fieldset > div');

      expect(groupCount()).toHaveLength(2);

      componentRef.setInput('allowHeadings', true);
      fixture.detectChanges();

      expect(groupCount()).toHaveLength(3);
    });
  });

  describe('raw HTML length limit', () => {
    it('blocks formatting that pushes the raw HTML over the limit', () => {
      componentRef.setInput('maxCharacters', 40);
      fixture.detectChanges();
      const editor = component['editor'];

      // '<p>' + 30 chars + '</p>' = 37 chars, under the limit.
      editor?.commands.setContent(`<p>${'a'.repeat(30)}</p>`);
      editor?.commands.selectAll();

      // Wrapping in <strong></strong> adds 17 chars (54 total), so the transaction is rejected.
      component['toggleBold']();

      expect(editor?.getHTML()).not.toContain('<strong>');
    });

    it('loads existing over-limit content and allows editing it down', () => {
      const overLimit = TestBed.createComponent(AgridataWysiwygComponent);
      overLimit.componentRef.setInput('control', new FormControl(`<p>${'a'.repeat(100)}</p>`));
      overLimit.componentRef.setInput('maxCharacters', 40);
      overLimit.detectChanges();
      const editor = overLimit.componentInstance['editor'];

      // Content set via the `content:` option is not a transaction, so it loads intact.
      expect(editor?.getHTML()).toContain('a'.repeat(100));

      // A shrinking transaction is always allowed, even while still over the limit.
      editor?.commands.clearContent();

      expect(overLimit.componentInstance.control()?.value).toBe('');
    });
  });

  describe('minLength', () => {
    it('reports minlength when the visible text is under the limit, even if the HTML is longer', () => {
      const shortControl = new FormControl('') as FormControlWithMessages;
      shortControl.minLength = 10;
      const shortFixture = TestBed.createComponent(AgridataWysiwygComponent);
      shortFixture.componentRef.setInput('control', shortControl);
      shortFixture.detectChanges();

      // '<p>abc</p>' is 10 characters, but the visible text is only 3.
      shortFixture.componentInstance['editor']?.commands.setContent('<p>abc</p>');

      expect(shortControl.errors?.['minlength']).toBeTruthy();
    });

    it('clears minlength once the visible text reaches the limit', () => {
      const longControl = new FormControl('') as FormControlWithMessages;
      longControl.minLength = 10;
      const longFixture = TestBed.createComponent(AgridataWysiwygComponent);
      longFixture.componentRef.setInput('control', longControl);
      longFixture.detectChanges();

      longFixture.componentInstance['editor']?.commands.setContent(`<p>${'a'.repeat(10)}</p>`);

      expect(longControl.errors?.['minlength']).toBeFalsy();
    });
  });

  describe('headings', () => {
    const headingButton = (text: string) =>
      Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('fieldset button')).find(
        (button) => button.getAttribute('aria-label')?.endsWith(text) === true,
      );

    it('should offer no heading buttons by default', () => {
      expect(headingButton('heading1')).toBeUndefined();
      expect(headingButton('heading2')).toBeUndefined();
      expect(headingButton('heading3')).toBeUndefined();
    });

    describe('when allowed', () => {
      beforeEach(() => {
        componentRef.setInput('allowHeadings', true);
        fixture.detectChanges();
      });

      it.each([1, 2, 3] as const)('should turn the selection into an h%s', (level) => {
        const editor = component['editor'];
        editor?.commands.setContent('<p>abc</p>');
        editor?.commands.selectAll();

        component['toggleHeading'](level);

        expect(control.value).toContain(`<h${level}>abc</h${level}>`);
      });

      it('should toggle the heading off again', () => {
        const editor = component['editor'];
        editor?.commands.setContent('<h2>abc</h2>');
        editor?.commands.setTextSelection(2);

        component['toggleHeading'](2);

        expect(editor?.getHTML()).toContain('<p>abc</p>');
      });

      it('should apply a heading when its toolbar button is clicked', () => {
        const editor = component['editor'];
        editor?.commands.setContent('<p>abc</p>');
        editor?.commands.selectAll();

        headingButton('heading2')?.click();

        expect(control.value).toContain('<h2>abc</h2>');
      });

      it('should mark the active heading level', () => {
        component['editor']?.commands.setContent('<h3>abc</h3>');

        const [h1, , h3] = component['headingButtons'];

        expect(h3.isActive?.()).toBe(true);
        expect(h1.isActive?.()).toBe(false);
      });

      it('should preserve stored h1-h3 headings', () => {
        const editor = component['editor'];
        editor?.commands.setContent('<h1>one</h1><h2>two</h2><h3>three</h3>');

        expect(editor?.getHTML()).toContain('<h1>one</h1><h2>two</h2><h3>three</h3>');
      });

      it('should collapse unsupported heading levels to a paragraph', () => {
        const editor = component['editor'];
        editor?.commands.setContent('<h4>four</h4>');

        expect(editor?.getHTML()).toContain('<p>four</p>');
      });

      it('should reset a heading to a paragraph', () => {
        const editor = component['editor'];
        editor?.commands.setContent('<h1>abc</h1>');
        editor?.commands.setTextSelection(2);

        component['resetFormat']();

        expect(editor?.getHTML()).toContain('<p>abc</p>');
        expect(editor?.getHTML()).not.toContain('<h1>');
      });
    });

    it('should recreate the editor when allowHeadings changes', () => {
      const initialEditor = component['editor'];

      componentRef.setInput('allowHeadings', true);
      fixture.detectChanges();

      expect(component['editor']).not.toBe(initialEditor);
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
