import { makeAutoObservable, runInAction } from 'mobx';
import type { SessionStore } from '../../Auth/Store';
import { USE_FIXTURES } from '../../Common/services/config';
import { ProductsApiService } from '../Services/index.api';
import { ProductsFixtureService } from '../Services/index.fixture';
import type { IProductsService } from '../Services';
import type {
  CategoryListItem,
  CategoryUnit,
  CreateProductInput,
  CreateVariantInput,
  ProductDetail,
  ProductListParams,
  ProductSummary,
  SubcategoryRef,
  UpdateProductInput,
  UpdateVariantInput,
} from '../types/domain';

export type LoadState = 'idle' | 'loading' | 'error';

export interface MutationResult {
  ok: boolean;
  message: string;
}

const PRODUCTS_PAGE_SIZE = 20;

export class ProductsStore {
  // Listing — GET /shops/shop-owner/products/
  products: ProductSummary[] = [];
  listState: LoadState = 'idle';
  listError: string | null = null;
  listFetched = false;

  // Pagination
  productsPage = 1;
  productsHasMore = true;
  productsTotalCount = 0;
  loadingMore = false;
  filters: ProductListParams = {};

  // Detail — GET /shops/shop-owner/products/{id}/
  detail: ProductDetail | null = null;
  detailState: LoadState = 'idle';
  detailError: string | null = null;

  // Category options for product forms — GET /shops/shop-owner/categories/
  categories: CategoryListItem[] = [];
  categoriesState: LoadState = 'idle';

  // Subcategories per category — GET /shops/shop-owner/categories/{id}/
  subcategoriesByCategory: Record<string, SubcategoryRef[]> = {};
  subcategoriesLoadingFor: string | null = null;
  subcategoriesError: string | null = null;

  // Valid units per category — GET /shops/categories/{id}/units/
  unitsByCategory: Record<string, CategoryUnit[]> = {};
  unitsLoadingFor: string | null = null;
  unitsError: string | null = null;

  saving = false;

  private service: IProductsService;

  constructor(session: SessionStore, service?: IProductsService) {
    this.service = service ?? (USE_FIXTURES ? new ProductsFixtureService() : new ProductsApiService(session));
    makeAutoObservable(this);
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  get activeCount() {
    return this.products.filter((p) => p.is_active).length;
  }

  get inactiveCount() {
    return this.products.filter((p) => !p.is_active).length;
  }

  unitsFor(categoryId: string | null): CategoryUnit[] {
    return categoryId ? (this.unitsByCategory[categoryId] ?? []) : [];
  }

  subcategoriesFor(categoryId: string | null): SubcategoryRef[] {
    return categoryId ? (this.subcategoriesByCategory[categoryId] ?? []) : [];
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async fetchProducts(filters?: ProductListParams): Promise<void> {
    if (filters) this.filters = filters;
    runInAction(() => {
      this.listState = 'loading';
      this.listError = null;
    });
    const res = await this.service.listProducts({
      ...this.filters,
      page: 1,
      page_size: PRODUCTS_PAGE_SIZE,
    });
    runInAction(() => {
      if (res.ok) {
        this.products = res.data?.results ?? [];
        this.productsPage = 1;
        this.productsHasMore = !!res.data?.next;
        this.productsTotalCount = res.data?.count ?? 0;
        this.listState = 'idle';
        this.listFetched = true;
      } else {
        this.listState = 'error';
        this.listError = res.message;
      }
    });
  }

  async loadMoreProducts(): Promise<void> {
    if (this.loadingMore || !this.productsHasMore || this.listState === 'loading') return;
    runInAction(() => {
      this.loadingMore = true;
    });
    const nextPage = this.productsPage + 1;
    const res = await this.service.listProducts({
      ...this.filters,
      page: nextPage,
      page_size: PRODUCTS_PAGE_SIZE,
    });
    runInAction(() => {
      this.loadingMore = false;
      if (res.ok) {
        this.products = [...this.products, ...(res.data?.results ?? [])];
        this.productsPage = nextPage;
        this.productsHasMore = !!res.data?.next;
        this.productsTotalCount = res.data?.count ?? this.productsTotalCount;
      }
    });
  }

  async fetchProduct(productId: string): Promise<void> {
    runInAction(() => {
      this.detailState = 'loading';
      this.detailError = null;
      if (this.detail?.id !== productId) this.detail = null;
    });
    const res = await this.service.getProduct(productId);
    runInAction(() => {
      if (res.ok) {
        this.detail = res.data;
        this.detailState = 'idle';
      } else {
        this.detailState = 'error';
        this.detailError = res.message;
      }
    });
  }

  async createProduct(input: CreateProductInput): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.createProduct(input);
    runInAction(() => {
      this.saving = false;
    });
    if (res.ok) {
      await this.fetchProducts();
      return { ok: true, message: res.message ?? 'Product created successfully.' };
    }
    return { ok: false, message: res.message };
  }

  async updateProduct(productId: string, patch: UpdateProductInput): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.updateProduct(productId, patch);
    runInAction(() => {
      this.saving = false;
      if (res.ok && res.data) {
        this.applyProductToList(res.data);
        if (this.detail?.id === productId) this.detail = res.data;
      }
    });
    return res.ok
      ? { ok: true, message: res.message ?? 'Product updated successfully.' }
      : { ok: false, message: res.message };
  }

