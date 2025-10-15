import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoModule } from '@/app/transloco-testing.module';
import {
  ConsentRequestProducerViewDto,
  ConsentRequestProducerViewDtoDataRequestStateCode,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';

import { ConsentRequestListComponent } from './consent-request-list.component';

describe('ConsentRequestListComponent', () => {
  let component: ConsentRequestListComponent;
  let fixture: ComponentFixture<ConsentRequestListComponent>;
  let mockI18nService: Partial<I18nService>;

  beforeEach(async () => {
    mockI18nService = {
      useObjectTranslation: jest.fn().mockImplementation((obj) => obj?.['en'] || 'Test Title'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ConsentRequestListComponent,
        getTranslocoModule({
          langs: {
            de: {},
          },
        }),
      ],
      providers: [{ provide: I18nService, useValue: mockI18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit updateConsentRequestStatus event with correct data when acceptRequest is called', () => {
    const mockRequest: ConsentRequestProducerViewDto = {
      id: 'request-123',
      stateCode: ConsentRequestStateEnum.Opened,
      dataRequest: {
        title: { de: 'Test Title' },
        stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Active,
      },
    };

    const mockEvent = new Event('click');
    jest.spyOn(mockEvent, 'stopPropagation');
    const updateSpy = jest.spyOn(component.updateConsentRequestStatus, 'emit');

    component.acceptRequest(mockEvent, mockRequest);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith({
      id: 'request-123',
      newState: ConsentRequestStateEnum.Granted,
      title: 'Test Title',
    });
    expect(mockI18nService.useObjectTranslation).toHaveBeenCalledWith(
      mockRequest.dataRequest?.title,
    );
  });
});
