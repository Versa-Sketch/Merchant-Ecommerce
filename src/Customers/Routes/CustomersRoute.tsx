import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { ArrowLeft, Search, MessageSquare, Phone, User, ShoppingBag, Award } from 'lucide-react-native';
import styles from './styles';

type FilterType = 'All' | 'Top' | 'Repeat' | 'High Value' | 'Inactive';

export default observer(function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { customersStore } = useStores();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const getFilteredCustomers = () => {
    let list = activeFilter === 'Top' ? customersStore.topCustomers
      : activeFilter === 'Repeat' ? customersStore.repeatCustomers
      : activeFilter === 'High Value' ? customersStore.highValueCustomers
      : activeFilter === 'Inactive' ? customersStore.inactiveCustomers
      : customersStore.customers;

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
      case 'Top': return { text: Colors.success, bg: 'rgba(34, 181, 115, 0.08)' };
      case 'Repeat': return { text: Colors.primary, bg: 'rgba(0, 109, 119, 0.08)' };
      case 'High Value': return { text: Colors.warning, bg: 'rgba(242, 169, 59, 0.08)' };
      default: return { text: Colors.textSecondary, bg: 'rgba(102, 112, 133, 0.08)' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Customer Directory</Text>
          <Text style={styles.subtitle}>Loyalty tracking, segment breakdown & contact hub</Text>
        </View>
      </View>

      <View style={styles.topContainer}>
        <View style={styles.searchBox}>
          <Search size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search customers by name..." placeholderTextColor={Colors.textSecondary} style={styles.searchInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroller}>
          {(['All', 'Top', 'Repeat', 'High Value', 'Inactive'] as FilterType[]).map((f) => (
            <TouchableOpacity key={f} style={[styles.filterPill, activeFilter === f && styles.activeFilterPill]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterPillText, activeFilter === f && styles.activeFilterPillText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleContactCustomer(customer.name, 'message')}>
                      <MessageSquare size={14} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { borderColor: Colors.copper }]} onPress={() => handleContactCustomer(customer.name, 'call')}>
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
