import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidepanelComponent } from './sidepanel.component';

describe('SidepanelComponent', () => {
  let component: SidepanelComponent;
  let fixture: ComponentFixture<SidepanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidepanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClose when handleClose is called', () => {
    const closeSpy = jest.spyOn(component.onClose, 'emit');
    component.handleClose();
    expect(closeSpy).toHaveBeenCalled();
  });
});
