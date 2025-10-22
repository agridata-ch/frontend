import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ImageListBlock, SectionImageListBlock } from '@/entities/cms';

import { SectionImageListComponent } from './section-image-list.component';

describe('SectionImageListComponent', () => {
  let component: SectionImageListComponent;
  let fixture: ComponentFixture<SectionImageListComponent>;
  let componentRef: ComponentRef<SectionImageListComponent>;

  const testImageList: ImageListBlock = {
    __component: 'image-list-block',
    id: 201,
    heading: 'Images Heading',
    images: [
      { id: 101, url: 'img1.jpg', alternativeText: 'First image', documentId: 'doc1' },
      { id: 102, url: 'img2.jpg', alternativeText: 'Second image', documentId: 'doc2' },
    ],
  };

  const testBlock: SectionImageListBlock = {
    __component: 'section-image-list',
    id: 1,
    heading: 'Gallery',
    subHeading: 'A collection of images',
    imageList: testImageList,
    anchorId: 'gallery-anchor',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionImageListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionImageListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('block', testBlock);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render section heading and subheading', () => {
    const heading = fixture.debugElement.query(By.css('h2')).nativeElement;
    expect(heading.textContent).toContain('Gallery');

    // Find the p tag that is a sibling to the h2 tag
    const headingElement = fixture.debugElement.query(By.css('h2'));
    const parent = headingElement.parent;
    const siblingP = parent?.children.find(
      (child) => child.nativeElement.tagName.toLowerCase() === 'p',
    );
    expect(siblingP).toBeDefined();
    expect(siblingP?.nativeElement.textContent).toContain('A collection of images');
  });
});
