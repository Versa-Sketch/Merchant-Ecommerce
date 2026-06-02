import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Search,
  MessageSquare,
  Phone,
  User,
  ShoppingBag,
  Award,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type FilterType = 'All' | 'Top' | 'Repeat' | 'High Value' | 'Inactive';

export default observer(function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { analyticsStore } = useStores();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getFilteredCustomers = () => {
    let list: ReadonlyArray<typeof analyticsStore.customers[number]> = analyticsStore.customers;
    if (activeFilter === 'Top') {
      list = analyticsStore.topCustomers;
    } else if (activeFilter === 'Repeat') {
      list = analyticsStore.repeatCustomers;
    } else if (activeFilter === 'High Value') {
      list = analyticsStore.highValueCustomers;
    } else if (activeFilter === 'Inactive') {
      list = analyticsStore.inactiveCustomers;
    }

    return list.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery)
    );
  };

  const filteredCustomers = getFilteredCustomers();

  const handleContactCustomer = (name: string, type: 'call' | 'message') => {
    if (type === 'call') {
      Alert.alert('Placing Call', `Simulating a VoIP phone call to ${name}...`);
    } else {
      Alert.alert('Sending Notification', `Simulating sending an SMS/WhatsApp merchant message to ${name}...`);
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Top':
        return { text: Colors.success, bg: 'rgba(34, 181, 115, 0.08)' };
      case 'Repeat':
        return { text: Colors.primary, bg: 'rgba(0, 109, 119, 0.08)' };
      case 'High Value':
        return { text: Colors.warning, bg: 'rgba(242, 169, 59, 0.08)' };
      default:
        return { text: Colors.textSecondary, bg: 'rgba(102, 112, 133, 0.08)' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Customer Directory</Text>
          <Text style={styles.subtitle}>Loyalty tracking, segment breakdown & contact hub</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.topContainer}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search customers by name..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroller}>
          {(['All', 'Top', 'Repeat', 'High Value', 'Inactive'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.activeFilterPill]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterPillText, activeFilter === f && styles.activeFilterPillText]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Customer List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No buyers found</Text>
            <Text style={styles.emptySub}>No customer matches your search or selected segment filter.</Text>
          </View>
        ) : (
          filteredCustomers.map((customer) => {
            const colors = getSegmentColor(customer.segment);
            return (
              <View key={customer.id} style={styles.customerCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{customer.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.customerMeta}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <Text style={styles.customerId}>ID: {customer.id}</Text>
                  </View>
                  <View style={[styles.segmentBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.segmentText, { color: colors.text }]}>{customer.segment}</Text>
                  </View>
                </View>

                {/* Details grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailCell}>
                    <ShoppingBag size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.detailLabel}>Orders:</Text>
                    <Text style={styles.detailValue}>{customer.ordersCount}</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Award size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.detailLabel}>Spend:</Text>
                    <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: '800' }]}>{formatCurrency(customer.lifetimeSpend)}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.lastOrderDate}>Last order: {customer.lastOrderDate}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleContactCustomer(customer.name, 'message')}
                    >
                      <MessageSquare size={14} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: Colors.copper }]}
                      onPress={() => handleContactCustomer(customer.name, 'call')}
                    >
                      <Phone size={14} color={Colors.copper} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
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
  topContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filterScroller: {
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeFilterPillText: {
    color: Colors.white,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 109, 119, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  customerMeta: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerId: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  segmentBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
    paddingTop: 12,
    gap: 16,
  },
  detailCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
    paddingTop: 12,
  },
  lastOrderDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
