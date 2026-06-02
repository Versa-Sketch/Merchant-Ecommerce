import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { LineChart, BarChart, DonutChart } from '../../components/charts/Charts';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Clock,
  Star,
  Users,
  Percent,
  Sparkles,
  Award,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default observer(function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { analyticsStore, dashboardStore } = useStores();
  const [chartTab, setChartTab] = useState<'today' | 'weekly' | 'monthly'>('today');

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Analytics Hub</Text>
          <Text style={styles.subtitle}>Deep dive into store growth & performance</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 181, 115, 0.1)' }]}>
              <TrendingUp color={Colors.success} size={18} />
            </View>
            <Text style={styles.metricLabel}>Retention Rate</Text>
            <Text style={styles.metricValue}>{analyticsStore.customerRetentionRate}%</Text>
            <Text style={styles.metricSub}>MoM loyal buyers</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(201, 124, 93, 0.1)' }]}>
              <Users color={Colors.copper} size={18} />
            </View>
            <Text style={styles.metricLabel}>Repeat Purchase</Text>
            <Text style={styles.metricValue}>{analyticsStore.repeatPurchaseRate}%</Text>
            <Text style={styles.metricSub}>Multi-order users</Text>
          </View>
        </View>

        {/* Revenue Performance Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenue Trends</Text>
          <Text style={styles.sectionSubtitle}>Select range to analyze sales volume</Text>
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

        {/* Sales Chart Card */}
        <View style={styles.chartCard}>
          {chartTab === 'today' ? (
            <>
              <Text style={styles.chartCardTitle}>Hourly Sales (₹)</Text>
              <LineChart data={analyticsStore.salesToday.slice()} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>Peak Selling Hour</Text>
                  <Text style={styles.chartStatValue}>06:00 PM - 08:00 PM</Text>
                </View>
                <View>
                  <Text style={styles.chartStatLabel}>Avg Hourly Revenue</Text>
                  <Text style={styles.chartStatValue}>₹1,605</Text>
                </View>
              </View>
            </>
          ) : chartTab === 'weekly' ? (
            <>
              <Text style={styles.chartCardTitle}>Daily Revenue (₹)</Text>
              <BarChart data={analyticsStore.weeklyRevenue.slice()} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>Highest Selling Day</Text>
                  <Text style={styles.chartStatValue}>Sunday (₹24,500)</Text>
                </View>
                <View>
                  <Text style={styles.chartStatLabel}>Weekly Aggregate</Text>
                  <Text style={styles.chartStatValue}>₹1,27,340</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.chartCardTitle}>Monthly Sales Trend (₹)</Text>
              <LineChart data={analyticsStore.monthlyRevenue.slice()} height={150} />
              <View style={styles.chartStatsRow}>
                <View>
                  <Text style={styles.chartStatLabel}>MoM Sales Growth</Text>
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

        {/* Category Share */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Share</Text>
          <Text style={styles.sectionSubtitle}>Sales distribution by department</Text>
        </View>
        <View style={styles.chartCard}>
          <DonutChart data={analyticsStore.categoryPerformance.slice()} />
        </View>

        {/* Top Selling Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <Text style={styles.sectionSubtitle}>Highest contributors to store catalog</Text>
        </View>
        <View style={styles.topProductsList}>
          {analyticsStore.topProducts.map((product, idx) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productRank}>
                <Award size={18} color={idx === 0 ? Colors.warning : idx === 1 ? Colors.textSecondary : Colors.copper} />
                <Text style={styles.rankText}>{idx + 1}</Text>
              </View>
              <Image source={{ uri: product.image }} style={styles.productImg} />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productSales}>{product.unitsSold} units sold</Text>
              </View>
              <View style={styles.productEarnings}>
                <Text style={styles.earningsVal}>{formatCurrency(product.revenue)}</Text>
                <Text style={styles.earningsLabel}>Revenue</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 112, 133, 0.05)',
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
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
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeChartTabText: {
    color: Colors.primary,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
    marginBottom: 20,
  },
  chartCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
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
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartStatValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  topProductsList: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productRank: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 32,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  productImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.background,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productSales: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  productEarnings: {
    alignItems: 'flex-end',
  },
  earningsVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  earningsLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
