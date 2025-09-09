import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

describe('CmsFooterBlockComponent', () => {
  let component: CmsFooterBlockComponent;
  let fixture: ComponentFixture<CmsFooterBlockComponent>;
  let componentRef: ComponentRef<CmsFooterBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsFooterBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CmsFooterBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      id: 2,
      heading: 'Ready for the Footer?',
      subHeading: 'Do you have any questions?',
      cta: {
        id: 93,
        href: '/login',
        label: 'Get Started',
        isExternal: false,
        isButtonLink: true,
        type: 'Primary',
      },
      contactLink: {
        id: 94,
        href: '/contact',
        label: 'Contact Us',
        isExternal: false,
        isButtonLink: false,
        type: 'Primary',
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
