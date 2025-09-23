import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionFaqBlockComponent } from './section-faq-block.component';

describe('SectionFaqBlockComponent', () => {
  let component: SectionFaqBlockComponent;
  let fixture: ComponentFixture<SectionFaqBlockComponent>;
  let componentRef: ComponentRef<SectionFaqBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFaqBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionFaqBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'layout.section-faq',
      id: 5,
      heading: 'Questions?',
      subHeading: 'Most questions are answered here',
      faqs: [
        {
          id: 14,
          question: 'How can I register?',
          answer: 'like this',
        },
        {
          id: 15,
          question: 'What do you do there?',
          answer: 'like this',
        },
        {
          id: 16,
          question: "Why doesn't this work?",
          answer: 'because of that',
        },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
