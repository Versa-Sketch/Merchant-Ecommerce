import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Building2, Bell, CreditCard, FileText, HelpCircle, LogOut, Settings, ShieldCheck, LayoutGrid, ChevronRight } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { Badge, Card, ScreenHeader } from '../../components/ui/MerchantPrimitives';
import styles from './styles';

export default observer(function MoreScreen() {
  const { authStore, sessionStore } = useStores();

  const settings = [
    { title: 'Store Profile', subtitle: 'Logo, address, public store details', icon: Building2, route: '/settings' },
    { title: 'Edit Shop Types', subtitle: 'Update the categories your shop sells', icon: LayoutGrid, route: '/edit-shop-types' },
    { title: 'Business Settings', subtitle: 'Hours, delivery radius, order rules', icon: Settings, route: '/settings' },
    { title: 'Payout Settings', subtitle: 'Bank account and settlement schedule', icon: CreditCard, route: '/payments' },
    { title: 'Notifications', subtitle: 'Order, bargain, stock, and payout alerts', icon: Bell, route: '/settings' },
    { title: 'Support', subtitle: 'Help center and support conversations', icon: HelpCircle, route: '/support' },
    { title: 'Policies', subtitle: 'Returns, tax, privacy, and merchant terms', icon: FileText, route: '/settings' },
  ];

  return (
    <AnimatedScreen style={styles.container}>
      <ScreenHeader title="More" subtitle="Account and store settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <Image source={{ uri: authStore.logo }} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{authStore.storeName}</Text>
            <Text style={styles.storeType}>{authStore.storeType} · Bengaluru</Text>
            <View style={styles.badges}>
              <Badge label="Open Now" tone="success" />
              <Badge label="Verified" tone="primary" />
            </View>
          </View>
        </Card>

        {sessionStore.user && (
          <Card style={styles.accountCard}>
            <Text style={styles.accountName}>{sessionStore.user.full_name}</Text>
            <Text style={styles.accountPhone}>{sessionStore.user.phone_number}</Text>
            <View style={styles.badges}>
              <Badge label={sessionStore.user.role.replace(/_/g, ' ')} tone="primary" />
              {sessionStore.user.is_verified && <Badge label="Verified" tone="success" />}
            </View>
          </Card>
        )}

        <View style={styles.trustBanner}>
          <ShieldCheck size={18} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Merchant account in good standing</Text>
            <Text style={styles.trustSub}>Payouts active · Policy checks complete · Catalog live</Text>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          {settings.map(({ title, subtitle, icon: Icon, route }, index) => (
            <TouchableOpacity
              key={title}
              style={[styles.settingRow, index === settings.length - 1 && styles.settingRowLast]}
              activeOpacity={0.7}
              onPress={() => router.push(route as any)}
            >
              <View style={styles.settingIcon}>
                <Icon size={17} color={Colors.primary} />
              </View>
              <View style={styles.settingMeta}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSub}>{subtitle}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.75}
          onPress={() => {
            Alert.alert(
              'Logout',
              'You will be signed out of your merchant account.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: () => {
                    sessionStore.logout();
                    router.replace('/(auth)/welcome');
                  },
                },
              ]
            );
          }}
        >
          <LogOut size={17} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </AnimatedScreen>
  );
});
