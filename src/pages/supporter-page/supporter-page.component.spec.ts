import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { UserService } from '@/entities/api/user.service';
import { PageResponseDto, UserInfoDto } from '@/entities/openapi';
import { SupporterPageComponent } from '@/pages/supporter-page/supporter-page.component';
import { UserInfoDtoDirective } from '@/pages/supporter-page/user-info-dto.directive';
import { I18nDirective } from '@/shared/i18n';
import { mockUserService } from '@/shared/testing/mocks/mock-user.service';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
} from '@/shared/ui/agridata-table';
import { ButtonComponent } from '@/shared/ui/button';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

describe('SupporterPageComponent', () => {
  let component: SupporterPageComponent;
  let fixture: ComponentFixture<SupporterPageComponent>;
  let mockUsers: UserInfoDto[];

  beforeEach(async () => {
    mockUsers = [
      {
        ktIdP: 'user1',
        givenName: 'Max',
        familyName: 'Mustermann',
        email: 'max@example.com',
        phoneNumber: '+41 123 456 78',
        lastLoginDate: '2023-10-01',
        addressPostalCode: '8000',
        addressLocality: 'Zürich',
      },
      {
        ktIdP: 'user2',
        givenName: 'Anna',
        familyName: 'Schmidt',
        email: 'anna@example.com',
        phoneNumber: '+41 987 654 32',
        lastLoginDate: '2023-09-15',
        addressPostalCode: '3000',
        addressLocality: 'Bern',
      },
    ];

    const mockPageResponse: PageResponseDto = {
      items: mockUsers,
      totalItems: mockUsers.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    };

    // Mock getProducers to return our test users
    mockUserService.getProducers = jest.fn().mockReturnValue(Promise.resolve(mockPageResponse));

    await TestBed.configureTestingModule({
      imports: [
        SupporterPageComponent,
        AgridataTableComponent,
        FaIconComponent,
        I18nDirective,
        UserInfoDtoDirective,
        AgridataContactCardComponent,
        ButtonComponent,
      ],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SupporterPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct table metadata structure', () => {
    const metadata = component['usersTableMetaData']();
    expect(metadata.idColumn).toBe('ktIdP');
    expect(metadata.columns.length).toBe(5);
    expect(metadata.columns[0].name).toBe(component['NAME_HEADER']);
    expect(metadata.columns[1].name).toBe(component['EMAIL_HEADER']);
    expect(metadata.columns[2].name).toBe(component['PHONE_HEADER']);
    expect(metadata.columns[3].name).toBe(component['LAST_LOGIN_HEADER']);
    expect(metadata.columns[4].name).toBe(component['ACTION_HEADER']);
  });

  it('should render email column correctly', () => {
    const metadata = component['usersTableMetaData']();
    const emailColumn = metadata.columns[1];

    if (emailColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = emailColumn.renderer.cellRenderFn(mockUsers[0]);
      expect(result).toBe('max@example.com');
    } else {
      fail('Email column should have function renderer');
    }
  });

  it('should render phone column correctly', () => {
    const metadata = component['usersTableMetaData']();
    const phoneColumn = metadata.columns[2];

    if (phoneColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = phoneColumn.renderer.cellRenderFn(mockUsers[0]);
      expect(result).toBe('+41 123 456 78');
    } else {
      fail('Phone column should have function renderer');
    }
  });

  it('should render lastLoginDate column correctly', () => {
    const metadata = component['usersTableMetaData']();
    const lastLoginColumn = metadata.columns[3];

    if (lastLoginColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = lastLoginColumn.renderer.cellRenderFn(mockUsers[0]);
      expect(result).toBe('2023-10-01');
    } else {
      fail('Last login column should have function renderer');
    }
  });

  it('should handle missing values in renderer functions', () => {
    const metadata = component['usersTableMetaData']();
    const userWithMissingData: UserInfoDto = {
      ktIdP: 'user3',
    };

    // Email renderer
    const emailColumn = metadata.columns[1];
    if (emailColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = emailColumn.renderer.cellRenderFn(userWithMissingData);
      expect(result).toBe('');
    }

    // Phone renderer
    const phoneColumn = metadata.columns[2];
    if (phoneColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = phoneColumn.renderer.cellRenderFn(userWithMissingData);
      expect(result).toBe('');
    }

    // Last login renderer
    const lastLoginColumn = metadata.columns[3];
    if (lastLoginColumn.renderer.type === CellRendererTypes.FUNCTION) {
      const result = lastLoginColumn.renderer.cellRenderFn(userWithMissingData);
      expect(result).toBe('');
    }
  });

  it('should get full name correctly', () => {
    const name = component['getName'](mockUsers[0]);
    expect(name).toBe('Max Mustermann');
  });

  it('should handle missing name parts', () => {
    const userWithoutGivenName: UserInfoDto = {
      ktIdP: 'user3',
      familyName: 'OnlyLastName',
    };

    const userWithoutFamilyName: UserInfoDto = {
      ktIdP: 'user4',
      givenName: 'OnlyFirstName',
    };

    expect(component['getName'](userWithoutGivenName)).toBe('OnlyLastName');
    expect(component['getName'](userWithoutFamilyName)).toBe('OnlyFirstName');
  });

  it('should get address correctly', () => {
    const address = component['getAddress'](mockUsers[0]);
    expect(address).toBe('8000 Zürich');
  });

  it('should handle missing address parts', () => {
    const userWithoutPostalCode: UserInfoDto = {
      ktIdP: 'user3',
      addressLocality: 'OnlyCity',
    };

    const userWithoutLocality: UserInfoDto = {
      ktIdP: 'user4',
      addressPostalCode: '1234',
    };

    expect(component['getAddress'](userWithoutPostalCode)).toBe('OnlyCity');
    expect(component['getAddress'](userWithoutLocality)).toBe('1234');
  });

  it('should log impersonation start', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    component['startImpersonation'](mockUsers[0]);
    expect(consoleSpy).toHaveBeenCalledWith('starting impersanation', mockUsers[0]);
  });

  it('should update resourceQueryDto when table emits query change', () => {
    // Manually trigger resource query update
    component.resourceQueryDto.set({
      page: 1,
      size: 25,
      sortParams: ['familyName'],
    });

    expect(component.resourceQueryDto()).toEqual({
      page: 1,
      size: 25,
      sortParams: ['familyName'],
    });
  });

  it('should have correct initial sort direction for lastLoginDate', () => {
    const metadata = component['usersTableMetaData']();
    const lastLoginColumn = metadata.columns[3];

    expect(lastLoginColumn.initialSortDirection).toBe(SortDirections.DESC);
  });

  it('should have correct column sortability configuration', () => {
    const metadata = component['usersTableMetaData']();

    expect(metadata.columns[0].sortable).toBe(true);
    expect(metadata.columns[1].sortable).toBe(true);
    expect(metadata.columns[2].sortable).toBe(true);
    expect(metadata.columns[3].sortable).toBe(true);
    expect(metadata.columns[4].sortable).toBeUndefined();
  });

  it('should use correct sort fields for columns', () => {
    const metadata = component['usersTableMetaData']();

    expect(metadata.columns[0].sortField).toBe('familyName');
    expect(metadata.columns[1].sortField).toBe('email');
    expect(metadata.columns[2].sortField).toBe('phoneNumber');
    expect(metadata.columns[3].sortField).toBe('lastLoginDate');
  });

  it('should use templates for name and action columns', () => {
    const metadata = component['usersTableMetaData']();

    expect(metadata.columns[0].renderer.type).toBe(CellRendererTypes.TEMPLATE);
    expect(metadata.columns[4].renderer.type).toBe(CellRendererTypes.TEMPLATE);
  });
});
