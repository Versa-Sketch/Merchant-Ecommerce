import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.copper,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Colors.border,
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: Colors.error,
          borderWidth: 0,
        };
      case 'ghost':
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getVariantTextStyles = () => {
    switch (variant) {
      case 'outline':
        return { color: Colors.textPrimary };
      case 'ghost':
        return { color: Colors.primary };
      default:
        return { color: Colors.white };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 };
    }
  };

  const getSizeTextStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: 13, fontWeight: '600' as const };
      case 'lg':
        return { fontSize: 16, fontWeight: '700' as const };
      case 'md':
      default:
        return { fontSize: 14, fontWeight: '600' as const };
    }
  };

  const isBtnDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isBtnDisabled}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        isBtnDisabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[styles.text, getVariantTextStyles(), getSizeTextStyles(), textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
