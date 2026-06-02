import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import {
  ArrowLeft,
  Truck,
  Phone,
  Star,
  Activity,
  Navigation,
  Compass,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default observer(function DeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { deliveryStore } = useStores();

  // Radar Animation
  const sweepAngle = useSharedValue(0);

  useEffect(() => {
    sweepAngle.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedSweep = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sweepAngle.value}deg` }],
    };
  });

  const getRadarCoords = (lat: number, lng: number) => {
    const lat0 = 12.91500;
    const lng0 = 77.64300;
    
    // Scale factor to map coordinates to SVG 220x220 space
    const scaleY = 32000;
    const scaleX = 32000;
    
    const dx = (lng - lng0) * scaleX;
    const dy = (lat - lat0) * scaleY;
    
    // Clamp to radar radius (95 pixels from center)
    const center = 110;
    const maxDist = 95;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let finalDx = dx;
    let finalDy = dy;
    if (dist > maxDist) {
      finalDx = (dx / dist) * maxDist;
      finalDy = (dy / dist) * maxDist;
    }
    
    return {
      x: center + finalDx,
      y: center - finalDy, // invert y for SVG coordinate space
    };
  };

  const handleCallDriver = (name: string, phone: string) => {
    Alert.alert('Calling Rider', `Initiating call to ${name} at ${phone}...`);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
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
        {/* Radar Panel */}
        <View style={styles.radarCard}>
          <View style={styles.radarHeader}>
            <Compass color={Colors.primary} size={18} />
            <Text style={styles.radarTitle}>Active Dispatch Radar ( Bangalore HSR )</Text>
          </View>
          <Text style={styles.radarSubtitle}>Simulating rider location coordinates via WebSocket</Text>
          
          <View style={styles.radarWrapper}>
            <View style={styles.radarCircleContainer}>
              {/* Concentric Circle Grid */}
              <Svg width={220} height={220} style={StyleSheet.absoluteFill}>
                <Circle cx={110} cy={110} r={105} stroke={Colors.border} strokeWidth={1} fill="transparent" />
                <Circle cx={110} cy={110} r={75} stroke={Colors.border} strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
                <Circle cx={110} cy={110} r={45} stroke={Colors.border} strokeWidth={1} fill="transparent" />
                
                {/* Crosshairs */}
                <Line x1={110} y1={5} x2={110} y2={215} stroke={Colors.border} strokeWidth={1} />
                <Line x1={5} y1={110} x2={215} y2={110} stroke={Colors.border} strokeWidth={1} />
                
                {/* Central Shop Icon Marker */}
                <Circle cx={110} cy={110} r={6} fill={Colors.primary} stroke={Colors.white} strokeWidth={1.5} />
              </Svg>

              {/* Sweep Line */}
              <Animated.View style={[styles.radarSweep, animatedSweep]}>
                <View style={styles.sweepLine} />
              </Animated.View>

              {/* Driver Coordinates mapped to Screen */}
              {deliveryStore.partners.map((partner) => {
                const { x, y } = getRadarCoords(partner.latitude, partner.longitude);
                if (!partner.isAvailable) return null;
                return (
                  <View
                    key={partner.id}
                    style={[
                      styles.riderPin,
                      {
                        left: x - 6,
                        top: y - 6,
                        backgroundColor: partner.currentOrdersCount > 0 ? Colors.warning : Colors.success,
                      },
                    ]}
                  >
                    <View style={styles.pingAnimation} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Store Hub</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Rider (Idle)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>Rider (On Delivery)</Text>
            </View>
          </View>
        </View>

        {/* Fleet List */}
        <Text style={styles.listHeader}>Fleet Directory ({deliveryStore.partners.length} Drivers)</Text>
        <View style={styles.fleetList}>
          {deliveryStore.partners.map((partner) => (
            <View key={partner.id} style={styles.driverCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.driverName}>{partner.name}</Text>
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>{partner.id}</Text>
                  </View>
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
                  <Switch
                    value={partner.isAvailable}
                    onValueChange={() => deliveryStore.togglePartnerAvailability(partner.id)}
                    trackColor={{ false: '#D1D5DB', true: Colors.success }}
                    thumbColor={Colors.white}
                    ios_backgroundColor="#D1D5DB"
                    style={styles.switch}
                  />
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCallDriver(partner.name, partner.phone)}
                >
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
  radarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    ...Shadows.soft,
    marginBottom: 20,
    alignItems: 'center',
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  radarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  radarSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 16,
  },
  radarWrapper: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(0, 109, 119, 0.02)',
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  radarCircleContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FAFDFD',
    overflow: 'hidden',
    position: 'relative',
  },
  radarSweep: {
    position: 'absolute',
    width: 220,
    height: 220,
    left: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweepLine: {
    width: 2,
    height: 110,
    backgroundColor: 'rgba(0, 109, 119, 0.4)',
    bottom: 55, // rotates around the center of the container
  },
  riderPin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  pingAnimation: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 181, 115, 0.4)',
    position: 'absolute',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    width: '100%',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  listHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fleetList: {
    gap: 10,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    padding: 14,
    borderRadius: 20,
    ...Shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  idBadge: {
    backgroundColor: 'rgba(0, 109, 119, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: '700',
  },
  driverPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statMiniText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  driverActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  callButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
});
