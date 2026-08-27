import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';

import { InfiniteScrollComponent } from './infinite-scroll.component';

interface MockIntersectionObserver {
  readonly observe: jest.Mock;
  readonly unobserve: jest.Mock;
  readonly disconnect: jest.Mock;
  readonly takeRecords: jest.Mock;
  readonly trigger: (isIntersecting: boolean) => void;
}

const mockObservers: MockIntersectionObserver[] = [];

function createMockIntersectionObserver(
  callback: IntersectionObserverCallback,
): MockIntersectionObserver {
  const mock: MockIntersectionObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(),
    trigger: (isIntersecting) =>
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        mock as unknown as IntersectionObserver,
      ),
  };
  mockObservers.push(mock);
  return mock;
}

@Component({
  imports: [InfiniteScrollComponent],
  template: `<app-infinite-scroll
    [loading]="loading()"
    [hasMore]="hasMore()"
    [hasItems]="hasItems()"
    (loadMore)="onLoad()"
    >all loaded</app-infinite-scroll
  >`,
})
class HostComponent {
  // Enabled by default: not loading and more to load (disabled = loading || !hasMore).
  readonly loading = signal(false);
  readonly hasMore = signal(true);
  readonly hasItems = signal(false);
  loads = 0;

  onLoad(): void {
    this.loads++;
  }
}

describe('InfiniteScrollComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  const originalObserver = globalThis.IntersectionObserver;

  const observer = () => mockObservers[0];

  beforeEach(async () => {
    mockObservers.length = 0;
    globalThis.IntersectionObserver = jest.fn(
      createMockIntersectionObserver,
    ) as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
  });

  it('should observe the host element', () => {
    expect(observer().observe).toHaveBeenCalled();
  });

  it('should ignore the initial intersection', () => {
    observer().trigger(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.loads).toBe(0);
  });

  it('should emit loadMore when scrolled into view', () => {
    observer().trigger(false); // initial report
    observer().trigger(true); // user scrolls the sentinel into view

    expect(fixture.componentInstance.loads).toBe(1);
  });

  it('should not emit loadMore while loading', () => {
    observer().trigger(false); // initial report
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    observer().trigger(true);

    expect(fixture.componentInstance.loads).toBe(0);
  });

  it('should not emit loadMore when nothing is left to load', () => {
    observer().trigger(false); // initial report
    fixture.componentInstance.hasMore.set(false);
    fixture.detectChanges();

    observer().trigger(true);

    expect(fixture.componentInstance.loads).toBe(0);
  });

  it('should emit again when loading clears while the sentinel stays in view', () => {
    observer().trigger(false); // initial report
    observer().trigger(true); // scrolled into view -> first load
    expect(fixture.componentInstance.loads).toBe(1);

    // Consumer starts loading; sentinel stays visible (no new observer transition).
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    // Loading finished, more to load: next page must trigger without another scroll.
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.loads).toBe(2);
  });

  it('should not emit when loading clears after the sentinel scrolled away', () => {
    observer().trigger(false); // initial report
    observer().trigger(true); // scrolled into view -> first load
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    observer().trigger(false); // appended content pushed the sentinel out of view
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.loads).toBe(1);
  });

  it('should disconnect the observer on destroy', () => {
    const current = observer();
    fixture.destroy();

    expect(current.disconnect).toHaveBeenCalled();
  });

  it('should show the spinner while loading', () => {
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('fa-icon[animation="spin"]')).not.toBeNull();
    expect(html.querySelector('.scroll-hint')).toBeNull();
    // The decorative icon is aria-hidden, so the live region needs the sr-only label to announce.
    expect(html.querySelector('.sr-only')?.textContent).toContain('loading');
  });

  it('should show the scroll hint when there are items and more to load', () => {
    fixture.componentInstance.hasItems.set(true);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.scroll-hint')).not.toBeNull();
    expect(html.textContent).not.toContain('all loaded');
  });

  it('should project the completed content when there are items and nothing left', () => {
    fixture.componentInstance.hasItems.set(true);
    fixture.componentInstance.hasMore.set(false);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.scroll-hint')).toBeNull();
    expect(html.textContent).toContain('all loaded');
  });

  it('should render nothing when there are no items and not loading', () => {
    fixture.componentInstance.hasItems.set(false);
    fixture.componentInstance.hasMore.set(false);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('fa-icon')).toBeNull();
    expect(html.textContent).not.toContain('all loaded');
  });
});
