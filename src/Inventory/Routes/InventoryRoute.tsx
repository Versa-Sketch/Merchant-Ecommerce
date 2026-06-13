import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  ChevronDown,
  ChevronUp,
  Layers,
  Plus,
  PlusCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { useStores } from '../../Common/hooks/useStores';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../theme/colors';
import { AddBatchModal } from '../Components/AddBatchModal';
import { AdjustStockModal } from '../Components/AdjustStockModal';
import { BatchDetailModal } from '../Components/BatchDetailModal';
import { BATCH_STATUSES, type BatchStatus, type InventoryBatch, type StockSummaryItem } from '../types/domain';
import styles from './styles';

const SEARCH_DEBOUNCE_MS = 400;

// Floats the FAB above the absolutely-positioned CustomTabBar
// (bottomOffset = max(insets.bottom, 8) + 8, bar height ~68).
const TAB_BAR_CLEARANCE = (insetsBottom: number) => Math.max(insetsBottom, 8) + 88;

type Segment = 'stock' | 'batches' | 'activity';
type StockHealthFilter = 'all' | 'low' | 'out';
type ActivityTypeFilter = 'all' | 'RECEIVE' | 'SALE' | 'ADJUSTMENT';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'stock', label: 'Overview' },
  { key: 'batches', label: 'Batches' },
  { key: 'activity', label: 'Activity' },
];

const STATUS_TONES: Record<BatchStatus, { color: string; bg: string }> = {
  ACTIVE: { color: Colors.success, bg: Colors.successBg },
  EXPIRED: { color: Colors.error, bg: Colors.errorBg },
  EXHAUSTED: { color: Colors.textSecondary, bg: Colors.background },
  RECALLED: { color: Colors.warning, bg: Colors.warningBg },
};

const ACTIVITY_FILTERS: { key: ActivityTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'RECEIVE', label: 'Receipts' },
  { key: 'SALE', label: 'Sales' },
  { key: 'ADJUSTMENT', label: 'Adjustments' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function stockHealth(available: number, reserved: number) {
  if (available <= 0) return { dot: Colors.error, bar: Colors.error, label: 'Out of stock' as const, tone: 'out' as const };
  if (available <= 5) return { dot: Colors.warning, bar: Colors.warning, label: 'Reorder soon' as const, tone: 'low' as const };
  return { dot: Colors.success, bar: Colors.success, label: 'Healthy stock' as const, tone: 'healthy' as const };
}

function stockAction(available: number, reserved: number) {
  if (available <= 0) return 'Create batch now';
  if (available <= 5) return 'Plan reorder today';
  if (reserved > 0) return 'Monitor reservations';
  return 'Maintain current stock';
}

function stockBarRatio(_available: number, _reserved: number) {
  return 0;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - today.getTime()) / 86400000);
}

function expiryTone(days: number) {
  if (days <= 2) return { box: styles.expiryUrgent, text: styles.expiryUrgentText, label: days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `Expires in ${days}d` };
  if (days <= 7) return { box: styles.expirySoon, text: styles.expirySoonText, label: `Expires in ${days}d` };
  return { box: styles.expiryGood, text: styles.expiryGoodText, label: `Expires in ${days}d` };
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function activityMeta(type: string) {
  switch (type) {
    case 'RECEIVE':
      return { Icon: ArrowUpCircle, color: Colors.success, bg: Colors.successBg, label: 'Stock Received' };
    case 'SALE':
      return { Icon: ArrowDownCircle, color: Colors.info, bg: Colors.infoBg, label: 'Sale' };
    case 'ADJUSTMENT':
      return { Icon: SlidersHorizontal, color: Colors.warning, bg: Colors.warningBg, label: 'Manual Adjustment' };
    default:
      return { Icon: Layers, color: Colors.textSecondary, bg: Colors.background, label: type };
  }
}

function SkeletonRows() {
  const [pulse] = useState(() => new Animated.Value(0.45));
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
    <Animated.View style={{ opacity: pulse, gap: 10 }}>
      <View style={[styles.skeletonCard, { height: 78 }]} />
      <View style={[styles.skeletonCard, { height: 78 }]} />
      <View style={[styles.skeletonCard, { height: 78 }]} />
      <View style={[styles.skeletonCard, { height: 78 }]} />
    </Animated.View>
  );
}

