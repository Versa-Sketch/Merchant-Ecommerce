import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, Switch, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores/RootStore';
import { Colors } from '../../../theme/colors';
import { Shadows } from '../../../theme/shadows';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/bottomSheets/BottomSheet';
import {
  Search,
  Plus,
  Package,
  Calendar,
  AlertTriangle,
  EyeOff,
  History,
  Tag,
  Check,
  TrendingDown,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Grocery', 'Pharmacy', 'Fashion', 'Electronics', 'Restaurants', 'Local Shops'];

export default observer(function ProductsScreen() {
  const { productsStore, inventoryStore } = useStores();
  const [activeSegment, setActiveSegment] = useState<'catalog' | 'inventory' | 'promotions'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Add Product form state
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Grocery');
  const [formMrp, setFormMrp] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formGst, setFormGst] = useState('5');
  const [formStock, setFormStock] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-06-02');
  const [formExpiryDate, setFormExpiryDate] = useState('2026-12-31');
  const [formValidityDate, setFormValidityDate] = useState('2026-12-31');
  const [formShowUntil, setFormShowUntil] = useState('180');

  // Adjust stock overlay state
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'Stock In' | 'Damaged' | 'Returned' | 'Audit Adjustment'>('Stock In');

  // Promotion state
  const [promoName, setPromoName] = useState('');
  const [promoType, setPromoType] = useState('Flash Sale');
  const [promoDiscount, setPromoDiscount] = useState('10');
  const [isPromoVisible, setIsPromoVisible] = useState(false);
  const [promotions, setPromotions] = useState<Array<{ id: string; name: string; type: string; discount: number; active: boolean }>>([
    { id: '1', name: 'Weekend Organic Blowout', type: 'Weekend Sale', discount: 15, active: true },
    { id: '2', name: 'Crocin Pain Relief Coupon', type: 'Coupon Management', discount: 5, active: false },
  ]);

  const handleAddProduct = () => {
    if (!formName || !formMrp || !formSellingPrice || !formStock) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const mrpNum = parseFloat(formMrp);
    const sellingPriceNum = parseFloat(formSellingPrice);
    const stockNum = parseInt(formStock, 10);

    if (sellingPriceNum > mrpNum) {
      Alert.alert('Price Error', 'Selling price cannot exceed MRP.');
      return;
    }

    productsStore.addProduct({
      name: formName,
      description: formDescription,
      category: formCategory,
      mrp: mrpNum,
      sellingPrice: sellingPriceNum,
      gst: parseFloat(formGst),
      stock: stockNum,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
      startDate: formStartDate,
      expiryDate: formExpiryDate,
      validityDate: formValidityDate,
      showUntilDays: parseInt(formShowUntil, 10),
    });

    // Reset Form
    setFormName('');
    setFormDescription('');
    setFormMrp('');
    setFormSellingPrice('');
    setFormStock('');
    setIsAddVisible(false);

    Alert.alert('Success', 'Product successfully added to catalog.');
  };

  const handleAdjustStock = () => {
    if (!adjustProductId || !adjustQty) return;
    const diff = parseInt(adjustQty, 10);
    const product = productsStore.products.find((p) => p.id === adjustProductId);

    if (!product) return;

    let resulting = product.stock + diff;
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

  const handleCreatePromo = () => {
    if (!promoName) return;
    const discountNum = parseInt(promoDiscount, 10);
    const id = (promotions.length + 1).toString();
    setPromotions([...promotions, { id, name: promoName, type: promoType, discount: discountNum, active: true }]);
    setPromoName('');
    setIsPromoVisible(false);
    Alert.alert('Campaign Created', `${promoType} discount campaign created successfully!`);
  };

  const getFilteredProducts = () => {
    return productsStore.products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery);
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredProducts = getFilteredProducts();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Operating System</Text>
        <Text style={styles.subtitle}>{productsStore.products.length} Products registered</Text>
      </View>

      {/* Segment controls */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'catalog' && styles.activeSegmentBtn]}
          onPress={() => setActiveSegment('catalog')}
        >
          <Text style={[styles.segmentText, activeSegment === 'catalog' && styles.activeSegmentText]}>Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'inventory' && styles.activeSegmentBtn]}
          onPress={() => setActiveSegment('inventory')}
        >
          <Text style={[styles.segmentText, activeSegment === 'inventory' && styles.activeSegmentText]}>Stock Adjust</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'promotions' && styles.activeSegmentBtn]}
          onPress={() => setActiveSegment('promotions')}
        >
          <Text style={[styles.segmentText, activeSegment === 'promotions' && styles.activeSegmentText]}>Offers</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Areas */}
      {activeSegment === 'catalog' ? (
        <View style={{ flex: 1 }}>
          {/* Search & Category filter */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBox}>
              <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search products by title or ID..."
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
              />
            </View>
          </View>

          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroller}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, selectedCategory === cat && styles.activeCatPill]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catPillText, selectedCategory === cat && styles.activeCatPillText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Product Cards */}
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Package size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySub}>No products match your current filters.</Text>
              </View>
            ) : (
              filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productDetails}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryBadge}>{product.category}</Text>
                      <Text style={[styles.stockStatusBadge, {
                        color: product.status === 'Active' ? Colors.success : product.status === 'Low Stock' ? Colors.warning : Colors.error,
                        backgroundColor: product.status === 'Active' ? 'rgba(34, 181, 115, 0.08)' : product.status === 'Low Stock' ? 'rgba(242, 169, 59, 0.08)' : 'rgba(229, 72, 77, 0.08)'
                      }]}>
                        {product.status === 'Active' ? 'In Stock' : product.status === 'Hidden' ? 'Hidden' : product.status}
                      </Text>
                    </View>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.sellingPrice}>₹{product.sellingPrice}</Text>
                      <Text style={styles.mrpPrice}>MRP ₹{product.mrp}</Text>
                      <Text style={styles.gstText}>GST {product.gst}%</Text>
                    </View>

                    {/* Dates Display section (MANDATORY REQUIREMENT) */}
                    <View style={styles.dateBlock}>
                      <View style={styles.dateRow}>
                        <Calendar size={10} color={Colors.textSecondary} />
                        <Text style={styles.dateLabel}>Start: {product.startDate}</Text>
                        <Text style={styles.dateLabel}>• Exp: {product.expiryDate}</Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Text style={styles.dateLabel}>Val: {product.validityDate} ({product.showUntilDays} days)</Text>
                      </View>
                    </View>

                    <View style={styles.stockBlock}>
                      <Text style={styles.stockCountText}>Units Left: <Text style={styles.stockBold}>{product.stock}</Text></Text>
                      <TouchableOpacity
                        style={styles.hideToggle}
                        onPress={() => productsStore.toggleHideProduct(product.id)}
                      >
                        <EyeOff size={14} color={product.status === 'Hidden' ? Colors.error : Colors.textSecondary} />
                        <Text style={[styles.hideToggleText, { color: product.status === 'Hidden' ? Colors.error : Colors.textSecondary }]}>
                          {product.status === 'Hidden' ? 'Show Product' : 'Hide'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsAddVisible(true)}
            activeOpacity={0.8}
          >
            <Plus color={Colors.white} size={24} />
          </TouchableOpacity>
        </View>
      ) : activeSegment === 'inventory' ? (
        <ScrollView contentContainerStyle={styles.inventoryContainer} showsVerticalScrollIndicator={false}>
          {/* Summary tiles */}
          <View style={styles.statsSummaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Active</Text>
              <Text style={[styles.summaryVal, { color: Colors.primary }]}>{productsStore.activeProducts.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Low Stock</Text>
              <Text style={[styles.summaryVal, { color: Colors.warning }]}>{productsStore.lowStockProducts.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Out of Stock</Text>
              <Text style={[styles.summaryVal, { color: Colors.error }]}>{productsStore.outOfStockProducts.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Hidden Items</Text>
              <Text style={[styles.summaryVal, { color: Colors.textSecondary }]}>{productsStore.hiddenProducts.length}</Text>
            </View>
          </View>

          {/* Stock adjustments quick adjust list */}
          <Text style={styles.sectionHeaderTitle}>Real-time Stock Levels</Text>
          {productsStore.products.map((product) => (
            <View key={product.id} style={styles.adjustStockCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.adjustProductName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.adjustProductStock}>Current units: {product.stock}</Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: Colors.border }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('-5');
                    setAdjustType('Damaged');
                  }}
                >
                  <Text style={styles.qtyControlText}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.qtyControlBtn, { backgroundColor: Colors.border }]}
                  onPress={() => {
                    setAdjustProductId(product.id);
                    setAdjustQty('10');
                    setAdjustType('Stock In');
                  }}
                >
                  <Text style={styles.qtyControlText}>+10</Text>
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
              </View>
            </View>
          ))}

          {/* Low Stock Alerts */}
          <View style={styles.sectionHeaderRow}>
            <AlertTriangle color={Colors.warning} size={16} />
            <Text style={styles.sectionHeaderTitle}>Low Stock Warnings</Text>
          </View>
          {inventoryStore.alerts.length === 0 ? (
            <Text style={styles.emptySectionText}>No active low stock alerts.</Text>
          ) : (
            inventoryStore.alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View>
                  <Text style={styles.alertProduct}>{alert.productName}</Text>
                  <Text style={styles.alertInfo}>Units left: {alert.currentStock} (Threshold: {alert.threshold})</Text>
                </View>
                <Button
                  label="Quick Refill (+20)"
                  variant="outline"
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
                  }}
                />
              </View>
            ))
          )}

          {/* Adjustments history */}
          <View style={styles.sectionHeaderRow}>
            <History color={Colors.primary} size={16} />
            <Text style={styles.sectionHeaderTitle}>Inventory History Audit Log</Text>
          </View>
          {inventoryStore.adjustments.map((adj) => (
            <View key={adj.id} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyText}>
                  {adj.productName} adjusted by {adj.qtyChanged > 0 ? '+' : ''}
                  {adj.qtyChanged} ({adj.type})
                </Text>
                <Text style={styles.historySub}>Result: {adj.resultingQty} units • {adj.date}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.promotionsContainer} showsVerticalScrollIndicator={false}>
          {/* Active Campaigns */}
          <View style={styles.promoHeaderRow}>
            <Tag color={Colors.copper} size={18} />
            <Text style={styles.sectionHeaderTitle}>Discount Campaigns</Text>
          </View>
          {promotions.map((p) => (
            <View key={p.id} style={styles.promoCard}>
              <View>
                <Text style={styles.promoNameText}>{p.name}</Text>
                <Text style={styles.promoTypeText}>{p.type} • Flat {p.discount}% OFF</Text>
              </View>
              <View style={[styles.promoStatusPill, { backgroundColor: p.active ? 'rgba(34, 181, 115, 0.1)' : 'rgba(102, 112, 133, 0.1)' }]}>
                <Text style={[styles.promoStatusText, { color: p.active ? Colors.success : Colors.textSecondary }]}>
                  {p.active ? 'Active' : 'Expired'}
                </Text>
              </View>
            </View>
          ))}

          <Button
            label="Create New Promotion Campaign"
            variant="secondary"
            onPress={() => setIsPromoVisible(true)}
            style={{ marginTop: 24 }}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Add Product Bottom Sheet */}
      <BottomSheet
        isVisible={isAddVisible}
        onClose={() => setIsAddVisible(false)}
        title="Add New Catalog Product"
        height={0.9}
      >
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
          <Text style={styles.formLabel}>Product Name *</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. Fresh Mangoes Dashahri 1kg"
            placeholderTextColor={Colors.textSecondary}
            style={styles.formInput}
          />

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Add product highlights, sizing, or storage instructions"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
          />

          <View style={styles.formGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Category *</Text>
              <TextInput
                value={formCategory}
                onChangeText={setFormCategory}
                placeholder="Grocery / Pharmacy"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Initial Stock *</Text>
              <TextInput
                value={formStock}
                onChangeText={setFormStock}
                placeholder="50"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>MRP (₹) *</Text>
              <TextInput
                value={formMrp}
                onChangeText={setFormMrp}
                placeholder="200"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Selling Price (₹) *</Text>
              <TextInput
                value={formSellingPrice}
                onChangeText={setFormSellingPrice}
                placeholder="160"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 0.8 }}>
              <Text style={styles.formLabel}>GST (%) *</Text>
              <TextInput
                value={formGst}
                onChangeText={setFormGst}
                placeholder="5"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
          </View>

          {/* Date Management Inputs (MANDATORY REQUIREMENT) */}
          <Text style={styles.formSectionTitle}>Validity & Expiration Dates</Text>

          <View style={styles.formGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Start Date</Text>
              <TextInput
                value={formStartDate}
                onChangeText={setFormStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Expiry Date</Text>
              <TextInput
                value={formExpiryDate}
                onChangeText={setFormExpiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Validity Date</Text>
              <TextInput
                value={formValidityDate}
                onChangeText={setFormValidityDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Show Until Days</Text>
              <TextInput
                value={formShowUntil}
                onChangeText={setFormShowUntil}
                placeholder="180"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
          </View>

          <Button
            label="Save & Add Product"
            variant="primary"
            onPress={handleAddProduct}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </BottomSheet>

      {/* Adjust Stock Manual Bottom Sheet */}
      <BottomSheet
        isVisible={adjustProductId !== null}
        onClose={() => setAdjustProductId(null)}
        title="Record Manual Inventory Audit"
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
            label="Post Stock Adjustment"
            variant="primary"
            onPress={handleAdjustStock}
            style={{ marginTop: 24 }}
          />
        </View>
      </BottomSheet>

      {/* Create Promotion Bottom Sheet */}
      <BottomSheet
        isVisible={isPromoVisible}
        onClose={() => setIsPromoVisible(false)}
        title="Create Discount Campaign"
        height={0.5}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.formLabel}>Campaign / Coupon Name</Text>
          <TextInput
            value={promoName}
            onChangeText={setPromoName}
            placeholder="e.g. Monsoon Grocery Special"
            placeholderTextColor={Colors.textSecondary}
            style={styles.formInput}
          />

          <View style={styles.formGrid}>
            <View style={{ flex: 1.2 }}>
              <Text style={styles.formLabel}>Campaign Type</Text>
              <TextInput
                value={promoType}
                onChangeText={setPromoType}
                placeholder="Flash Sale / Festival Campaign"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
            <View style={{ flex: 0.8 }}>
              <Text style={styles.formLabel}>Discount (%)</Text>
              <TextInput
                value={promoDiscount}
                onChangeText={setPromoDiscount}
                placeholder="15"
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
                style={styles.formInput}
              />
            </View>
          </View>

          <Button
            label="Publish Campaign"
            variant="secondary"
            onPress={handleCreatePromo}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 112, 133, 0.05)',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeSegmentBtn: {
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeSegmentText: {
    color: Colors.primary,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    ...Shadows.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  categoryScroller: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCatPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeCatPillText: {
    color: Colors.white,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
    gap: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    backgroundColor: 'rgba(102, 112, 133, 0.08)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  stockStatusBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  sellingPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  mrpPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  gstText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateBlock: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 231, 236, 0.5)',
    paddingTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 1,
  },
  dateLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stockBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stockCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stockBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  hideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hideToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    backgroundColor: Colors.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.strong,
    zIndex: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    padding: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 4,
  },
  inventoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    borderRadius: 14,
    alignItems: 'center',
    ...Shadows.soft,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  adjustStockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 4,
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
  adjustControls: {
    flexDirection: 'row',
    gap: 6,
  },
  qtyControlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyControlText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 169, 59, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242, 169, 59, 0.2)',
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
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
  emptySectionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  historyText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  historySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  reasonTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  reasonPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
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
  promotionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  promoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    borderRadius: 18,
    marginVertical: 6,
    ...Shadows.soft,
  },
  promoNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  promoTypeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  promoStatusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  promoStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
