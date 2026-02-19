import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestEmptyStateComponent } from './consent-request-empty-state.component';

describe('ConsentRequestEmptyStateComponent', () => {
  let component: ConsentRequestEmptyStateComponent;
  let fixture: ComponentFixture<ConsentRequestEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestEmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
