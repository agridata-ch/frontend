import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillWidth(): string {
    const fill = fixture.nativeElement.querySelector('[role=progressbar] > div') as HTMLElement;
    return fill.style.width;
  }

  function progressbar(): HTMLElement {
    return fixture.nativeElement.querySelector('[role=progressbar]') as HTMLElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reflects the value as fill width', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();
    expect(fillWidth()).toBe('42%');
  });

  it('clamps values below 0 and above 100', () => {
    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();
    expect(fillWidth()).toBe('100%');

    fixture.componentRef.setInput('value', -10);
    fixture.detectChanges();
    expect(fillWidth()).toBe('0%');
  });

  it('exposes aria-valuenow reflecting the value', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();
    expect(progressbar().getAttribute('aria-valuenow')).toBe('42');
  });
});
