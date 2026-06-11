import {
  AlertCircle,
  Box,
  Eye,
  Layers,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  PowerOff,
  Search,
  X,
} from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { useStores } from '../../Common/hooks/useStores';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import { ProductFormModal } from '../Components/ProductFormModal';
import type { ProductSummary } from '../types/domain';
import styles from './styles';

type StatusFilter = 'all' | 'active' | 'inactive';

// ── Skeleton while the first load is in flight ──────────────────────────────
function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.45, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      <View style={[styles.skeletonBlock, { width: 64, height: 64 }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonBlock, { height: 14, width: '70%' }]} />
        <View style={[styles.skeletonBlock, { height: 10, width: '45%' }]} />
        <View style={[styles.skeletonBlock, { height: 10, width: '55%' }]} />
      </View>
    </Animated.View>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const ProductCard = observer(function ProductCard({
  product,
  onOpenActions,
}: {
  product: ProductSummary;
  onOpenActions: (p: ProductSummary) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.productCard, !product.is_active && styles.productCardInactive]}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/products/[id]', params: { id: product.id } })}
    >
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.productImg} />
      ) : (
        <View style={[styles.productImg, styles.productImgPlaceholder]}>
          <Box size={20} color={Colors.border} />
        </View>
      )}
      <View style={styles.productInfo}>
        <View style={styles.productNameRow}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <TouchableOpacity
            onPress={() => onOpenActions(product)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.productCat} numberOfLines={1}>
          {product.category?.name}
          {product.subcategory ? ` › ${product.subcategory.name}` : ''}
        </Text>
        {product.brand ? <Text style={styles.productBrand}>{product.brand.name}</Text> : null}
        <View style={styles.badgeRow}>
          <Pill
            label={`${product.variant_count} variant${product.variant_count === 1 ? '' : 's'}`}
            color={Colors.info}
            bg={Colors.infoBg}
          />
          <Pill
            label={product.is_perishable ? 'Perishable' : 'Non-perishable'}
            color={product.is_perishable ? Colors.warning : Colors.textSecondary}
            bg={product.is_perishable ? Colors.warningBg : Colors.background}
          />
          <Pill
            label={product.is_active ? 'Active' : 'Inactive'}
            color={product.is_active ? Colors.success : Colors.error}
            bg={product.is_active ? Colors.successBg : Colors.errorBg}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default observer(function ProductsScreen() {
  const { productsStore } = useStores();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductSummary | null>(null);
  const [actionsFor, setActionsFor] = useState<ProductSummary | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<ProductSummary | null>(null);

  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!productsStore.listFetched) void productsStore.fetchProducts();
  }, [productsStore]);

  function showToast(message: string, error = false) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return productsStore.products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand?.name ?? '').toLowerCase().includes(q) ||
        (p.manufacturer ?? '').toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? p.is_active : !p.is_active);
      const matchesCategory = !categoryFilter || p.category?.id === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [productsStore.products, searchQuery, statusFilter, categoryFilter]);

  async function handleDeactivate() {
    const target = confirmDeactivate;
    setConfirmDeactivate(null);
    if (!target) return;
    const result = await productsStore.deactivateProduct(target.id);
    showToast(result.message, !result.ok);
  }

  const isLoading = productsStore.listState === 'loading' && !productsStore.listFetched;
  const isError = productsStore.listState === 'error';
  const hasFilters = !!searchQuery.trim() || statusFilter !== 'all' || !!categoryFilter;

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
  ];

  return (
    <AnimatedScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>
              {productsStore.products.length} products · {productsStore.activeCount} active
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setCreateOpen(true)} activeOpacity={0.85}>
            <Plus size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {toast ? (
        <View style={[styles.toastBanner, toast.error && styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={15} color={Colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products, brands…"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRail}
        contentContainerStyle={styles.chipsScroll}
      >
        {STATUS_FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, statusFilter === key && styles.chipActive]}
            onPress={() => setStatusFilter(key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, statusFilter === key && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        {productsStore.listCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, categoryFilter === cat.id && styles.chipActive]}
            onPress={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, categoryFilter === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={productsStore.listState === 'loading' && productsStore.listFetched}
            onRefresh={() => void productsStore.fetchProducts()}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isError ? (
          <View style={styles.stateWrap}>
            <View style={[styles.stateIcon, styles.stateIconError]}>
              <AlertCircle size={26} color={Colors.error} strokeWidth={1.8} />
            </View>
            <Text style={styles.stateTitle}>Couldn't load products</Text>
            <Text style={styles.stateSub}>{productsStore.listError}</Text>
            <Button label="Retry" onPress={() => void productsStore.fetchProducts()} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.stateWrap}>
            <View style={styles.stateIcon}>
              <Package size={26} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.stateTitle}>
              {hasFilters ? 'No products found' : 'No products yet'}
            </Text>
            <Text style={styles.stateSub}>
              {hasFilters
                ? 'Try a different search or filter.'
                : 'Add your first product to start building your catalog.'}
            </Text>
            {!hasFilters ? (
              <Button label="Add your first product" onPress={() => setCreateOpen(true)} />
            ) : null}
          </View>
        ) : (
          filtered.map((p) => <ProductCard key={p.id} product={p} onOpenActions={setActionsFor} />)
        )}
      </ScrollView>

      {/* Per-product actions */}
      <BottomSheet
        isVisible={actionsFor !== null}
        onClose={() => setActionsFor(null)}
        title={actionsFor?.name ?? 'Product actions'}
        height={0.42}
      >
        <View style={styles.sheetContent}>
          {[
            {
              icon: <Eye size={18} color={Colors.textPrimary} />,
              label: 'View product',
              onPress: () => {
                const id = actionsFor?.id;
                setActionsFor(null);
                if (id) router.push({ pathname: '/products/[id]', params: { id } });
              },
            },
            {
              icon: <Pencil size={18} color={Colors.textPrimary} />,
              label: 'Edit product',
              onPress: () => {
                setEditProduct(actionsFor);
                setActionsFor(null);
              },
            },
            {
              icon: <Layers size={18} color={Colors.textPrimary} />,
              label: 'Manage variants',
              onPress: () => {
                const id = actionsFor?.id;
                setActionsFor(null);
                if (id) router.push({ pathname: '/products/[id]', params: { id } });
              },
            },
          ].map(({ icon, label, onPress }) => (
            <TouchableOpacity key={label} style={styles.actionRow} onPress={onPress}>
              {icon}
              <Text style={styles.actionRowText}>{label}</Text>
            </TouchableOpacity>
          ))}
          {actionsFor?.is_active ? (
            <TouchableOpacity
              style={[styles.actionRow, { borderBottomWidth: 0 }]}
              onPress={() => {
                setConfirmDeactivate(actionsFor);
                setActionsFor(null);
              }}
            >
              <PowerOff size={18} color={Colors.error} />
              <Text style={[styles.actionRowText, styles.actionRowDanger]}>Deactivate product</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </BottomSheet>

      {/* Deactivation confirm */}
      <BottomSheet
        isVisible={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        title="Deactivate product?"
        height={0.32}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.confirmText}>
            "{confirmDeactivate?.name}" will be hidden from your catalog and customers. You can
            reactivate it later from Edit Product.
          </Text>
          <View style={styles.confirmActions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => setConfirmDeactivate(null)}
              style={{ flex: 1 }}
            />
            <Button
              label="Deactivate"
              variant="danger"
              loading={productsStore.saving}
              onPress={() => void handleDeactivate()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </BottomSheet>

      <ProductFormModal
        visible={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
      <ProductFormModal
        visible={editProduct !== null}
        mode="edit"
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSuccess={(msg) => showToast(msg)}
      />
    </AnimatedScreen>
  );
});
