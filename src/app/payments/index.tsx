import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  TrendingDown,
  Percent,
  Coins,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const PaymentsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const { paymentsStore } = useStores();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleWithdraw = () => {
    if (paymentsStore.walletBalance <= 0) {
      Alert.alert('Empty Wallet', 'No earnings available for payout.');
      return;
    }
    setIsWithdrawing(true);
    // Simulate real-time bank settlement and notify
    setTimeout(() => {
      paymentsStore.requestPayout();
      setIsWithdrawing(false);
      Alert.alert('Payout Processed', 'Available balance successfully withdrawn to your registered bank account.');
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Wallet & Payouts</Text>
          <Text style={styles.subtitle}>Direct settlements, commission tracking & payouts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Available Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <View style={styles.cardIconBg}>
              <Wallet color={Colors.white} size={20} />
            </View>
            <Text style={styles.walletLabel}>AVAILABLE FOR TRANSFER</Text>
          </View>
          
          <Text style={styles.walletBalance}>{formatCurrency(paymentsStore.walletBalance)}</Text>
          <Text style={styles.walletSubText}>Settles instantly to your default bank account</Text>
          
          <Button
            label="Withdraw to Bank Account"
            variant="secondary"
            loading={isWithdrawing}
            onPress={handleWithdraw}
            style={styles.withdrawBtn}
          />
        </View>

        {/* Financial Breakdown Grid */}
        <View style={styles.sectionHeaderRow}>
          <TrendingUp color={Colors.primary} size={16} />
          <Text style={styles.sectionHeaderTitle}>Lifetime Store Earnings</Text>
        </View>

        <View style={styles.gridBreakdown}>
          <View style={styles.gridCell}>
            <View style={[styles.cellIconBg, { backgroundColor: 'rgba(34, 181, 115, 0.1)' }]}>
              <Coins color={Colors.success} size={16} />
            </View>
            <Text style={styles.cellLabel}>Net Earnings</Text>
            <Text style={[styles.cellVal, { color: Colors.success }]}>
              {formatCurrency(paymentsStore.netEarnings)}
            </Text>
            <Text style={styles.cellSub}>Post platform fee</Text>
          </View>

          <View style={styles.gridCell}>
            <View style={[styles.cellIconBg, { backgroundColor: 'rgba(229, 72, 77, 0.1)' }]}>
              <TrendingDown color={Colors.error} size={16} />
            </View>
            <Text style={styles.cellLabel}>Commissions Paid</Text>
            <Text style={[styles.cellVal, { color: Colors.error }]}>
              {formatCurrency(paymentsStore.commissionsPaid)}
            </Text>
            <Text style={styles.cellSub}>Platform charges</Text>
          </View>

          <View style={styles.gridCell}>
            <View style={[styles.cellIconBg, { backgroundColor: 'rgba(0, 109, 119, 0.1)' }]}>
              <Percent color={Colors.primary} size={16} />
            </View>
            <Text style={styles.cellLabel}>GST Collected</Text>
            <Text style={styles.cellVal}>
              {formatCurrency(paymentsStore.gstCollected)}
            </Text>
            <Text style={styles.cellSub}>Tax liabilities</Text>
          </View>

          <View style={styles.gridCell}>
            <View style={[styles.cellIconBg, { backgroundColor: 'rgba(201, 124, 93, 0.1)' }]}>
              <ArrowDownCircle color={Colors.copper} size={16} />
            </View>
            <Text style={styles.cellLabel}>Refunds Processed</Text>
            <Text style={styles.cellVal}>
              {formatCurrency(paymentsStore.refundsProcessed)}
            </Text>
            <Text style={styles.cellSub}>Returned items</Text>
          </View>
        </View>

        {/* Withdrawal Transactions List */}
        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionHeaderTitle}>Withdrawal & Payout History</Text>
        </View>

        <View style={styles.historyContainer}>
          {paymentsStore.payouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No payouts requested yet.</Text>
            </View>
          ) : (
            paymentsStore.payouts.map((pay) => (
              <View key={pay.id} style={styles.payoutCard}>
                <View style={{ flex: 1 }}>
                  <View style={styles.payoutCardRow}>
                    <Text style={styles.payoutAmt}>{formatCurrency(pay.amount)}</Text>
                    <View style={[
                      styles.statusPill, 
                      { backgroundColor: pay.status === 'Paid' ? 'rgba(34, 181, 115, 0.08)' : 'rgba(242, 169, 59, 0.08)' }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: pay.status === 'Paid' ? Colors.success : Colors.warning }
                      ]}>
                        {pay.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.payoutTxn}>Reference: {pay.transactionId}</Text>
                  <Text style={styles.payoutDate}>Settlement Date: {pay.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
});

// Default export as required by Expo Router conventions
export default PaymentsScreen;

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
  walletCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 20,
    ...Shadows.medium,
    marginBottom: 24,
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },
  walletBalance: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.white,
    marginVertical: 14,
  },
  walletSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    fontWeight: '500',
  },
  withdrawBtn: {
    width: '100%',
    shadowColor: Colors.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  gridBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  gridCell: {
    width: (width - 42) / 2, // 2 column layout with gap
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    borderRadius: 20,
    padding: 14,
    ...Shadows.soft,
  },
  cellIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cellLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cellVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  cellSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyContainer: {
    gap: 8,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  payoutCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    padding: 16,
    borderRadius: 20,
    ...Shadows.soft,
  },
  payoutCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  payoutAmt: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  payoutTxn: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  payoutDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
