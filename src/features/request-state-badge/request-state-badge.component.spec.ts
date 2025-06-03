import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestStateBadgeComponent } from './request-state-badge.component';
import { BadgeVariant } from '@/shared/ui/badge/badge.component';

describe('RequestStateBadgeComponent', () => {
  let component: RequestStateBadgeComponent;
  let fixture: ComponentFixture<RequestStateBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestStateBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestStateBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('badgeText and badgeVariant for OPENED', () => {
    fixture.componentRef.setInput('status', 'OPENED');
    fixture.componentRef.setInput('lastStateChangeDate', undefined);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Offen');
    expect(component.badgeVariant()).toBe(BadgeVariant.INFO);
  });

  it('badgeText and badgeVariant for GRANTED without date', () => {
    fixture.componentRef.setInput('status', 'GRANTED');
    fixture.componentRef.setInput('lastStateChangeDate', undefined);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Eingewilligt');
    expect(component.badgeVariant()).toBe(BadgeVariant.SUCCESS);
  });

  it('badgeText and badgeVariant for GRANTED with date', () => {
    fixture.componentRef.setInput('status', 'GRANTED');
    fixture.componentRef.setInput('lastStateChangeDate', '2024-06-01T12:00:00Z');
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Eingewilligt am 01.06.2024');
    expect(component.badgeVariant()).toBe(BadgeVariant.SUCCESS);
  });

  it('badgeText and badgeVariant for DECLINED without date', () => {
    fixture.componentRef.setInput('status', 'DECLINED');
    fixture.componentRef.setInput('lastStateChangeDate', undefined);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Abgelehnt');
    expect(component.badgeVariant()).toBe(BadgeVariant.ERROR);
  });

  it('badgeText and badgeVariant for DECLINED with date', () => {
    fixture.componentRef.setInput('status', 'DECLINED');
    fixture.componentRef.setInput('lastStateChangeDate', '2024-06-02T12:00:00Z');
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Abgelehnt am 02.06.2024');
    expect(component.badgeVariant()).toBe(BadgeVariant.ERROR);
  });

  it('badgeText and badgeVariant for unknown status', () => {
    fixture.componentRef.setInput('status', 'SOMETHING_ELSE');
    fixture.componentRef.setInput('lastStateChangeDate', undefined);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Unknown');
    expect(component.badgeVariant()).toBe(BadgeVariant.DEFAULT);
  });
});
