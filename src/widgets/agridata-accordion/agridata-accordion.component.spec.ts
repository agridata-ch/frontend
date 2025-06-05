import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { AgridataAccordionComponent } from './agridata-accordion.component';

describe('AgridataAccordionComponent', () => {
  let component: AgridataAccordionComponent;

  beforeEach(() => {
    component = new AgridataAccordionComponent();
  });

  it('should initialize with collapsed state', () => {
    expect(component.isExpanded()).toBe(false);
    expect(component.expandIcon()).toBe(faChevronDown);
  });

  it('should expand when toggleAccordion is called once', () => {
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

  it('should accept header and content as input', () => {
    component.header = 'Test Header';
    component.content = 'Test Content';
    expect(component.header).toBe('Test Header');
    expect(component.content).toBe('Test Content');
  });
});
