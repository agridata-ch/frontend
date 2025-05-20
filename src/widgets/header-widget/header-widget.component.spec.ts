import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderWidgetComponent } from './header-widget.component';

describe('HeaderWidgetComponent', () => {
  let component: HeaderWidgetComponent;
  let fixture: ComponentFixture<HeaderWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWidgetComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
