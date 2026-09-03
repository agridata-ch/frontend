import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tab } from '@/shared/ui/agridata-tabs/agridata-tabs.model';

import { AgridataTabsComponent } from './agridata-tabs.component';

const TABS: Tab[] = [
  { id: 'a', label: 'Tab A' },
  { id: 'b', label: 'Tab B' },
  { id: 'c', label: 'Tab C', disabled: true },
];

describe('AgridataTabsComponent', () => {
  let component: AgridataTabsComponent;
  let fixture: ComponentFixture<AgridataTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataTabsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tabs', TABS);
    fixture.componentRef.setInput('activeTabId', 'a');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('activates the clicked tab and emits the change', () => {
    let emitted: string | undefined;
    component.tabChange.subscribe((id) => (emitted = id));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[1].dispatchEvent(new Event('click'));

    expect(component.activeTabId()).toBe('b');
    expect(emitted).toBe('b');
  });

  it('ignores clicks on a disabled tab', () => {
    let emitted: string | undefined;
    component.tabChange.subscribe((id) => (emitted = id));

    component['handleTabClick']({ id: 'c', label: 'Tab C', disabled: true });

    expect(component.activeTabId()).toBe('a');
    expect(emitted).toBeUndefined();
  });
});
