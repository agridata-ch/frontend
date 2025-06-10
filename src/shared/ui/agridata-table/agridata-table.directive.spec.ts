import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AgridataFlipRowDirective } from './agridata-table.directive';

@Component({
  standalone: true,
  template: `
    <tr agridataFlipRow [rowId]="rowId" [rowData]="rowData" [totalRows]="totalRows"></tr>
  `,
  imports: [AgridataFlipRowDirective],
  schemas: [NO_ERRORS_SCHEMA],
})
class TestHostComponent {
  @Input() rowId = '1';
  @Input() totalRows = 1;
}

describe('AgridataFlipRowDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let tr: HTMLElement;
  let directive: AgridataFlipRowDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    tr = fixture.debugElement.query(By.directive(AgridataFlipRowDirective)).nativeElement;
    directive = fixture.debugElement
      .query(By.directive(AgridataFlipRowDirective))
      .injector.get(AgridataFlipRowDirective);
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });

  it('should remove highlight after timeout', () => {
    jest.useFakeTimers();
    fixture.detectChanges();
    directive.ngDoCheck();
    jest.advanceTimersByTime(5000);
    directive.ngDoCheck();
    jest.useRealTimers();
  });

  it('should trigger FLIP animation only if row moves and totalRows is unchanged', () => {
    // Simulate previous state
    (directive as unknown as { previousTop: number }).previousTop = 100;
    (directive as unknown as { previousRowId: string }).previousRowId = '1';
    (directive as unknown as { previousTotalRows: number }).previousTotalRows = 1;
    (directive as unknown as { firstCheck: boolean }).firstCheck = false;

    // Simulate move
    Object.defineProperty(tr, 'getBoundingClientRect', {
      value: () => ({ top: 50 }),
    });

    directive.ngDoCheck();

    expect(tr.style.transform).toContain('translateY');
  });
});
