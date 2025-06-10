import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { AgridataAccordionComponent } from './agridata-accordion.component';

describe('AgridataAccordionComponent', () => {
  let fixture: ComponentFixture<AgridataAccordionComponent>;
  let component: AgridataAccordionComponent;
  let componentRef: ComponentRef<AgridataAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataAccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataAccordionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default collapsed state', () => {
    expect(component.isExpanded()).toBe(false);
    expect(component.expandIcon()).toBe(faChevronDown);
  });

  it('should expand when toggleAccordion is called', () => {
    component.toggleAccordion();
    expect(component.isExpanded()).toBe(true);
    expect(component.expandIcon()).toBe(faChevronUp);
  });

  it('should collapse when toggleAccordion is called twice', () => {
    component.toggleAccordion();
    component.toggleAccordion();
    expect(component.isExpanded()).toBe(false);
    expect(component.expandIcon()).toBe(faChevronDown);
  });

  it('should set header and content via setInput', async () => {
    componentRef.setInput('header', 'Test Header');
    componentRef.setInput('content', 'Test Content');
    expect(component.header()).toBe('Test Header');
    expect(component.content()).toBe('Test Content');
  });
});
