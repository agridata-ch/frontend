import { Component, ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { SidepanelComponent } from './sidepanel.component';

@Component({
  imports: [SidepanelComponent],
  template: `
    <app-sidepanel [isOpen]="true" title="Panel title">
      <span subtitle>Projected subtitle</span>
      <p>Projected body</p>
    </app-sidepanel>
  `,
})
class TestHostComponent {}

describe('SidepanelComponent', () => {
  let component: SidepanelComponent;
  let componentRef: ComponentRef<SidepanelComponent>;
  let fixture: ComponentFixture<SidepanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidepanelComponent,
        TestHostComponent,
        createTranslocoTestingModule({
          langs: { de: { 'common.ariaLabel.close': 'Schliessen' } },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidepanelComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeSidepanel when handleClose is called', () => {
    const closeSpy = vi.spyOn(component.closeSidepanel, 'emit');
    component.handleClose();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should label the close button for screen readers', () => {
    const closeButton = fixture.debugElement.nativeElement.querySelector('button[aria-label]');
    expect(closeButton.getAttribute('aria-label')).toBe('Schliessen');
  });

  describe('handleGlobalKeydown', () => {
    const pressKey = (key: string) => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
      fixture.detectChanges();
    };

    it('should emit closeSidepanel when the panel is open', () => {
      const closeSpy = vi.spyOn(component.closeSidepanel, 'emit');
      componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      pressKey('Escape');

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not emit closeSidepanel when the panel is closed', () => {
      const closeSpy = vi.spyOn(component.closeSidepanel, 'emit');

      pressKey('Escape');

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should not emit closeSidepanel when manual closing is prevented', () => {
      const closeSpy = vi.spyOn(component.closeSidepanel, 'emit');
      componentRef.setInput('isOpen', true);
      componentRef.setInput('preventManualClose', true);
      fixture.detectChanges();

      pressKey('Escape');

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('should not emit closeSidepanel for other keys', () => {
      const closeSpy = vi.spyOn(component.closeSidepanel, 'emit');
      componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      pressKey('Enter');

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  it('should project the subtitle slot and the default slot', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const text = hostFixture.debugElement.nativeElement.textContent;
    expect(text).toContain('Projected subtitle');
    expect(text).toContain('Projected body');
  });
});
