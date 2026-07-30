import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nFormatDirective } from './i18n-format.directive';

@Component({
  imports: [I18nFormatDirective],
  template: `<span [i18nFormat]="text()"></span>`,
})
class HostComponent {
  readonly text = signal('');
}

describe('I18nFormatDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const render = (text: string) => {
    host.text.set(text);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('span');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render markdown bold as a strong element', () => {
    const span = render('Dieser Vertrag **regelt die Nutzung** abschliessend.');

    expect(span.querySelector('strong')?.textContent).toBe('regelt die Nutzung');
    expect(span.textContent).toBe('Dieser Vertrag regelt die Nutzung abschliessend.');
  });

  it('should render plain text unchanged', () => {
    const span = render('Ganz normaler Text ohne Formatierung.');

    expect(span.textContent).toBe('Ganz normaler Text ohne Formatierung.');
  });

  it('should preserve newlines so whitespace-pre-line still works', () => {
    const span = render('**Katalog:** sichtbar\n**Antrag:** möglich');

    expect(span.textContent).toBe('Katalog: sichtbar\nAntrag: möglich');
    expect(span.querySelectorAll('strong')).toHaveLength(2);
  });

  it('should re-render when the text changes', () => {
    render('**erste**');
    const span = render('**zweite**');

    expect(span.querySelector('strong')?.textContent).toBe('zweite');
    expect(span.textContent).toBe('zweite');
  });

  describe('supported inline formatting', () => {
    it('should render italic as an em element', () => {
      const span = render('Das ist *kursiv*.');

      expect(span.querySelector('em')?.textContent).toBe('kursiv');
    });

    it('should render strikethrough as a del element', () => {
      const span = render('Das ist ~~weg~~.');

      expect(span.querySelector('del')?.textContent).toBe('weg');
    });

    it('should render code as a code element', () => {
      const span = render('Das ist `code`.');

      expect(span.querySelector('code')?.textContent).toBe('code');
    });

    it('should keep nested emphasis', () => {
      const span = render('**fett *und kursiv***');

      expect(span.querySelector('strong em')?.textContent).toBe('und kursiv');
    });
  });

  describe('untrusted markup', () => {
    it('should render a markdown link as plain text', () => {
      const span = render('Bio Suisse [Widerruf](https://evil.example)');

      expect(span.querySelector('a')).toBeNull();
      expect(span.textContent).toBe('Bio Suisse Widerruf');
    });

    it('should not autolink a bare url', () => {
      const span = render('Bio Suisse https://evil.example');

      expect(span.querySelector('a')).toBeNull();
      expect(span.textContent).toBe('Bio Suisse https://evil.example');
    });

    it('should not render a markdown image', () => {
      const span = render('![x](https://evil.example/p.png)');

      expect(span.querySelector('img')).toBeNull();
    });

    it('should strip dangerous markup', () => {
      const span = render('Hallo <script>alert(1)</script><img src="x" onerror="alert(1)" />');

      expect(span.querySelector('script')).toBeNull();
      expect(span.querySelector('img')).toBeNull();
    });

    it('should strip attributes but keep the element of a nested anchor', () => {
      const span = render('<a href="https://evil.example"><b>Widerruf</b></a>');

      expect(span.querySelector('a')).toBeNull();
      expect(span.querySelector('b')?.textContent).toBe('Widerruf');
    });

    it('should drop attributes from allowlisted elements', () => {
      const span = render('<code class="x" onclick="alert(1)">codeText</code>');

      const code = span.querySelector('code');
      expect(code?.textContent).toBe('codeText');
      expect(code?.attributes).toHaveLength(0);
    });
  });
});
