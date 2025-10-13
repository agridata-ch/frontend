import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBlockComponent } from './hero-block.component';

describe('HeroBlockComponent', () => {
  let component: HeroBlockComponent;
  let fixture: ComponentFixture<HeroBlockComponent>;
  let componentRef: ComponentRef<HeroBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'blocks.hero',
      id: 1,
      heading: 'Hero Block Heading',
      subHeading: 'Hero Block Subheading',
      cta: [],
      image: {
        id: 1,
        documentId: '1',
        alternativeText: 'Hero Image',
        url: '/path/to/hero/image.jpg',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
