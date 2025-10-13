import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextImageBlockComponent } from './text-image-block.component';

describe('TextImageBlockComponent', () => {
  let component: TextImageBlockComponent;
  let fixture: ComponentFixture<TextImageBlockComponent>;
  let componentRef: ComponentRef<TextImageBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextImageBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextImageBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'blocks.text-image',
      id: 1,
      heading: 'Text Image Block',
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
