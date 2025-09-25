import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataContactCardComponent } from './agridata-contact-card.component';

describe('AgridataContactCardComponent', () => {
  let component: AgridataContactCardComponent;
  let fixture: ComponentFixture<AgridataContactCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataContactCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataContactCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
