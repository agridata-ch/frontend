import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterWidgetComponent } from '@/widgets/footer-widget';

describe('FooterWidgetComponent', () => {
  let component: FooterWidgetComponent;
  let fixture: ComponentFixture<FooterWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterWidgetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
