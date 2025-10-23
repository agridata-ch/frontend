import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineCardComponent } from './timeline-card.component';

describe('TimelineCardComponent', () => {
  let component: TimelineCardComponent;
  let fixture: ComponentFixture<TimelineCardComponent>;
  let componentRef: ComponentRef<TimelineCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineCardComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      id: 1,
      heading: 'Antrag',
      description:
        'Eine Organisation möchte Ihre Daten nutzen und erstellt dazu ein Datenantrag auf agridata.ch',
      image: {
        id: 44,
        documentId: 'xq9ewkoqjh281prvo5vyne6b',
        alternativeText: null,
        url: '/uploads/L_Datenaustausch3_433fb847f0.png',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
