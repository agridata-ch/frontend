import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestPrivacyInfosComponent } from './data-request-privacy-infos.component';

describe('DataRequestPrivacyInfosComponent', () => {
  let component: DataRequestPrivacyInfosComponent;
  let fixture: ComponentFixture<DataRequestPrivacyInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestPrivacyInfosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPrivacyInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
