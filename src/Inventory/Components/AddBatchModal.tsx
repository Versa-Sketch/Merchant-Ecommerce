import React, { useEffect, useState } from 'react';
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
import { FormSectionLabel, SelectField, TextField } from '../../Common/components/FormFields';
import { Colors } from '../../theme/colors';
import type { CreateBatchInput } from '../types/domain';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EXPIRY_HELPER =
  'If expiry date is left empty, the system will automatically calculate it for perishable products based on their shelf life.';

interface Props {
  visible: boolean;
  presetVariantId?: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddBatchModal = observer(function AddBatchModal({
  visible,
  presetVariantId,
  onClose,
  onSuccess,
}: Props) {
  const { inventoryStore } = useStores();
  const insets = useSafeAreaInsets();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [variantId, setVariantId] = useState<string | null>(null);
  const [receivedQty, setReceivedQty] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturedAt, setManufacturedAt] = useState('');
  const [receivedAt, setReceivedAt] = useState('');
  const [expiryAt, setExpiryAt] = useState('');

  useEffect(() => {
    if (!visible) return;
    setVariantId(presetVariantId ?? null);
    setReceivedQty('');
    setPurchasePrice('');
    setSellingPrice('');
    setBatchNumber('');
    setManufacturedAt('');
    setReceivedAt('');
    setExpiryAt('');
    setErrors({});
    setSubmitError(null);
  }, [visible, presetVariantId]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!variantId) errs.variant = 'Select a variant';
    const qty = Number(receivedQty);
    if (!receivedQty.trim() || !Number.isFinite(qty) || qty <= 0) {
      errs.receivedQty = 'Enter a quantity above 0';
    }
    const pp = Number(purchasePrice);
    if (!purchasePrice.trim() || !Number.isFinite(pp) || pp <= 0) {
      errs.purchasePrice = 'Enter a valid purchase price';
    }
    if (sellingPrice.trim()) {
      const sp = Number(sellingPrice);
      if (!Number.isFinite(sp) || sp <= 0) errs.sellingPrice = 'Enter a valid selling price';
    }
    if (manufacturedAt.trim() && !DATE_RE.test(manufacturedAt.trim())) {
      errs.manufacturedAt = 'Use YYYY-MM-DD format';
    }
    if (receivedAt.trim() && !DATE_RE.test(receivedAt.trim())) {
      errs.receivedAt = 'Use YYYY-MM-DD format';
    }
    if (expiryAt.trim() && !DATE_RE.test(expiryAt.trim())) {
      errs.expiryAt = 'Use YYYY-MM-DD format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!validate()) return;

    const input: CreateBatchInput = {
      variant_id: variantId!,
      received_quantity: Number(receivedQty),
      purchase_price: Number(purchasePrice),
      ...(sellingPrice.trim() ? { selling_price: Number(sellingPrice) } : {}),
      ...(batchNumber.trim() ? { batch_number: batchNumber.trim() } : {}),
      ...(manufacturedAt.trim() ? { manufactured_at: manufacturedAt.trim() } : {}),
      ...(receivedAt.trim() ? { received_at: receivedAt.trim() } : {}),
      ...(expiryAt.trim() ? { expiry_at: expiryAt.trim() } : {}),
    };

    const result = await inventoryStore.createBatch(input);
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
          <Text style={styles.title}>Add Inventory Batch</Text>
          <TouchableOpacity
            style={[styles.saveBtn, inventoryStore.saving && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={inventoryStore.saving}
          >
            {inventoryStore.saving ? (
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

          <FormSectionLabel text="Stock arrival" />
          <SelectField
            label="Variant *"
            value={variantId}
            options={inventoryStore.variantOptions}
            onChange={setVariantId}
            error={errors.variant}
            disabled={!!presetVariantId}
            placeholder="Select a product variant"
            emptyText="No variants found. Add a product first."
          />
          <TextField
            label="Received quantity *"
            value={receivedQty}
            onChangeText={setReceivedQty}
            placeholder="e.g. 100"
            keyboardType="decimal-pad"
            error={errors.receivedQty}
          />

          <FormSectionLabel text="Pricing" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Purchase price *"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                placeholder="20.00"
                keyboardType="decimal-pad"
                prefix="₹"
                error={errors.purchasePrice}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Selling price"
                value={sellingPrice}
                onChangeText={setSellingPrice}
                placeholder="26.00"
                keyboardType="decimal-pad"
                prefix="₹"
                error={errors.sellingPrice}
              />
            </View>
          </View>

          <FormSectionLabel text="Batch details" />
          <TextField
            label="Batch number"
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g. LOT-2026-A"
            autoCapitalize="characters"
          />
          <TextField
            label="Manufactured date"
            value={manufacturedAt}
            onChangeText={setManufacturedAt}
            placeholder="YYYY-MM-DD"
            error={errors.manufacturedAt}
          />
          <TextField
            label="Received date"
            value={receivedAt}
            onChangeText={setReceivedAt}
            placeholder="YYYY-MM-DD (defaults to today)"
            error={errors.receivedAt}
          />
          <TextField
            label="Expiry date"
            value={expiryAt}
            onChangeText={setExpiryAt}
            placeholder="YYYY-MM-DD"
            error={errors.expiryAt}
            hint={EXPIRY_HELPER}
          />

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
