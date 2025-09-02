import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionMediaBlockComponent } from './section-media-block.component';

describe('SectionMediaBlockComponent', () => {
  let component: SectionMediaBlockComponent;
  let fixture: ComponentFixture<SectionMediaBlockComponent>;
  let componentRef: ComponentRef<SectionMediaBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionMediaBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionMediaBlockComponent);
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
