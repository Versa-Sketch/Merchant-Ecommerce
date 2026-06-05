import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { ArrowLeft, AlertTriangle, History, Search } from 'lucide-react-native';
import styles from './styles';

export default observer(function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { productsStore, inventoryStore } = useStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment'>('Stock In');

  const handleAdjustStock = () => {
    if (!adjustProductId || !adjustQty) return;
    const diff = parseInt(adjustQty, 10);
    if (isNaN(diff)) { Alert.alert('Invalid Quantity', 'Please enter a valid integer.'); return; }
    const product = productsStore.products.find((p) => p.id === adjustProductId);
    if (!product) return;
    const resulting = product.stock + diff;
    if (resulting < 0) { Alert.alert('Adjustment Error', 'Stock level cannot fall below zero.'); return; }
    inventoryStore.recordAdjustment({ productId: product.id, productName: product.name, type: adjustType, qtyChanged: diff, resultingQty: resulting });
    productsStore.adjustStock(product.id, resulting);
    setAdjustProductId(null);
    setAdjustQty('');
    Alert.alert('Stock Adjusted', 'Inventory level has been updated.');
  };

  const filteredProducts = productsStore.products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery)
  );

  const selectedProduct = productsStore.products.find((p) => p.id === adjustProductId);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
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
        <View style={styles.statsSummaryGrid}>
          {[
            { label: 'Total Products', val: productsStore.products.length, color: Colors.primary },
            { label: 'Low Stock', val: productsStore.lowStockProducts.length, color: Colors.warning },
            { label: 'Out of Stock', val: productsStore.outOfStockProducts.length, color: Colors.error },
          ].map(({ label, val, color }) => (
            <View key={label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={[styles.summaryVal, { color }]}>{val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <AlertTriangle color={Colors.warning} size={16} />
          <Text style={styles.sectionHeaderTitle}>Low Stock Warnings</Text>
        </View>
        {inventoryStore.alerts.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>All products are well stocked. No active warnings.</Text></View>
        ) : (
          inventoryStore.alerts.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.alertProduct}>{alert.productName}</Text>
                <Text style={styles.alertInfo}>Units left: <Text style={styles.boldText}>{alert.currentStock}</Text> (Threshold: {alert.threshold})</Text>
              </View>
              <Button label="Refill (+20)" variant="primary" size="sm"
                onPress={() => {
                  productsStore.adjustStock(alert.productId, alert.currentStock + 20);
                  inventoryStore.recordAdjustment({ productId: alert.productId, productName: alert.productName, type: 'Stock In', qtyChanged: 20, resultingQty: alert.currentStock + 20 });
                  inventoryStore.dismissAlert(alert.id);
                  Alert.alert('Refill Success', `Added 20 units to ${alert.productName}`);
                }}
              />
            </View>
          ))
        )}

        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionHeaderTitle}>Stock List & Quick Adjustments</Text>
        </View>

        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search stock list..." placeholderTextColor={Colors.textSecondary} style={styles.searchInput} />
        </View>

        <View style={styles.productStockList}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.adjustStockCard}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.adjustProductName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.adjustProductStock}>Current stock: <Text style={styles.stockCountText}>{product.stock}</Text></Text>
              </View>
              <View style={styles.adjustControls}>
                {[{ label: '-5', qty: '-5', type: 'Damaged' as const, bg: 'rgba(229, 72, 77, 0.08)', color: Colors.error },
                  { label: '+10', qty: '10', type: 'Stock In' as const, bg: 'rgba(34, 181, 115, 0.08)', color: Colors.success },
                  { label: '+1', qty: '1', type: 'Stock In' as const, bg: Colors.primary, color: Colors.white },
                  { label: 'Audit', qty: '', type: 'Audit Adjustment' as const, bg: Colors.border, color: Colors.textPrimary },
                ].map(({ label, qty, type, bg, color }) => (
                  <TouchableOpacity key={label} style={[styles.qtyControlBtn, { backgroundColor: bg }]} onPress={() => { setAdjustProductId(product.id); setAdjustQty(qty); setAdjustType(type); }}>
                    <Text style={[styles.qtyControlText, { color }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <History color={Colors.primary} size={16} />
          <Text style={styles.sectionHeaderTitle}>Inventory History Audit Log</Text>
        </View>
        <View style={styles.historyCard}>
          {inventoryStore.adjustments.map((adj, index) => (
            <View key={adj.id} style={[styles.historyRow, index === inventoryStore.adjustments.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.historyDot, { backgroundColor: adj.qtyChanged > 0 ? Colors.success : Colors.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyText}>{adj.productName} adjusted by {adj.qtyChanged > 0 ? '+' : ''}{adj.qtyChanged} units</Text>
                <Text style={styles.historySub}>Reason: {adj.type} • Result: {adj.resultingQty} left</Text>
              </View>
              <Text style={styles.historyDate}>{adj.date}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomSheet isVisible={adjustProductId !== null} onClose={() => setAdjustProductId(null)} title={selectedProduct ? `Audit: ${selectedProduct.name}` : 'Record Manual Audit'} height={0.5}>
        <View style={styles.sheetContent}>
          <Text style={styles.formLabel}>Quantity to Adjust (Positive to add, Negative to remove)</Text>
          <TextInput value={adjustQty} onChangeText={setAdjustQty} placeholder="e.g. 15 or -3" keyboardType="numeric" placeholderTextColor={Colors.textSecondary} style={styles.formInput} />
          <Text style={styles.formLabel}>Adjustment Reason</Text>
          <View style={styles.reasonTabs}>
            {(['Stock In', 'Damaged', 'Returned', 'Audit Adjustment'] as const).map((r) => (
              <TouchableOpacity key={r} style={[styles.reasonPill, adjustType === r && styles.activeReasonPill]} onPress={() => setAdjustType(r)}>
                <Text style={[styles.reasonPillText, adjustType === r && styles.activeReasonPillText]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button label="Save Audit Adjustment" variant="primary" onPress={handleAdjustStock} style={{ marginTop: 24 }} />
        </View>
      </BottomSheet>
    </View>
  );
});
