import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataInputComponent } from './agridata-input.component';

describe('AgridataInputComponent', () => {
  let component: AgridataInputComponent;
  let fixture: ComponentFixture<AgridataInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the input value on handleInputChange', () => {
    const mockEmit = jest.fn();
    Object.defineProperty(component, 'onInput', {
      value: { emit: mockEmit },
      writable: false,
    });
    const mockValue = 'test value';
    const event = { target: { value: mockValue } } as unknown as Event;

    component.handleInputChange(event);

    expect(mockEmit).toHaveBeenCalledWith(mockValue);
  });
});
