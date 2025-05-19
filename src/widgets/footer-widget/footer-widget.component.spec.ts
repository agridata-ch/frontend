import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterWidgetComponent } from './footer-widget.component';

describe('FooterWidgetComponent', () => {
  let component: FooterWidgetComponent;
  let fixture: ComponentFixture<FooterWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
