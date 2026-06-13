import { apiRequest, apiRequestPaginated, buildQuery, type ApiResult, type PaginatedResult } from '../../Common/services/http';
import { CATALOG_ENDPOINTS } from '../Constants/api';
import type { IProductsService } from './index';
import type {
  CategoryDetail,
  CategoryListItem,
  CategoryUnitsResponse,
  CreateProductInput,
  CreateVariantInput,
  ProductDetail,
  ProductListParams,
  ProductSummary,
  UpdateProductInput,
  UpdateVariantInput,
  VariantSummary,
} from '../types/domain';

export interface TokenProvider {
  accessToken: string | null;
}

export class ProductsApiService implements IProductsService {
  constructor(private session: TokenProvider) {}

  private get token() {
    return this.session.accessToken;
  }

  listProducts(params: ProductListParams = {}): Promise<ApiResult<PaginatedResult<ProductSummary>>> {
    const qs = buildQuery({
      page: params.page?.toString(),
      page_size: params.page_size?.toString(),
      search: params.search,
      category_id: params.category_id,
      is_active: params.is_active,
    });
    return apiRequestPaginated<ProductSummary>(`${CATALOG_ENDPOINTS.PRODUCTS}${qs}`, {
      token: this.token,
    });
  }

  getProduct(productId: string): Promise<ApiResult<ProductDetail>> {
    return apiRequest<ProductDetail>(CATALOG_ENDPOINTS.PRODUCT(productId), { token: this.token });
  }

  createProduct(input: CreateProductInput): Promise<ApiResult<ProductDetail>> {
    return apiRequest<ProductDetail>(CATALOG_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      token: this.token,
      body: input,
    });
  }

  updateProduct(productId: string, patch: UpdateProductInput): Promise<ApiResult<ProductDetail>> {
    return apiRequest<ProductDetail>(CATALOG_ENDPOINTS.PRODUCT(productId), {
      method: 'PATCH',
      token: this.token,
      body: patch,
    });
  }

  deactivateProduct(productId: string): Promise<ApiResult<null>> {
    return apiRequest<null>(CATALOG_ENDPOINTS.PRODUCT(productId), {
      method: 'DELETE',
      token: this.token,
    });
  }

  listVariants(productId: string): Promise<ApiResult<VariantSummary[]>> {
    return apiRequest<VariantSummary[]>(CATALOG_ENDPOINTS.VARIANTS(productId), {
      token: this.token,
    });
  }

  createVariant(productId: string, input: CreateVariantInput): Promise<ApiResult<VariantSummary>> {
    return apiRequest<VariantSummary>(CATALOG_ENDPOINTS.VARIANTS(productId), {
      method: 'POST',
      token: this.token,
      body: input,
    });
  }

  updateVariant(
    productId: string,
    variantId: string,
    patch: UpdateVariantInput,
  ): Promise<ApiResult<VariantSummary>> {
    return apiRequest<VariantSummary>(CATALOG_ENDPOINTS.VARIANT(productId, variantId), {
      method: 'PATCH',
      token: this.token,
      body: patch,
    });
  }

  deactivateVariant(productId: string, variantId: string): Promise<ApiResult<null>> {
    return apiRequest<null>(CATALOG_ENDPOINTS.VARIANT(productId, variantId), {
      method: 'DELETE',
      token: this.token,
    });
  }

  getCategoryUnits(categoryId: string): Promise<ApiResult<CategoryUnitsResponse>> {
    return apiRequest<CategoryUnitsResponse>(CATALOG_ENDPOINTS.CATEGORY_UNITS(categoryId), {
      token: this.token,
    });
  }

  listCategories(): Promise<ApiResult<CategoryListItem[]>> {
    return apiRequest<CategoryListItem[]>(CATALOG_ENDPOINTS.CATEGORIES, { token: this.token });
  }

  getCategoryDetail(categoryId: string): Promise<ApiResult<CategoryDetail>> {
    return apiRequest<CategoryDetail>(CATALOG_ENDPOINTS.CATEGORY_DETAIL(categoryId), {
      token: this.token,
    });
  }
}
