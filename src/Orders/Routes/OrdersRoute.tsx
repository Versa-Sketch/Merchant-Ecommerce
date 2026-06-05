import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { Button } from '../../components/ui/Button';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { ORDER_STATUSES } from '../Constants/statuses';
import styles from './styles';

function getUrgency(orderTime: string): { color: string; label: string; mins: number } {
  const now = new Date();
  const [time, meridiem] = orderTime.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (meridiem === 'PM' && h !== 12) hours += 12;
  if (meridiem === 'AM' && h === 12) hours = 0;
  const orderDate = new Date(now);
  orderDate.setHours(hours, m, 0, 0);
  const diffMs = now.getTime() - orderDate.getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));

  if (mins < 5) return { color: Colors.success, label: 'Fresh', mins };
  if (mins < 15) return { color: Colors.warning, label: 'Attention', mins };
  return { color: Colors.error, label: 'Critical', mins };
}

function formatWait(mins: number) {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function PulseDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const op = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 2, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(op, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: Colors.success,
          opacity: op,
          transform: [{ scale: pulse }],
        }}
      />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success }} />
    </View>
  );
}

export default observer(function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { ordersStore, deliveryStore, dashboardStore } = useStores();
  const [selectedStatus, setSelectedStatus] = useState('New Orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const activeOrder = ordersStore.orders.find((o) => o.id === selectedOrderId);

  const countFor = (key: string) => {
    if (key === 'New Orders') return ordersStore.newOrders.length;
    if (key === 'Accepted') return ordersStore.acceptedOrders.length;
    if (key === 'Packed') return ordersStore.packedOrders.length;
    if (key === 'Out For Delivery') return ordersStore.outForDeliveryOrders.length;
    if (key === 'Delivered') return ordersStore.deliveredOrders.length;
    return ordersStore.cancelledOrders.length;
  };

  const filteredOrders = (() => {
    if (selectedStatus === 'New Orders') return ordersStore.newOrders;
    if (selectedStatus === 'Accepted') return ordersStore.acceptedOrders;
    if (selectedStatus === 'Packed') return ordersStore.packedOrders;
    if (selectedStatus === 'Out For Delivery') return ordersStore.outForDeliveryOrders;
    if (selectedStatus === 'Delivered') return ordersStore.deliveredOrders;
    return ordersStore.cancelledOrders;
  })();

  const advance = (id: string, status: string) => {
    const order = ordersStore.orders.find((o) => o.id === id);
    if (!order) return;
    if (status === 'Accepted') order.updateStatus('Packed');
    if (status === 'Packed') {
      if (!order.deliveryPartnerId) { setAssigningOrderId(id); return; }
      order.updateStatus('Out For Delivery');
    }
    if (status === 'Out For Delivery') order.updateStatus('Delivered');
  };

  const newCount = ordersStore.newOrders.length;

  return (
    <AnimatedScreen style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} translucent />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerBlob} />
        <View style={styles.headerTopRow}>
          <View style={styles.liveRow}>
            <PulseDot />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.8}>
            <Search size={17} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIcon, { marginLeft: 8 }]} activeOpacity={0.8}>
            <Bell size={17} color="rgba(255,255,255,0.85)" />
            {newCount > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Orders</Text>

        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>{dashboardStore.todayOrders}</Text>
            <Text style={styles.headerStatLbl}>Today</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatVal}>₹{(dashboardStore.todayRevenue / 1000).toFixed(1)}k</Text>
            <Text style={styles.headerStatLbl}>Revenue</Text>
          </View>
          {newCount > 0 && (
            <>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={[styles.headerStatVal, { color: Colors.accent }]}>{newCount}</Text>
                <Text style={styles.headerStatLbl}>Need Action</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {ORDER_STATUSES.map(({ key, label, dot }) => {
            const active = selectedStatus === key;
            const count = countFor(key);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setSelectedStatus(key)}
                activeOpacity={0.75}
              >
                {!active && count > 0 && <View style={[styles.tabDot, { backgroundColor: dot }]} />}
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
                {count > 0 && (
                  <View style={[styles.tabCount, active && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <EmptyState status={selectedStatus} />
        ) : (
          filteredOrders.map((order) => {
            const driver = deliveryStore.partners.find((p) => p.id === order.deliveryPartnerId);
            const urgency = getUrgency(order.orderTime);
            const showUrgency = order.status === 'New Orders' || order.status === 'Accepted';
            return (
              <OrderCard
                key={order.id}
                order={order}
                driver={driver}
                urgency={showUrgency ? urgency : null}
                onAccept={() => ordersStore.acceptOrder(order.id)}
                onReject={() =>
                  Alert.alert('Reject order', `Reject ${order.id}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reject', style: 'destructive', onPress: () => ordersStore.rejectOrder(order.id) },
                  ])
                }
                onAdvance={() => advance(order.id, order.status)}
                onAssign={() => setAssigningOrderId(order.id)}
                onView={() => setSelectedOrderId(order.id)}
              />
            );
          })
        )}
      </ScrollView>

      <BottomSheet isVisible={selectedOrderId !== null} onClose={() => setSelectedOrderId(null)} title="Order Details" height={0.72}>
        {activeOrder ? (
          <ScrollView contentContainerStyle={styles.sheet}>
            <View style={styles.sheetSection}>
              <View style={styles.sheetSectionHead}>
                <User size={14} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Customer</Text>
              </View>
              <Text style={styles.sheetName}>{activeOrder.customerName}</Text>
              <Text style={styles.sheetMeta}>{activeOrder.customerPhone}</Text>
              <View style={styles.addressRow}>
                <MapPin size={12} color={Colors.textMuted} />
                <Text style={styles.addressText}>{activeOrder.deliveryAddress}</Text>
              </View>
            </View>

            <View style={styles.sheetSection}>
              <View style={styles.sheetSectionHead}>
                <Package size={14} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Items ({activeOrder.itemsCount})</Text>
              </View>
              {activeOrder.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name} ×{item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalLabel}>Total</Text>
                <Text style={styles.itemTotalValue}>₹{activeOrder.amount}</Text>
              </View>
            </View>

            <View style={[styles.sheetSection, { borderBottomWidth: 0 }]}>
              <View style={styles.sheetSectionHead}>
                <Clock size={14} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Timeline</Text>
              </View>
              {activeOrder.timeline.map((event, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineDotWrap}>
                    <View style={styles.timelineDot} />
                    {i < activeOrder.timeline.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.timelineStatus}>{event.status}</Text>
                    <Text style={styles.timelineTime}>{event.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}
      </BottomSheet>

      <BottomSheet isVisible={assigningOrderId !== null} onClose={() => setAssigningOrderId(null)} title="Assign Driver" height={0.55}>
        <ScrollView contentContainerStyle={styles.sheet}>
          {deliveryStore.availablePartners.map((partner) => (
            <View key={partner.id} style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>{partner.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.driverName}>{partner.name}</Text>
                <Text style={styles.driverMeta}>{partner.phone} · ★ {partner.rating}</Text>
              </View>
              <Button
                label="Assign"
                size="sm"
                onPress={() => {
                  if (assigningOrderId) {
                    ordersStore.assignDeliveryPartner(assigningOrderId, partner.id);
                    deliveryStore.assignDriverToOrder(partner.id);
                  }
                  setAssigningOrderId(null);
                }}
              />
            </View>
          ))}
        </ScrollView>
      </BottomSheet>
    </AnimatedScreen>
  );
});

function OrderCard({
  order, driver, urgency, onAccept, onReject, onAdvance, onAssign, onView,
}: {
  order: any;
  driver: any;
  urgency: { color: string; label: string; mins: number } | null;
  onAccept: () => void;
  onReject: () => void;
  onAdvance: () => void;
  onAssign: () => void;
  onView: () => void;
}) {
  const isNew = order.status === 'New Orders';
  const isAccepted = order.status === 'Accepted';
  const isPacked = order.status === 'Packed';
  const isOFD = order.status === 'Out For Delivery';
  const isDone = order.status === 'Delivered' || order.status === 'Cancelled';

  return (
    <View style={[styles.orderCard, isNew && styles.orderCardNew]}>
      {isNew && (
        <View style={styles.newOrderBanner}>
          <View style={styles.newOrderDot} />
          <Text style={styles.newOrderText}>NEW ORDER</Text>
        </View>
      )}

      <View style={styles.cardTopRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{order.customerName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.orderMeta}>{order.id} · {order.orderTime}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amount}>₹{order.amount}</Text>
          <View style={[styles.payPill, order.paymentMethod === 'COD' ? styles.payPillCOD : styles.payPillOnline]}>
            <Text style={[styles.payPillText, order.paymentMethod === 'COD' ? styles.payPillTextCOD : styles.payPillTextOnline]}>
              {order.paymentMethod === 'COD' ? 'Cash' : 'Online'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Package size={11} color={Colors.textMuted} strokeWidth={1.8} />
          <Text style={styles.chipText}>{order.itemsCount} items</Text>
        </View>
        {driver && (
          <View style={styles.chip}>
            <Truck size={11} color={Colors.textMuted} strokeWidth={1.8} />
            <Text style={styles.chipText}>{driver.name}</Text>
          </View>
        )}
        {urgency && (
          <View style={[styles.chip, styles.urgencyChip, { borderColor: `${urgency.color}40` }]}>
            <Clock size={11} color={urgency.color} strokeWidth={2} />
            <Text style={[styles.chipText, { color: urgency.color, fontWeight: '700' }]}>
              {urgency.label} · {formatWait(urgency.mins)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        {isNew && (
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.8} onPress={onAccept}>
              <CheckCircle2 size={15} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} activeOpacity={0.8} onPress={onReject}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {isAccepted && (
          <>
            <Button label="Assign Driver" variant="secondary" size="sm" onPress={onAssign} style={{ flex: 1 }} />
            <Button label="Mark Packed" size="sm" onPress={onAdvance} style={{ flex: 1 }} />
          </>
        )}
        {isPacked && <Button label="Send Out" size="sm" onPress={onAdvance} style={{ flex: 1 }} />}
        {isOFD && <Button label="Mark Delivered" size="sm" onPress={onAdvance} style={{ flex: 1 }} />}
        {isDone && (
          <View style={[styles.donePill, order.status === 'Delivered' ? styles.donePillGreen : styles.donePillRed]}>
            <Text style={[styles.donePillText, order.status === 'Delivered' ? { color: Colors.success } : { color: Colors.error }]}>
              {order.status}
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8} onPress={onView}>
          <Text style={styles.viewBtnText}>Details</Text>
          <ChevronRight size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ status }: { status: string }) {
  const isNew = status === 'New Orders';
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <ShoppingBag size={32} color={Colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>{isNew ? 'No New Orders' : `No ${status} Orders`}</Text>
      <Text style={styles.emptySubtitle}>
        {isNew ? "You're all caught up. New orders appear here instantly." : 'Orders in this stage will show up here.'}
      </Text>
    </View>
  );
}
