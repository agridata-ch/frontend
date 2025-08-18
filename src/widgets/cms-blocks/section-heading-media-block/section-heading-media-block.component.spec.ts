import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHeadingMediaBlockComponent } from './section-heading-media-block.component';

describe('SectionHeadingMediaBlockComponent', () => {
  let component: SectionHeadingMediaBlockComponent;
  let fixture: ComponentFixture<SectionHeadingMediaBlockComponent>;
  let componentRef: ComponentRef<SectionHeadingMediaBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeadingMediaBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeadingMediaBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'blocks.section-heading-media',
      id: 1,
      heading: 'Section Heading Media Block',
      subHeading: 'This is a subheading',
      media: {
        id: 1,
        documentId: '1',
        alternativeText: 'Media Image',
        url: '/path/to/media/image.jpg',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
