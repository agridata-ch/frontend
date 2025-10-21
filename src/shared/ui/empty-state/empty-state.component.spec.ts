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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the empty state image', () => {
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('assets/images/app-ok.svg');
    expect(img.nativeElement.alt).toBe('Keine Anfragen');
  });

  it('should display the heading text', () => {
    const heading = fixture.debugElement.query(By.css('h5'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent.trim()).toBe('Keine Anfragen vorhanden');
  });

  it('should display the main description text', () => {
    const paragraphs = fixture.debugElement.queryAll(By.css('p'));
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
    expect(paragraphs[0].nativeElement.textContent).toContain(
      'Sie haben derzeit keine aktiven Datenanfragen',
    );
  });

  it('should display a link to agridata.ch', () => {
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.href).toBe('https://www.agridata.ch/');
    expect(link.nativeElement.textContent.trim()).toBe('agridata.ch');
  });
});
