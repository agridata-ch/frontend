import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Block } from '@/entities/cms';
import { CMS_BLOCKS } from '@/shared/constants/constants';

import { BlockRendererComponent } from './cms-block-renderer.component';

const mockMediaBlock: Block = {
  __component: CMS_BLOCKS.SECTION_MEDIA,
  id: 1,
  heading: 'Test Heading',
  subHeading: 'Test Sub',
  anchorId: '',
  media: {
    id: 1,
    documentId: 'abc',
    alternativeText: null,
    url: '/test.mp4',
  },
};

describe('BlockRendererComponent', () => {
  let component: BlockRendererComponent;
  let fixture: ComponentFixture<BlockRendererComponent>;
  let componentRef: ComponentRef<BlockRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockRendererComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', mockMediaBlock);
    componentRef.setInput('index', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isOdd', () => {
    describe('when isDynamicPage is false (default)', () => {
      it('returns false for even indices', () => {
        componentRef.setInput('index', 0);
        expect(component['isOdd']()).toBe(false);

        componentRef.setInput('index', 2);
        expect(component['isOdd']()).toBe(false);
      });

      it('returns true for odd indices', () => {
        componentRef.setInput('index', 1);
        expect(component['isOdd']()).toBe(true);

        componentRef.setInput('index', 3);
        expect(component['isOdd']()).toBe(true);
      });
    });

    describe('when isDynamicPage is true', () => {
      beforeEach(() => {
        componentRef.setInput('isDynamicPage', true);
      });

      it('returns true for even indices', () => {
        componentRef.setInput('index', 0);
        expect(component['isOdd']()).toBe(true);

        componentRef.setInput('index', 2);
        expect(component['isOdd']()).toBe(true);
      });

      it('returns false for odd indices', () => {
        componentRef.setInput('index', 1);
        expect(component['isOdd']()).toBe(false);

        componentRef.setInput('index', 3);
        expect(component['isOdd']()).toBe(false);
      });
    });
  });
});
