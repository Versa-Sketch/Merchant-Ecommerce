import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle, Minus, Plus } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../Common/hooks/useStores';
import { SelectField, TextField } from '../../Common/components/FormFields';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';

interface Props {
  visible: boolean;
  presetBatchId?: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

type Direction = 'add' | 'remove';

const REASONS = [
  'Damaged / Spoiled',
  'Stock Count Correction',
  'Theft / Loss',
  'Returned to Supplier',
  'Other',
];

export const AdjustStockModal = observer(function AdjustStockModal({
  visible,
  presetBatchId,
  onClose,
  onSuccess,
}: Props) {
  const { inventoryStore } = useStores();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>('add');
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState<string | null>(null);
  const [otherNote, setOtherNote] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setBatchId(presetBatchId ?? null);
    setDirection('add');
    setAmount(1);
    setReason(null);
    setOtherNote('');
    setSubmitError(null);
  }, [visible, presetBatchId]);

  const batch = useMemo(() => inventoryStore.batchById(batchId ?? ''), [inventoryStore, batchId]);
  const currentStock = batch ? Number(batch.available_quantity) : 0;
  const delta = direction === 'add' ? amount : -amount;
  const newStock = currentStock + delta;

  const exceedsAvailable = direction === 'remove' && amount > currentStock;
  const canConfirm = !!batchId && amount > 0 && !exceedsAvailable && !!reason && (reason !== 'Other' || otherNote.trim().length > 0);

  function adjustAmount(step: number) {
    setAmount((a) => Math.max(1, a + step));
  }

  async function handleConfirm() {
    if (!canConfirm || !batchId) return;
    setSubmitError(null);
    const note = reason === 'Other' ? otherNote.trim() : reason ?? undefined;
    const result = await inventoryStore.adjustStock({
      batch_id: batchId,
      delta,
      ...(note ? { note } : {}),
    });
    if (result.ok) {
      onSuccess(result.message);
      onClose();
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <BottomSheet isVisible={visible} onClose={onClose} title="Adjust Stock" height={0.88}>
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

        <SelectField
          label="Batch *"
          value={batchId}
          options={inventoryStore.batchOptions}
          onChange={(id) => setBatchId(id)}
          disabled={!!presetBatchId}
          placeholder="Select a batch"
          emptyText="No batches found."
        />

        {batch ? (
          <>
            <Text style={styles.currentStockText}>
              Current stock: <Text style={styles.currentStockValue}>{batch.available_quantity}</Text>
            </Text>

            {/* Direction toggle */}
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segment, direction === 'add' && styles.segmentAdd]}
                activeOpacity={0.85}
                onPress={() => setDirection('add')}
              >
                <Plus size={15} color={direction === 'add' ? Colors.white : Colors.success} />
                <Text style={[styles.segmentText, direction === 'add' && styles.segmentTextActive]}>Add Stock</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segment, direction === 'remove' && styles.segmentRemove]}
                activeOpacity={0.85}
                onPress={() => setDirection('remove')}
              >
                <Minus size={15} color={direction === 'remove' ? Colors.white : Colors.error} />
                <Text style={[styles.segmentText, direction === 'remove' && styles.segmentTextActive]}>Remove Stock</Text>
              </TouchableOpacity>
            </View>

            {/* Stepper */}
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={() => adjustAmount(-1)}>
                <Minus size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{amount}</Text>
              <TouchableOpacity style={styles.stepperBtn} activeOpacity={0.7} onPress={() => adjustAmount(1)}>
                <Plus size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Live preview */}
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Current</Text>
                <Text style={styles.previewValue}>{currentStock}</Text>
              </View>
              <Text style={styles.previewArrow}>→</Text>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Adjustment</Text>
                <Text style={[styles.previewValue, direction === 'add' ? styles.previewAdd : styles.previewRemove]}>
                  {direction === 'add' ? '+' : '-'}
                  {amount}
                </Text>
              </View>
              <Text style={styles.previewArrow}>→</Text>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>New Stock</Text>
                <Text style={[styles.previewValue, styles.previewNew]}>{newStock}</Text>
              </View>
            </View>

            {exceedsAvailable ? (
              <View style={styles.warningBox}>
                <AlertTriangle size={16} color={Colors.error} />
                <Text style={[styles.warningText, { color: Colors.error }]}>
                  Cannot remove more than {currentStock} units (current stock).
                </Text>
              </View>
            ) : null}

            {/* Reason */}
            <Text style={styles.reasonLabel}>Reason for adjustment *</Text>
            <View style={styles.reasonList}>
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.reasonRow}
                  activeOpacity={0.7}
                  onPress={() => setReason(r)}
                >
                  <View style={[styles.radioOuter, reason === r && styles.radioOuterActive]}>
                    {reason === r ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.reasonText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {reason === 'Other' ? (
              <TextField
                label="Specify reason *"
                value={otherNote}
                onChangeText={setOtherNote}
                placeholder="Describe the reason for this adjustment"
                multiline
              />
            ) : null}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText} numberOfLines={1}>
                {inventoryStore.productLabelForVariant(batch.variant_id)}
              </Text>
              <Text style={styles.summaryEquation}>
                {currentStock} → {direction === 'add' ? '+' : '-'}
                {amount} → <Text style={styles.summaryNew}>{newStock}</Text>
              </Text>
            </View>

            <Button
              label="Confirm Adjustment"
              variant={direction === 'remove' ? 'danger' : 'primary'}
              loading={inventoryStore.saving}
              disabled={!canConfirm}
              onPress={() => void handleConfirm()}
            />
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  form: { paddingHorizontal: 20, paddingTop: 12 },
  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  errorBannerText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  currentStockText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14, marginTop: -4 },
  currentStockValue: { fontWeight: '800', color: Colors.textPrimary },

  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  segmentAdd: { backgroundColor: Colors.success, borderColor: Colors.success },
  segmentRemove: { backgroundColor: Colors.error, borderColor: Colors.error },
  segmentText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  segmentTextActive: { color: Colors.white },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, minWidth: 64, textAlign: 'center' },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  previewItem: { alignItems: 'center', flex: 1 },
  previewLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  previewValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  previewAdd: { color: Colors.success },
  previewRemove: { color: Colors.error },
  previewNew: { color: Colors.primary, fontSize: 22 },
  previewArrow: { fontSize: 16, color: Colors.textMuted, marginHorizontal: 2 },

  warningBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '500' },

  reasonLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  reasonList: { gap: 2, marginBottom: 4 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  reasonText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },

  summaryBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  summaryText: { fontSize: 12, fontWeight: '700', color: Colors.primaryDark, marginBottom: 4 },
  summaryEquation: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  summaryNew: { color: Colors.primary },
});
