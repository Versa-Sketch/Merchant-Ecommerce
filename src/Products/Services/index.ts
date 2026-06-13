import type { ApiResult, PaginatedResult } from '../../Common/services/http';
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

export interface IProductsService {
  listProducts(params?: ProductListParams): Promise<ApiResult<PaginatedResult<ProductSummary>>>;
  getProduct(productId: string): Promise<ApiResult<ProductDetail>>;
  createProduct(input: CreateProductInput): Promise<ApiResult<ProductDetail>>;
  updateProduct(productId: string, patch: UpdateProductInput): Promise<ApiResult<ProductDetail>>;
  deactivateProduct(productId: string): Promise<ApiResult<null>>;

  listVariants(productId: string): Promise<ApiResult<VariantSummary[]>>;
  createVariant(productId: string, input: CreateVariantInput): Promise<ApiResult<VariantSummary>>;
  updateVariant(
    productId: string,
    variantId: string,
    patch: UpdateVariantInput,
  ): Promise<ApiResult<VariantSummary>>;
  deactivateVariant(productId: string, variantId: string): Promise<ApiResult<null>>;

  getCategoryUnits(categoryId: string): Promise<ApiResult<CategoryUnitsResponse>>;
  listCategories(): Promise<ApiResult<CategoryListItem[]>>;
  getCategoryDetail(categoryId: string): Promise<ApiResult<CategoryDetail>>;
}
