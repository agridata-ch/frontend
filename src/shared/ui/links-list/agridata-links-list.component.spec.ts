import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataLinksListComponent } from './agridata-links-list.component';

describe('AgridataLinksListComponent', () => {
  let fixture: ComponentFixture<AgridataLinksListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataLinksListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataLinksListComponent);
  });

  it('renders one anchor per link with its display text and url', () => {
    fixture.componentRef.setInput('links', [
      { url: 'https://a.example', displayText: 'A' },
      { url: 'https://b.example', displayText: 'B' },
    ]);
    fixture.detectChanges();

    const anchors = fixture.nativeElement.querySelectorAll('a');
    expect(anchors).toHaveLength(2);
    expect(anchors[0].getAttribute('href')).toBe('https://a.example');
    expect(anchors[0].textContent).toContain('A');
  });

  it('falls back to the url when no display text is given', () => {
    fixture.componentRef.setInput('links', [{ url: 'https://only-url.example' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a').textContent).toContain(
      'https://only-url.example',
    );
  });

  it('renders no anchors for an empty list', () => {
    fixture.componentRef.setInput('links', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('a')).toHaveLength(0);
  });
});
