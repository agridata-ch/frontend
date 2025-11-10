import { provideLocationMocks } from '@angular/common/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
  mockUids,
} from '@/shared/testing/mocks/mock-agridata-state-service';

import { UidSwitchComponent } from './uid-switch.component';

describe('UidSwitchComponent', () => {
  let component: UidSwitchComponent;
  let fixture: ComponentFixture<UidSwitchComponent>;
  let agridataStateService: MockAgridataStateService;
  const activUid = '1';

  beforeEach(async () => {
    agridataStateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      imports: [UidSwitchComponent],
      providers: [
        {
          provide: AgridataStateService,
          useValue: agridataStateService,
        },
        provideLocationMocks(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UidSwitchComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedUid when selectUid is called', () => {
    const newUid = 'test-uid';
    component.selectUid(newUid);
    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(newUid);
  });

  it('should compute activeUid from selectedUid and authorizedUids', () => {
    component.selectedUid.set('2');
    agridataStateService.activeUid.set('1');
    expect(component.activeUid()).toBe('2');

    component.selectedUid.set(null);
    expect(component.activeUid()).toBe(activUid);
  });

  it('should return sorted authorizedUids', () => {
    agridataStateService.userUids.set(mockUids);

    const sorted = component.sortedUids();

    expect(sorted[0].name).toBe('Alpha');
    expect(sorted[1].name).toBe('Beta');
    expect(sorted[2].name).toBeUndefined();
  });

  it('should sort alphabetically with undefined names at the end', () => {
    const sort = component.sortAlphabetically.bind(component);
    expect(sort({ name: 'B', uid: '' }, { name: 'A', uid: '' })).toBeGreaterThan(0);
    expect(sort({ name: 'A', uid: '' }, { name: 'B', uid: '' })).toBeLessThan(0);
    expect(sort({ name: undefined, uid: '' }, { name: 'A', uid: '' })).toBe(1);
    expect(sort({ name: 'A', uid: '' }, { name: undefined, uid: '' })).toBe(-1);
  });
});
