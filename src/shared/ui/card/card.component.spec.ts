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
});
