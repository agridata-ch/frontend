import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionImageCardBlockComponent } from './section-image-card-block.component';

describe('SectionImageCardBlockComponent', () => {
  let component: SectionImageCardBlockComponent;
  let fixture: ComponentFixture<SectionImageCardBlockComponent>;
  let componentRef: ComponentRef<SectionImageCardBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionImageCardBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionImageCardBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      id: 3,
      heading: 'Heading',
      subHeading: 'Subheading',
      imageCardBlock: {
        card: {},
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
