import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSupportInfoContentComponent } from './contact-support-info-content.component';

describe('ContactSupportInfoContentComponent', () => {
  let component: ContactSupportInfoContentComponent;
  let fixture: ComponentFixture<ContactSupportInfoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSupportInfoContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSupportInfoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
