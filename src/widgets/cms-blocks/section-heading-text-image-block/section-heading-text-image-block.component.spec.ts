import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHeadingTextImageBlockComponent } from './section-heading-text-image-block.component';

describe('SectionHeadingTextImageBlockComponent', () => {
  let component: SectionHeadingTextImageBlockComponent;
  let fixture: ComponentFixture<SectionHeadingTextImageBlockComponent>;
  let componentRef: ComponentRef<SectionHeadingTextImageBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeadingTextImageBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeadingTextImageBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'blocks.section-heading-text-image',
      id: 1,
      heading: 'Section Heading Text Image Block',
      subHeading: 'This is a subheading',
      text: 'This is some text content.',
      image: {
        id: 1,
        documentId: '1',
        alternativeText: 'Image Alt Text',
        url: '/path/to/image.jpg',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
