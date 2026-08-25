import { DataProductDto } from '@/entities/openapi';

/**
 * Suffix appended to a system code to form a distinct consent category. Per product decision this
 * category holds the products where `consentRequired` is false; consent-required products stay in
 * the plain system category. Unlikely to collide with a real data source system code.
 */
export const CONSENT_CATEGORY_SUFFIX = '::consent';

export interface ProductOption {
  deprecated: boolean;
  label: string;
  value: string;
}

export function getDataSourceCode(product: DataProductDto): string {
  return product.dataSourceSystem?.code ?? product.dataSourceSystemCode ?? '';
}

/**
 * Category key for a product: the data source system code, plus a consent suffix for products that
 * do NOT require consent, so they form their own category and cannot be combined with
 * consent-required products (or products from other systems).
 */
export function getCategoryKey(product: DataProductDto): string {
  const code = getDataSourceCode(product);
  return product.consentRequired ? code : `${code}${CONSENT_CATEGORY_SUFFIX}`;
}

export function mapProductToOption(product: DataProductDto, lang: string): ProductOption {
  return {
    deprecated: product.deprecatedSince !== null,
    label: product.name?.[lang as keyof typeof product.name] ?? '',
    value: product.id,
  };
}

export function buildCategoriesMap(
  products: DataProductDto[],
  lang: string,
  consentSuffix: string,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const product of products) {
    const code = getDataSourceCode(product);
    if (!code) continue;
    const key = getCategoryKey(product);
    if (map.has(key)) continue;
    const name =
      product.dataSourceSystem?.name?.[lang as keyof typeof product.dataSourceSystem.name] ?? code;
    map.set(key, product.consentRequired ? name : `${name} ${consentSuffix}`);
  }
  return map;
}
