import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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

    componentRef.setInput('block', {
      __component: 'blocks.image-grid',
      id: 6,
      images: [
        {
          id: 31,
          documentId: 'mrt95ap0ef6rn8kkiouame97',
          alternativeText: null,
          url: 'logo.png',
          formats: null,
        },
        {
          id: 32,
          documentId: 'v9bkknv9epds8wyw1kjcyvq4',
          alternativeText: null,
          url: 'logo.png',
          formats: null,
        },
        {
          id: 34,
          documentId: 'gylz65gamn7pmxel629wg6jn',
          alternativeText: null,
          url: 'logo.png',
          formats: null,
        },
        {
          id: 35,
          documentId: 'c4c6kqouvc7xfct7l8ed8syu',
          alternativeText: null,
          url: 'logo.png',
          formats: null,
        },
      ],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
