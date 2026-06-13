// Catalog domain types — mirror the Product Catalog API swagger definitions.

export interface CategoryRef {
  id: string;
  name: string;
}

export interface BrandRef {
  id: string;
  name: string;
  logo?: string | null;
}

export type UnitType = 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH';

export interface UnitRef {
  id: string;
  name: string;
  symbol: string;
  unit_type: UnitType;
}

export interface CategoryUnit extends UnitRef {
  is_default: boolean;
}

export interface VariantSummary {
  id: string;
  name: string;
  unit: UnitRef;
  quantity_per_unit: string;
  sku: string | null;
  barcode: string | null;
  mrp: string;
  selling_price: string;
  image: string | null;
  position: number;
  is_active: boolean;
}

export interface ProductSummary {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  manufacturer: string | null;
  is_perishable: boolean;
  shelf_life_days: number | null;
  is_active: boolean;
  category: CategoryRef;
  subcategory: CategoryRef | null;
  brand: BrandRef | null;
  variant_count: number;
}

export interface ProductDetail extends ProductSummary {
  variants: VariantSummary[];
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface CreateVariantInput {
  name: string;
  unit_id: string;
  quantity_per_unit: number;
  mrp: number;
  selling_price: number; // must be <= mrp
  sku?: string;
  barcode?: string;
  image?: string;
  position?: number;
}

export interface CreateProductInput {
  name: string;
  category_id: string;
  subcategory_id: string;
  variant: CreateVariantInput; // first (default) variant — required
  brand_id?: string;
  description?: string;
  image?: string;
  manufacturer?: string;
  is_perishable?: boolean;
  shelf_life_days?: number;
}

// Partial update — if category_id is sent, subcategory_id must be sent too.
export interface UpdateProductInput {
  name?: string;
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
  description?: string;
  image?: string;
  manufacturer?: string;
  is_perishable?: boolean;
  shelf_life_days?: number | null;
  is_active?: boolean;
}

export interface UpdateVariantInput {
  name?: string;
  unit_id?: string;
  quantity_per_unit?: number;
  mrp?: number;
  selling_price?: number;
  sku?: string;
  barcode?: string;
  image?: string;
  position?: number;
  is_active?: boolean;
}

// Flat category for the create/edit product form — GET /shops/shop-owner/categories/
export interface CategoryListItem {
  id: string;
  name: string;
  is_active: boolean;
}

export interface SubcategoryRef {
  id: string;
  name: string;
  image?: string | null;
  is_active?: boolean;
}

// Category detail with subcategories — GET /shops/shop-owner/categories/{category_id}/
export interface CategoryDetail {
  id: string;
  name: string;
  image?: string | null;
  is_active: boolean;
  subcategories: SubcategoryRef[];
}

export interface CategoryUnitsResponse {
  category_id: string;
  category_name: string;
  units: CategoryUnit[];
}

// ── List query params ───────────────────────────────────────────────────────

export interface ProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: string;
  is_active?: boolean;
}
