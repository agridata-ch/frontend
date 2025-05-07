import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { ConsentRequestComponent } from './consent-request.component';
import { ConsentRequestService } from './consent-request.service';
import { Resource, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import type { ConsentRequest } from '@/app/shared/openapi/model/models';

type DynamicRow = Record<string, unknown>;

describe('ConsentRequestComponent', () => {
  let fixture: ComponentFixture<ConsentRequestComponent>;
  let component: ConsentRequestComponent;
  let mockService: Partial<ConsentRequestService>;
  let reloadSpy: jest.Mock;

  const testData: ConsentRequest[] = [
    {
      dataProducerUid: 'Producer1',
      dataRequest: { descriptionDe: 'Desc1' },
      requestDate: '2025-01-01T00:00:00Z',
      state: 'OPENED',
    } as ConsentRequest,
    {
      dataProducerUid: 'Producer2',
      dataRequest: { descriptionDe: 'Desc2' },
      requestDate: '2025-02-01T00:00:00Z',
      state: 'GRANTED',
    } as ConsentRequest,
  ];

  beforeEach(waitForAsync(() => {
    const stubResource: Partial<Resource<ConsentRequest[]>> = {
      value: signal(testData),
      reload: jest.fn(),
    };

    reloadSpy = stubResource.reload as jest.Mock;

    mockService = {
      consentRequests: stubResource as Resource<ConsentRequest[]>,
    };

    TestBed.configureTestingModule({
      imports: [ConsentRequestComponent],
      providers: [{ provide: ConsentRequestService, useValue: mockService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestComponent);
    component = fixture.componentInstance;
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call reload on init', () => {
    component.ngOnInit();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('requests should return mapped DynamicRow[] when no filter', () => {
    component.stateFilter.set([]);
    const rows = component.requests();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(2);
    const first = rows[0] as DynamicRow;
    expect(first['Antragsteller']).toBe('Producer1');
    expect(first['Datenantrag']).toBe('Desc1');
    const formatted = component.dateFormatter.format(new Date('2025-01-01T00:00:00Z'));
    expect(first['Antragsdatum']).toBe(formatted);
    expect(first['Status']).toBe('OPENED');
  });

  it('requests should filter by state values array', () => {
    component.stateFilter.set(['GRANTED']);
    const rows = component.requests();
    expect(rows.length).toBe(1);
    const only = rows[0] as DynamicRow;
    expect(only['Antragsteller']).toBe('Producer2');
  });

  it('actions signal yields correct default actions', () => {
    const acts = component.actions();
    expect(acts).toHaveLength(2);
    const main = acts.find((a) => a.isMainAction === true);
    expect(main).toBeDefined();
    expect(main?.label).toBe('Einwilligen');
  });
});
