import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';

@Component({
  imports: [CardComponent],
  template: `
    <app-card [title]="title" [description]="description">
      <span cardTags class="tag">tag</span>
    </app-card>
  `,
})
class HostComponent {
  title = 'My title';
  description = 'My description';
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title and description', () => {
    expect(fixture.nativeElement.querySelector('span.font-semibold')?.textContent).toContain(
      'My title',
    );
    expect(fixture.nativeElement.textContent).toContain('My description');
  });

  it('should project tags content', () => {
    expect(fixture.nativeElement.querySelector('.tag')).not.toBeNull();
  });

  it('should render an image when imageUrl is set', () => {
    const cardFixture = TestBed.createComponent(CardComponent);
    cardFixture.componentRef.setInput('imageUrl', 'https://cdn.example/x.jpg');
    cardFixture.componentRef.setInput('imageAlt', 'the alt');
    cardFixture.detectChanges();

    const img = cardFixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('src')).toBe('https://cdn.example/x.jpg');
    expect(img?.getAttribute('alt')).toBe('the alt');
  });

  it('should render no image when imageUrl is not set', () => {
    const cardFixture = TestBed.createComponent(CardComponent);
    cardFixture.detectChanges();

    expect(cardFixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should render pulsing placeholders instead of content while loading', () => {
    const cardFixture = TestBed.createComponent(CardComponent);
    cardFixture.componentRef.setInput('title', 'My title');
    cardFixture.componentRef.setInput('description', 'My description');
    cardFixture.componentRef.setInput('loading', true);
    cardFixture.detectChanges();

    expect(cardFixture.nativeElement.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(cardFixture.nativeElement.querySelector('span.font-semibold')).toBeNull();
    expect(cardFixture.nativeElement.textContent).not.toContain('My title');
  });

  it('should emit handleClick when the card is clicked', () => {
    const cardFixture = TestBed.createComponent(CardComponent);
    const clickSpy = vi.fn();
    cardFixture.componentInstance.handleClick.subscribe(clickSpy);
    cardFixture.detectChanges();

    cardFixture.nativeElement.click();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit handleClick while text is selected', () => {
    const cardFixture = TestBed.createComponent(CardComponent);
    cardFixture.componentRef.setInput('description', 'Selectable text');
    const clickSpy = vi.fn();
    cardFixture.componentInstance.handleClick.subscribe(clickSpy);
    cardFixture.detectChanges();
    document.body.appendChild(cardFixture.nativeElement);

    const range = document.createRange();
    range.selectNodeContents(cardFixture.nativeElement.querySelector('p'));
    getSelection()?.addRange(range);
    cardFixture.nativeElement.click();
    getSelection()?.removeAllRanges();

    expect(clickSpy).not.toHaveBeenCalled();
  });
});
