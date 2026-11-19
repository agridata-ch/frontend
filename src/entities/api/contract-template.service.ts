import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ContractTemplateAdminService, ContractTemplateVersionDto } from '@/entities/openapi';
import { PageResponseDto } from '@/shared/lib/api.helper';

/**
 * Service for retrieving contract template versions (admin).
 *
 * CommentLastReviewed: 2026-11-18
 */
@Service()
export class ContractTemplateService {
  // Injects
  private readonly contractTemplateAdminService = inject(ContractTemplateAdminService);

  /**
   * The endpoint is not paginated. The result is wrapped into a single page so it can be
   * displayed by the agridata table.
   */
  async fetchAllContractTemplateVersions(): Promise<PageResponseDto<ContractTemplateVersionDto>> {
    const items = await firstValueFrom(
      this.contractTemplateAdminService.getAllContractTemplateVersions(),
    );
    return {
      items,
      totalItems: items.length,
      totalPages: 1,
      currentPage: 0,
      pageSize: items.length || 1,
    };
  }
}
