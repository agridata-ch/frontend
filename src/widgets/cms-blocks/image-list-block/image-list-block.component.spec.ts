import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ImageListBlockComponent } from './image-list-block.component';

describe('ImageListComponent', () => {
  let component: ImageListBlockComponent;
  let fixture: ComponentFixture<ImageListBlockComponent>;
  let componentRef: ComponentRef<ImageListBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageListBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageListBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    const testData = {
      heading: 'Test Heading',
      images: [
        { id: 1, url: 'test1.jpg', alternativeText: 'Image 1' },
        { id: 2, url: 'test2.jpg', alternativeText: 'Image 2' },
      ],
      __component: 'test-comp',
    };
    componentRef.setInput('block', testData);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render heading and images', () => {
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h3')).nativeElement;
    expect(heading.textContent).toContain('Test Heading');

    const images = fixture.debugElement.queryAll(By.css('img'));
    expect(images.length).toBe(2);
    expect(images[0].attributes['alt']).toBe('Image 1');
    expect(images[1].attributes['alt']).toBe('Image 2');
  });
});
