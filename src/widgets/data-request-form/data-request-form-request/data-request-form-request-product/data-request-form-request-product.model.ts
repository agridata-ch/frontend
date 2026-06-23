import { DataProductDto } from '@/entities/openapi';

export interface ProductOption {
  deprecated: boolean;
  label: string;
  value: string;
}

export function getDataSourceCode(product: DataProductDto): string {
  return product.dataSourceSystem?.code ?? product.dataSourceSystemCode ?? '';
}

export function mapProductToOption(product: DataProductDto, lang: string): ProductOption {
  return {
    deprecated: product.deprecatedSince !== null,
    label: product.name?.[lang as keyof typeof product.name] ?? '',
    value: product.id,
  };
}

export function buildCategoriesMap(products: DataProductDto[], lang: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const product of products) {
    const code = getDataSourceCode(product);
    if (!code || map.has(code)) continue;
    const name =
      product.dataSourceSystem?.name?.[lang as keyof typeof product.dataSourceSystem.name] ?? code;
    map.set(code, name);
  }
  return map;
}
