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
import type { CreateVariantInput, UpdateVariantInput, VariantSummary } from '../types/domain';

interface Props {
  visible: boolean;
  productId: string;
  categoryId: string | null; // drives the valid-units lookup
  variant?: VariantSummary | null; // present in edit mode
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const VariantFormModal = observer(function VariantFormModal({
  visible,
  productId,
  categoryId,
  variant,
  onClose,
  onSuccess,
}: Props) {
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();
  const isEdit = !!variant;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState<string | null>(null);
  const [qty, setQty] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [image, setImage] = useState('');
  const [position, setPosition] = useState('0');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!visible) return;
    // Units must come from GET /shops/categories/{id}/units/ before showing the dropdown
    if (categoryId) void productsStore.fetchCategoryUnits(categoryId);
    if (variant) {
      setName(variant.name);
      setUnitId(variant.unit?.id ?? null);
      setQty(variant.quantity_per_unit ?? '');
      setMrp(variant.mrp ?? '');
      setSellingPrice(variant.selling_price ?? '');
      setSku(variant.sku ?? '');
      setBarcode(variant.barcode ?? '');
      setImage(variant.image ?? '');
      setPosition(String(variant.position ?? 0));
      setIsActive(variant.is_active);
    } else {
      setName('');
      setUnitId(null);
      setQty('');
      setMrp('');
      setSellingPrice('');
      setSku('');
      setBarcode('');
      setImage('');
      setPosition('0');
      setIsActive(true);
    }
    setErrors({});
    setSubmitError(null);
  }, [visible, variant, categoryId, productsStore]);

  const unitOptions = useMemo(() => {
    const opts = productsStore.unitsFor(categoryId).map((u) => ({
      id: u.id,
      label: `${u.name} (${u.symbol})`,
      sublabel: u.is_default ? 'Default unit' : undefined,
    }));
    if (variant?.unit && !opts.some((o) => o.id === variant.unit.id)) {
      opts.unshift({
        id: variant.unit.id,
        label: `${variant.unit.name} (${variant.unit.symbol})`,
        sublabel: undefined,
      });
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, productsStore.unitsByCategory[categoryId ?? ''], variant]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Variant name is required';
    if (!unitId) errs.unit = 'Unit is required';
    const q = Number(qty);
    if (!qty.trim() || !Number.isFinite(q) || q <= 0) errs.qty = 'Enter a quantity above 0';
    const m = Number(mrp);
    const sp = Number(sellingPrice);
    if (!mrp.trim() || !Number.isFinite(m) || m <= 0) errs.mrp = 'Enter a valid MRP';
    if (!sellingPrice.trim() || !Number.isFinite(sp) || sp <= 0) {
      errs.sellingPrice = 'Enter a valid selling price';
    } else if (Number.isFinite(m) && m > 0 && sp > m) {
      errs.sellingPrice = 'Selling price must be less than or equal to MRP';
    }
    if (position.trim() && (!Number.isInteger(Number(position)) || Number(position) < 0)) {
      errs.position = 'Position must be 0 or a positive whole number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;

    if (!isEdit) {
      const input: CreateVariantInput = {
        name: name.trim(),
        unit_id: unitId!,
        quantity_per_unit: Number(qty),
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        ...(sku.trim() ? { sku: sku.trim() } : {}),
        ...(barcode.trim() ? { barcode: barcode.trim() } : {}),
        ...(image.trim() ? { image: image.trim() } : {}),
        position: Number(position) || 0,
      };
      const result = await productsStore.createVariant(productId, input);
      if (result.ok) {
        onSuccess(result.message);
        onClose();
      } else {
        setSubmitError(result.message);
      }
      return;
    }

    // Edit — send only changed fields
    const v = variant!;
    const patch: UpdateVariantInput = {};
    if (name.trim() !== v.name) patch.name = name.trim();
    if (unitId && unitId !== v.unit?.id) patch.unit_id = unitId;
    if (Number(qty) !== Number(v.quantity_per_unit)) patch.quantity_per_unit = Number(qty);
    if (Number(mrp) !== Number(v.mrp)) patch.mrp = Number(mrp);
    if (Number(sellingPrice) !== Number(v.selling_price)) patch.selling_price = Number(sellingPrice);
    if (sku.trim() !== (v.sku ?? '')) patch.sku = sku.trim();
    if (barcode.trim() !== (v.barcode ?? '')) patch.barcode = barcode.trim();
    if (image.trim() !== (v.image ?? '')) patch.image = image.trim();
    if (Number(position) !== v.position) patch.position = Number(position) || 0;
    if (isActive !== v.is_active) patch.is_active = isActive;

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    const result = await productsStore.updateVariant(productId, v.id, patch);
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
          <Text style={styles.title}>{isEdit ? 'Edit Variant' : 'Add Variant'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, productsStore.saving && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={productsStore.saving}
          >
            {productsStore.saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
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

          <FormSectionLabel text="Variant details" />
          <TextField
            label="Variant name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. 500ml"
            error={errors.name}
          />
          <SelectField
            label="Unit *"
            value={unitId}
            options={unitOptions}
            onChange={setUnitId}
            error={errors.unit}
            loading={!!categoryId && productsStore.unitsLoadingFor === categoryId}
            placeholder="Select unit"
            hint="Only units valid for this product's category are shown."
            emptyText="No units mapped to this category."
          />
          <TextField
            label="Quantity per unit *"
            value={qty}
            onChangeText={setQty}
            placeholder="e.g. 500"
            keyboardType="decimal-pad"
            error={errors.qty}
          />

          <FormSectionLabel text="Pricing" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="MRP *"
                value={mrp}
                onChangeText={setMrp}
                placeholder="28.00"
                keyboardType="decimal-pad"
                prefix="₹"
                error={errors.mrp}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Selling price *"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                placeholder="26.00"
                keyboardType="decimal-pad"
                prefix="₹"
                error={errors.sellingPrice}
              />
            </View>
          </View>

          <FormSectionLabel text="Identifiers" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="SKU"
                value={sku}
                onChangeText={setSku}
                placeholder="AMK-500"
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Barcode"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="EAN-13 / UPC-A"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <TextField
            label="Image URL"
            value={image}
            onChangeText={setImage}
            placeholder="https://…"
            autoCapitalize="none"
          />
          <TextField
            label="Display position"
            value={position}
            onChangeText={setPosition}
            placeholder="0"
            keyboardType="number-pad"
            error={errors.position}
            hint="Lower numbers show first."
          />

          {isEdit ? (
            <>
              <FormSectionLabel text="Status" />
              <ToggleField
                title="Active"
                subtitle="Inactive variants are hidden from customers"
                value={isActive}
                onValueChange={setIsActive}
              />
            </>
          ) : null}

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
