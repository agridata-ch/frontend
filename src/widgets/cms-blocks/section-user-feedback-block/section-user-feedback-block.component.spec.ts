import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionUserFeedbackBlockComponent } from './section-user-feedback-block.component';

describe('SectionUserFeedbackBlockComponent', () => {
  let component: SectionUserFeedbackBlockComponent;
  let fixture: ComponentFixture<SectionUserFeedbackBlockComponent>;
  let componentRef: ComponentRef<SectionUserFeedbackBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionUserFeedbackBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionUserFeedbackBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'layout.section-user-feedback',
      id: 3,
      heading: 'Was die Benutzer sagen',
      subHeading: null,
      feedbackBlocks: [
        {
          id: 5,
          quote:
            'Endlich weiss ich, wer welche Daten hat. Mit einem Klick kann ich Freigaben erteilen oder stoppen. Das gibt mir Sicherheit.',
          name: 'Hans Zimmermann',
          location: 'Bio-Hof Thurgau',
          image: {
            id: 23,
            alternativeText: null,
            url: '/uploads/Screenshot_2025_09_02_at_12_42_36_aa1d98d9a7.png',
          },
        },
        {
          id: 6,
          quote:
            'Endlich weiss ich, wer welche Daten hat. Mit einem Klick kann ich Freigaben erteilen oder stoppen. Das gibt mir Sicherheit.',
          name: 'Susanne Zimmermann',
          location: 'Bio-Hof Thurgau',
          image: {
            id: 24,
            documentId: 'n2r9cpm9yrcojfc8u2dhkezb',
            alternativeText: null,
            url: '/uploads/Screenshot_2025_09_02_at_12_44_28_634710baf7.png',
          },
        },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
