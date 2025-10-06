import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCardBlockComponent } from './image-card-block.component';

describe('ImageCardBlockComponent', () => {
  let component: ImageCardBlockComponent;
  let fixture: ComponentFixture<ImageCardBlockComponent>;
  let componentRef: ComponentRef<ImageCardBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCardBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCardBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      id: 3,
      image: {
        id: 36,
        documentId: 'qdsxxuzoprlq890s4ban1v0o',
        alternativeText: null,
        url: '/uploads/test.png',
      },
      card: {
        id: 48,
        heading: 'Heading',
        text: 'Some **markdown** text',
        image: {
          id: 37,
          documentId: 'lcwyguf0xd2fi8ym5hbtmvi7',
          alternativeText: null,
          url: '/uploads/test2.png',
          formats: null,
        },
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