// ── Stock overview card (expandable) ─────────────────────────────────────────

const StockCard = observer(function StockCard({
  item,
  expanded,
  onToggle,
  onAdjust,
  onViewBatches,
}: {
  item: StockSummaryItem;
  expanded: boolean;
  onToggle: () => void;
  onAdjust: (batchId: string | null) => void;
  onViewBatches: () => void;
}) {
  const { inventoryStore } = useStores();
  const available = Number(item.available_stock);
  const reserved = Number(item.reserved_stock);
  const health = stockHealth(available, reserved);
  const action = stockAction(available, reserved);
  const ratio = stockBarRatio(available, reserved);

  const variantBatches = useMemo(
    () => inventoryStore.batches.filter((b) => b.variant_id === item.variant_id && b.status === 'ACTIVE'),
    [inventoryStore.batches, item.variant_id],
  );
  const primaryBatchId = variantBatches[0]?.id ?? null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.stockCard}>
      <View style={styles.stockTopRow}>
        <View style={[styles.healthDot, { backgroundColor: health.dot }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.stockProductName} numberOfLines={1}>
            {item.product_name}
          </Text>
          <Text style={styles.stockVariantName} numberOfLines={1}>
            {item.variant_name} · {item.unit_symbol}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={Colors.textMuted} />
        )}
      </View>

      <View style={styles.stockInsightGrid}>
        <View style={styles.stockInsightItem}>
          <Text style={styles.stockMetaLabel}>AVAILABLE</Text>
          <Text style={styles.stockMetaValue}>{item.available_stock}</Text>
        </View>
        <View style={styles.stockInsightItem}>
          <Text style={styles.stockMetaLabel}>RESERVED</Text>
          <Text style={styles.stockMetaValue}>{item.reserved_stock}</Text>
        </View>
        <View style={styles.stockInsightItemWide}>
          <Text style={styles.stockMetaLabel}>SUGGESTED ACTION</Text>
          <Text style={styles.stockActionText}>{action}</Text>
        </View>
      </View>

      <View style={styles.stockBarTrack}>
        <View style={[styles.stockBarFill, { width: `${ratio}%`, backgroundColor: health.bar }]} />
      </View>
      <View style={styles.stockSubRow}>
        <Text style={styles.stockSubText}>
          <Text style={styles.stockSubValue}>{item.available_stock}</Text> available
          {reserved > 0 ? ` · ${item.reserved_stock} reserved` : ''}
        </Text>
        {health.tone !== 'healthy' ? (
          <View style={[styles.lowStockBadge, health.tone === 'out' && styles.outOfStockBadge]}>
            <Text style={[styles.lowStockBadgeText, health.tone === 'out' && styles.outOfStockBadgeText]}>
              {health.label}
            </Text>
          </View>
        ) : null}
      </View>

      {expanded ? (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedSectionLabel}>ACTIVE BATCHES</Text>
          {variantBatches.length === 0 ? (
            <Text style={styles.stockSubText}>No active batches for this variant.</Text>
          ) : (
            variantBatches.map((b) => {
              const days = daysUntil(b.expiry_at);
              const tone = days !== null ? expiryTone(days) : null;
              return (
                <View key={b.id} style={styles.miniBatchCard}>
                  <View style={styles.miniBatchLeft}>
                    <Text style={styles.miniBatchTitle}>
                      {b.batch_number ? `Batch ${b.batch_number}` : `Batch #${b.id.slice(0, 8)}`}
                    </Text>
                    <Text style={styles.miniBatchSub}>{b.available_quantity} available</Text>
                  </View>
                  {tone ? (
                    <View style={[styles.expiryChip, tone.box]}>
                      <Text style={[styles.expiryChipText, tone.text]}>{tone.label}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
          <View style={styles.expandedActions}>
            <Button
              label="Adjust Stock"
              variant="outline"
              size="sm"
              onPress={() => onAdjust(primaryBatchId)}
              style={{ flex: 1 }}
            />
            <Button label="View Batches" variant="view" size="sm" onPress={onViewBatches} style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

// ── Batch card (compact / expandable) ────────────────────────────────────────

const BatchRow = observer(function BatchRow({
  batch,
  expanded,
  onToggle,
  onView,
  onAdjust,
}: {
  batch: InventoryBatch;
  expanded: boolean;
  onToggle: () => void;
  onView: (b: InventoryBatch) => void;
  onAdjust: (b: InventoryBatch) => void;
}) {
  const { inventoryStore } = useStores();
  const tone = STATUS_TONES[batch.status] ?? STATUS_TONES.ACTIVE;
  const received = Number(batch.received_quantity) || 0;
  const available = Number(batch.available_quantity) || 0;
  const ratio = received > 0 ? Math.max(2, Math.min(100, (available / received) * 100)) : 0;
  const days = daysUntil(batch.expiry_at);
  const expiry = days !== null ? expiryTone(days) : null;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.batchCard}>
      <View style={styles.batchTopRow}>
        <View style={[styles.statusBadge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.statusBadgeText, { color: tone.color }]}>{batch.status}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.batchProductName} numberOfLines={1}>
            {inventoryStore.productLabelForVariant(batch.variant_id)}
          </Text>
          <Text style={styles.batchNumber}>
            {batch.batch_number ? `Batch ${batch.batch_number}` : `Batch #${batch.id.slice(0, 8)}`}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textMuted} />
        ) : (
          <ChevronDown size={18} color={Colors.textMuted} />
        )}
      </View>

      <View style={styles.batchProgressTrack}>
        <View style={[styles.batchProgressFill, { width: `${ratio}%` }]} />
      </View>
      <View style={styles.batchSummaryRow}>
        <Text style={styles.batchSummaryText}>
          {batch.available_quantity} / {batch.received_quantity} available
        </Text>
        {expiry ? (
          <View style={[styles.expiryChip, expiry.box]}>
            <Text style={[styles.expiryChipText, expiry.text]}>{expiry.label}</Text>
          </View>
        ) : null}
      </View>

      {expanded ? (
        <>
          <View style={styles.batchMetaGrid}>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>RESERVED QTY</Text>
              <Text style={styles.batchMetaValue}>{batch.reserved_quantity}</Text>
            </View>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>PURCHASE PRICE</Text>
              <Text style={styles.batchMetaValue}>₹{batch.purchase_price}</Text>
            </View>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>SELLING PRICE</Text>
              <Text style={styles.batchMetaValue}>{batch.selling_price ? `₹${batch.selling_price}` : '—'}</Text>
            </View>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>RECEIVED DATE</Text>
              <Text style={styles.batchMetaValue}>{batch.received_at}</Text>
            </View>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>EXPIRY DATE</Text>
              <Text style={styles.batchMetaValue}>{batch.expiry_at ?? '—'}</Text>
            </View>
            <View style={styles.batchMetaItem}>
              <Text style={styles.batchMetaLabel}>MANUFACTURED</Text>
              <Text style={styles.batchMetaValue}>{batch.manufactured_at ?? '—'}</Text>
            </View>
          </View>

          <View style={styles.batchActions}>
            <Button label="View / Update" variant="view" size="sm" onPress={() => onView(batch)} style={{ flex: 1 }} />
            <Button label="Adjust stock" variant="outline" size="sm" onPress={() => onAdjust(batch)} style={{ flex: 1 }} />
          </View>
        </>
      ) : null}
    </TouchableOpacity>
  );
});

// ── Activity row (timeline) ───────────────────────────────────────────────────

const ActivityRow = observer(function ActivityRow({ txn }: { txn: import('../types/domain').InventoryTransaction }) {
  const { inventoryStore } = useStores();
  const batch = inventoryStore.batchById(txn.batch_id);
  const qty = Number(txn.quantity);
  const isPositive = qty > 0;
  const meta = activityMeta(txn.transaction_type);
  const time = new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.activityCard}>
      <View style={[styles.activityIconWrap, { backgroundColor: meta.bg }]}>
        <meta.Icon size={18} color={meta.color} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{meta.label}</Text>
        <Text style={styles.activityMeta} numberOfLines={1}>
          {batch ? inventoryStore.productLabelForVariant(batch.variant_id) : `Batch ${txn.batch_id.slice(0, 8)}`}
          {batch?.batch_number ? ` · ${batch.batch_number}` : ''}
          {txn.reference_id ? ` · ${txn.reference_type ?? 'Ref'} ${txn.reference_id.slice(0, 8)}` : ''}
        </Text>
        {txn.note ? <Text style={styles.activityNote}>"{txn.note}"</Text> : null}
      </View>
      <View style={styles.activityRight}>
        <Text style={[styles.activityQty, isPositive ? styles.txnQtyPositive : styles.txnQtyNegative]}>
          {isPositive ? '+' : ''}
          {txn.quantity}
        </Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
});

export default observer(function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { inventoryStore } = useStores();

  const [segment, setSegment] = useState<Segment>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<StockHealthFilter>('all');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'all'>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityTypeFilter>('all');

  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustPresetBatch, setAdjustPresetBatch] = useState<string | null>(null);
  const [detailBatch, setDetailBatch] = useState<InventoryBatch | null>(null);
  const [dialOpen, setDialOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void inventoryStore.fetchBatches();
    void inventoryStore.fetchTransactions();
  }, [inventoryStore]);

  // Debounce stock search before hitting the API (also fires the initial fetch).
  useEffect(() => {
    const timer = setTimeout(() => {
      void inventoryStore.fetchStock(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inventoryStore, searchQuery]);

  function showToast(message: string, error = false) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function applyBatchStatusFilter(nextStatus: BatchStatus | 'all') {
    setStatusFilter(nextStatus);
    inventoryStore.setBatchFilters(nextStatus !== 'all' ? { status: nextStatus } : {});
  }

  // ── Stock overview filtering ─────────────────────────────────────────────
  const filteredStock = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = inventoryStore.stock;
    if (q) {
      list = list.filter(
        (s) => s.product_name.toLowerCase().includes(q) || s.variant_name.toLowerCase().includes(q),
      );
    }
    if (stockFilter === 'low') {
      list = list.filter((s) => {
        const a = Number(s.available_stock);
        return a > 0 && a <= 5;
      });
    } else if (stockFilter === 'out') {
      list = list.filter((s) => Number(s.available_stock) <= 0);
    }
    return list;
  }, [inventoryStore.stock, searchQuery, stockFilter]);

  // Trigger the next page as soon as the user reaches the second-to-last
  // stock row of the currently loaded list.
  const filteredStockRef = useRef(filteredStock);
  filteredStockRef.current = filteredStock;
  const stockViewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onStockViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const lastVisible = viewableItems[viewableItems.length - 1];
      if (
        lastVisible?.index != null &&
        lastVisible.index >= filteredStockRef.current.length - 2
      ) {
        void inventoryStore.loadMoreStock();
      }
    },
  ).current;

  const lowStockCount = inventoryStore.lowStockItems.length;
  const outOfStockCount = inventoryStore.outOfStockItems.length;
  const expiringCount = useMemo(
    () =>
      inventoryStore.batches.filter((b) => {
        if (b.status !== 'ACTIVE') return false;
        const days = daysUntil(b.expiry_at);
        return days !== null && days <= 3;
      }).length,
    [inventoryStore.batches],
  );

  // ── Activity filtering + grouping ────────────────────────────────────────
  const filteredActivity = useMemo(() => {
    if (activityFilter === 'all') return inventoryStore.sortedTransactions;
    return inventoryStore.sortedTransactions.filter((t) => t.transaction_type === activityFilter);
  }, [inventoryStore.sortedTransactions, activityFilter]);

  const groupedActivity = useMemo(() => {
    const groups: { label: string; items: typeof filteredActivity }[] = [];
    filteredActivity.forEach((txn) => {
      const label = dayLabel(txn.created_at);
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push(txn);
      } else {
        groups.push({ label, items: [txn] });
      }
    });
    return groups;
  }, [filteredActivity]);

  // ── Header subtitle per segment ──────────────────────────────────────────
  const subtitle =
    segment === 'stock'
      ? `${inventoryStore.stockTotalCount} variants · ${lowStockCount + outOfStockCount} need attention`
      : segment === 'batches'
        ? `${inventoryStore.batches.length} batches`
        : `${inventoryStore.transactions.length} events`;

  return (
    <AnimatedScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Inventory</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>

      {toast ? (
        <View style={[styles.toastBanner, toast.error && styles.toastError]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}

      <View style={styles.segmentRow}>
        {SEGMENTS.map((seg) => (
          <TouchableOpacity
            key={seg.key}
            style={[styles.segment, segment === seg.key && styles.segmentActive]}
            onPress={() => setSegment(seg.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, segment === seg.key && styles.segmentTextActive]}>
              {seg.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Stock Overview ──────────────────────────────────────────────── */}
      {segment === 'stock' ? (
        inventoryStore.stockState === 'loading' && inventoryStore.stock.length === 0 ? (
          <View style={[styles.list, { paddingBottom: insets.bottom + 100 }]}>
            <SkeletonRows />
          </View>
        ) : inventoryStore.stockState === 'error' ? (
          <View style={[styles.list, { paddingBottom: insets.bottom + 100 }]}>
            <View style={styles.stateWrap}>
              <View style={[styles.stateIcon, styles.stateIconError]}>
                <AlertCircle size={26} color={Colors.error} strokeWidth={1.8} />
              </View>
              <Text style={styles.stateTitle}>Couldn&apos;t load stock</Text>
              <Text style={styles.stateSub}>{inventoryStore.stockError}</Text>
              <Button label="Retry" onPress={() => void inventoryStore.fetchStock()} />
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredStock}
            keyExtractor={(item) => item.variant_id}
            renderItem={({ item }) => (
              <StockCard
                item={item}
                expanded={expandedVariant === item.variant_id}
                onToggle={() =>
                  setExpandedVariant(expandedVariant === item.variant_id ? null : item.variant_id)
                }
                onAdjust={(batchId) => {
                  setAdjustPresetBatch(batchId);
                  setAdjustOpen(true);
                }}
                onViewBatches={() => setSegment('batches')}
              />
            )}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={inventoryStore.stockState === 'loading'}
                onRefresh={() => void inventoryStore.fetchStock()}
                tintColor={Colors.primary}
              />
            }
            onViewableItemsChanged={onStockViewableItemsChanged}
            viewabilityConfig={stockViewabilityConfig}
            ListHeaderComponent={
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={styles.kpiScroll}
                >
                  <TouchableOpacity
                    style={[styles.kpiCard, stockFilter === 'all' && styles.kpiCardActive]}
                    onPress={() => setStockFilter('all')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.kpiValue}>{inventoryStore.stockTotalCount}</Text>
                    <Text style={styles.kpiLabel}>Total SKUs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.kpiCard, stockFilter === 'low' && styles.kpiCardActive]}
                    onPress={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.kpiValue, styles.kpiValueWarn]}>{lowStockCount}</Text>
                    <Text style={styles.kpiLabel}>Low Stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.kpiCard, stockFilter === 'out' && styles.kpiCardActive]}
                    onPress={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.kpiValue, styles.kpiValueDanger]}>{outOfStockCount}</Text>
                    <Text style={styles.kpiLabel}>Out of Stock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.kpiCard}
                    onPress={() => setSegment('batches')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.kpiValue, styles.kpiValueInfo]}>{expiringCount}</Text>
                    <Text style={styles.kpiLabel}>Expiring ≤3d</Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.searchRow}>
                  <View style={styles.searchBox}>
                    <Search size={15} color={Colors.textMuted} />
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search products, variants…"
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
              </>
            }
            ListEmptyComponent={
              <View style={styles.stateWrap}>
                <View style={styles.stateIcon}>
                  <Boxes size={26} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.stateTitle}>
                  {searchQuery || stockFilter !== 'all' ? 'No matching variants' : 'No stock yet'}
                </Text>
                <Text style={styles.stateSub}>
                  {searchQuery || stockFilter !== 'all'
                    ? 'Try a different search or filter.'
                    : 'Add an inventory batch to start tracking stock levels.'}
                </Text>
                {!searchQuery && stockFilter === 'all' ? (
                  <Button label="Add inventory batch" onPress={() => setAddBatchOpen(true)} />
                ) : null}
              </View>
            }
            ListFooterComponent={
              inventoryStore.stockLoadingMore ? (
                <View style={styles.loadMoreRow}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : null
            }
          />
        )
      ) : null}

      {/* ── Inventory Batches ───────────────────────────────────────────── */}
      {segment === 'batches' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRail}
            contentContainerStyle={styles.chipsScroll}
          >
            {(['all', ...BATCH_STATUSES] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, statusFilter === s && styles.chipActive]}
                onPress={() => applyBatchStatusFilter(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                  {s === 'all' ? 'All' : s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            contentContainerStyle={[styles.list, { paddingTop: 12, paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={inventoryStore.batchesState === 'loading'}
                onRefresh={() => void inventoryStore.fetchBatches()}
                tintColor={Colors.primary}
              />
            }
          >
            {inventoryStore.batchesState === 'loading' && inventoryStore.batches.length === 0 ? (
              <SkeletonRows />
            ) : inventoryStore.batchesState === 'error' ? (
              <View style={styles.stateWrap}>
                <View style={[styles.stateIcon, styles.stateIconError]}>
                  <AlertCircle size={26} color={Colors.error} strokeWidth={1.8} />
                </View>
                <Text style={styles.stateTitle}>Couldn&apos;t load batches</Text>
                <Text style={styles.stateSub}>{inventoryStore.batchesError}</Text>
                <Button label="Retry" onPress={() => void inventoryStore.fetchBatches()} />
              </View>
            ) : inventoryStore.batches.length === 0 ? (
              <View style={styles.stateWrap}>
                <View style={styles.stateIcon}>
                  <Layers size={26} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.stateTitle}>{statusFilter !== 'all' ? 'No matching batches' : 'No batches yet'}</Text>
                <Text style={styles.stateSub}>
                  {statusFilter !== 'all'
                    ? 'Try a different filter.'
                    : 'Add a stock arrival to create your first inventory batch.'}
                </Text>
                {statusFilter === 'all' ? <Button label="Add inventory batch" onPress={() => setAddBatchOpen(true)} /> : null}
              </View>
            ) : (
              inventoryStore.batches.map((b) => (
                <BatchRow
                  key={b.id}
                  batch={b}
                  expanded={expandedBatch === b.id}
                  onToggle={() => setExpandedBatch(expandedBatch === b.id ? null : b.id)}
                  onView={setDetailBatch}
                  onAdjust={(batch) => {
                    setAdjustPresetBatch(batch.id);
                    setAdjustOpen(true);
                  }}
                />
              ))
            )}
          </ScrollView>
        </>
      ) : null}

      {/* ── Activity ─────────────────────────────────────────────────────── */}
      {segment === 'activity' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRail}
            contentContainerStyle={styles.chipsScroll}
          >
            {ACTIVITY_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, activityFilter === f.key && styles.chipActive]}
                onPress={() => setActivityFilter(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, activityFilter === f.key && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            contentContainerStyle={[styles.list, { paddingTop: 12, paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={inventoryStore.transactionsState === 'loading'}
                onRefresh={() => void inventoryStore.fetchTransactions()}
                tintColor={Colors.primary}
              />
            }
          >
            {inventoryStore.transactionsState === 'loading' && inventoryStore.transactions.length === 0 ? (
              <SkeletonRows />
            ) : inventoryStore.transactionsState === 'error' ? (
              <View style={styles.stateWrap}>
                <View style={[styles.stateIcon, styles.stateIconError]}>
                  <AlertCircle size={26} color={Colors.error} strokeWidth={1.8} />
                </View>
                <Text style={styles.stateTitle}>Couldn&apos;t load activity</Text>
                <Text style={styles.stateSub}>{inventoryStore.transactionsError}</Text>
                <Button label="Retry" onPress={() => void inventoryStore.fetchTransactions()} />
              </View>
            ) : groupedActivity.length === 0 ? (
              <View style={styles.stateWrap}>
                <View style={styles.stateIcon}>
                  <Layers size={26} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.stateTitle}>No activity yet</Text>
                <Text style={styles.stateSub}>
                  Stock movements from sales, batch arrivals, and adjustments will show up here.
                </Text>
              </View>
            ) : (
              groupedActivity.map((group) => (
                <View key={group.label} style={{ gap: 10 }}>
                  <Text style={styles.dayHeader}>{group.label}</Text>
                  {group.items.map((t) => (
                    <ActivityRow key={t.id} txn={t} />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : null}

      {/* ── FAB + speed dial ────────────────────────────────────────────── */}
      {dialOpen ? (
        <TouchableOpacity
          style={styles.speedDialOverlay}
          activeOpacity={1}
          onPress={() => setDialOpen(false)}
        >
          <View
            style={{
              position: 'absolute',
              right: 20,
              bottom: TAB_BAR_CLEARANCE(insets.bottom) + 60,
              gap: 10,
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              style={styles.speedDialItem}
              activeOpacity={0.85}
              onPress={() => {
                setDialOpen(false);
                setAdjustPresetBatch(null);
                setAdjustOpen(true);
              }}
            >
              <Text style={styles.speedDialLabel}>Adjust Stock</Text>
              <View style={styles.speedDialIcon}>
                <SlidersHorizontal size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.speedDialItem}
              activeOpacity={0.85}
              onPress={() => {
                setDialOpen(false);
                setAddBatchOpen(true);
              }}
            >
              <Text style={styles.speedDialLabel}>New Batch</Text>
              <View style={styles.speedDialIcon}>
                <PlusCircle size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.fab, { right: 20, bottom: TAB_BAR_CLEARANCE(insets.bottom) }]}
        activeOpacity={0.85}
        onPress={() => setDialOpen((v) => !v)}
      >
        {dialOpen ? <X size={24} color={Colors.white} /> : <Plus size={24} color={Colors.white} />}
      </TouchableOpacity>

      <AddBatchModal
        visible={addBatchOpen}
        onClose={() => setAddBatchOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
      <AdjustStockModal
        visible={adjustOpen}
        presetBatchId={adjustPresetBatch}
        onClose={() => {
          setAdjustOpen(false);
          setAdjustPresetBatch(null);
        }}
        onSuccess={(msg) => showToast(msg)}
      />
      <BatchDetailModal
        visible={detailBatch !== null}
        batch={detailBatch}
        onClose={() => setDetailBatch(null)}
        onSuccess={(msg) => showToast(msg)}
      />
    </AnimatedScreen>
  );
});
