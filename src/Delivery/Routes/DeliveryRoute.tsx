import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import Svg, { Circle, Line } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { ArrowLeft, Star, Compass } from 'lucide-react-native';
import { Phone } from 'lucide-react-native';
import styles from './styles';

export default observer(function DeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { deliveryStore } = useStores();

  const sweepAngle = useSharedValue(0);

  useEffect(() => {
    sweepAngle.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedSweep = useAnimatedStyle(() => ({ transform: [{ rotate: `${sweepAngle.value}deg` }] }));

  const getRadarCoords = (lat: number, lng: number) => {
    const lat0 = 12.91500, lng0 = 77.64300;
    const scaleY = 32000, scaleX = 32000;
    const dx = (lng - lng0) * scaleX, dy = (lat - lat0) * scaleY;
    const center = 110, maxDist = 95;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const finalDx = dist > maxDist ? (dx / dist) * maxDist : dx;
    const finalDy = dist > maxDist ? (dy / dist) * maxDist : dy;
    return { x: center + finalDx, y: center - finalDy };
  };

  const handleCallDriver = (name: string, phone: string) => {
    Alert.alert('Calling Rider', `Initiating call to ${name} at ${phone}...`);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Delivery Fleet Control</Text>
          <Text style={styles.subtitle}>Real-time tracking, rider availability & performance</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.radarCard}>
          <View style={styles.radarHeader}>
            <Compass color={Colors.primary} size={18} />
            <Text style={styles.radarTitle}>Active Dispatch Radar ( Bangalore HSR )</Text>
          </View>
          <Text style={styles.radarSubtitle}>Simulating rider location coordinates via WebSocket</Text>

          <View style={styles.radarWrapper}>
            <View style={styles.radarCircleContainer}>
              <Svg width={220} height={220} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <Circle cx={110} cy={110} r={105} stroke={Colors.border} strokeWidth={1} fill="transparent" />
                <Circle cx={110} cy={110} r={75} stroke={Colors.border} strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
                <Circle cx={110} cy={110} r={45} stroke={Colors.border} strokeWidth={1} fill="transparent" />
                <Line x1={110} y1={5} x2={110} y2={215} stroke={Colors.border} strokeWidth={1} />
                <Line x1={5} y1={110} x2={215} y2={110} stroke={Colors.border} strokeWidth={1} />
                <Circle cx={110} cy={110} r={6} fill={Colors.primary} stroke={Colors.white} strokeWidth={1.5} />
              </Svg>
              <Animated.View style={[styles.radarSweep, animatedSweep]}>
                <View style={styles.sweepLine} />
              </Animated.View>
              {deliveryStore.partners.map((partner) => {
                const { x, y } = getRadarCoords(partner.latitude, partner.longitude);
                if (!partner.isAvailable) return null;
                return (
                  <View key={partner.id} style={[styles.riderPin, { left: x - 6, top: y - 6, backgroundColor: partner.currentOrdersCount > 0 ? Colors.warning : Colors.success }]}>
                    <View style={styles.pingAnimation} />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.legend}>
            {[{ color: Colors.primary, label: 'Store Hub' }, { color: Colors.success, label: 'Rider (Idle)' }, { color: Colors.warning, label: 'Rider (On Delivery)' }].map(({ color, label }) => (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.listHeader}>Fleet Directory ({deliveryStore.partners.length} Drivers)</Text>
        <View style={styles.fleetList}>
          {deliveryStore.partners.map((partner) => (
            <View key={partner.id} style={styles.driverCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.driverName}>{partner.name}</Text>
                  <View style={styles.idBadge}><Text style={styles.idBadgeText}>{partner.id}</Text></View>
                </View>
                <Text style={styles.driverPhone}>{partner.phone}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statMini}>
                    <Star size={10} color={Colors.warning} fill={Colors.warning} />
                    <Text style={styles.statMiniText}>{partner.rating}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <Text style={styles.statMiniText}>Completed: {partner.completedOrdersCount}</Text>
                  <View style={styles.statDivider} />
                  <Text style={[styles.statMiniText, partner.currentOrdersCount > 0 && { color: Colors.warning, fontWeight: '700' }]}>
                    Active: {partner.currentOrdersCount}
                  </Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <View style={styles.statusToggle}>
                  <Text style={[styles.statusToggleText, { color: partner.isAvailable ? Colors.success : Colors.textSecondary }]}>
                    {partner.isAvailable ? 'Online' : 'Offline'}
                  </Text>
                  <Switch value={partner.isAvailable} onValueChange={() => deliveryStore.togglePartnerAvailability(partner.id)} trackColor={{ false: '#D1D5DB', true: Colors.success }} thumbColor={Colors.white} ios_backgroundColor="#D1D5DB" style={styles.switch} />
                </View>
                <TouchableOpacity style={styles.callButton} onPress={() => handleCallDriver(partner.name, partner.phone)}>
                  <Phone size={14} color={Colors.primary} />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
});