  async deactivateProduct(productId: string): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.deactivateProduct(productId);
    runInAction(() => {
      this.saving = false;
      if (res.ok) {
        const p = this.products.find((x) => x.id === productId);
        if (p) p.is_active = false;
        if (this.detail?.id === productId) this.detail.is_active = false;
      }
    });
    return res.ok
      ? { ok: true, message: res.message ?? 'Product deactivated.' }
      : { ok: false, message: res.message };
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  async createVariant(productId: string, input: CreateVariantInput): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.createVariant(productId, input);
    runInAction(() => {
      this.saving = false;
    });
    if (res.ok) {
      await this.fetchProduct(productId);
      return { ok: true, message: res.message ?? 'Variant created successfully.' };
    }
    return { ok: false, message: res.message };
  }

  async updateVariant(
    productId: string,
    variantId: string,
    patch: UpdateVariantInput,
  ): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.updateVariant(productId, variantId, patch);
    runInAction(() => {
      this.saving = false;
      if (res.ok && res.data && this.detail?.id === productId) {
        const idx = this.detail.variants.findIndex((v) => v.id === variantId);
        if (idx !== -1) this.detail.variants[idx] = res.data;
      }
    });
    return res.ok
      ? { ok: true, message: res.message ?? 'Variant updated successfully.' }
      : { ok: false, message: res.message };
  }

  async deactivateVariant(productId: string, variantId: string): Promise<MutationResult> {
    this.saving = true;
    const res = await this.service.deactivateVariant(productId, variantId);
    runInAction(() => {
      this.saving = false;
      if (res.ok && this.detail?.id === productId) {
        const v = this.detail.variants.find((x) => x.id === variantId);
        if (v) v.is_active = false;
      }
    });
    return res.ok
      ? { ok: true, message: res.message ?? 'Variant deactivated.' }
      : { ok: false, message: res.message };
  }

  // ── Reference data ────────────────────────────────────────────────────────

  async fetchCategories(): Promise<void> {
    if (this.categoriesState === 'loading') return;
    runInAction(() => {
      this.categoriesState = 'loading';
    });
    const res = await this.service.listCategories();
    runInAction(() => {
      if (res.ok) {
        this.categories = res.data ?? [];
        this.categoriesState = 'idle';
      } else {
        this.categoriesState = 'error';
      }
    });
  }

  async fetchSubcategories(categoryId: string): Promise<void> {
    if (this.subcategoriesByCategory[categoryId]) return; // cached
    runInAction(() => {
      this.subcategoriesLoadingFor = categoryId;
      this.subcategoriesError = null;
    });
    const res = await this.service.getCategoryDetail(categoryId);
    runInAction(() => {
      this.subcategoriesLoadingFor = null;
      if (res.ok) {
        this.subcategoriesByCategory[categoryId] = res.data?.subcategories ?? [];
      } else {
        this.subcategoriesError = res.message;
      }
    });
  }

  async fetchCategoryUnits(categoryId: string): Promise<void> {
    if (this.unitsByCategory[categoryId]) return; // cached
    runInAction(() => {
      this.unitsLoadingFor = categoryId;
      this.unitsError = null;
    });
    const res = await this.service.getCategoryUnits(categoryId);
    runInAction(() => {
      this.unitsLoadingFor = null;
      if (res.ok) {
        this.unitsByCategory[categoryId] = res.data?.units ?? [];
      } else {
        this.unitsError = res.message;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private applyProductToList(detail: ProductDetail) {
    const idx = this.products.findIndex((p) => p.id === detail.id);
    if (idx === -1) return;
    const { variants, ...summary } = detail;
    this.products[idx] = {
      ...summary,
      variant_count: variants?.length ?? this.products[idx].variant_count,
    };
  }
}

export type ProductsStoreType = ProductsStore;
