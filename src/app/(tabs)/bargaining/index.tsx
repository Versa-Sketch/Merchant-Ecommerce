import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores/RootStore';
import { Colors } from '../../../theme/colors';
import { Shadows } from '../../../theme/shadows';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/bottomSheets/BottomSheet';
import {
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingDown,
  DollarSign,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default observer(function BargainingScreen() {
  const { bargainingStore } = useStores();
  const [selectedSection, setSelectedSection] = useState<'Pending' | 'Accepted' | 'Rejected' | 'Expired'>('Pending');
  const [selectedBargainId, setSelectedBargainId] = useState<string | null>(null);

  // Counter offer sheet state
  const [isCounterVisible, setIsCounterVisible] = useState(false);
  const [counterPrice, setCounterPrice] = useState<number>(0);

  // Chat timeline detail modal state
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const getFilteredBargains = () => {
    switch (selectedSection) {
      case 'Pending':
        return bargainingStore.pendingBargains;
      case 'Accepted':
        return bargainingStore.acceptedBargains;
      case 'Rejected':
        return bargainingStore.rejectedBargains;
      case 'Expired':
        return bargainingStore.expiredBargains;
      default:
        return bargainingStore.bargains;
    }
  };

  const activeBargain = bargainingStore.bargains.find((b) => b.id === selectedBargainId);

  const handleAccept = (id: string) => {
    bargainingStore.acceptBargain(id);
    Alert.alert('Agreement Met!', 'Customer offer accepted. Order generated successfully.');
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Offer', 'Are you sure you want to reject this negotiation request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => bargainingStore.rejectBargain(id) },
    ]);
  };

  const openCounterSheet = (id: string) => {
    const bargain = bargainingStore.bargains.find((b) => b.id === id);
    if (!bargain) return;
    setSelectedBargainId(id);
    // Initialize counter price halfway between customer offer and current price
    setCounterPrice(Math.round(bargain.customerOffer + (bargain.currentPrice - bargain.customerOffer) * 0.5));
    setIsCounterVisible(true);
  };

  const submitCounter = () => {
    if (!selectedBargainId) return;
    bargainingStore.counterBargain(selectedBargainId, counterPrice);
    setIsCounterVisible(false);
    Alert.alert('Counter Sent', `Counter offer of ₹${counterPrice} dispatched to customer. Waiting for reply...`);
  };

  const openDetails = (id: string) => {
    setSelectedBargainId(id);
    setIsDetailsVisible(true);
  };

  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const filteredBargains = getFilteredBargains();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Negotiation Center</Text>
        <Text style={styles.subtitle}>{bargainingStore.pendingBargains.length} Live bargain requests in progress</Text>
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        {(['Pending', 'Accepted', 'Rejected', 'Expired'] as const).map((sec) => {
          const isSelected = selectedSection === sec;
          const count =
            sec === 'Pending'
              ? bargainingStore.pendingBargains.length
              : sec === 'Accepted'
              ? bargainingStore.acceptedBargains.length
              : sec === 'Rejected'
              ? bargainingStore.rejectedBargains.length
              : bargainingStore.expiredBargains.length;

          return (
            <TouchableOpacity
              key={sec}
              style={[styles.sectionTab, isSelected && styles.activeSectionTab]}
              onPress={() => setSelectedSection(sec)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sectionTabText, isSelected && styles.activeSectionTabText]}>
                {sec}
              </Text>
              {count > 0 ? (
                <View style={[styles.countBadge, { backgroundColor: isSelected ? Colors.white : Colors.primary }]}>
                  <Text style={[styles.countText, { color: isSelected ? Colors.primary : Colors.white }]}>
                    {count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bargain Cards List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredBargains.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No negotiations here</Text>
            <Text style={styles.emptySub}>No requests match the status '{selectedSection}' right now.</Text>
          </View>
        ) : (
          filteredBargains.map((bargain) => {
            const marginPercentage = Math.round((bargain.potentialProfit / bargain.merchantCost) * 100);

            return (
              <View key={bargain.id} style={styles.bargainCard}>
                {/* Product/Customer Header */}
                <View style={styles.cardHeader}>
                  <Image source={{ uri: bargain.productImage }} style={styles.productImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{bargain.customerName}</Text>
                    <Text style={styles.productName} numberOfLines={1}>{bargain.productName}</Text>
                  </View>

                  {bargain.status === 'Pending' ? (
                    <View style={styles.timerContainer}>
                      <Clock size={12} color={Colors.error} />
                      <Text style={styles.timerText}>{formatTimer(bargain.expirationTime)}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Price Details */}
                <View style={styles.priceContainer}>
                  <View style={styles.priceColumn}>
                    <Text style={styles.priceLabel}>Current Price</Text>
                    <Text style={styles.priceValStrike}>₹{bargain.currentPrice}</Text>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.priceLabel}>Customer Offer</Text>
                    <Text style={styles.priceValCustomer}>₹{bargain.customerOffer}</Text>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.priceLabel}>Profit Margin</Text>
                    <Text style={[styles.priceValProfit, { color: bargain.potentialProfit > 0 ? Colors.success : Colors.error }]}>
                      ₹{bargain.potentialProfit} ({marginPercentage}%)
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  {bargain.status === 'Pending' ? (
                    <>
                      <Button
                        label="Accept"
                        variant="primary"
                        size="sm"
                        onPress={() => handleAccept(bargain.id)}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Counter"
                        variant="secondary"
                        size="sm"
                        onPress={() => openCounterSheet(bargain.id)}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Reject"
                        variant="outline"
                        size="sm"
                        onPress={() => handleReject(bargain.id)}
                        style={styles.rejectBtn}
                      />
                    </>
                  ) : (
                    <Button
                      label="View Chat Log"
                      variant="outline"
                      size="sm"
                      onPress={() => openDetails(bargain.id)}
                      style={{ flex: 1 }}
                    />
                  )}
                  {bargain.status === 'Pending' ? (
                    <Button
                      label="Chat"
                      variant="ghost"
                      size="sm"
                      onPress={() => openDetails(bargain.id)}
                      style={styles.chatBtn}
                    />
                  ) : null}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Counter Offer Modal Sheet */}
      <BottomSheet
        isVisible={isCounterVisible}
        onClose={() => setIsCounterVisible(false)}
        title="Propose Counter Offer"
        height={0.5}
      >
        {activeBargain ? (
          <View style={styles.sheetContent}>
            <Text style={styles.sheetLabel}>Product: {activeBargain.productName}</Text>
            <View style={styles.priceSliderBox}>
              <Text style={styles.sliderValueText}>Counter Price: ₹{counterPrice}</Text>

              {/* Custom Selector instead of native slider which behaves weirdly in React Native */}
              <View style={styles.selectorGrid}>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setCounterPrice(Math.max(activeBargain.customerOffer, counterPrice - 5))}
                >
                  <Text style={styles.selectorBtnText}>- ₹5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectorBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => setCounterPrice(Math.min(activeBargain.currentPrice, counterPrice + 5))}
                >
                  <Text style={[styles.selectorBtnText, { color: Colors.white }]}>+ ₹5</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Profit Margin updates */}
            <View style={styles.marginPreviewCard}>
              <Text style={styles.marginPreviewLabel}>Potential Profit Margin:</Text>
              <Text style={styles.marginPreviewValue}>
                ₹{counterPrice - activeBargain.merchantCost} (
                {Math.round(((counterPrice - activeBargain.merchantCost) / activeBargain.merchantCost) * 100)}%)
              </Text>
            </View>

            <Button
              label="Transmit Counter Offer"
              variant="primary"
              onPress={submitCounter}
              style={{ marginTop: 24 }}
            />
          </View>
        ) : null}
      </BottomSheet>

      {/* Chat Conversation Timeline Sheet */}
      <BottomSheet
        isVisible={isDetailsVisible}
        onClose={() => setIsDetailsVisible(false)}
        title="Negotiation Timeline"
        height={0.7}
      >
        {activeBargain ? (
          <View style={{ flex: 1 }}>
            {/* Countdown info */}
            {activeBargain.status === 'Pending' ? (
              <View style={styles.chatHeaderInfo}>
                <Clock size={14} color={Colors.error} />
                <Text style={styles.chatHeaderText}>Remaining time: {formatTimer(activeBargain.expirationTime)}</Text>
              </View>
            ) : null}

            {/* Chat timeline messages list */}
            <ScrollView
              style={styles.chatScrollView}
              contentContainerStyle={styles.chatContentContainer}
            >
              {activeBargain.timeline.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                const isMerchant = msg.sender === 'merchant';

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatMessageWrapper,
                      isCustomer ? styles.msgCus : isMerchant ? styles.msgMer : styles.msgSys,
                    ]}
                  >
                    <View
                      style={[
                        styles.chatMessageBubble,
                        isCustomer
                          ? styles.bubbleCus
                          : isMerchant
                          ? styles.bubbleMer
                          : styles.bubbleSys,
                      ]}
                    >
                      <Text style={[styles.msgSenderText, { color: isCustomer ? Colors.copper : isMerchant ? Colors.primary : Colors.textSecondary }]}>
                        {isCustomer ? activeBargain.customerName : isMerchant ? 'You' : 'System'}
                      </Text>
                      <Text style={[styles.msgBodyText, { color: isMerchant ? Colors.white : Colors.textPrimary }]}>
                        {msg.message}
                      </Text>
                      {msg.price ? <Text style={styles.msgPricePill}>Price Point: ₹{msg.price}</Text> : null}
                      <Text style={styles.msgTimeText}>{msg.time}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  activeSectionTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeSectionTabText: {
    color: Colors.white,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  countText: {
    fontSize: 9,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  bargainCard: {
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
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  productName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  priceColumn: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priceValStrike: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  priceValCustomer: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.copper,
    marginTop: 2,
  },
  priceValProfit: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1.2,
  },
  rejectBtn: {
    flex: 0.8,
  },
  chatBtn: {
    flex: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  sheetContent: {
    padding: 20,
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  priceSliderBox: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  sliderValueText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 12,
  },
  selectorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  selectorBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  marginPreviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 181, 115, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 181, 115, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  marginPreviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  marginPreviewValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 72, 77, 0.05)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
    justifyContent: 'center',
  },
  chatHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  chatScrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatContentContainer: {
    padding: 16,
    gap: 12,
  },
  chatMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  msgCus: {
    justifyContent: 'flex-start',
  },
  msgMer: {
    justifyContent: 'flex-end',
  },
  msgSys: {
    justifyContent: 'center',
  },
  chatMessageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
    ...Shadows.soft,
  },
  bubbleCus: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 4,
  },
  bubbleMer: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleSys: {
    backgroundColor: 'rgba(102, 112, 133, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '90%',
  },
  msgSenderText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  msgBodyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  msgPricePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 124, 93, 0.15)',
    color: Colors.copper,
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 6,
  },
  msgTimeText: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
});
