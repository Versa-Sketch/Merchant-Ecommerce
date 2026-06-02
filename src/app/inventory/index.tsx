import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/bottomSheets/BottomSheet';
import {
  ArrowLeft,
  AlertTriangle,
  History,
  Plus,
  PlusCircle,
  TrendingDown,
  Search,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default observer(function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { productsStore, inventoryStore } = useStores();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Custom stock adjustment form
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment'>('Stock In');

  const handleAdjustStock = () => {
    if (!adjustProductId || !adjustQty) return;
    const diff = parseInt(adjustQty, 10);
    if (isNaN(diff)) {
      Alert.alert('Invalid Quantity', 'Please enter a valid integer.');
      return;
    }
    const product = productsStore.products.find((p) => p.id === adjustProductId);
    if (!product) return;

    const resulting = product.stock + diff;
    if (resulting < 0) {
      Alert.alert('Adjustment Error', 'Stock level cannot fall below zero.');
      return;
    }

    // Save adjustment record
    inventoryStore.recordAdjustment({
      productId: product.id,
      productName: product.name,
      type: adjustType,
      qtyChanged: diff,
      resultingQty: resulting,
    });

    // Update main product stock
    productsStore.adjustStock(product.id, resulting);
    setAdjustProductId(null);
    setAdjustQty('');
    Alert.alert('Stock Adjusted', 'Inventory level has been updated.');
  };

  const getFilteredProducts = () => {
    return productsStore.products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery)
    );
  };

  const filteredProducts = getFilteredProducts();
  const selectedProduct = productsStore.products.find((p) => p.id === adjustProductId);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Inventory Manager</Text>
          <Text style={styles.subtitle}>Audit logs, adjustments & low stock warnings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary tiles */}
        <View style={styles.statsSummaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Products</Text>
            <Text style={[styles.summaryVal, { color: Colors.primary }]}>{productsStore.products.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Low Stock</Text>
            <Text style={[styles.summaryVal, { color: Colors.warning }]}>{productsStore.lowStockProducts.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Out of Stock</Text>
            <Text style={[styles.summaryVal, { color: Colors.error }]}>{productsStore.outOfStockProducts.length}</Text>
          </View>
        </View>

        {/* Low Stock Alerts */}
        <View style={styles.sectionHeaderRow}>
          <AlertTriangle color={Colors.warning} size={16} />
          <Text style={styles.sectionHeaderTitle}>Low Stock Warnings</Text>
        </View>
        {inventoryStore.alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>All products are well stocked. No active warnings.</Text>
          </View>
        ) : (
          inventoryStore.alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.alertProduct}>{alert.productName}</Text>
                <Text style={styles.alertInfo}>Units left: <Text style={styles.boldText}>{alert.currentStock}</Text> (Threshold: {alert.threshold})</Text>
              </View>
              <Button
                label="Refill (+20)"
                variant="primary"
                size="sm"
                onPress={() => {
                  productsStore.adjustStock(alert.productId, alert.currentStock + 20);
                  inventoryStore.recordAdjustment({
                    productId: alert.productId,
                    productName: alert.productName,
                    type: 'Stock In',
                    qtyChanged: 20,
                    resultingQty: alert.currentStock + 20,
                  });
                  inventoryStore.dismissAlert(alert.id);
                  Alert.alert('Refill Success', `Added 20 units to ${alert.productName}`);
                }}
              />
            </View>
          ))
        )}

        {/* Stock levels and search */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionHeaderTitle}>Stock List & Quick Adjustments</Text>
        </View>

        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search stock list..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.productStockList}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.adjustStockCard}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.adjustProductName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.adjustProductStock}>Current stock: <Text style={styles.stockCountText}>{product.stock}</Text></Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: 'rgba(229, 72, 77, 0.08)' }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('-5');
                    setAdjustType('Damaged');
                  }}
                >
                  <Text style={[styles.qtyControlText, { color: Colors.error }]}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: 'rgba(34, 181, 115, 0.08)' }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('10');
                    setAdjustType('Stock In');
                  }}
                >
                  <Text style={[styles.qtyControlText, { color: Colors.success }]}>+10</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('1');
                    setAdjustType('Stock In');
                  }}
                >
                  <Text style={[styles.qtyControlText, { color: Colors.white }]}>+1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: Colors.border }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('');
                    setAdjustType('Audit Adjustment');
                  }}
                >
                  <Text style={[styles.qtyControlText, { color: Colors.textPrimary }]}>Audit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Audit Log */}
        <View style={styles.sectionHeaderRow}>
          <History color={Colors.primary} size={16} />
          <Text style={styles.sectionHeaderTitle}>Inventory History Audit Log</Text>
        </View>
        <View style={styles.historyCard}>
          {inventoryStore.adjustments.map((adj, index) => (
            <View key={adj.id} style={[styles.historyRow, index === inventoryStore.adjustments.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.historyDot, { backgroundColor: adj.qtyChanged > 0 ? Colors.success : Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyText}>
                  {adj.productName} adjusted by {adj.qtyChanged > 0 ? '+' : ''}{adj.qtyChanged} units
                </Text>
                <Text style={styles.historySub}>Reason: {adj.type} • Result: {adj.resultingQty} left</Text>
              </View>
              <Text style={styles.historyDate}>{adj.date}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Adjust Stock Custom Bottom Sheet */}
      <BottomSheet
        isVisible={adjustProductId !== null}
        onClose={() => setAdjustProductId(null)}
        title={selectedProduct ? `Audit: ${selectedProduct.name}` : 'Record Manual Audit'}
        height={0.5}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.formLabel}>Quantity to Adjust (Positive to add, Negative to remove)</Text>
          <TextInput
            value={adjustQty}
            onChangeText={setAdjustQty}
            placeholder="e.g. 15 or -3"
            keyboardType="numeric"
            placeholderTextColor={Colors.textSecondary}
            style={styles.formInput}
          />

          <Text style={styles.formLabel}>Adjustment Reason</Text>
          <View style={styles.reasonTabs}>
            {(['Stock In', 'Damaged', 'Returned', 'Audit Adjustment'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonPill, adjustType === r && styles.activeReasonPill]}
                onPress={() => setAdjustType(r)}
              >
                <Text style={[styles.reasonPillText, adjustType === r && styles.activeReasonPillText]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Save Audit Adjustment"
            variant="primary"
            onPress={handleAdjustStock}
            style={{ marginTop: 24 }}
          />
        </View>
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(242, 169, 59, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(242, 169, 59, 0.3)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    ...Shadows.soft,
  },
  alertProduct: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  alertInfo: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.error,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
    ...Shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  productStockList: {
    gap: 8,
    marginBottom: 20,
  },
  adjustStockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    padding: 12,
    borderRadius: 18,
    ...Shadows.soft,
  },
  adjustProductName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  adjustProductStock: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stockCountText: {
    fontWeight: '800',
    color: Colors.primary,
  },
  adjustControls: {
    flexDirection: 'row',
    gap: 4,
  },
  qtyControlBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  qtyControlText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    paddingHorizontal: 14,
    ...Shadows.soft,
    marginBottom: 20,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  historyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 9,
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sheetContent: {
    padding: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  reasonTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeReasonPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reasonPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeReasonPillText: {
    color: Colors.white,
  },
});
