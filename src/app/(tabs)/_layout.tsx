import React, { useRef } from 'react';
import { Tabs } from 'expo-router';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ListChecks, Package, MessagesSquare, Menu } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

const TABS = [
  { name: 'home/index',       label: 'Home',     Icon: Home },
  { name: 'orders/index',     label: 'Orders',   Icon: ListChecks },
  { name: 'products/index',   label: 'Products', Icon: Package },
  { name: 'bargaining/index', label: 'Bargains', Icon: MessagesSquare },
  { name: 'profile/index',    label: 'More',     Icon: Menu },
];

// ── Individual tab item with press-scale micro-interaction ─────────────────
function TabItem({
  name,
  label,
  Icon,
  focused,
  onPress,
}: {
  name: string;
  label: string;
  Icon: React.ComponentType<any>;
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const color       = focused ? Colors.primary : Colors.textMuted;
  const strokeWidth = focused ? 2.2 : 1.8;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      activeOpacity={1}
      style={styles.item}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.iconWrap,
          focused && styles.iconWrapActive,
          { transform: [{ scale }] },
        ]}
      >
        <Icon color={color} size={21} strokeWidth={strokeWidth} />
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Custom floating tab bar ────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  // Floating bar sits above the home indicator / gesture zone
  const bottomOffset = Math.max(insets.bottom, 8) + 8;

  return (
    <View
      style={[
        styles.bar,
        { bottom: bottomOffset },
      ]}
      pointerEvents="box-none"
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const tab = TABS.find(t => t.name === route.name);
        if (!tab) return null;

        return (
          <TabItem
            key={route.key}
            name={route.name}
            label={tab.label}
            Icon={tab.Icon}
            focused={focused}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(({ name, label }) => (
        <Tabs.Screen key={name} name={name} options={{ title: label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 6,
    shadowColor: '#0F1F17',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 12,
    // Subtle top border for definition on light backgrounds
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
