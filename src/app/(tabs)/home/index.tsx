import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useStores, simulateIncomingWebSocketMessage } from '../../../stores/RootStore';
import { Colors } from '../../../theme/colors';
import { Shadows } from '../../../theme/shadows';
import { LineChart, BarChart, DonutChart } from '../../../components/charts/Charts';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Star,
  PlusCircle,
  Percent,
  MessageSquare,
  Package,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default observer(function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { dashboardStore, authStore, analyticsStore } = useStores();
  const [isOnline, setIsOnline] = useState(true);
  const [chartTab, setChartTab] = useState<'today' | 'weekly' | 'monthly'>('today');

  const triggerWSSimulator = (type: 'order' | 'bargain' | 'alert') => {
    simulateIncomingWebSocketMessage(type);
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>{authStore.storeName}</Text>
          <Text style={styles.greeting}>Hello, {authStore.ownerName} 👋</Text>
        </View>

        {/* Store Status Toggle */}
        <View style={[styles.statusBadge, { backgroundColor: isOnline ? 'rgba(34, 181, 115, 0.1)' : 'rgba(102, 112, 133, 0.1)' }]}>
          <Text style={[styles.statusText, { color: isOnline ? Colors.success : Colors.textSecondary }]}>
            {isOnline ? 'Store Open' : 'Store Closed'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#D1D5DB', true: Colors.success }}
            thumbColor={Colors.white}
            ios_backgroundColor="#D1D5DB"
            style={styles.switch}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Real-time WebSocket Simulator Pills */}
        <View style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <Zap color={Colors.primary} size={16} />
            <Text style={styles.simulatorTitle}>WebSocket Simulation Control Center</Text>
          </View>
          <Text style={styles.simulatorSub}>Inject simulated real-time events to test reactivity:</Text>
          <View style={styles.simulatorButtons}>
            <TouchableOpacity style={styles.simButton} onPress={() => triggerWSSimulator('order')}>
              <ShoppingBag color={Colors.primary} size={14} />
              <Text style={styles.simButtonText}>+ New Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.simButton, { borderColor: Colors.copper }]} onPress={() => triggerWSSimulator('bargain')}>
              <Percent color={Colors.copper} size={14} />
              <Text style={[styles.simButtonText, { color: Colors.copper }]}>+ Bargain</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.simButton, { borderColor: Colors.warning }]} onPress={() => triggerWSSimulator('alert')}>
              <Activity color={Colors.warning} size={14} />
              <Text style={[styles.simButtonText, { color: Colors.warning }]}>Low Stock</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Performance Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Store Performance</Text>
          <Text style={styles.sectionSubtitle}>Today's real-time highlights</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Revenue Card (Double Width) */}
          <View style={[styles.statCard, styles.revenueCard]}>
            <View style={styles.statRow}>
              <View>
                <Text style={styles.statLabelLight}>TODAY'S REVENUE</Text>
                <Text style={styles.revenueValue}>{formatCurrency(dashboardStore.todayRevenue)}</Text>
              </View>
              <View style={styles.revenueIconBg}>
                <TrendingUp color={Colors.white} size={24} />
              </View>
            </View>
            <View style={styles.revenueMeta}>
              <Text style={styles.statLabelLight}>Net earnings after platform fees</Text>
            </View>
          </View>

          {/* Grid Cards */}
          <View style={styles.statCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(0, 109, 119, 0.1)' }]}>
              <ShoppingBag color={Colors.primary} size={18} />
            </View>
            <Text style={styles.statLabel}>Today's Orders</Text>
            <Text style={styles.statValue}>{dashboardStore.todayOrders}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(242, 169, 59, 0.1)' }]}>
              <Clock color={Colors.warning} size={18} />
            </View>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.statValue}>{dashboardStore.pendingOrders}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 181, 115, 0.1)' }]}>
              <CheckCircle color={Colors.success} size={18} />
            </View>
            <Text style={styles.statLabel}>Delivered</Text>
            <Text style={styles.statValue}>{dashboardStore.deliveredOrders}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(201, 124, 93, 0.1)' }]}>
              <Truck color={Colors.copper} size={18} />
            </View>
            <Text style={styles.statLabel}>Active Drivers</Text>
            <Text style={styles.statValue}>{dashboardStore.activeDeliveryPartners}</Text>
          </View>

          <View style={[styles.statCard, { width: '100%' }]}>
            <View style={styles.statRow}>
              <View style={styles.flexRow}>
                <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 181, 115, 0.1)', marginRight: 12 }]}>
                  <Star color={Colors.success} size={18} fill={Colors.success} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Average Rating</Text>
                  <Text style={styles.statValue}>{dashboardStore.averageRating} / 5.0</Text>
                </View>
              </View>
              <Text style={styles.ratingSubtitle}>Based on recent orders</Text>
            </View>
          </View>
        </View>





        {/* Analytics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Analytics Dashboard</Text>
          <Text style={styles.sectionSubtitle}>Compare store statistics</Text>
        </View>

        <View style={styles.chartTabs}>
          <TouchableOpacity
            style={[styles.chartTab, chartTab === 'today' && styles.activeChartTab]}
            onPress={() => setChartTab('today')}
          >
            <Text style={[styles.chartTabText, chartTab === 'today' && styles.activeChartTabText]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTab, chartTab === 'weekly' && styles.activeChartTab]}
            onPress={() => setChartTab('weekly')}
          >
            <Text style={[styles.chartTabText, chartTab === 'weekly' && styles.activeChartTabText]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTab, chartTab === 'monthly' && styles.activeChartTab]}
            onPress={() => setChartTab('monthly')}
          >
            <Text style={[styles.chartTabText, chartTab === 'monthly' && styles.activeChartTabText]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        {/* Chart Render Card */}
        <View style={styles.chartCard}>
          {chartTab === 'today' ? (
            <>
              <Text style={styles.chartCardTitle}>Sales Trends (Hourly)</Text>
              <LineChart data={analyticsStore.salesToday.slice()} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>Peak Hour</Text>
                  <Text style={styles.chartStatValue}>6:00 PM</Text>
                </View>
                <View>
                  <Text style={styles.chartStatLabel}>Avg Sale/Hour</Text>
                  <Text style={styles.chartStatValue}>₹1,605</Text>
                </View>
              </View>
            </>
          ) : chartTab === 'weekly' ? (
            <>
              <Text style={styles.chartCardTitle}>Weekly Revenue (₹)</Text>
              <BarChart data={analyticsStore.weeklyRevenue.slice()} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>Highest Sales Day</Text>
                  <Text style={styles.chartStatValue}>Sunday (₹24,500)</Text>
                </View>
                <View>
                  <Text style={styles.chartStatLabel}>Weekly Total</Text>
                  <Text style={styles.chartStatValue}>₹1,27,340</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.chartCardTitle}>Monthly Revenue Trend (₹)</Text>
              <LineChart data={analyticsStore.monthlyRevenue.slice()} height={150} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>Growth MoM</Text>
                  <Text style={styles.chartStatValue}>+14.2%</Text>
                </View>
                <View>
                  <Text style={styles.chartStatLabel}>Peak Month</Text>
                  <Text style={styles.chartStatValue}>May (₹4.8L)</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Category Breakdown Card */}
        <View style={[styles.chartCard, { marginBottom: 100 }]}>
          <Text style={styles.chartCardTitle}>Category Performance</Text>
          <Text style={styles.chartCardSubtitle}>Sales share by product department</Text>
          <DonutChart data={analyticsStore.categoryPerformance.slice()} />
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  simulatorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    ...Shadows.soft,
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  simulatorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  simulatorSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  simulatorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
  },
  simButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    width: (width - 44) / 2, // 2-column flow with gap/padding
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
  },
  revenueCard: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderColor: Colors.deepTeal,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
  statLabelLight: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 4,
  },
  revenueMeta: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 8,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  ratingSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  carouselContainer: {
    paddingRight: 16,
    paddingBottom: 24,
    gap: 12,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderLeftWidth: 6,
    padding: 16,
    width: width - 64,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.7)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  insightActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 112, 133, 0.05)',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeChartTab: {
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  chartTabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeChartTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  chartCardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  chartStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  chartStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
});
