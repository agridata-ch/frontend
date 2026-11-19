import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputComponent } from './search-input.component';

describe('FilterInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should show the initial value', async () => {
    fixture.componentRef.setInput('initialValue', 'foo');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['value']()).toBe('foo');
    expect(component['trimmedValue']()).toBe('foo');
  });
});
