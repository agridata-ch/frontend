import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewYearBannerComponent } from './new-year-banner.component';

describe('NewYearBannerComponent', () => {
  let component: NewYearBannerComponent;
  let fixture: ComponentFixture<NewYearBannerComponent>;

  beforeEach(async () => {
    localStorage.clear();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-10'));

    await TestBed.configureTestingModule({
      imports: [NewYearBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewYearBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show banner when within New Year period and not dismissed', () => {
    expect(component['showBanner']()).toBe(true);
  });

  it('should hide banner when outside New Year period', () => {
    vi.setSystemTime(new Date('2025-01-20'));

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(false);
  });

  it('should hide banner when previously dismissed', () => {
    localStorage.setItem('dismissNewYearBanner', 'true');

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(false);
  });

  it('should display current year', () => {
    expect(component['currentYear']()).toBe(2025);
  });

  it('should show banner for dates at the start of the period', () => {
    vi.setSystemTime(new Date('2025-01-01'));

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(true);
  });

  it('should show banner for dates at the end of the period', () => {
    vi.setSystemTime(new Date('2025-01-15'));

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(true);
  });

  it('should not show banner before the period starts', () => {
    vi.setSystemTime(new Date('2024-12-31'));

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(false);
  });

  it('should hide the banner, persist dismissal and emit on close', () => {
    const emitted: void[] = [];
    component.closeBanner.subscribe(() => emitted.push(undefined));

    component['handleClose']();

    expect(component['showBanner']()).toBe(false);
    expect(localStorage.getItem('dismissNewYearBanner')).toBe('true');
    expect(emitted).toHaveLength(1);
  });

  it('should show the banner and log when localStorage read fails', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    const newFixture = TestBed.createComponent(NewYearBannerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent['showBanner']()).toBe(true);
    expect(errorSpy).toHaveBeenCalled();
  });
});
