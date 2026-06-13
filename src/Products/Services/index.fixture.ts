// Mock data + fixture service for the Products (catalog) module.
// Toggle `USE_FIXTURES` in Common/services/config.ts to switch to ProductsApiService.

import type { ApiResult, PaginatedResult } from '../../Common/services/http';
import { fixtureDelay } from '../../Common/services/config';
import type { IProductsService } from './index';
import type {
  CategoryDetail,
  CategoryListItem,
  CategoryUnit,
  CategoryUnitsResponse,
  CreateProductInput,
  CreateVariantInput,
  ProductDetail,
  ProductListParams,
  ProductSummary,
  SubcategoryRef,
  UnitRef,
  UpdateProductInput,
  UpdateVariantInput,
  VariantSummary,
} from '../types/domain';

// ── Reference data ───────────────────────────────────────────────────────────

export const UNIT_REFS: Record<string, UnitRef> = {
  'u-kg': { id: 'u-kg', name: 'Kilogram', symbol: 'kg', unit_type: 'WEIGHT' },
  'u-g': { id: 'u-g', name: 'Gram', symbol: 'g', unit_type: 'WEIGHT' },
  'u-l': { id: 'u-l', name: 'Litre', symbol: 'l', unit_type: 'VOLUME' },
  'u-ml': { id: 'u-ml', name: 'Millilitre', symbol: 'ml', unit_type: 'VOLUME' },
  'u-pcs': { id: 'u-pcs', name: 'Piece', symbol: 'pcs', unit_type: 'COUNT' },
};

export const categoryFixtures: CategoryListItem[] = [
  { id: 'cat-grocery', name: 'Grocery', is_active: true },
  { id: 'cat-pharmacy', name: 'Pharmacy', is_active: true },
  { id: 'cat-fashion', name: 'Fashion', is_active: true },
  { id: 'cat-electronics', name: 'Electronics', is_active: true },
];

const subcategoryFixtures: Record<string, SubcategoryRef[]> = {
  'cat-grocery': [
    { id: 'sub-grocery-staples', name: 'Staples', is_active: true },
    { id: 'sub-grocery-snacks', name: 'Snacks & Beverages', is_active: true },
  ],
  'cat-pharmacy': [{ id: 'sub-pharmacy-otc', name: 'OTC Medicines', is_active: true }],
  'cat-fashion': [{ id: 'sub-fashion-mens', name: "Men's Wear", is_active: true }],
  'cat-electronics': [{ id: 'sub-electronics-wearables', name: 'Wearables', is_active: true }],
};

const categoryUnitFixtures: Record<string, CategoryUnit[]> = {
  'cat-grocery': [
    { ...UNIT_REFS['u-kg'], is_default: true },
    { ...UNIT_REFS['u-g'], is_default: false },
    { ...UNIT_REFS['u-l'], is_default: false },
    { ...UNIT_REFS['u-ml'], is_default: false },
    { ...UNIT_REFS['u-pcs'], is_default: false },
  ],
  'cat-pharmacy': [
    { ...UNIT_REFS['u-pcs'], is_default: true },
    { ...UNIT_REFS['u-g'], is_default: false },
    { ...UNIT_REFS['u-ml'], is_default: false },
  ],
  'cat-fashion': [{ ...UNIT_REFS['u-pcs'], is_default: true }],
  'cat-electronics': [{ ...UNIT_REFS['u-pcs'], is_default: true }],
};

// ── Products + variants ──────────────────────────────────────────────────────

