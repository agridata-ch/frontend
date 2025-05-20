// consent-request.component.spec.ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Resource, signal, NO_ERRORS_SCHEMA } from '@angular/core';

import { ConsentRequestProducerPage } from './consent-request-producer.page';
import { ConsentRequestService } from '@pages/consent-request-producer/api/consent-request.service';
import { ConsentRequestDto } from '@shared/api/openapi/model/models';

describe('ConsentRequestProducerPage', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let mockService: Partial<ConsentRequestService>;
  let reloadSpy: jest.Mock;
  const sample: ConsentRequestDto[] = [
    {
      dataProducerUid: 'u1',
      dataRequest: { id: '0', descriptionDe: 'D1' },
      requestDate: '2025-05-10',
      state: 'OPENED',
    },
    {
      dataProducerUid: 'u2',
      dataRequest: { id: '1', descriptionDe: 'D2' },
      requestDate: '2025-04-01',
      state: 'DECLINED',
    },
    {
      dataProducerUid: 'u3',
      dataRequest: { id: '2', descriptionDe: 'D3' },
      requestDate: '2025-03-15',
      state: 'GRANTED',
    },
  ];

  beforeEach(waitForAsync(() => {
    const stubResource: Partial<Resource<ConsentRequestDto[]>> = {
      value: signal(sample),
      reload: jest.fn(),
    };

    reloadSpy = stubResource.reload as jest.Mock;

    mockService = {
      consentRequests: stubResource as Resource<ConsentRequestDto[]>,
    };

    TestBed.configureTestingModule({
      imports: [ConsentRequestProducerPage],
      providers: [{ provide: ConsentRequestService, useValue: mockService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
  }));

  it('calls reload() on ngOnInit', () => {
    component.ngOnInit();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('produces correct action sets per state', () => {
    component.setStateFilter(null);
    const labels = component.requests().map((r) => r.actions.map((a) => a.label));
    expect(labels[0]).toEqual(['Details', 'Einwilligen', 'Ablehnen']); // OPENED
    expect(labels[1]).toEqual(['Details', 'Zurückziehen']); // DECLINED
    expect(labels[2]).toEqual(['Details', 'Zurückziehen']); // GRANTED
  });

  it('getCellValue returns empty string if header missing', () => {
    const rows = component.requests();
    expect(component.getCellValue(rows[0], 'NonExistent')).toBe('');
  });

  it('should return the correct value for totalOpenRequests', () => {
    const totalOpenRequests = component.totalOpenRequests();
    expect(totalOpenRequests).toBe(1);
  });

  it('should return correct actions for getFilteredActions with given value', () => {
    const actions = component.getFilteredActions('OPENED');
    expect(actions).toEqual([
      { label: 'Details', callback: expect.any(Function) },
      { label: 'Einwilligen', callback: expect.any(Function), isMainAction: true },
      { label: 'Ablehnen', callback: expect.any(Function) },
    ]);
  });

  it('should return correct actions for getFilteredActions with no given value', () => {
    const actions = component.getFilteredActions();
    expect(actions).toEqual([
      { label: 'Details', callback: expect.any(Function) },
      { label: 'Einwilligen', callback: expect.any(Function), isMainAction: true },
      { label: 'Ablehnen', callback: expect.any(Function) },
      { label: 'Zurückziehen', callback: expect.any(Function) },
    ]);
  });
});
