import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title when provided', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h5'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent.trim()).toBe('Test Title');
  });

  it('should display the message when provided', () => {
    fixture.componentRef.setInput('message', 'Test Message');
    fixture.detectChanges();

    const paragraph = fixture.debugElement.query(By.css('p'));
    expect(paragraph).toBeTruthy();
    expect(paragraph.nativeElement.textContent.trim()).toBe('Test Message');
  });

  it('should display both title and message', () => {
    fixture.componentRef.setInput('title', 'Empty State Title');
    fixture.componentRef.setInput('message', 'Empty State Message');
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h5'));
    const paragraph = fixture.debugElement.query(By.css('p'));

    expect(heading.nativeElement.textContent.trim()).toBe('Empty State Title');
    expect(paragraph.nativeElement.textContent.trim()).toBe('Empty State Message');
  });
});
