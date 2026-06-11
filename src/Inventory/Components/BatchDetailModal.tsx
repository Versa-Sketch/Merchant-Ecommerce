import React, { useEffect, useState } from 'react';
import {
  Modal,
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
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import { BATCH_STATUSES, type BatchStatus, type InventoryBatch } from '../types/domain';

const STATUS_TONES: Record<BatchStatus, { color: string; bg: string }> = {
  ACTIVE: { color: Colors.success, bg: Colors.successBg },
  EXPIRED: { color: Colors.error, bg: Colors.errorBg },
  EXHAUSTED: { color: Colors.textSecondary, bg: Colors.background },
  RECALLED: { color: Colors.warning, bg: Colors.warningBg },
};

interface Props {
  visible: boolean;
  batch: InventoryBatch | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const BatchDetailModal = observer(function BatchDetailModal({
  visible,
  batch,
  onClose,
  onSuccess,
}: Props) {
  const { inventoryStore } = useStores();
  const insets = useSafeAreaInsets();

  const [newStatus, setNewStatus] = useState<BatchStatus | null>(null);
  const [confirmStatus, setConfirmStatus] = useState(false);

  const [sellingPrice, setSellingPrice] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [confirmPrice, setConfirmPrice] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !batch) return;
    setNewStatus(batch.status);
    setSellingPrice(batch.selling_price ?? '');
    setConfirmStatus(false);
    setConfirmPrice(false);
    setPriceError(null);
    setSubmitError(null);
  }, [visible, batch]);

  if (!batch) return null;

  const productLabel = inventoryStore.productLabelForVariant(batch.variant_id);
  const tone = STATUS_TONES[batch.status] ?? STATUS_TONES.ACTIVE;

  async function handleStatusSave() {
    if (!newStatus || newStatus === batch!.status) {
      setConfirmStatus(false);
      return;
    }
    setSubmitError(null);
    const result = await inventoryStore.updateBatch(batch!.id, { status: newStatus });
    setConfirmStatus(false);
    if (result.ok) {
      onSuccess(result.message);
    } else {
      setSubmitError(result.message);
    }
  }

  async function handlePriceSave() {
    const sp = Number(sellingPrice);
    if (!sellingPrice.trim() || !Number.isFinite(sp) || sp <= 0) {
      setPriceError('Enter a valid selling price');
      setConfirmPrice(false);
      return;
    }
    if (String(sp) === String(Number(batch!.selling_price ?? 0))) {
      setConfirmPrice(false);
      return;
    }
    setSubmitError(null);
    const result = await inventoryStore.updateBatch(batch!.id, { selling_price: sp });
    setConfirmPrice(false);
    if (result.ok) {
      onSuccess(result.message);
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 4, 20) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Batch Details</Text>
          <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
            <Text style={[styles.statusPillText, { color: tone.color }]}>{batch.status}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <FormSectionLabel text="Overview" />
          <View style={styles.infoCard}>
            <InfoRow label="Product / Variant" value={productLabel} />
            <InfoRow label="Batch number" value={batch.batch_number || '—'} />
            <InfoRow label="Received quantity" value={batch.received_quantity} />
            <InfoRow label="Available quantity" value={batch.available_quantity} />
            <InfoRow label="Reserved quantity" value={batch.reserved_quantity} />
            <InfoRow label="Purchase price" value={`₹${batch.purchase_price}`} />
            <InfoRow label="Selling price" value={batch.selling_price ? `₹${batch.selling_price}` : '—'} />
            <InfoRow label="Received date" value={batch.received_at} />
            <InfoRow label="Manufactured date" value={batch.manufactured_at || '—'} />
            <InfoRow label="Expiry date" value={batch.expiry_at || '—'} last />
          </View>

          <FormSectionLabel text="Update status" />
          <SelectField
            label="Status"
            value={newStatus}
            options={BATCH_STATUSES.map((s) => ({ id: s, label: s }))}
            onChange={(id) => {
              setNewStatus(id as BatchStatus);
              setConfirmStatus(false);
            }}
            placeholder="Select status"
          />
          {newStatus && newStatus !== batch.status ? (
            confirmStatus ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>
                  Change batch status from {batch.status} to {newStatus}? This affects stock
                  availability.
                </Text>
                <View style={styles.confirmActions}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setConfirmStatus(false);
                      setNewStatus(batch.status);
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Confirm"
                    variant="danger"
                    size="sm"
                    loading={inventoryStore.saving}
                    onPress={() => void handleStatusSave()}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              <Button label="Save status" variant="view" size="sm" onPress={() => setConfirmStatus(true)} />
            )
          ) : null}

          <FormSectionLabel text="Update selling price" />
          <TextField
            label="Selling price"
            value={sellingPrice}
            onChangeText={(v) => {
              setSellingPrice(v);
              setConfirmPrice(false);
              setPriceError(null);
            }}
            placeholder="26.00"
            keyboardType="decimal-pad"
            prefix="₹"
            error={priceError ?? undefined}
          />
          {sellingPrice.trim() && sellingPrice !== (batch.selling_price ?? '') ? (
            confirmPrice ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>
                  Update selling price for this batch to ₹{sellingPrice}?
                </Text>
                <View style={styles.confirmActions}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setConfirmPrice(false);
                      setSellingPrice(batch.selling_price ?? '');
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    label="Confirm"
                    variant="primary"
                    size="sm"
                    loading={inventoryStore.saving}
                    onPress={() => void handlePriceSave()}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              <Button label="Save price" variant="view" size="sm" onPress={() => setConfirmPrice(true)} />
            )
          ) : null}

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>
    </Modal>
  );
});

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

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
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  form: { paddingHorizontal: 20, paddingTop: 8 },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  infoLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  infoValue: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  confirmBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: -4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  confirmText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  errorBannerText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
});
