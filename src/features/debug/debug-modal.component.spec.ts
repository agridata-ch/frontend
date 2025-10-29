import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugLogEntry, DebugLogSource, DebugLogStatus } from '@/features/debug/debug.model';
import { DebugService } from '@/features/debug/debug.service';

import { DebugModalComponent } from './debug-modal.component';

type MockDebugService = {
  debugLogs: WritableSignal<DebugLogEntry[]>;
};

describe('DebugModalComponent', () => {
  let component: DebugModalComponent;
  let fixture: ComponentFixture<DebugModalComponent>;
  let mockDebugService: MockDebugService;

  beforeEach(async () => {
    mockDebugService = {
      debugLogs: signal([
        {
          timestamp: new Date('2025-01-13T10:00:00'),
          message: 'GET: /api/users',
          source: DebugLogSource.REQUEST,
          status: DebugLogStatus.INFO,
        },
        {
          timestamp: new Date('2025-01-13T10:00:01'),
          message: '200 OK - /api/users',
          source: DebugLogSource.RESPONSE,
          status: DebugLogStatus.SUCCESS,
        },
        {
          timestamp: new Date('2025-01-13T10:00:02'),
          message: '404 Not Found - /api/missing | requestId: abc-123',
          source: DebugLogSource.RESPONSE,
          status: DebugLogStatus.ERROR,
        },
        {
          timestamp: new Date('2025-01-13T10:00:03'),
          message: 'Error occurred',
          source: DebugLogSource.ERROR,
          status: DebugLogStatus.ERROR,
        },
        {
          timestamp: new Date('2025-01-13T10:00:04'),
          message: '/home',
          source: DebugLogSource.ROUTE_START,
          status: DebugLogStatus.INFO,
        },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [DebugModalComponent],
      providers: [{ provide: DebugService, useValue: mockDebugService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DebugModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with debug modal closed', () => {
    expect(component.debugEnabled()).toBe(false);
  });

  it('should toggle debug mode when toggleDebugMode is called', () => {
    expect(component.debugEnabled()).toBe(false);

    component.toggleDebugMode();
    expect(component.debugEnabled()).toBe(true);

    component.toggleDebugMode();
    expect(component.debugEnabled()).toBe(false);
  });

  it('should open debug modal when Ctrl+Alt+D is pressed', () => {
    expect(component.debugEnabled()).toBe(false);

    const event = new KeyboardEvent('keydown', {
      ctrlKey: true,
      altKey: true,
      code: 'KeyD',
    });
    document.dispatchEvent(event);

    expect(component.debugEnabled()).toBe(true);
  });

  it('should not open debug modal with incorrect key combination', () => {
    expect(component.debugEnabled()).toBe(false);

    const event = new KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'd',
    });
    document.dispatchEvent(event);

    expect(component.debugEnabled()).toBe(false);
  });

  it('should display browser information', () => {
    component.toggleDebugMode();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const browserInfo = compiled.querySelector('.bg-gray-50');

    expect(browserInfo).toBeTruthy();
    expect(browserInfo.textContent).toContain('Browser Information');
    expect(browserInfo.textContent).toContain('Language:');
    expect(browserInfo.textContent).toContain('Screen:');
    expect(browserInfo.textContent).toContain('Viewport:');
    expect(browserInfo.textContent).toContain('Cookies:');
    expect(browserInfo.textContent).toContain('Online:');
    expect(browserInfo.textContent).toContain('User Agent:');
  });

  it('should display logs from debug service', () => {
    component.toggleDebugMode();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tbody tr');

    expect(rows.length).toBeGreaterThan(0);
  });

  it('should display correct number of log entries', () => {
    component.toggleDebugMode();
    fixture.detectChanges();

    const logs = component['logs']();
    expect(logs.length).toBe(5);
  });

  it('should display empty state when no logs are available', () => {
    // Update the signal to return empty array
    mockDebugService.debugLogs.set([]);

    component.toggleDebugMode();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const emptyMessage = compiled.querySelector('tbody tr td');

    expect(emptyMessage?.textContent).toContain('No logs available');
  });

  it('should have correct browser info properties', () => {
    expect(component['browserInfo'].userAgent).toBeDefined();
    expect(component['browserInfo'].language).toBeDefined();
    expect(component['browserInfo'].cookieEnabled).toBeDefined();
    expect(component['browserInfo'].onLine).toBeDefined();
    expect(component['browserInfo'].screenResolution).toMatch(/\d+x\d+/);
    expect(component['browserInfo'].viewport).toMatch(/\d+x\d+/);
  });

  it('should display different log sources with correct styling', () => {
    component.toggleDebugMode();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const sourceCells = compiled.querySelectorAll('tbody td:nth-child(2) span');

    expect(sourceCells.length).toBeGreaterThan(0);

    // Check that different source types are present
    const sourceTexts = Array.from(sourceCells).map((cell: any) => cell.textContent.trim());
    expect(sourceTexts).toContain('REQUEST');
    expect(sourceTexts).toContain('RESPONSE');
    expect(sourceTexts).toContain('ERROR');
  });

  it('should display timestamps in correct format', () => {
    component.toggleDebugMode();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const timestampCells = compiled.querySelectorAll('tbody td:first-child');

    expect(timestampCells.length).toBeGreaterThan(0);
    // Timestamps should be rendered (exact format depends on AgridataDatePipe)
    expect(timestampCells[0].textContent).toBeTruthy();
  });

  it('should not render modal when debugEnabled is false', () => {
    expect(component.debugEnabled()).toBe(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const modal = compiled.querySelector('app-modal');

    expect(modal).toBeFalsy();
  });

  it('should render modal when debugEnabled is true', () => {
    component.toggleDebugMode();
    expect(component.debugEnabled()).toBe(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const modal = compiled.querySelector('app-modal');

    expect(modal).toBeTruthy();
  });
});
