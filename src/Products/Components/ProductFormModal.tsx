import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '../../Common/hooks/useStores';
import {
  FormSectionLabel,
  SelectField,
  TextField,
  ToggleField,
} from '../../Common/components/FormFields';
import { Colors } from '../../theme/colors';
import type {
  CreateProductInput,
  ProductDetail,
  ProductSummary,
  UpdateProductInput,
} from '../types/domain';

const SHELF_LIFE_HELPER = 'Actual expiry dates are tracked per inventory batch, not on the product.';

interface Props {
  visible: boolean;
  mode: 'create' | 'edit';
  product?: ProductDetail | ProductSummary | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ProductFormModal = observer(function ProductFormModal({
  visible,
  mode,
  product,
  onClose,
  onSuccess,
}: Props) {
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();
  const isEdit = mode === 'edit';

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Product fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [image, setImage] = useState('');
  const [isPerishable, setIsPerishable] = useState(false);
  const [shelfLifeDays, setShelfLifeDays] = useState('');
  const [isActive, setIsActive] = useState(true);

  // First variant fields (create mode only)
  const [vName, setVName] = useState('');
  const [vUnitId, setVUnitId] = useState<string | null>(null);
  const [vQty, setVQty] = useState('');
  const [vMrp, setVMrp] = useState('');
  const [vSellingPrice, setVSellingPrice] = useState('');
  const [vSku, setVSku] = useState('');
  const [vBarcode, setVBarcode] = useState('');
  const [vImage, setVImage] = useState('');

  useEffect(() => {
    if (!visible) return;
    void productsStore.fetchCategories();
    if (isEdit && product) {
      setName(product.name);
      setCategoryId(product.category?.id ?? null);
      setSubcategoryId(product.subcategory?.id ?? null);
      setDescription(product.description ?? '');
      setManufacturer(product.manufacturer ?? '');
      setImage(product.image ?? '');
      setIsPerishable(product.is_perishable);
      setShelfLifeDays(product.shelf_life_days != null ? String(product.shelf_life_days) : '');
      setIsActive(product.is_active);
    } else {
      setName('');
      setCategoryId(null);
      setSubcategoryId(null);
      setDescription('');
      setManufacturer('');
      setImage('');
      setIsPerishable(false);
      setShelfLifeDays('');
      setIsActive(true);
      setVName('');
      setVUnitId(null);
      setVQty('');
      setVMrp('');
      setVSellingPrice('');
      setVSku('');
      setVBarcode('');
      setVImage('');
    }
    setErrors({});
    setSubmitError(null);
  }, [visible, isEdit, product, productsStore]);

  // Load units for selected category (used by the first-variant unit dropdown)
  useEffect(() => {
    if (visible && categoryId && !isEdit) void productsStore.fetchCategoryUnits(categoryId);
  }, [visible, categoryId, isEdit, productsStore]);

  // Load subcategories for the selected category
  useEffect(() => {
    if (visible && categoryId) void productsStore.fetchSubcategories(categoryId);
  }, [visible, categoryId, productsStore]);

  const categoryOptions = useMemo(() => {
    const opts = productsStore.categories.map((c) => ({ id: c.id, label: c.name }));
    // Ensure the product's current category is selectable even if suggestions miss it
    if (isEdit && product?.category && !opts.some((o) => o.id === product.category.id)) {
      opts.unshift({ id: product.category.id, label: product.category.name });
    }
    return opts;
  }, [productsStore.categories, isEdit, product]);

  const subcategoryOptions = useMemo(() => {
    const opts = productsStore.subcategoriesFor(categoryId).map((s) => ({ id: s.id, label: s.name }));
    if (
      isEdit &&
      product?.subcategory &&
      product.category?.id === categoryId &&
      !opts.some((o) => o.id === product.subcategory!.id)
    ) {
      opts.unshift({ id: product.subcategory.id, label: product.subcategory.name });
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsStore.subcategoriesByCategory[categoryId ?? ''], categoryId, isEdit, product]);

  const unitOptions = useMemo(
    () =>
      productsStore.unitsFor(categoryId).map((u) => ({
        id: u.id,
        label: `${u.name} (${u.symbol})`,
        sublabel: u.is_default ? 'Default unit' : undefined,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryId, productsStore.unitsByCategory[categoryId ?? '']],
  );

  const categoryChanged = isEdit && product ? categoryId !== product.category?.id : false;

  function handleCategoryChange(id: string) {
    if (id !== categoryId) {
      setCategoryId(id);
      setSubcategoryId(null); // subcategory must belong to the chosen category
      setVUnitId(null);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!categoryId) errs.category = 'Category is required';
    if (!subcategoryId) {
      errs.subcategory = categoryChanged
        ? 'Select a subcategory for the new category'
        : 'Subcategory is required';
    }
    if (isPerishable && shelfLifeDays.trim()) {
      const days = Number(shelfLifeDays);
      if (!Number.isInteger(days) || days <= 0) errs.shelfLifeDays = 'Enter a whole number of days';
    }
    if (!isEdit) {
      if (!vName.trim()) errs.vName = 'Variant name is required';
      if (!vUnitId) errs.vUnit = 'Unit is required';
      const qty = Number(vQty);
      if (!vQty.trim() || !Number.isFinite(qty) || qty <= 0) errs.vQty = 'Enter a quantity above 0';
      const mrp = Number(vMrp);
      const sp = Number(vSellingPrice);
      if (!vMrp.trim() || !Number.isFinite(mrp) || mrp <= 0) errs.vMrp = 'Enter a valid MRP';
      if (!vSellingPrice.trim() || !Number.isFinite(sp) || sp <= 0) {
        errs.vSellingPrice = 'Enter a valid selling price';
      } else if (Number.isFinite(mrp) && mrp > 0 && sp > mrp) {
        errs.vSellingPrice = 'Selling price must be less than or equal to MRP';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;

    if (!isEdit) {
      const input: CreateProductInput = {
        name: name.trim(),
        category_id: categoryId!,
        subcategory_id: subcategoryId!,
        variant: {
          name: vName.trim(),
          unit_id: vUnitId!,
          quantity_per_unit: Number(vQty),
          mrp: Number(vMrp),
          selling_price: Number(vSellingPrice),
          ...(vSku.trim() ? { sku: vSku.trim() } : {}),
          ...(vBarcode.trim() ? { barcode: vBarcode.trim() } : {}),
          ...(vImage.trim() ? { image: vImage.trim() } : {}),
        },
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(manufacturer.trim() ? { manufacturer: manufacturer.trim() } : {}),
        ...(image.trim() ? { image: image.trim() } : {}),
        is_perishable: isPerishable,
        ...(isPerishable && shelfLifeDays.trim()
          ? { shelf_life_days: Number(shelfLifeDays) }
          : {}),
      };
      const result = await productsStore.createProduct(input);
      if (result.ok) {
        onSuccess(result.message);
        onClose();
      } else {
        setSubmitError(result.message);
      }
      return;
    }

    // Edit — send only changed fields
    const p = product!;
    const patch: UpdateProductInput = {};
    if (name.trim() !== p.name) patch.name = name.trim();
    if (categoryChanged) {
      patch.category_id = categoryId!;
      patch.subcategory_id = subcategoryId!; // required alongside category_id
    } else if (subcategoryId !== (p.subcategory?.id ?? null) && subcategoryId) {
      patch.subcategory_id = subcategoryId;
    }
    if (description.trim() !== (p.description ?? '')) patch.description = description.trim();
    if (manufacturer.trim() !== (p.manufacturer ?? '')) patch.manufacturer = manufacturer.trim();
    if (image.trim() !== (p.image ?? '')) patch.image = image.trim();
    if (isPerishable !== p.is_perishable) patch.is_perishable = isPerishable;
    const newShelfLife = shelfLifeDays.trim() ? Number(shelfLifeDays) : null;
    if (newShelfLife !== (p.shelf_life_days ?? null)) patch.shelf_life_days = newShelfLife;
    if (isActive !== p.is_active) patch.is_active = isActive;

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    const result = await productsStore.updateProduct(p.id, patch);
    if (result.ok) {
      onSuccess(result.message);
      onClose();
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 4, 20) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEdit ? 'Edit Product' : 'Create Product'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, productsStore.saving && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={productsStore.saving}
          >
            {productsStore.saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>{isEdit ? 'Save' : 'Create'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <FormSectionLabel text="Product information" />
          <TextField
            label="Product name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amul Taaza Toned Milk"
            error={errors.name}
          />
          <SelectField
            label="Category *"
            value={categoryId}
            options={categoryOptions}
            onChange={handleCategoryChange}
            error={errors.category}
            loading={productsStore.categoriesState === 'loading'}
            placeholder="Select category"
            emptyText="No categories found. Set up your shop types first."
          />
          <SelectField
            label="Subcategory *"
            value={subcategoryId}
            options={subcategoryOptions}
            onChange={setSubcategoryId}
            error={errors.subcategory}
            disabled={!categoryId}
            loading={!!categoryId && productsStore.subcategoriesLoadingFor === categoryId}
            placeholder={categoryId ? 'Select subcategory' : 'Select a category first'}
            hint={categoryChanged ? 'Category changed — pick a matching subcategory.' : undefined}
            emptyText="No subcategories available for this category."
          />
          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Visible to customers…"
            multiline
          />
          <TextField
            label="Manufacturer"
            value={manufacturer}
            onChangeText={setManufacturer}
            placeholder="e.g. GCMMF"
          />
          <TextField
            label="Product image URL"
            value={image}
            onChangeText={setImage}
            placeholder="https://…"
            autoCapitalize="none"
          />

          <FormSectionLabel text="Shelf life information" />
          <ToggleField
            title="Is perishable"
            subtitle={SHELF_LIFE_HELPER}
            value={isPerishable}
            onValueChange={setIsPerishable}
          />
          {isPerishable ? (
            <View style={{ marginTop: 12 }}>
              <TextField
                label="Shelf life (days)"
                value={shelfLifeDays}
                onChangeText={setShelfLifeDays}
                placeholder="e.g. 7"
                keyboardType="number-pad"
                error={errors.shelfLifeDays}
                hint="Used to auto-calculate each stock batch's expiry date from its received date."
              />
            </View>
          ) : null}

          {isEdit ? (
            <>
              <FormSectionLabel text="Status" />
              <ToggleField
                title="Active"
                subtitle="Inactive products are hidden from your catalog"
                value={isActive}
                onValueChange={setIsActive}
              />
            </>
          ) : (
            <>
              <FormSectionLabel text="First variant (required)" />
              <TextField
                label="Variant name *"
                value={vName}
                onChangeText={setVName}
                placeholder="e.g. 500ml"
                error={errors.vName}
              />
              <SelectField
                label="Unit *"
                value={vUnitId}
                options={unitOptions}
                onChange={setVUnitId}
                error={errors.vUnit}
                disabled={!categoryId}
                loading={productsStore.unitsLoadingFor === categoryId && !!categoryId}
                placeholder={categoryId ? 'Select unit' : 'Select a category first'}
                emptyText="No units mapped to this category."
              />
              <TextField
                label="Quantity per unit *"
                value={vQty}
                onChangeText={setVQty}
                placeholder="e.g. 500"
                keyboardType="decimal-pad"
                error={errors.vQty}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="MRP *"
                    value={vMrp}
                    onChangeText={setVMrp}
                    placeholder="28.00"
                    keyboardType="decimal-pad"
                    prefix="₹"
                    error={errors.vMrp}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Selling price *"
                    value={vSellingPrice}
                    onChangeText={setVSellingPrice}
                    placeholder="26.00"
                    keyboardType="decimal-pad"
                    prefix="₹"
                    error={errors.vSellingPrice}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="SKU"
                    value={vSku}
                    onChangeText={setVSku}
                    placeholder="AMK-500"
                    autoCapitalize="characters"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Barcode"
                    value={vBarcode}
                    onChangeText={setVBarcode}
                    placeholder="8901058857756"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <TextField
                label="Variant image URL"
                value={vImage}
                onChangeText={setVImage}
                placeholder="https://…"
                autoCapitalize="none"
              />
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    minWidth: 72,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  form: { paddingHorizontal: 20, paddingTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  errorBannerText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
});
