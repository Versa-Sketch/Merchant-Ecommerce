import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../stores/RootStore';
import { Colors } from '../../../theme/colors';
import { Shadows } from '../../../theme/shadows';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/bottomSheets/BottomSheet';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  FileText,
  UserCheck,
  CheckCircle,
  Truck,
  Package,
  Clock,
} from 'lucide-react-native';

const STATUS_FILTERS = [
  'New Orders',
  'Accepted',
  'Packed',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
];

export default observer(function OrdersScreen() {
  const { ordersStore, deliveryStore } = useStores();
  const [selectedStatus, setSelectedStatus] = useState<string>('New Orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isAssignVisible, setIsAssignVisible] = useState(false);

  const getFilteredOrders = () => {
    switch (selectedStatus) {
      case 'New Orders':
        return ordersStore.newOrders;
      case 'Accepted':
        return ordersStore.acceptedOrders;
      case 'Packed':
        return ordersStore.packedOrders;
      case 'Out For Delivery':
        return ordersStore.outForDeliveryOrders;
      case 'Delivered':
        return ordersStore.deliveredOrders;
      case 'Cancelled':
        return ordersStore.cancelledOrders;
      default:
        return ordersStore.orders;
    }
  };

  const activeOrder = ordersStore.orders.find((o) => o.id === selectedOrderId);

  const handleAccept = (id: string) => {
    ordersStore.acceptOrder(id);
    Alert.alert('Order Accepted', `Order ${id} is now in the Accepted state.`, [
      { text: 'OK' }
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Order', `Are you sure you want to reject order ${id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => ordersStore.rejectOrder(id),
      },
    ]);
  };

  const handleNextStatus = (id: string, currentStatus: string) => {
    const order = ordersStore.orders.find((o) => o.id === id);
    if (!order) return;

    if (currentStatus === 'Accepted') {
      order.updateStatus('Packed');
    } else if (currentStatus === 'Packed') {
      // Check if driver assigned
      if (!order.deliveryPartnerId) {
        Alert.alert('Driver Required', 'Please assign a delivery partner before marking order as Out For Delivery.');
        return;
      }
      order.updateStatus('Out For Delivery');
    } else if (currentStatus === 'Out For Delivery') {
      order.updateStatus('Delivered');
      // Increment driver stats
      if (order.deliveryPartnerId) {
        const partner = deliveryStore.partners.find((p) => p.id === order.deliveryPartnerId);
        if (partner) partner.incrementCompleted();
      }
    }
  };

  const openDetails = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailsVisible(true);
  };

  const openAssignDriver = (id: string) => {
    setSelectedOrderId(id);
    setIsAssignVisible(true);
  };

  const handleAssignDriver = (partnerId: string) => {
    if (selectedOrderId) {
      ordersStore.assignDeliveryPartner(selectedOrderId, partnerId);
      deliveryStore.assignDriverToOrder(partnerId);
      setIsAssignVisible(false);
      Alert.alert('Driver Assigned', 'Delivery partner has been assigned to the order.');
    }
  };

  const printInvoice = (id: string) => {
    const order = ordersStore.orders.find((o) => o.id === id);
    if (!order) return;
    const text = `Localio Merchant - INVOICE\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nAmount: ₹${order.amount}\nItems: ${order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}`;
    Share.share({ message: text });
  };

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Order Center</Text>
        <Text style={styles.subtitle}>{ordersStore.orders.length} Total orders registered</Text>
      </View>

      {/* Filter tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
        >
          {STATUS_FILTERS.map((status) => {
            const count =
              status === 'New Orders'
                ? ordersStore.newOrders.length
                : status === 'Accepted'
                ? ordersStore.acceptedOrders.length
                : status === 'Packed'
                ? ordersStore.packedOrders.length
                : status === 'Out For Delivery'
                ? ordersStore.outForDeliveryOrders.length
                : status === 'Delivered'
                ? ordersStore.deliveredOrders.length
                : ordersStore.cancelledOrders.length;

            const isSelected = selectedStatus === status;

            return (
              <TouchableOpacity
                key={status}
                style={[styles.filterTab, isSelected && styles.activeFilterTab]}
                onPress={() => setSelectedStatus(status)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterTabText, isSelected && styles.activeFilterTabText]}>
                  {status}
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
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView contentContainerStyle={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No orders here</Text>
            <Text style={styles.emptySub}>No orders match the status '{selectedStatus}' right now.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const assignedDriver = deliveryStore.partners.find((p) => p.id === order.deliveryPartnerId);

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderTime}>{order.orderTime}</Text>
                  </View>
                  <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>₹{order.amount}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <Text style={styles.itemsSummary}>
                    {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'} • {order.paymentMethod}
                  </Text>
                  {assignedDriver ? (
                    <View style={styles.driverInfoPill}>
                      <UserCheck size={12} color={Colors.copper} />
                      <Text style={styles.driverInfoText}>Driver: {assignedDriver.name}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  {order.status === 'New Orders' ? (
                    <>
                      <Button
                        label="Accept"
                        variant="primary"
                        size="sm"
                        onPress={() => handleAccept(order.id)}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Reject"
                        variant="outline"
                        size="sm"
                        onPress={() => handleReject(order.id)}
                        style={styles.actionBtn}
                      />
                    </>
                  ) : order.status === 'Accepted' ? (
                    <>
                      <Button
                        label="Assign Driver"
                        variant="secondary"
                        size="sm"
                        onPress={() => openAssignDriver(order.id)}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Mark Packed"
                        variant="primary"
                        size="sm"
                        onPress={() => handleNextStatus(order.id, 'Accepted')}
                        style={styles.actionBtn}
                      />
                    </>
                  ) : order.status === 'Packed' ? (
                    <>
                      {!order.deliveryPartnerId ? (
                        <Button
                          label="Assign Driver"
                          variant="secondary"
                          size="sm"
                          onPress={() => openAssignDriver(order.id)}
                          style={styles.actionBtn}
                        />
                      ) : (
                        <Button
                          label="Ship Order"
                          variant="primary"
                          size="sm"
                          onPress={() => handleNextStatus(order.id, 'Packed')}
                          style={styles.actionBtn}
                        />
                      )}
                    </>
                  ) : order.status === 'Out For Delivery' ? (
                    <Button
                      label="Mark Delivered"
                      variant="primary"
                      size="sm"
                      onPress={() => handleNextStatus(order.id, 'Out For Delivery')}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <Button
                      label="Print Invoice"
                      variant="outline"
                      size="sm"
                      onPress={() => printInvoice(order.id)}
                      style={{ flex: 1 }}
                    />
                  )}
                  <Button
                    label="Details"
                    variant="ghost"
                    size="sm"
                    onPress={() => openDetails(order.id)}
                    style={styles.detailBtn}
                  />
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Order Details Bottom Sheet */}
      <BottomSheet
        isVisible={isDetailsVisible}
        onClose={() => setIsDetailsVisible(false)}
        title="Order Specifications"
      >
        {activeOrder ? (
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
            {/* Customer Section */}
            <View style={styles.sheetSection}>
              <View style={styles.sectionTitleRow}>
                <User size={16} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Customer Details</Text>
              </View>
              <Text style={styles.sheetTextBold}>{activeOrder.customerName}</Text>
              <Text style={styles.sheetTextSub}>{activeOrder.customerPhone}</Text>
              <View style={[styles.flexRow, { marginTop: 8 }]}>
                <MapPin size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.addressText}>{activeOrder.deliveryAddress}</Text>
              </View>
            </View>

            {/* Products Section */}
            <View style={styles.sheetSection}>
              <View style={styles.sectionTitleRow}>
                <Package size={16} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Items Ordered</Text>
              </View>
              {activeOrder.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.name} <Text style={styles.itemQty}>x{item.quantity}</Text>
                  </Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalVal}>₹{activeOrder.amount}</Text>
              </View>
            </View>

            {/* Payment Section */}
            <View style={styles.sheetSection}>
              <View style={styles.sectionTitleRow}>
                <CreditCard size={16} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Payment Details</Text>
              </View>
              <Text style={styles.sheetTextBold}>{activeOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Online'}</Text>
              <Text style={styles.sheetTextSub}>Transaction status: {activeOrder.paymentMethod === 'Online' ? 'Captured Success' : 'Awaiting collection'}</Text>
            </View>

            {/* Timeline Section */}
            <View style={[styles.sheetSection, { borderBottomWidth: 0 }]}>
              <View style={styles.sectionTitleRow}>
                <Clock size={16} color={Colors.primary} />
                <Text style={styles.sheetSectionTitle}>Order Timeline</Text>
              </View>
              {activeOrder.timeline.map((event, idx) => (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelinePoint}>
                    <CheckCircle size={14} color={Colors.success} fill={Colors.success} />
                    {idx < activeOrder.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <View style={styles.timelineDetails}>
                    <Text style={styles.timelineText}>{event.status}</Text>
                    <Text style={styles.timelineTime}>{event.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}
      </BottomSheet>

      {/* Driver Assignment Bottom Sheet */}
      <BottomSheet
        isVisible={isAssignVisible}
        onClose={() => setIsAssignVisible(false)}
        title="Assign Delivery Partner"
        height={0.55}
      >
        <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
          <Text style={styles.sheetSectionSubtitle}>Select an available store rider:</Text>
          {deliveryStore.availablePartners.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Truck size={32} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No riders available</Text>
              <Text style={styles.emptySub}>All delivery partners are currently busy or offline.</Text>
            </View>
          ) : (
            deliveryStore.availablePartners.map((partner) => (
              <View key={partner.id} style={styles.partnerAssignmentCard}>
                <View>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.partnerPhone}>Phone: {partner.phone}</Text>
                  <Text style={styles.partnerRating}>Rating: ⭐ {partner.rating}</Text>
                </View>
                <Button
                  label="Assign"
                  variant="primary"
                  size="sm"
                  onPress={() => handleAssignDriver(partner.id)}
                />
              </View>
            ))
          )}
        </ScrollView>
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
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    ...Shadows.soft,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeFilterTabText: {
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
  ordersList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  amountBadge: {
    backgroundColor: 'rgba(0, 109, 119, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardDetails: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemsSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  driverInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 124, 93, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  driverInfoText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.copper,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1.2,
  },
  detailBtn: {
    flex: 0.8,
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
    paddingHorizontal: 32,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    padding: 20,
  },
  sheetSection: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sheetSectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  sheetTextBold: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetTextSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  itemQty: {
    fontWeight: '700',
    color: Colors.primary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  timelinePoint: {
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.success,
    marginVertical: 4,
  },
  timelineDetails: {
    paddingBottom: 16,
  },
  timelineText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timelineTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  partnerAssignmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    borderRadius: 16,
    marginVertical: 6,
    ...Shadows.soft,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  partnerPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  partnerRating: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