export const productFixtures: ProductDetail[] = [
  {
    id: 'PRD-1001',
    name: 'Organic Roma Tomatoes 1kg',
    description: 'Juicy, vine-ripened organic tomatoes. Sourced directly from local farmers.',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
    manufacturer: null,
    is_perishable: true,
    shelf_life_days: 7,
    is_active: true,
    category: { id: 'cat-grocery', name: 'Grocery' },
    subcategory: { id: 'sub-grocery-staples', name: 'Staples' },
    brand: null,
    variant_count: 1,
    variants: [
      {
        id: 'VAR-1001-1',
        name: '1 kg',
        unit: UNIT_REFS['u-kg'],
        quantity_per_unit: '1',
        sku: 'TOM-1KG',
        barcode: null,
        mrp: '80.00',
        selling_price: '60.00',
        image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400',
        position: 0,
        is_active: true,
      },
    ],
  },
  {
    id: 'PRD-1002',
    name: 'Hass Avocados (Pack of 2)',
    description: 'Ripe and creamy Hass Avocados. Perfect for homemade guacamole or salads.',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
    manufacturer: null,
    is_perishable: true,
    shelf_life_days: 5,
    is_active: true,
    category: { id: 'cat-grocery', name: 'Grocery' },
    subcategory: { id: 'sub-grocery-staples', name: 'Staples' },
    brand: null,
    variant_count: 1,
    variants: [
      {
        id: 'VAR-1002-1',
        name: '2 units',
        unit: UNIT_REFS['u-pcs'],
        quantity_per_unit: '2',
        sku: 'AVO-2PK',
        barcode: null,
        mrp: '350.00',
        selling_price: '299.00',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
        position: 0,
        is_active: true,
      },
    ],
  },
  {
    id: 'PRD-1003',
    name: 'Crocin Pain Relief Tablet (15s)',
    description:
      'Fast acting relief from headache, body aches, and fever. Use with doctor recommendation.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    manufacturer: 'GSK',
    is_perishable: false,
    shelf_life_days: null,
    is_active: true,
    category: { id: 'cat-pharmacy', name: 'Pharmacy' },
    subcategory: { id: 'sub-pharmacy-otc', name: 'OTC Medicines' },
    brand: null,
    variant_count: 1,
    variants: [
      {
        id: 'VAR-1003-1',
        name: '15 Tablets',
        unit: UNIT_REFS['u-pcs'],
        quantity_per_unit: '15',
        sku: 'CRO-15',
        barcode: '8901030801234',
        mrp: '120.00',
        selling_price: '110.00',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
        position: 0,
        is_active: true,
      },
    ],
  },
  {
    id: 'PRD-1004',
    name: 'Cotton Oversized Tee - Black',
    description: 'Premium heavyweight cotton oversized t-shirt. Breathable and extremely durable.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
    manufacturer: 'Urban Threads',
    is_perishable: false,
    shelf_life_days: null,
    is_active: true,
    category: { id: 'cat-fashion', name: 'Fashion' },
    subcategory: { id: 'sub-fashion-mens', name: "Men's Wear" },
    brand: null,
    variant_count: 2,
    variants: [
      {
        id: 'VAR-1004-1',
        name: 'Size M',
        unit: UNIT_REFS['u-pcs'],
        quantity_per_unit: '1',
        sku: 'TEE-BLK-M',
        barcode: null,
        mrp: '999.00',
        selling_price: '599.00',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
        position: 0,
        is_active: true,
      },
      {
        id: 'VAR-1004-2',
        name: 'Size L',
        unit: UNIT_REFS['u-pcs'],
        quantity_per_unit: '1',
        sku: 'TEE-BLK-L',
        barcode: null,
        mrp: '999.00',
        selling_price: '599.00',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
        position: 1,
        is_active: true,
      },
    ],
  },
  {
    id: 'PRD-1005',
    name: 'Noise ColorFit Pulse Smartwatch',
    description:
      'Sleek smart watch with 1.4 inch screen, heart rate monitor, sleep tracking, and 10 day battery.',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
    manufacturer: 'Noise',
    is_perishable: false,
    shelf_life_days: null,
    is_active: true,
    category: { id: 'cat-electronics', name: 'Electronics' },
    subcategory: { id: 'sub-electronics-wearables', name: 'Wearables' },
    brand: { id: 'brand-noise', name: 'Noise', logo: null },
    variant_count: 1,
    variants: [
      {
        id: 'VAR-1005-1',
        name: 'Default',
        unit: UNIT_REFS['u-pcs'],
        quantity_per_unit: '1',
        sku: 'NOISE-CFP',
        barcode: null,
        mrp: '2999.00',
        selling_price: '1799.00',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400',
        position: 0,
        is_active: true,
      },
    ],
  },
  {
    id: 'PRD-1006',
    name: 'Amul Taaza Toned Milk 1L',
    description: 'Fresh toned milk, homogenised and pasteurised for daily goodness.',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    manufacturer: 'GCMMF',
    is_perishable: true,
    shelf_life_days: 2,
    is_active: false,
    category: { id: 'cat-grocery', name: 'Grocery' },
    subcategory: { id: 'sub-grocery-staples', name: 'Staples' },
    brand: { id: 'brand-amul', name: 'Amul', logo: null },
    variant_count: 1,
    variants: [
      {
        id: 'VAR-1006-1',
        name: '1 Litre',
        unit: UNIT_REFS['u-l'],
        quantity_per_unit: '1',
        sku: 'AMUL-TZ-1L',
        barcode: null,
        mrp: '66.00',
        selling_price: '64.00',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
        position: 0,
        is_active: false,
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let nextProductSeq = productFixtures.length + 1;
let nextVariantSeq = 1;

function ok<T>(data: T, message: string | null = null): ApiResult<T> {
  return { ok: true, status: 200, data, message };
}

function notFound<T>(message: string): ApiResult<T> {
  return { ok: false, status: 404, message } as ApiResult<T>;
}

function toSummary(detail: ProductDetail): ProductSummary {
  const { variants, ...summary } = detail;
  return { ...summary, variant_count: variants.length };
}

// ── Fixture service ───────────────────────────────────────────────────────────

export class ProductsFixtureService implements IProductsService {
  async listProducts(
    params: ProductListParams = {},
  ): Promise<ApiResult<PaginatedResult<ProductSummary>>> {
    let list = productFixtures.map(toSummary);

    if (params.search) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand?.name ?? '').toLowerCase().includes(q) ||
          (p.manufacturer ?? '').toLowerCase().includes(q),
      );
    }
    if (params.category_id) {
      list = list.filter((p) => p.category?.id === params.category_id);
    }
    if (params.is_active !== undefined) {
      list = list.filter((p) => p.is_active === params.is_active);
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const start = (page - 1) * pageSize;
    const results = list.slice(start, start + pageSize);

    return fixtureDelay(
      ok({
        count: list.length,
        next: start + pageSize < list.length ? String(page + 1) : null,
        previous: page > 1 ? String(page - 1) : null,
        results,
      }),
    );
  }

  async getProduct(productId: string): Promise<ApiResult<ProductDetail>> {
    const product = productFixtures.find((p) => p.id === productId);
    if (!product) return fixtureDelay(notFound('Product not found.'));
    return fixtureDelay(ok(product));
  }

  async createProduct(input: CreateProductInput): Promise<ApiResult<ProductDetail>> {
    const category = categoryFixtures.find((c) => c.id === input.category_id);
    const subcategory = subcategoryFixtures[input.category_id]?.find(
      (s) => s.id === input.subcategory_id,
    );
    const unit = categoryUnitFixtures[input.category_id]?.find(
      (u) => u.id === input.variant.unit_id,
    );

    const productId = `PRD-${1000 + nextProductSeq++}`;
    const product: ProductDetail = {
      id: productId,
      name: input.name,
      description: input.description ?? null,
      image: input.image ?? null,
      manufacturer: input.manufacturer ?? null,
      is_perishable: input.is_perishable ?? false,
      shelf_life_days: input.shelf_life_days ?? null,
      is_active: true,
      category: category ? { id: category.id, name: category.name } : { id: input.category_id, name: '' },
      subcategory: subcategory
        ? { id: subcategory.id, name: subcategory.name }
        : { id: input.subcategory_id, name: '' },
      brand: null,
      variant_count: 1,
      variants: [
        {
          id: `VAR-${productId}-1`,
          name: input.variant.name,
          unit: unit ?? UNIT_REFS['u-pcs'],
          quantity_per_unit: String(input.variant.quantity_per_unit),
          sku: input.variant.sku ?? null,
          barcode: input.variant.barcode ?? null,
          mrp: input.variant.mrp.toFixed(2),
          selling_price: input.variant.selling_price.toFixed(2),
          image: input.variant.image ?? null,
          position: input.variant.position ?? 0,
          is_active: true,
        },
      ],
    };

    productFixtures.unshift(product);
    return fixtureDelay(ok(product, 'Product created successfully.'));
  }

  async updateProduct(
    productId: string,
    patch: UpdateProductInput,
  ): Promise<ApiResult<ProductDetail>> {
    const product = productFixtures.find((p) => p.id === productId);
    if (!product) return fixtureDelay(notFound('Product not found.'));

    if (patch.name !== undefined) product.name = patch.name;
    if (patch.description !== undefined) product.description = patch.description;
    if (patch.image !== undefined) product.image = patch.image;
    if (patch.manufacturer !== undefined) product.manufacturer = patch.manufacturer;
    if (patch.is_perishable !== undefined) product.is_perishable = patch.is_perishable;
    if (patch.shelf_life_days !== undefined) product.shelf_life_days = patch.shelf_life_days;
    if (patch.is_active !== undefined) product.is_active = patch.is_active;
    if (patch.category_id !== undefined) {
      const category = categoryFixtures.find((c) => c.id === patch.category_id);
      product.category = category
        ? { id: category.id, name: category.name }
        : { id: patch.category_id, name: '' };
    }
    if (patch.subcategory_id !== undefined) {
      const subcategory = subcategoryFixtures[product.category.id]?.find(
        (s) => s.id === patch.subcategory_id,
      );
      product.subcategory = subcategory
        ? { id: subcategory.id, name: subcategory.name }
        : { id: patch.subcategory_id, name: '' };
    }
    if (patch.brand_id !== undefined) {
      product.brand = patch.brand_id ? { id: patch.brand_id, name: product.brand?.name ?? '' } : null;
    }

    return fixtureDelay(ok(product, 'Product updated successfully.'));
  }

  async deactivateProduct(productId: string): Promise<ApiResult<null>> {
    const product = productFixtures.find((p) => p.id === productId);
    if (!product) return fixtureDelay(notFound('Product not found.'));
    product.is_active = false;
    return fixtureDelay(ok(null, 'Product deactivated.'));
  }

  async listVariants(productId: string): Promise<ApiResult<VariantSummary[]>> {
    const product = productFixtures.find((p) => p.id === productId);
    if (!product) return fixtureDelay(notFound('Product not found.'));
    return fixtureDelay(ok(product.variants));
  }

  async createVariant(
    productId: string,
    input: CreateVariantInput,
  ): Promise<ApiResult<VariantSummary>> {
    const product = productFixtures.find((p) => p.id === productId);
    if (!product) return fixtureDelay(notFound('Product not found.'));

    const unit = categoryUnitFixtures[product.category.id]?.find((u) => u.id === input.unit_id);
    const variant: VariantSummary = {
      id: `VAR-${productId.replace('PRD-', '')}-${product.variants.length + nextVariantSeq++}`,
      name: input.name,
      unit: unit ?? UNIT_REFS['u-pcs'],
      quantity_per_unit: String(input.quantity_per_unit),
      sku: input.sku ?? null,
      barcode: input.barcode ?? null,
      mrp: input.mrp.toFixed(2),
      selling_price: input.selling_price.toFixed(2),
      image: input.image ?? null,
      position: input.position ?? product.variants.length,
      is_active: true,
    };
    product.variants.push(variant);
    product.variant_count = product.variants.length;
    return fixtureDelay(ok(variant, 'Variant created successfully.'));
  }

  async updateVariant(
    productId: string,
    variantId: string,
    patch: UpdateVariantInput,
  ): Promise<ApiResult<VariantSummary>> {
    const product = productFixtures.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant) return fixtureDelay(notFound('Variant not found.'));

    if (patch.name !== undefined) variant.name = patch.name;
    if (patch.unit_id !== undefined) {
      variant.unit =
        categoryUnitFixtures[product.category.id]?.find((u) => u.id === patch.unit_id) ??
        variant.unit;
    }
    if (patch.quantity_per_unit !== undefined) {
      variant.quantity_per_unit = String(patch.quantity_per_unit);
    }
    if (patch.mrp !== undefined) variant.mrp = patch.mrp.toFixed(2);
    if (patch.selling_price !== undefined) variant.selling_price = patch.selling_price.toFixed(2);
    if (patch.sku !== undefined) variant.sku = patch.sku;
    if (patch.barcode !== undefined) variant.barcode = patch.barcode;
    if (patch.image !== undefined) variant.image = patch.image;
    if (patch.position !== undefined) variant.position = patch.position;
    if (patch.is_active !== undefined) variant.is_active = patch.is_active;

    return fixtureDelay(ok(variant, 'Variant updated successfully.'));
  }

  async deactivateVariant(productId: string, variantId: string): Promise<ApiResult<null>> {
    const product = productFixtures.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!variant) return fixtureDelay(notFound('Variant not found.'));
    variant.is_active = false;
    return fixtureDelay(ok(null, 'Variant deactivated.'));
  }

  async getCategoryUnits(categoryId: string): Promise<ApiResult<CategoryUnitsResponse>> {
    const category = categoryFixtures.find((c) => c.id === categoryId);
    if (!category) return fixtureDelay(notFound('Category not found.'));
    return fixtureDelay(
      ok({
        category_id: category.id,
        category_name: category.name,
        units: categoryUnitFixtures[categoryId] ?? [],
      }),
    );
  }

  async listCategories(): Promise<ApiResult<CategoryListItem[]>> {
    return fixtureDelay(ok(categoryFixtures));
  }

  async getCategoryDetail(categoryId: string): Promise<ApiResult<CategoryDetail>> {
    const category = categoryFixtures.find((c) => c.id === categoryId);
    if (!category) return fixtureDelay(notFound('Category not found.'));
    return fixtureDelay(
      ok({
        id: category.id,
        name: category.name,
        image: null,
        is_active: category.is_active,
        subcategories: subcategoryFixtures[categoryId] ?? [],
      }),
    );
  }
}
