import {
  Component,
  TemplateRef,
  computed,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowUpRightFromSquare, faUsers } from '@fortawesome/free-solid-svg-icons';

import { UserService } from '@/entities/api/user.service';
import { PageResponseDto, ResourceQueryDto, UserInfoDto } from '@/entities/openapi';
import { UserInfoDtoDirective } from '@/pages/supporter-page/user-info-dto.directive';
import { I18nDirective } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { ButtonComponent } from '@/shared/ui/button';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card/';

/**
 * Shows a table with all users that can be managed by a supporter.
 * CommentLastReviewed: 2025-09-24
 */
@Component({
  selector: 'app-supporter-page',
  imports: [
    AgridataTableComponent,
    FaIconComponent,
    I18nDirective,
    UserInfoDtoDirective,
    AgridataContactCardComponent,
    ButtonComponent,
  ],
  templateUrl: './supporter-page.component.html',
})
export class SupporterPageComponent {
  public readonly userService = inject(UserService);

  protected readonly NAME_HEADER = 'supporter.table.name';
  protected readonly EMAIL_HEADER = 'supporter.table.email';
  protected readonly PHONE_HEADER = 'supporter.table.phone';
  protected readonly LAST_LOGIN_HEADER = 'supporter.table.lastLogin';
  protected readonly ACTION_HEADER = 'supporter.table.actions';

  protected readonly TITLE_ICON = faUsers;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;

  private readonly nameTemplate =
    viewChild<TemplateRef<{ $implicit: UserInfoDto }>>('nameTemplate');
  private readonly actionTemplate =
    viewChild<TemplateRef<{ $implicit: UserInfoDto }>>('actionTemplate');
  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  protected readonly usersTableMetaData = computed<TableMetadata<UserInfoDto>>(() => {
    return {
      idColumn: 'ktIdP',
      columns: [
        {
          name: this.NAME_HEADER,
          sortField: 'familyName',
          sortable: true,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.nameTemplate(),
          },
        },
        {
          name: this.EMAIL_HEADER,
          sortable: true,
          sortField: 'email',
          renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.email ?? '' },
        },
        {
          name: this.PHONE_HEADER,
          sortable: true,
          sortField: 'phoneNumber',
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.phoneNumber ?? '',
          },
        },
        {
          name: this.LAST_LOGIN_HEADER,
          sortable: true,
          sortField: 'lastLoginDate',
          initialSortDirection: SortDirections.DESC,
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.lastLoginDate ?? '',
          },
        },
        {
          name: this.ACTION_HEADER,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.actionTemplate(),
          },
        },
      ],
    };
  });

  readonly fetchProducers = resource({
    params: () => this.resourceQueryDto(),
    loader: ({ params }) => {
      return this.userService.getProducers(params);
    },
    defaultValue: {} as PageResponseDto,
  });

  protected getName(item: UserInfoDto) {
    return [item.givenName, item.familyName].filter(Boolean).join(' ');
  }

  protected getAddress(item: UserInfoDto) {
    return [item.addressPostalCode, item.addressLocality].filter(Boolean).join(' ');
  }

  protected startImpersonation(item: UserInfoDto) {
    console.log('starting impersanation', item);
  }

  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
}
