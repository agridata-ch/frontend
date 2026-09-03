import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConsentRequestProducerViewV2Dto, ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestDecisionStore } from '@/shared/consent-request';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AlertComponent } from '@/widgets/alert';

import { DataRequestConsentRequestDecisionsComponent } from './data-request-consent-request-decisions.component';

describe('DataRequestConsentRequestDecisionsComponent', () => {
  let fixture: ComponentFixture<DataRequestConsentRequestDecisionsComponent>;
  let component: DataRequestConsentRequestDecisionsComponent;
  let store: ConsentRequestDecisionStore;

  const requests: ConsentRequestProducerViewV2Dto[] = [
    { id: 'uid-1', dataProducerUid: 'uid-1', stateCode: ConsentRequestStateEnum.Opened },
    { id: 'bur-1', dataProducerBur: '111', stateCode: ConsentRequestStateEnum.Granted },
  ];

  async function setup(withStore: boolean): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [
        DataRequestConsentRequestDecisionsComponent,
        createTranslocoTestingModule({ langs: { de: {} } }),
      ],
      providers: withStore ? [ConsentRequestDecisionStore] : [],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestConsentRequestDecisionsComponent);
    component = fixture.componentInstance;
    if (withStore) {
      store = TestBed.inject(ConsentRequestDecisionStore);
      store.consentRequests.set(requests);
    }
    fixture.detectChanges();
  }

  it('shows the non-producer info when no store is provided (preview usage)', async () => {
    await setup(false);

    expect(component['store']).toBeNull();
    expect(fixture.debugElement.query(By.directive(AlertComponent))).toBeTruthy();
  });

  it('shows an edit button while not editing and enters edit mode on click', async () => {
    await setup(true);

    const editButton = fixture.debugElement.query(
      By.css('[data-testid="consent-request-decisions-edit"]'),
    );
    editButton.componentInstance.handleClick.emit(new MouseEvent('click'));
    fixture.detectChanges();

    expect(store.editMode()).toBe(true);
    // seeded from current state: the granted BUR child starts on
    expect(store.decisions()).toEqual({ 'bur-1': true });
  });

  it('renders a toggle per BUR child in edit mode and stages its decision', async () => {
    await setup(true);
    store.consentRequests.set([
      { id: 'bur-1', dataProducerBur: '1', stateCode: ConsentRequestStateEnum.Granted },
      { id: 'bur-2', dataProducerBur: '2', stateCode: ConsentRequestStateEnum.Granted },
    ]);
    store.startEdit();
    fixture.detectChanges();

    const toggles = fixture.debugElement.queryAll(By.directive(AgridataToggleComponent));
    expect(toggles).toHaveLength(2);

    toggles[0].componentInstance.checked.set(false);
    fixture.detectChanges();

    expect(store.decisions()['bur-1']).toBe(false);
  });

  it('replaces the edit button with a cancel button in edit mode', async () => {
    await setup(true);
    store.startEdit();
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('[data-testid="consent-request-decisions-edit"]')),
    ).toBeNull();
    expect(
      fixture.debugElement.query(By.css('[data-testid="consent-request-decisions-cancel-edit"]')),
    ).toBeTruthy();
  });
});
