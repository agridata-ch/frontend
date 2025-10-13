import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSupportInfoComponent } from './contact-support-info.component';

describe('ContactSupportInfoComponent', () => {
  let component: ContactSupportInfoComponent;
  let fixture: ComponentFixture<ContactSupportInfoComponent>;
  let openComponent: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSupportInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSupportInfoComponent);
    component = fixture.componentInstance;
    openComponent = component as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle popover visibility when handleToggle is called', () => {
    expect(openComponent.showPopover()).toBe(false);

    openComponent.handleToggle();
    expect(openComponent.showPopover()).toBe(true);

    openComponent.handleToggle();
    expect(openComponent.showPopover()).toBe(false);
  });

  it('should set showPopover to false when closeOverlay is called', () => {
    // First set it to true
    openComponent.showPopover.set(true);
    expect(openComponent.showPopover()).toBe(true);

    // Then call closeOverlay
    openComponent.closeOverlay();
    expect(openComponent.showPopover()).toBe(false);
  });

  it('should set showPopover to false when closeOverlay is called even if already false', () => {
    // Make sure it's false
    openComponent.showPopover.set(false);
    expect(openComponent.showPopover()).toBe(false);

    // Call closeOverlay and verify it remains false
    openComponent.closeOverlay();
    expect(openComponent.showPopover()).toBe(false);
  });
});
