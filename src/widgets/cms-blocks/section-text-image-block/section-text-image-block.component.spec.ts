import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTextImageBlockComponent } from './section-text-image-block.component';

describe('SectionTextImageBlockComponent', () => {
  let component: SectionTextImageBlockComponent;
  let fixture: ComponentFixture<SectionTextImageBlockComponent>;
  let componentRef: ComponentRef<SectionTextImageBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTextImageBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionTextImageBlockComponent);
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
