import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsentRequestDetailsComponent } from './consent-request-details.component';
import { ConsentRequestDto } from '@/shared/api/openapi/model/models';

describe('ConsentRequestDetailsComponent', () => {
  let component: ConsentRequestDetailsComponent;
  let fixture: ComponentFixture<ConsentRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show details before a request is set', () => {
    expect(component.showDetails()).toBe(false);
  });

  it('setting request should open details', () => {
    const req = {
      dataRequest: { dataConsumer: { name: 'TestConsumer' } },
    } as unknown as ConsentRequestDto;

    component.request = req;
    fixture.detectChanges(); // run the effect

    expect(component.showDetails()).toBe(true);
  });

  it('formattedRequestDate returns an empty string if no date', () => {
    const req = {
      requestDate: null,
      dataRequest: { dataConsumer: { name: 'John' } },
    } as unknown as ConsentRequestDto;

    component.request = req;
    fixture.detectChanges();

    expect(component.formattedRequestDate()).toBe('');
  });

  it('handleCloseDetails hides the details and emits onCloseDetail', () => {
    const req = {
      requestDate: new Date(),
      dataRequest: { dataConsumer: { name: 'John' } },
    } as unknown as ConsentRequestDto;

    component.request = req;
    fixture.detectChanges();
    expect(component.showDetails()).toBe(true);

    let emitted = false;
    component.onCloseDetail.subscribe(() => (emitted = true));

    component.handleCloseDetails();
    fixture.detectChanges();

    expect(component.showDetails()).toBe(false);
    expect(emitted).toBe(true);
  });

  it('should close details when Escape key is pressed', async () => {
    component.showDetails.set(true);
    fixture.detectChanges();

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    await Promise.resolve();

    expect(closeSpy).toHaveBeenCalled();
    expect(component.showDetails()).toBe(false);
  });
});
