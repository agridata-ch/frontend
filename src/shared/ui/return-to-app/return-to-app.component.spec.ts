import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createMockDocument, MockLocation } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ButtonComponent } from '@/shared/ui/button';

import { ReturnToAppComponent } from './return-to-app.component';

describe('ReturnToAppComponent', () => {
  let fixture: ComponentFixture<ReturnToAppComponent>;
  let component: ReturnToAppComponent;
  let componentRef: ComponentRef<ReturnToAppComponent>;
  let mockLocation: MockLocation;

  beforeEach(async () => {
    const mockDocument = createMockDocument();
    mockLocation = mockDocument.location;

    await TestBed.configureTestingModule({
      imports: [
        ReturnToAppComponent,
        createTranslocoTestingModule({
          langs: {
            de: {
              producer: {
                returnToApp: {
                  target: 'Weiter zu:',
                  unverified: 'Adresse ungeprüft:',
                },
              },
            },
          },
        }),
      ],
      providers: [mockDocument.provider],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnToAppComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('verified', false);
  });

  it('renders the destination after the text with the host in bold', () => {
    componentRef.setInput('verified', true);
    componentRef.setInput('url', 'https://example.ch/path');
    fixture.detectChanges();

    const text: HTMLElement = fixture.nativeElement;

    expect(text.textContent).toContain('Weiter zu: example.ch/path');
    expect(text.querySelector('strong')?.textContent).toBe('example.ch');
  });

  it('shows the unverified text instead of the target text when not verified', () => {
    componentRef.setInput('url', 'https://example.ch/path');
    fixture.detectChanges();

    const text: HTMLElement = fixture.nativeElement;

    expect(text.textContent).toContain('Adresse ungeprüft: example.ch/path');
    expect(text.textContent).not.toContain('Weiter zu');
  });

  it('exposes the host of an https url', () => {
    componentRef.setInput('url', 'https://example.ch/path?x=1');

    expect(component['target']()?.host).toBe('example.ch');
  });

  it.each(['javascript:alert(1)', 'data:text/html,hi', 'not a url', ''])(
    'rejects the unsafe or invalid url %s',
    (url) => {
      componentRef.setInput('url', url);

      expect(component['target']()).toBeNull();
    },
  );

  it('navigates to the url on button click', () => {
    componentRef.setInput('url', 'https://example.ch/path');
    fixture.detectChanges();

    fixture.debugElement
      .query(By.directive(ButtonComponent))
      .triggerEventHandler('handleClick', null);

    expect(mockLocation.href).toBe('https://example.ch/path');
  });
});
