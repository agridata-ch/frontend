import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFeedbackBlockComponent } from './user-feedback-block.component';

describe('UserFeedbackBlockComponent', () => {
  let component: UserFeedbackBlockComponent;
  let fixture: ComponentFixture<UserFeedbackBlockComponent>;
  let componentRef: ComponentRef<UserFeedbackBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFeedbackBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFeedbackBlockComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
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
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
