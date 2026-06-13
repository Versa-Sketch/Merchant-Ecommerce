import { router } from 'expo-router';
import {
  ArrowUpRight, Award, BarChart2, Bell, Boxes, CheckCircle2, ChevronRight, Clock,
  IndianRupee, MapPin, Package, PackagePlus, ShoppingBag, Star, Tags, Truck, UserCircle, Users, XCircle,
} from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Pressable, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/MerchantPrimitives';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import styles, { blobStyles } from './styles';

function formatCurrency(value: number) { return `₹${value.toLocaleString('en-IN')}`; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function PulseDot({ active = true }: { active?: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (!active) return;
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ]),
    ])).start();
  }, [active]);
  const color = active ? Colors.success : Colors.error;
  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: color, opacity, transform: [{ scale: pulse }] }} />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
    </View>
  );
}

function CountUp({ target, prefix = '', style }: { target: number; prefix?: string; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(prefix === '₹' ? '₹0' : `${prefix}0`);
  useEffect(() => {
    anim.addListener(({ value }) => {
      setDisplay(prefix === '₹' ? `₹${Math.floor(value).toLocaleString('en-IN')}` : `${prefix}${Math.floor(value)}`);
    });
    Animated.timing(anim, { toValue: target, duration: 1100, useNativeDriver: false }).start();
    return () => anim.removeAllListeners();
  }, [target]);
  return <Text style={style}>{display}</Text>;
}

function ProgressBar({ value: _value }: { value: number }) {
  return null;
}

export default observer(function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { authStore, dashboardStore, ordersStore, sessionStore } = useStores();
  const [isOpen, setIsOpen] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'neutral' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'neutral' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  }, []);

  const handleAccept = (id: string) => { ordersStore.acceptOrder(id); showToast('Order accepted ✓'); };
  const handleReject = (id: string) => { ordersStore.rejectOrder(id); showToast('Order rejected', 'neutral'); };

  const storeName = authStore.storeName || 'FreshMart Hyperlocal';
  const ownerFirstName = sessionStore.user?.full_name?.trim().split(/\s+/)[0];
  const recentOrders = ordersStore.orders.slice(0, 3);
  const pendingCount = ordersStore.newOrders.length;
  const deliveredCount = ordersStore.deliveredOrders.length;
  const cancelledCount = ordersStore.orders.filter((o) => o.status === 'Cancelled').length;

  const quickActions = [
    { label: 'Add Product', icon: PackagePlus, route: '/(tabs)/products' },
    { label: 'Inventory', icon: Boxes, route: '/(tabs)/inventory' },
    { label: 'Offers', icon: Tags, route: '/(tabs)/products' },
    { label: 'Reports', icon: BarChart2, route: '/reports' },
    { label: 'Customers', icon: Users, route: '/customers' },
    { label: 'Delivery', icon: Truck, route: '/delivery' },
  ];

  const activityFeed = [
    { icon: CheckCircle2, label: 'Order #2847 accepted', time: '2 min ago', positive: true },
    { icon: IndianRupee, label: 'Payment ₹420 received', time: '8 min ago', positive: true },
    { icon: Package, label: 'Tomatoes stock updated', time: '15 min ago', positive: null },
    { icon: Truck, label: 'Order #2841 delivered', time: '32 min ago', positive: true },
  ];

  return (
    <AnimatedScreen style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} translucent />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
          <View style={blobStyles.b1} />
          <View style={blobStyles.b2} />
          <View style={styles.heroRow}>
            <View style={styles.logoBox}><Text style={styles.logoLetter}>{storeName.charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.greeting}>
                {getGreeting()}{ownerFirstName ? `, ${ownerFirstName}` : ''} 👋
              </Text>
              <Text style={styles.storeName} numberOfLines={1}>{storeName}</Text>
              {sessionStore.user?.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{sessionStore.user.role.replace(/_/g, ' ')}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
              <Bell size={18} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} activeOpacity={0.8} onPress={() => router.push('/profile' as any)}>
              <UserCircle size={18} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>
          <View style={styles.metricStrip}>
            <View style={styles.metricItem}><Text style={styles.metricVal}>{dashboardStore.todayOrders}</Text><Text style={styles.metricLbl}>Orders Today</Text></View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}><Text style={styles.metricVal}>₹{(dashboardStore.todayRevenue / 1000).toFixed(1)}k</Text><Text style={styles.metricLbl}>Revenue</Text></View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Star size={12} color={Colors.accent} fill={Colors.accent} /><Text style={styles.metricVal}>4.8</Text></View>
              <Text style={styles.metricLbl}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.floatRow}>
          <View style={[styles.floatCard, { flex: 1 }]}>
            <View style={styles.statusPulseRow}><PulseDot active={isOpen} /><Text style={[styles.statusChip, { color: isOpen ? Colors.success : Colors.error }]}>{isOpen ? 'LIVE' : 'PAUSED'}</Text></View>
            <Text style={styles.statusTitle}>{isOpen ? 'Accepting orders' : 'Store paused'}</Text>
            <Switch value={isOpen} onValueChange={(v) => { setIsOpen(v); showToast(v ? 'Store is live 🟢' : 'Store paused', v ? 'success' : 'neutral'); }} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor={Colors.white} style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }], marginTop: 10, alignSelf: 'flex-start' }} />
          </View>
          <View style={[styles.floatCard, { flex: 1.4 }]}>
            <Text style={styles.revLabel}>TODAY'S REVENUE</Text>
            <CountUp target={dashboardStore.todayRevenue} prefix="₹" style={styles.revValue} />
            <View style={styles.revGrowthRow}><ArrowUpRight size={13} color={Colors.success} /><Text style={styles.revGrowthText}>18% vs yesterday</Text></View>
          </View>
        </View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Orders Requiring Action</Text></View>
        <View style={styles.kpiRow}>
          {[
            { label: 'Orders', value: dashboardStore.todayOrders, icon: ShoppingBag },
            { label: 'Pending', value: pendingCount, icon: Clock, warn: pendingCount > 0 },
            { label: 'Delivered', value: deliveredCount, icon: CheckCircle2 },
            { label: 'Cancelled', value: cancelledCount, icon: XCircle, danger: cancelledCount > 0 },
          ].map(({ label, value, icon: Icon, warn, danger }: any) => (
            <View key={label} style={styles.kpiCard}>
              <Icon size={16} color={danger ? Colors.error : warn ? Colors.warning : Colors.primary} strokeWidth={2} />
              <Text style={[styles.kpiVal, danger && { color: Colors.error }, warn && { color: Colors.warning }]}>{value}</Text>
              <Text style={styles.kpiLbl}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Quick Actions</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
          {quickActions.map(({ label, icon: Icon, route }) => (
            <Pressable key={label} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] }]} onPress={() => router.push(route as any)}>
              <View style={styles.actionIcon}><Icon size={20} color={Colors.primary} strokeWidth={1.8} /></View>
              <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Store Performance</Text>
          <View style={styles.healthBadge}><Award size={11} color={Colors.accent} /><Text style={styles.healthBadgeText}>92/100 score</Text></View>
        </View>
        <View style={styles.card}>
          {[
            { label: 'Order Acceptance', value: 98, suffix: '98%' },
            { label: 'Customer Satisfaction', value: 96, suffix: '4.8 ★' },
            { label: 'Response Time', value: 80, suffix: '48 sec' },
          ].map(({ label, value, suffix }, i) => (
            <View key={label} style={{ marginBottom: i < 2 ? 16 : 0 }}>
              <View style={styles.perfRow}><Text style={styles.perfLabel}>{label}</Text><Text style={styles.perfVal}>{suffix}</Text></View>
              <ProgressBar value={value} />
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/(tabs)/orders' as any)}>
            <Text style={styles.viewAllText}>View all</Text><ChevronRight size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={[styles.card, styles.emptyState]}>
            <ShoppingBag size={32} color={Colors.border} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>New orders will appear here</Text>
          </View>
        ) : (
          recentOrders.map((order) => {
            const isNew = order.status === 'New Orders';
            const isDelivered = order.status === 'Delivered';
            const isPreparing = order.status === 'Packed' || order.status === 'Accepted';
            const statusLabel = isNew ? 'New' : isPreparing ? 'Preparing' : isDelivered ? 'Delivered' : 'Cancelled';
            const statusColor = isNew ? Colors.accent : isPreparing ? Colors.info : isDelivered ? Colors.success : Colors.error;
            return (
              <View key={order.id} style={[styles.card, styles.orderCard]}>
                <View style={styles.orderTop}>
                  <View style={styles.orderAvatar}><Text style={styles.orderAvatarText}>{(order.customerName || 'U').charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.orderName}>{order.customerName}</Text>
                    <Text style={styles.orderMeta}>{order.id} · {order.orderTime}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
                      <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.orderMeta2Row}>
                  <Text style={styles.orderPayText}>{order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Online payment'}</Text>
                </View>
                {isNew ? (
                  <View style={styles.orderActions}>
                    <Button label="Accept" size="sm" onPress={() => handleAccept(order.id)} style={{ flex: 1 }} />
                    <Button label="Reject" variant="outline" size="sm" onPress={() => handleReject(order.id)} style={{ flex: 1 }} />
                    <Button label="View" variant="view" size="sm" onPress={() => router.push('/(tabs)/orders' as any)} />
                  </View>
                ) : (
                  <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.75} onPress={() => router.push('/(tabs)/orders' as any)}>
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                    <ChevronRight size={13} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}

        <View style={[styles.sectionHead, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.livePill}><PulseDot active /><Text style={styles.livePillText}>Live</Text></View>
        </View>
        <View style={styles.card}>
          {activityFeed.map(({ icon: Icon, label, time }, i) => (
            <View key={i} style={[styles.activityRow, i < activityFeed.length - 1 && styles.activityRowBorder]}>
              <View style={styles.activityIcon}><Icon size={14} color={Colors.textSecondary} strokeWidth={1.8} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.activityLabel}>{label}</Text>
                <Text style={styles.activityTime}>{time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
});
