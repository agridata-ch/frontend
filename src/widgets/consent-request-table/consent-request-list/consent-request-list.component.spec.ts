import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestListComponent } from './consent-request-list.component';

describe('ConsentRequestListComponent', () => {
  let component: ConsentRequestListComponent;
  let fixture: ComponentFixture<ConsentRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
