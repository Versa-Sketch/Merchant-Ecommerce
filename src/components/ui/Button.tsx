import React, { useRef } from 'react';
import {
  Animated,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'view';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const variantStyle = (() => {
    switch (variant) {
      case 'primary':   return { backgroundColor: Colors.primary, borderWidth: 0 };
      case 'secondary': return { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight, borderWidth: 1 };
      case 'outline':   return { backgroundColor: Colors.white, borderColor: Colors.border, borderWidth: 1 };
      case 'view':      return { backgroundColor: Colors.white, borderColor: Colors.primary, borderWidth: 1 };
      case 'danger':    return { backgroundColor: Colors.error, borderWidth: 0 };
      case 'ghost':
      default:          return { backgroundColor: 'transparent', borderWidth: 0 };
    }
  })();

  const variantTextStyle = (() => {
    switch (variant) {
      case 'outline':   return { color: Colors.textSecondary };
      case 'view':      return { color: Colors.primary };
      case 'ghost':     return { color: Colors.primary };
      case 'secondary': return { color: Colors.primaryDark };
      case 'danger':    return { color: Colors.white };
      default:          return { color: Colors.white };
    }
  })();

  const sizeStyle = (() => {
    switch (size) {
      case 'sm': return { paddingVertical: 9,  paddingHorizontal: 14, borderRadius: 12 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 };
      case 'md':
      default:   return { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14 };
    }
  })();

  const sizeTextStyle = (() => {
    switch (size) {
      case 'sm': return { fontSize: 13, fontWeight: '600' as const };
      case 'lg': return { fontSize: 16, fontWeight: '700' as const };
      case 'md':
      default:   return { fontSize: 14, fontWeight: '600' as const };
    }
  })();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyle,
          sizeStyle,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' || variant === 'view'
              ? Colors.primary
              : Colors.white}
          />
        ) : (
          <Text style={[styles.text, variantTextStyle, sizeTextStyle, textStyle]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { textAlign: 'center' },
  disabled: { opacity: 0.55 },
});
