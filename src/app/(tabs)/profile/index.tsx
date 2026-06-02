import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, Switch, Dimensions } from 'react-native';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../../stores/RootStore';
import { Colors } from '../../../theme/colors';
import { Shadows } from '../../../theme/shadows';
import { Button } from '../../../components/ui/Button';
import {
  Wallet,
  Truck,
  Star,
  LifeBuoy,
  Settings,
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  ChevronRight,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const ProfileScreen = observer(() => {
  const { authStore } = useStores();

  // Review reply state
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [reviewsList, setReviewsList] = useState([
    { id: '1', customer: 'Aarav Mehta', rating: 5, date: '2 hrs ago', comment: 'Always fresh tomatoes and fast delivery. Best shop in HSR!', product: 'Organic Roma Tomatoes', reply: '' },
    { id: '2', customer: 'Riya Sen', rating: 4, date: 'Yesterday', comment: 'Good quality avocados, but slightly expensive.', product: 'Hass Avocados', reply: 'Thanks for the feedback Riya, we source organic quality!' },
    { id: '3', customer: 'Sanjay Dutt', rating: 3, date: '3 days ago', comment: 'Crocin tablet was correct but delivery took 40 minutes.', product: 'Crocin Pain Relief Tablet', reply: '' },
  ]);

  const submitReviewReply = (id: string) => {
    const text = replyText[id];
    if (!text) return;
    setReviewsList(reviewsList.map(r => r.id === id ? { ...r, reply: text } : r));
    setReplyText({ ...replyText, [id]: '' });
    Alert.alert('Reply Sent', 'Your reply has been posted under the customer review.');
  };

  const commandCenterItems = [
    {
      id: 'analytics',
      title: 'Analytics Hub',
      subtitle: 'Real-time sales & growth insights',
      icon: TrendingUp,
      color: Colors.success,
      bgColor: 'rgba(34, 181, 115, 0.08)',
      route: '/analytics',
    },
    {
      id: 'inventory',
      title: 'Inventory Manager',
      subtitle: 'Quick stock audits & low warnings',
      icon: Package,
      color: Colors.primary,
      bgColor: 'rgba(0, 109, 119, 0.08)',
      route: '/inventory',
    },
    {
      id: 'customers',
      title: 'Customer Directory',
      subtitle: 'Loyalty tracking & direct contact',
      icon: Users,
      color: Colors.copper,
      bgColor: 'rgba(201, 124, 93, 0.08)',
      route: '/customers',
    },
    {
      id: 'delivery',
      title: 'Delivery Fleet',
      subtitle: 'Rider dispatch, radar & control',
      icon: Truck,
      color: Colors.primary,
      bgColor: 'rgba(0, 109, 119, 0.08)',
      route: '/delivery',
    },
    {
      id: 'payments',
      title: 'Wallet & Payouts',
      subtitle: 'Instant cash withdraws & history',
      icon: Wallet,
      color: Colors.success,
      bgColor: 'rgba(34, 181, 115, 0.08)',
      route: '/payments',
    },
    {
      id: 'support',
      title: 'Support Tickets',
      subtitle: 'Simulated customer live chat desk',
      icon: LifeBuoy,
      color: Colors.warning,
      bgColor: 'rgba(242, 169, 59, 0.08)',
      route: '/support',
    },
    {
      id: 'settings',
      title: 'Operational Rules',
      subtitle: 'Set timings, delivery radius & COD',
      icon: Settings,
      color: Colors.textSecondary,
      bgColor: 'rgba(102, 112, 133, 0.08)',
      route: '/settings',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      <Image source={{ uri: authStore.coverImage }} style={styles.coverImage} />
      
      {/* Store Header Identity Info */}
      <View style={styles.storeHeader}>
        <Image source={{ uri: authStore.logo }} style={styles.storeLogo} />
        <View style={styles.storeMeta}>
          <Text style={styles.storeName}>{authStore.storeName}</Text>
          <Text style={styles.storeType}>{authStore.storeType} Operating Center</Text>
        </View>
      </View>

      {/* SECTION: STORE COMMAND CENTER */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Sparkles size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Store Command Center</Text>
        </View>
        
        <View style={styles.commandGrid}>
          {commandCenterItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.commandRow}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                  <IconComponent size={18} color={item.color} />
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION: REVIEWS HUB */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Star size={16} color={Colors.warning} fill={Colors.warning} />
          <Text style={styles.sectionTitle}>Customer Reviews Hub</Text>
        </View>

        {/* Rating Analytics Card */}
        <View style={styles.ratingCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} color={Colors.warning} fill={Colors.warning} />
            ))}
          </View>
          <Text style={styles.avgRatingText}>4.8 / 5.0 Rating</Text>
          <Text style={styles.ratingMeta}>Based on 142 recent hyperlocal buyers</Text>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviewsList.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewCustomer}>{review.customer}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              
              <View style={styles.reviewStarsRow}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={10} color={Colors.warning} fill={Colors.warning} style={{ marginRight: 2 }} />
                ))}
              </View>

              <Text style={styles.reviewProduct}>Purchased: {review.product}</Text>
              <Text style={styles.reviewComment}>"{review.comment}"</Text>

              {review.reply ? (
                <View style={styles.merchantReplyCard}>
                  <Text style={styles.replyTitle}>Your Response:</Text>
                  <Text style={styles.replyText}>"{review.reply}"</Text>
                </View>
              ) : (
                <View style={styles.replyBox}>
                  <TextInput
                    value={replyText[review.id] || ''}
                    onChangeText={(txt) => setReplyText({ ...replyText, [review.id]: txt })}
                    placeholder="Type review reply..."
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.replyInput}
                  />
                  <Button
                    label="Reply"
                    variant="primary"
                    size="sm"
                    onPress={() => submitReviewReply(review.id)}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
  },
  storeLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  storeMeta: {
    marginLeft: 12,
    marginTop: 24,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  storeType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  commandGrid: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...Shadows.soft,
  },
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowMeta: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  ratingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    ...Shadows.soft,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  avgRatingText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ratingMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    borderRadius: 20,
    padding: 14,
    ...Shadows.soft,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCustomer: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewProduct: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 6,
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  merchantReplyCard: {
    backgroundColor: 'rgba(0, 109, 119, 0.04)',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  replyTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  replyText: {
    fontSize: 11,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  replyBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    fontSize: 11,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
});
