import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGridBlock } from '@/entities/cms';

import { ImageGridBlockComponent } from './image-grid-block.component';

describe('ImageGridBlockComponent', () => {
  let component: ImageGridBlockComponent;
  let fixture: ComponentFixture<ImageGridBlockComponent>;
  let componentRef: ComponentRef<ImageGridBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGridBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageGridBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    const testData: ImageGridBlock = {
      __component: 'blocks.image-grid',
      id: 6,
      anchorId: 'grid',
      images: [
        {
          id: 31,
          imageAlt: null,
          file: {
            id: 31,
            documentId: 'mrt95ap0ef6rn8kkiouame97',
            alternativeText: null,
            url: 'logo.png',
          },
        },
        {
          id: 32,
          imageAlt: null,
          file: {
            id: 32,
            documentId: 'v9bkknv9epds8wyw1kjcyvq4',
            alternativeText: null,
            url: 'logo.png',
          },
        },
        {
          id: 34,
          imageAlt: null,
          file: {
            id: 34,
            documentId: 'gylz65gamn7pmxel629wg6jn',
            alternativeText: null,
            url: 'logo.png',
          },
        },
        {
          id: 35,
          imageAlt: null,
          file: {
            id: 35,
            documentId: 'c4c6kqouvc7xfct7l8ed8syu',
            alternativeText: null,
            url: 'logo.png',
          },
        },
      ],
    };
    componentRef.setInput('block', testData);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
