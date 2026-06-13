import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronLeft, ImagePlus, X } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStores } from '../../Common/hooks/useStores';
import {
  FormSectionLabel,
  SelectField,
  TextField,
  ToggleField,
} from '../../Common/components/FormFields';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import type { CreateProductInput } from '../types/domain';
import styles from './ProductCreateRoute.styles';

const SHELF_LIFE_HELPER = 'Actual expiry dates are tracked per inventory batch, not on the product.';
const MAX_IMAGES = 6;

const STEPS = ['Basic Info', 'Images', 'Variant', 'Type', 'Review'] as const;

export default observer(function ProductCreateRoute() {
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Basic info
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');

  // Images
  const [images, setImages] = useState<string[]>([]);

  // First variant
  const [vName, setVName] = useState('');
  const [vUnitId, setVUnitId] = useState<string | null>(null);
  const [vQty, setVQty] = useState('');
  const [vMrp, setVMrp] = useState('');
  const [vSellingPrice, setVSellingPrice] = useState('');
  const [vSku, setVSku] = useState('');
  const [vBarcode, setVBarcode] = useState('');

  // Product type
  const [isPerishable, setIsPerishable] = useState(false);
  const [shelfLifeDays, setShelfLifeDays] = useState('');

  useEffect(() => {
    void productsStore.fetchCategories();
  }, [productsStore]);

  useEffect(() => {
    if (categoryId) {
      void productsStore.fetchSubcategories(categoryId);
      void productsStore.fetchCategoryUnits(categoryId);
    }
  }, [categoryId, productsStore]);

  const categoryOptions = useMemo(
    () => productsStore.categories.map((c) => ({ id: c.id, label: c.name })),
    [productsStore.categories],
  );

  const subcategoryOptions = useMemo(
    () => productsStore.subcategoriesFor(categoryId).map((s) => ({ id: s.id, label: s.name })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productsStore.subcategoriesByCategory[categoryId ?? ''], categoryId],
  );

  const unitOptions = useMemo(
    () =>
      productsStore.unitsFor(categoryId).map((u) => ({
        id: u.id,
        label: `${u.name} (${u.symbol})`,
        sublabel: u.is_default ? 'Default unit' : undefined,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productsStore.unitsByCategory[categoryId ?? ''], categoryId],
  );

  const selectedCategory = categoryOptions.find((c) => c.id === categoryId);
  const selectedSubcategory = subcategoryOptions.find((c) => c.id === subcategoryId);
  const selectedUnit = unitOptions.find((u) => u.id === vUnitId);

  function handleCategoryChange(id: string) {
    if (id !== categoryId) {
      setCategoryId(id);
      setSubcategoryId(null);
      setVUnitId(null);
    }
  }

  async function pickImages() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErrors((e) => ({ ...e, images: 'Allow photo library access to add product images.' }));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(MAX_IMAGES - images.length, 1),
      quality: 0.7,
    });
    if (!result.canceled) {
      setErrors((e) => ({ ...e, images: '' }));
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, MAX_IMAGES));
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((u) => u !== uri));
  }

  function validateStep(target: number): boolean {
    const errs: Record<string, string> = {};
    if (target === 0) {
      if (!name.trim()) errs.name = 'Product name is required';
      if (!categoryId) errs.category = 'Category is required';
      if (!subcategoryId) errs.subcategory = 'Subcategory is required';
    }
    if (target === 2) {
      if (!vName.trim()) errs.vName = 'Variant name is required';
      if (!vUnitId) errs.vUnit = 'Unit is required';
      const qty = Number(vQty);
      if (!vQty.trim() || !Number.isFinite(qty) || qty <= 0) errs.vQty = 'Enter a quantity above 0';
      const mrp = Number(vMrp);
      const sp = Number(vSellingPrice);
      if (!vMrp.trim() || !Number.isFinite(mrp) || mrp <= 0) errs.vMrp = 'Enter a valid price';
      if (!vSellingPrice.trim() || !Number.isFinite(sp) || sp <= 0) {
        errs.vSellingPrice = 'Enter a valid discount price';
      } else if (Number.isFinite(mrp) && mrp > 0 && sp > mrp) {
        errs.vSellingPrice = 'Discount price must be less than or equal to price';
      }
    }
    if (target === 3 && isPerishable && shelfLifeDays.trim()) {
      const days = Number(shelfLifeDays);
      if (!Number.isInteger(days) || days <= 0) errs.shelfLifeDays = 'Enter a whole number of days';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  async function handlePublish() {
    setSubmitError(null);
    for (let i = 0; i <= 2; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }

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
        ...(images[0] ? { image: images[0] } : {}),
      },
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(brand.trim() ? { manufacturer: brand.trim() } : {}),
      ...(images[0] ? { image: images[0] } : {}),
      is_perishable: isPerishable,
      ...(isPerishable && shelfLifeDays.trim() ? { shelf_life_days: Number(shelfLifeDays) } : {}),
    };

    const result = await productsStore.createProduct(input);
    if (result.ok) {
      router.back();
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={goBack} style={styles.closeBtn}>
          {step === 0 ? (
            <X size={18} color={Colors.textSecondary} />
          ) : (
            <ChevronLeft size={18} color={Colors.textSecondary} />
          )}
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Add Product</Text>
          <Text style={styles.headerStep}>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.progressSegment, i <= step && styles.progressSegmentDone]} />
        ))}
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

        {step === 0 ? (
          <>
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
              emptyText="No subcategories available for this category."
            />
            <TextField
              label="Brand"
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g. Amul"
            />
            <TextField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Visible to customers…"
              multiline
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <FormSectionLabel text="Product images" />
            <View style={styles.imageGrid}>
              {images.map((uri) => (
                <View key={uri} style={styles.imageTile}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  {uri === images[0] ? (
                    <View style={styles.imagePrimaryBadge}>
                      <Text style={styles.imagePrimaryText}>Cover</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity style={styles.imageRemoveBtn} onPress={() => removeImage(uri)}>
                    <X size={12} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < MAX_IMAGES ? (
                <TouchableOpacity style={styles.addImageTile} onPress={pickImages} activeOpacity={0.75}>
                  <ImagePlus size={20} color={Colors.textSecondary} />
                  <Text style={styles.addImageText}>Add photo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {errors.images ? <Text style={styles.errorBannerText}>{errors.images}</Text> : null}
            <Text style={styles.imagesHint}>
              Add up to {MAX_IMAGES} images. The first image is used as the product&apos;s cover photo.
            </Text>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FormSectionLabel text="First variant (required)" />
            <TextField
              label="Size / Weight / Quantity name *"
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
                  label="Price (MRP) *"
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
                  label="Discount price *"
                  value={vSellingPrice}
                  onChangeText={setVSellingPrice}
                  placeholder="26.00"
                  keyboardType="decimal-pad"
                  prefix="₹"
                  error={errors.vSellingPrice}
                />
              </View>
            </View>
            <TextField
              label="SKU"
              value={vSku}
              onChangeText={setVSku}
              placeholder="AMK-500"
              autoCapitalize="characters"
            />
            <TextField
              label="Barcode"
              value={vBarcode}
              onChangeText={setVBarcode}
              placeholder="8901058857756"
              keyboardType="number-pad"
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <FormSectionLabel text="Product type" />
            <ToggleField
              title="Perishable"
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
          </>
        ) : null}

        {step === 4 ? (
          <>
            <FormSectionLabel text="Review" />
            {images.length > 0 ? (
              <View style={styles.reviewImageRow}>
                {images.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.reviewImage} />
                ))}
              </View>
            ) : null}

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>BASIC INFORMATION</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Name</Text>
                <Text style={styles.reviewValue}>{name || '—'}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>
                  {selectedCategory?.label ?? '—'}
                  {selectedSubcategory ? ` › ${selectedSubcategory.label}` : ''}
                </Text>
              </View>
              {brand.trim() ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Brand</Text>
                  <Text style={styles.reviewValue}>{brand}</Text>
                </View>
              ) : null}
              {description.trim() ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Description</Text>
                  <Text style={styles.reviewValue}>{description}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>VARIANT</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Name</Text>
                <Text style={styles.reviewValue}>{vName || '—'}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Quantity</Text>
                <Text style={styles.reviewValue}>
                  {vQty || '—'} {selectedUnit?.label ?? ''}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Price</Text>
                <Text style={styles.reviewValue}>
                  ₹{vMrp || '—'} {vSellingPrice ? `→ ₹${vSellingPrice}` : ''}
                </Text>
              </View>
              {vSku.trim() ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>SKU</Text>
                  <Text style={styles.reviewValue}>{vSku}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>PRODUCT TYPE</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Type</Text>
                <Text style={styles.reviewValue}>
                  {isPerishable ? 'Perishable' : 'Non-perishable'}
                </Text>
              </View>
              {isPerishable && shelfLifeDays.trim() ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Shelf life</Text>
                  <Text style={styles.reviewValue}>{shelfLifeDays} days</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Back" variant="outline" onPress={goBack} style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Button label="Next" onPress={goNext} style={{ flex: 1 }} />
        ) : (
          <Button
            label="Publish Product"
            onPress={() => void handlePublish()}
            loading={productsStore.saving}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
});
