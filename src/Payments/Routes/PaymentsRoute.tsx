import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Wallet, TrendingUp, ArrowDownCircle, TrendingDown, Percent, Coins } from 'lucide-react-native';
import styles from './styles';

export default observer(function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { paymentsStore } = useStores();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const handleWithdraw = () => {
    if (paymentsStore.walletBalance <= 0) { Alert.alert('Empty Wallet', 'No earnings available for payout.'); return; }
    setIsWithdrawing(true);
    setTimeout(() => {
      paymentsStore.requestPayout();
      setIsWithdrawing(false);
      Alert.alert('Payout Processed', 'Available balance successfully withdrawn to your registered bank account.');
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
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
        <View style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <View style={styles.cardIconBg}><Wallet color={Colors.white} size={20} /></View>
            <Text style={styles.walletLabel}>AVAILABLE FOR TRANSFER</Text>
          </View>
          <Text style={styles.walletBalance}>{formatCurrency(paymentsStore.walletBalance)}</Text>
          <Text style={styles.walletSubText}>Settles instantly to your default bank account</Text>
          <Button label="Withdraw to Bank Account" variant="secondary" loading={isWithdrawing} onPress={handleWithdraw} style={styles.withdrawBtn} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <TrendingUp color={Colors.primary} size={16} />
          <Text style={styles.sectionHeaderTitle}>Lifetime Store Earnings</Text>
        </View>

        <View style={styles.gridBreakdown}>
          {[
            { icon: Coins, iconColor: Colors.success, bg: 'rgba(34, 181, 115, 0.1)', label: 'Net Earnings', val: paymentsStore.netEarnings, valColor: Colors.success, sub: 'Post platform fee' },
            { icon: TrendingDown, iconColor: Colors.error, bg: 'rgba(229, 72, 77, 0.1)', label: 'Commissions Paid', val: paymentsStore.commissionsPaid, valColor: Colors.error, sub: 'Platform charges' },
            { icon: Percent, iconColor: Colors.primary, bg: 'rgba(0, 109, 119, 0.1)', label: 'GST Collected', val: paymentsStore.gstCollected, valColor: undefined, sub: 'Tax liabilities' },
            { icon: ArrowDownCircle, iconColor: Colors.copper, bg: 'rgba(201, 124, 93, 0.1)', label: 'Refunds Processed', val: paymentsStore.refundsProcessed, valColor: undefined, sub: 'Returned items' },
          ].map(({ icon: Icon, iconColor, bg, label, val, valColor, sub }) => (
            <View key={label} style={styles.gridCell}>
              <View style={[styles.cellIconBg, { backgroundColor: bg }]}><Icon color={iconColor} size={16} /></View>
              <Text style={styles.cellLabel}>{label}</Text>
              <Text style={[styles.cellVal, valColor ? { color: valColor } : {}]}>{formatCurrency(val)}</Text>
              <Text style={styles.cellSub}>{sub}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionHeaderRow, { marginTop: 12 }]}>
          <Text style={styles.sectionHeaderTitle}>Withdrawal & Payout History</Text>
        </View>

        <View style={styles.historyContainer}>
          {paymentsStore.payouts.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>No payouts requested yet.</Text></View>
          ) : (
            paymentsStore.payouts.map((pay) => (
              <View key={pay.id} style={styles.payoutCard}>
                <View style={styles.payoutCardRow}>
                  <Text style={styles.payoutAmt}>{formatCurrency(pay.amount)}</Text>
                  <View style={[styles.statusPill, { backgroundColor: pay.status === 'Paid' ? 'rgba(34, 181, 115, 0.08)' : 'rgba(242, 169, 59, 0.08)' }]}>
                    <Text style={[styles.statusText, { color: pay.status === 'Paid' ? Colors.success : Colors.warning }]}>{pay.status}</Text>
                  </View>
                </View>
                <Text style={styles.payoutTxn}>Reference: {pay.transactionId}</Text>
                <Text style={styles.payoutDate}>Settlement Date: {pay.date}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
});
