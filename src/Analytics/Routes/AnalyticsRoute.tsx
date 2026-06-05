import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { LineChart, BarChart, DonutChart } from '../../components/charts/Charts';
import { Image } from 'expo-image';
import { ArrowLeft, TrendingUp, Users, Award } from 'lucide-react-native';
import styles from './styles';

export default observer(function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { analyticsStore, dashboardStore } = useStores();
  const [chartTab, setChartTab] = useState<'today' | 'weekly' | 'monthly'>('today');

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenue Trends</Text>
          <Text style={styles.sectionSubtitle}>Select range to analyze sales volume</Text>
        </View>

        <View style={styles.chartTabs}>
          {(['today', 'weekly', 'monthly'] as const).map((tab) => (
            <TouchableOpacity key={tab} style={[styles.chartTab, chartTab === tab && styles.activeChartTab]} onPress={() => setChartTab(tab)}>
              <Text style={[styles.chartTabText, chartTab === tab && styles.activeChartTabText]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          {chartTab === 'today' ? (
            <>
              <Text style={styles.chartCardTitle}>Hourly Sales (₹)</Text>
              <LineChart data={analyticsStore.salesToday.slice()} />
              <View style={styles.chartStatsRow}>
                <View><Text style={styles.chartStatLabel}>Peak Selling Hour</Text><Text style={styles.chartStatValue}>06:00 PM - 08:00 PM</Text></View>
                <View><Text style={styles.chartStatLabel}>Avg Hourly Revenue</Text><Text style={styles.chartStatValue}>₹1,605</Text></View>
              </View>
            </>
          ) : chartTab === 'weekly' ? (
            <>
              <Text style={styles.chartCardTitle}>Daily Revenue (₹)</Text>
              <BarChart data={analyticsStore.weeklyRevenue.slice()} />
              <View style={styles.chartStatsRow}>
                <View><Text style={styles.chartStatLabel}>Highest Selling Day</Text><Text style={styles.chartStatValue}>Sunday (₹24,500)</Text></View>
                <View><Text style={styles.chartStatLabel}>Weekly Aggregate</Text><Text style={styles.chartStatValue}>₹1,27,340</Text></View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.chartCardTitle}>Monthly Sales Trend (₹)</Text>
              <LineChart data={analyticsStore.monthlyRevenue.slice()} height={150} />
              <View style={styles.chartStatsRow}>
                <View><Text style={styles.chartStatLabel}>MoM Sales Growth</Text><Text style={styles.chartStatValue}>+14.2%</Text></View>
                <View><Text style={styles.chartStatLabel}>Peak Month</Text><Text style={styles.chartStatValue}>May (₹4.8L)</Text></View>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Share</Text>
          <Text style={styles.sectionSubtitle}>Sales distribution by department</Text>
        </View>
        <View style={styles.chartCard}>
          <DonutChart data={analyticsStore.categoryPerformance.slice()} />
        </View>

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
