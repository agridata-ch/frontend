import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupporterPageComponent } from './supporter-page.component';

describe.skip('SupporterPageComponent', () => {
  let component: SupporterPageComponent;
  let fixture: ComponentFixture<SupporterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupporterPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupporterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
