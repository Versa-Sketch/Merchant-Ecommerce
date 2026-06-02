import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ShoppingBag, Package, Percent, User } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  // Find if keyboard is open to hide tab bar (optional, but good practice)
  return (
    <View style={[styles.tabBarContainer, { bottom: Platform.OS === 'ios' ? 24 : 16 }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIcon = () => {
            const color = isFocused ? Colors.primary : Colors.textSecondary;
            const size = 22;
            switch (route.name) {
              case 'home/index':
                return <Home color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
              case 'orders/index':
                return <ShoppingBag color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
              case 'products/index':
                return <Package color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
              case 'bargaining/index':
                return <Percent color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
              case 'profile/index':
                return <User color={color} size={size} strokeWidth={isFocused ? 2.5 : 2} />;
              default:
                return <Home color={color} size={size} />;
            }
          };

          const getLabel = () => {
            switch (route.name) {
              case 'home/index':
                return 'Home';
              case 'orders/index':
                return 'Orders';
              case 'products/index':
                return 'Products';
              case 'bargaining/index':
                return 'Bargain';
              case 'profile/index':
                return 'Profile';
              default:
                return '';
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                {getIcon()}
              </View>
              <Text style={[styles.tabLabel, { color: isFocused ? Colors.primary : Colors.textSecondary, fontWeight: isFocused ? '600' : '500' }]}>
                {getLabel()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="orders/index" options={{ title: 'Orders' }} />
      <Tabs.Screen name="products/index" options={{ title: 'Products' }} />
      <Tabs.Screen name="bargaining/index" options={{ title: 'Bargaining' }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.glassBg,
    borderRadius: 24,
    height: 68,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    ...Shadows.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(0, 109, 119, 0.1)',
  },
  tabLabel: {
    fontSize: 10,
  },
});
