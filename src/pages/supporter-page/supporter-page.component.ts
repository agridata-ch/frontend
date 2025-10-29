import {
  Component,
  computed,
  inject,
  resource,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  faArrowUpRightFromSquare,
  faUsers,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { UserService } from '@/entities/api/user.service';
import { PageResponseDto, ResourceQueryDto, UserInfoDto } from '@/entities/openapi';
import { UserInfoDtoDirective } from '@/pages/supporter-page/user-info-dto.directive';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { ButtonComponent } from '@/shared/ui/button';
import { ErrorOutletComponent } from '@/styles/error-alert-outlet/error-outlet.component';
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
    ErrorOutletComponent,
  ],
  templateUrl: './supporter-page.component.html',
})
export class SupporterPageComponent {
  private readonly userService = inject(UserService);
  private readonly errorService = inject(ErrorHandlerService);
  protected readonly NAME_HEADER = 'supporter.table.name';
  protected readonly EMAIL_HEADER = 'supporter.table.email';
  protected readonly PHONE_HEADER = 'supporter.table.phone';
  protected readonly LAST_LOGIN_HEADER = 'supporter.table.lastLogin';
  protected readonly ACTION_HEADER = 'supporter.table.actions';

  protected readonly TITLE_ICON = faUsers;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;

  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;

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

  readonly fetchProducersResource = resource({
    params: () => this.resourceQueryDto(),
    loader: ({ params }) => {
      return this.userService.getProducers(params);
    },

    defaultValue: {} as PageResponseDto,
  });
  fetchProducersErrorHandler = createResourceErrorHandlerEffect(
    this.fetchProducersResource,
    this.errorService,
  );

  protected getName(item: UserInfoDto) {
    return [item.givenName, item.familyName].filter(Boolean).join(' ');
  }

  protected getAddress(item: UserInfoDto) {
    return [item.addressPostalCode, item.addressLocality].filter(Boolean).join(' ');
  }

  protected openImpersonationTab(item: UserInfoDto) {
    const absoluteUrl = `${globalThis.location.origin}?${KTIDP_IMPERSONATION_QUERY_PARAM}=${item.ktIdP}`;
    globalThis.open(absoluteUrl, '_blank');
  }
}
