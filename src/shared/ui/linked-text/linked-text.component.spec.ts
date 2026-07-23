import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedTextParts } from '@/shared/utils';

import { LinkedTextComponent } from './linked-text.component';

describe('LinkedTextComponent', () => {
  let component: LinkedTextComponent;
  let fixture: ComponentFixture<LinkedTextComponent>;
  let componentRef: ComponentRef<LinkedTextComponent>;

  const setParts = (parts: LinkedTextParts): void => {
    componentRef.setInput('parts', parts);
    fixture.detectChanges();
  };

  const anchor = (): HTMLAnchorElement | null => fixture.nativeElement.querySelector('a');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkedTextComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    setParts({ before: 'text', linkText: null, after: '' });
    expect(component).toBeTruthy();
  });

  it('should build a urlSchema:linkText href from the parts', () => {
    setParts({
      before: 'Contact ',
      linkText: 'support@agridata.ch',
      after: '.',
      urlSchema: 'mailto',
    });
    const link = anchor();
    expect(link?.getAttribute('href')).toBe('mailto:support@agridata.ch');
    expect(link?.textContent?.trim()).toBe('support@agridata.ch');
  });

  it('should prefer the explicit href input over urlSchema', () => {
    componentRef.setInput('href', 'https://example.com');
    setParts({ before: 'See ', linkText: 'the terms', after: '.', urlSchema: 'mailto' });
    expect(anchor()?.getAttribute('href')).toBe('https://example.com');
  });

  it('should render plain link text without an anchor when no valid href resolves', () => {
    // Bracketed text but no mailto:/tel: marker → urlSchema undefined → no broken link.
    setParts({ before: 'Contact ', linkText: 'support@agridata.ch', after: '.' });
    expect(anchor()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('support@agridata.ch');
  });

  it('should set rel="noopener noreferrer" on the anchor', () => {
    setParts({ before: '', linkText: 'call us', after: '', urlSchema: 'tel' });
    expect(anchor()?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(anchor()?.getAttribute('target')).toBe('_blank');
  });
});
