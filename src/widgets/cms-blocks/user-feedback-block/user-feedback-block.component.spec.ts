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
      id: 33,
      heading: 'Ihre digitale Souveränität:',
      items: [
        {
          id: 114,
          label: 'Sie entscheiden, wer Zugriff auf Ihre Daten erhält',
          icon: {
            id: 17,
            documentId: 'ggg7xbwh91edowi71d44s6fm',
            alternativeText: null,
            url: '/uploads/icon_97b99a9124.png',
            formats: null,
          },
        },
        {
          id: 115,
          label: 'Transparente Übersicht auf Ihrem persönlichen Dashboard',
          icon: {
            id: 17,
            documentId: 'ggg7xbwh91edowi71d44s6fm',
            alternativeText: null,
            url: '/uploads/icon_97b99a9124.png',
            formats: null,
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
