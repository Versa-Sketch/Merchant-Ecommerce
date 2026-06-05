import {
  Box,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { Badge } from '../../components/ui/MerchantPrimitives';
import type { Product } from '../Models/Product';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { ALL_CATEGORIES, CATEGORIES, GST_OPTIONS, UNIT_OPTIONS } from '../Constants/categories';
import styles from './styles';

function getStatusMeta(status: string) {
  if (status === 'Active') return { color: Colors.success, label: 'In Stock' };
  if (status === 'Low Stock') return { color: Colors.warning, label: 'Low Stock' };
  if (status === 'Out Of Stock') return { color: Colors.error, label: 'Out of Stock' };
  if (status === 'Hidden') return { color: Colors.textMuted, label: 'Hidden' };
  return { color: Colors.textMuted, label: status };
}

const ProductCard = observer(function ProductCard({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: (p: Product) => void;
}) {
  const { productsStore } = useStores();
  const { color: statusColor, label: statusLabel } = getStatusMeta(product.status);
  const discountPct = product.mrp > 0 ? Math.round((1 - product.sellingPrice / product.mrp) * 100) : 0;
  const soldEstimate = Math.max(0, Math.floor(product.stock * 0.3 + 12));

  function openActions() {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Edit', 'Restock', 'Hide / Show', 'Delete'], destructiveButtonIndex: 4, cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) onEdit(product);
          if (idx === 3) productsStore.toggleHideProduct(product.id);
          if (idx === 4) {
            Alert.alert('Delete product', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => productsStore.deleteProduct(product.id) },
            ]);
          }
        },
      );
    } else {
      Alert.alert('Actions', product.name, [
        { text: 'Edit', onPress: () => onEdit(product) },
        { text: product.status === 'Hidden' ? 'Show' : 'Hide', onPress: () => productsStore.toggleHideProduct(product.id) },
        { text: 'Delete', style: 'destructive', onPress: () => productsStore.deleteProduct(product.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  return (
    <View style={[styles.productCard, { borderRadius: 12 }]}>
      <View style={styles.productImgWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImg} />
        ) : (
          <View style={[styles.productImg, styles.productImgPlaceholder]}>
            <Box size={20} color={Colors.border} />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productNameRow}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <TouchableOpacity onPress={openActions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MoreVertical size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.productCat}>{product.category}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{product.sellingPrice}</Text>
          {product.mrp > product.sellingPrice && <Text style={styles.productMrp}>₹{product.mrp}</Text>}
          {discountPct > 0 && (
            <View style={styles.discountChip}>
              <Text style={styles.discountChipText}>{discountPct}% off</Text>
            </View>
          )}
        </View>
        <View style={styles.productMetaRow}>
          <Text style={styles.productStock}>{product.stock} units</Text>
          <View style={styles.dot} />
          <TrendingUp size={10} color={Colors.textMuted} />
          <Text style={styles.productSold}>{soldEstimate} sold / wk</Text>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}16` }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

function SelectField({ label, value, options, onChange, error, placeholder }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.fieldInput, styles.fieldInputRow, error ? styles.fieldInputError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]}>{value || placeholder || 'Select…'}</Text>
        <ChevronDown size={15} color={Colors.textMuted} />
      </TouchableOpacity>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.pickerRow, opt === value && styles.pickerRowActive]}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={[styles.pickerRowText, opt === value && styles.pickerRowTextActive]}>{opt}</Text>
                {opt === value && <Check size={15} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function TextField({ label, value, onChangeText, placeholder, keyboardType, multiline, error, hint, prefix, editable }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
  keyboardType?: any; multiline?: boolean; error?: string; hint?: string; prefix?: string; editable?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldInput, multiline ? styles.fieldInputMulti : null, error ? styles.fieldInputError : null]}>
        {prefix ? <Text style={styles.fieldPrefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={editable !== false}
          style={[styles.fieldTextInput, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
        />
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

function FormSectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.formSectionLabelWrap}>
      <Text style={styles.formSectionLabel}>{text.toUpperCase()}</Text>
    </View>
  );
}

const EMPTY_ERRORS: Record<string, string> = {};

const ProductModal = observer(function ProductModal({
  visible, editingProduct, onClose, onSuccess,
}: {
  visible: boolean; editingProduct: Product | null; onClose: () => void; onSuccess: (msg: string) => void;
}) {
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();
  const isEditing = editingProduct !== null;
  const [loading, setLoading] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(EMPTY_ERRORS);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [gst, setGst] = useState('5');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [expiryDate, setExpiryDate] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [showInCatalog, setShowInCatalog] = useState(true);
  const [allowBargain, setAllowBargain] = useState(true);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setSku(editingProduct.id);
      setDescription(editingProduct.description);
      setSellingPrice(String(editingProduct.sellingPrice));
      setMrp(String(editingProduct.mrp));
      setGst(String(editingProduct.gst));
      setStock(String(editingProduct.stock));
      setExpiryDate(editingProduct.expiryDate);
      setShowInCatalog(editingProduct.status !== 'Hidden');
    } else {
      setName(''); setCategory('Grocery'); setSku(''); setDescription('');
      setSellingPrice(''); setMrp(''); setGst('5'); setStock('');
      setUnit('pieces'); setExpiryDate(''); setLowStockThreshold('10');
      setShowInCatalog(true); setAllowBargain(true);
    }
    setErrors(EMPTY_ERRORS);
    setLoading(false);
  }, [editingProduct, visible]);

  const discountPct = useMemo(() => {
    const sp = Number(sellingPrice), mp = Number(mrp);
    if (sp > 0 && mp > 0 && mp >= sp) return Math.round((1 - sp / mp) * 100);
    return 0;
  }, [sellingPrice, mrp]);

  const mrpWarning = mrp && sellingPrice && Number(mrp) > 0 && Number(sellingPrice) > Number(mrp)
    ? 'MRP should be higher than selling price' : '';

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Required';
    if (!category) errs.category = 'Required';
    if (!sellingPrice.trim()) errs.sellingPrice = 'Required';
    if (!stock.trim()) errs.stock = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate() || mrpWarning) return;
    setLoading(true);
    setTimeout(() => {
      const sp = Number(sellingPrice), mp = Number(mrp) || sp;
      const st = parseInt(stock, 10);
      if (isEditing && editingProduct) {
        editingProduct.updateDetails({ name: name.trim(), description: description.trim(), category, mrp: mp, sellingPrice: sp, gst: Number(gst), stock: st, expiryDate: expiryDate || editingProduct.expiryDate });
        if (!showInCatalog && editingProduct.status !== 'Hidden') editingProduct.toggleHide();
        else if (showInCatalog && editingProduct.status === 'Hidden') editingProduct.toggleHide();
        else editingProduct.updateStock(st);
      } else {
        productsStore.addProduct({ name: name.trim(), description: description.trim(), category, mrp: mp, sellingPrice: sp, gst: Number(gst), stock: st, image: '', startDate: '2026-06-03', expiryDate: expiryDate || '2026-12-31', validityDate: expiryDate || '2026-12-31', showUntilDays: 180 });
      }
      setLoading(false);
      onClose();
      onSuccess(isEditing ? 'Product updated ✓' : 'Product saved ✓');
    }, 900);
  }

  function handleDelete() {
    setDeleteSheetOpen(false);
    if (editingProduct) { productsStore.deleteProduct(editingProduct.id); onClose(); onSuccess('Product deleted'); }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.surface }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalHeader, { paddingTop: Math.max(insets.top + 4, 20) }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Product' : 'Add Product'}</Text>
          <TouchableOpacity style={[styles.modalSaveSmall, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.modalSaveSmallText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.imageSectionWrap}>
            {isEditing && editingProduct?.image ? (
              <View style={styles.imageEditWrap}>
                <Image source={{ uri: editingProduct.image }} style={styles.imagePreview} />
                <View style={styles.imageEditOverlay}><Camera size={14} color={Colors.white} /></View>
              </View>
            ) : (
              <TouchableOpacity style={styles.imageUploadBox} activeOpacity={0.75}>
                <Camera size={22} color={Colors.textMuted} />
                <Text style={styles.imageUploadLabel}>Add photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <FormSectionLabel text="Basic info" />
          <TextField label="Product name *" value={name} onChangeText={setName} placeholder="e.g. Organic Roma Tomatoes 1kg" error={errors.name} />
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}><SelectField label="Category *" value={category} options={CATEGORIES} onChange={setCategory} error={errors.category} /></View>
            <View style={{ flex: 1 }}><TextField label="SKU" value={sku} onChangeText={setSku} placeholder="Auto-generated" editable={!isEditing} hint={isEditing ? undefined : 'Auto-generated if blank'} /></View>
          </View>
          <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Notes visible to customers…" multiline />

          <FormSectionLabel text="Pricing" />
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}><TextField label="Selling price *" value={sellingPrice} onChangeText={setSellingPrice} placeholder="60" keyboardType="numeric" prefix="₹" error={errors.sellingPrice} /></View>
            <View style={{ flex: 1 }}><TextField label="MRP" value={mrp} onChangeText={setMrp} placeholder="80" keyboardType="numeric" prefix="₹" /></View>
          </View>
          {mrpWarning ? <View style={styles.warningBanner}><Text style={styles.warningText}>{mrpWarning}</Text></View> : null}
          {discountPct > 0 && !mrpWarning ? <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>{discountPct}% discount applied</Text></View> : null}
          <View style={{ width: '50%' }}><SelectField label="GST %" value={gst} options={GST_OPTIONS} onChange={setGst} /></View>

          <FormSectionLabel text="Inventory" />
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}><TextField label="Stock quantity *" value={stock} onChangeText={setStock} placeholder="50" keyboardType="numeric" error={errors.stock} hint={`Alert below ${lowStockThreshold} units`} /></View>
            <View style={{ flex: 1 }}><SelectField label="Unit" value={unit} options={UNIT_OPTIONS} onChange={setUnit} /></View>
          </View>
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}><TextField label="Expiry date" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" /></View>
            <View style={{ flex: 1 }}><TextField label="Low stock below" value={lowStockThreshold} onChangeText={setLowStockThreshold} placeholder="10" keyboardType="numeric" /></View>
          </View>

          <FormSectionLabel text="Visibility" />
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}><Text style={styles.toggleTitle}>Show in catalog</Text><Text style={styles.toggleSub}>Visible to customers</Text></View>
            <Switch value={showInCatalog} onValueChange={setShowInCatalog} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1 }}><Text style={styles.toggleTitle}>Allow bargaining</Text><Text style={styles.toggleSub}>Customers can negotiate</Text></View>
            <Switch value={allowBargain} onValueChange={setAllowBargain} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.white} />
          </View>

          {isEditing ? <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteSheetOpen(true)}><Text style={styles.deleteBtnText}>Delete product</Text></TouchableOpacity> : null}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet isVisible={deleteSheetOpen} onClose={() => setDeleteSheetOpen(false)} title="Delete product?" height={0.3}>
        <View style={styles.deleteSheet}>
          <Text style={styles.deleteSheetSub}>This cannot be undone. The product will be removed from your catalog permanently.</Text>
          <View style={styles.deleteSheetActions}>
            <TouchableOpacity style={styles.cancelSheetBtn} onPress={() => setDeleteSheetOpen(false)}>
              <Text style={styles.cancelSheetText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDelete}>
              <Text style={styles.confirmDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </Modal>
  );
});

export default observer(function ProductsScreen() {
  const { productsStore, inventoryStore } = useStores();
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState<'catalog' | 'stock' | 'offers'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listOpacity = useRef(new Animated.Value(1)).current;

  function openCreate() { setEditingProduct(null); setModalVisible(true); }
  function openEdit(p: Product) { setEditingProduct(p); setModalVisible(true); }
  function closeModal() { setModalVisible(false); setEditingProduct(null); }
  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message: msg });
    toastTimer.current = setTimeout(() => setToast({ visible: false, message: '' }), 2500);
  }

  function changeCategory(cat: string) {
    Animated.timing(listOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setSelectedCategory(cat);
      Animated.timing(listOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  const filteredProducts = useMemo(
    () => productsStore.products.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    }),
    [productsStore.products.length, searchQuery, selectedCategory],
  );

  const lowCount = productsStore.lowStockProducts.length;
  const outCount = productsStore.outOfStockProducts.length;
  const alertCount = lowCount + outCount;
  const healthyCount = productsStore.activeProducts.length;

  const SEGMENTS = [
    { key: 'catalog', label: 'Catalog' },
    { key: 'stock', label: 'Stock' },
    { key: 'offers', label: 'Offers' },
  ] as const;

  return (
    <AnimatedScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>
              {productsStore.products.length} items{alertCount > 0 ? ` · ${alertCount} need attention` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerSearchBtn} activeOpacity={0.75}>
            <Search size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate} activeOpacity={0.85}>
            <Plus size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {toast.visible && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      <View style={styles.segmentWrap}>
        {SEGMENTS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.segmentTab, activeSegment === key && styles.segmentTabActive]}
            onPress={() => setActiveSegment(key as any)}
            activeOpacity={0.75}
          >
            <Text style={[styles.segmentText, activeSegment === key && styles.segmentTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeSegment === 'catalog' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Search size={15} color={Colors.textMuted} />
              <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search products or SKU…" placeholderTextColor={Colors.textMuted} style={styles.searchInput} />
              {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><X size={14} color={Colors.textMuted} /></TouchableOpacity> : null}
            </View>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.75}>
              <SlidersHorizontal size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {alertCount > 0 && searchQuery === '' && selectedCategory === 'All' && (
            <TouchableOpacity style={styles.alertBanner} activeOpacity={0.8}>
              <View style={styles.alertBannerLeft}>
                <View style={[styles.healthDot, { backgroundColor: Colors.warning, width: 8, height: 8 }]} />
                <Text style={styles.alertBannerText}>{alertCount} product{alertCount > 1 ? 's' : ''} need restocking</Text>
              </View>
              <ChevronRight size={14} color={Colors.warning} />
            </TouchableOpacity>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRail} contentContainerStyle={styles.chipsScroll}>
            {ALL_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => changeCategory(cat)} activeOpacity={0.75}>
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Animated.ScrollView style={{ opacity: listOpacity }} contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}><Package size={28} color={Colors.primary} strokeWidth={1.5} /></View>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySub}>Try a different search or category.</Text>
              </View>
            ) : (
              filteredProducts.map((p) => <ProductCard key={p.id} product={p} onEdit={openEdit} />)
            )}
          </Animated.ScrollView>
        </View>
      )}

      {activeSegment === 'stock' && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryRow}>
            {[
              { label: 'Active', val: healthyCount, color: Colors.success },
              { label: 'Low Stock', val: lowCount, color: Colors.warning },
              { label: 'Out of Stock', val: outCount, color: Colors.error },
            ].map(({ label, val, color }) => (
              <View key={label} style={styles.summaryCard}>
                <Text style={[styles.summaryVal, val > 0 && label !== 'Active' && { color }]}>{val}</Text>
                <Text style={styles.summaryLbl}>{label}</Text>
              </View>
            ))}
          </View>
          {productsStore.products.map((product) => (
            <View key={product.id} style={styles.stockRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.stockMeta}>{product.stock} units available</Text>
              </View>
              {([-5, 1, 10] as const).map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.qtyBtn, amt > 0 && styles.qtyBtnPos]}
                  onPress={() => {
                    const next = Math.max(0, product.stock + amt);
                    productsStore.adjustStock(product.id, next);
                    inventoryStore.recordAdjustment({ productId: product.id, productName: product.name, type: amt > 0 ? 'Stock In' : 'Audit Adjustment', qtyChanged: amt, resultingQty: next });
                  }}
                >
                  <Text style={[styles.qtyText, amt > 0 && styles.qtyTextPos]}>{amt > 0 ? `+${amt}` : amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {activeSegment === 'offers' && (
        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
          {[
            { name: 'Weekend Fresh Basket', desc: '15% off Grocery above ₹699', status: 'Active' },
            { name: 'Expiry Saver', desc: 'Auto-surface expiring items', status: 'Draft' },
            { name: 'Fashion Margin Guard', desc: 'Min margin rule for bargains', status: 'Active' },
          ].map(({ name, desc, status }) => (
            <View key={name} style={styles.offerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockName}>{name}</Text>
                <Text style={styles.stockMeta}>{desc}</Text>
              </View>
              <Badge label={status} tone={status === 'Active' ? 'success' : 'neutral'} />
            </View>
          ))}
          <TouchableOpacity style={styles.createOfferBtn} onPress={() => Alert.alert('Offer draft', 'Offer creation workflow is ready to connect.')}>
            <Plus size={15} color={Colors.primary} />
            <Text style={styles.createOfferText}>Create offer</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <ProductModal visible={modalVisible} editingProduct={editingProduct} onClose={closeModal} onSuccess={showToast} />
    </AnimatedScreen>
  );
});
