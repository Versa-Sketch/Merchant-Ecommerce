import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { validateIndianPhone } from '../types/domain';
import styles from './Login.styles';

export default observer(function LoginRoute() {
  const { sessionStore } = useStores();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(sessionStore.fullName);
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false });

  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const { valid: phoneValid, error: phoneError } = validateIndianPhone(sessionStore.phone);
  const nameValid = name.trim().length >= 2;
  const canSubmit = phoneValid && nameValid;
  const isLoading = sessionStore.otpState === 'sending';
  const apiError = sessionStore.otpState === 'error' ? sessionStore.otpError : null;

  const showNameError = touched.name && !nameValid;
  const showPhoneError = touched.phone && !phoneValid && !!sessionStore.phone;

  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const handlePressIn = () => {
    if (!canSubmit) return;
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };

  const handleNameChange = (text: string) => {
    setName(text);
    sessionStore.setFullName(text);
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    sessionStore.setPhone(digits);
  };

  const handleContinue = async () => {
    setTouched({ name: true, phone: true });
    if (!canSubmit || isLoading) return;
    sessionStore.resetOTPState();
    const sent = await sessionStore.sendOTP();
    if (sent) router.push('/(auth)/otp');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top - 20, 4) }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.eyebrow}>Sign up or Sign in</Text>
            <Text style={styles.title}>Let's get started</Text>
            <Text style={styles.subtitle}>
              Enter your name and mobile number. We'll send a one-time verification code.
            </Text>

            {/* Full Name */}
            <Text style={[styles.inputLabel, { marginTop: 4 }]}>FULL NAME</Text>
            <View
              style={[
                styles.textInputBox,
                nameFocused && styles.textInputBoxFocused,
                showNameError && styles.textInputBoxError,
              ]}
            >
              <TextInput
                ref={nameRef}
                style={styles.textInputField}
                value={name}
                onChangeText={handleNameChange}
                onFocus={() => setNameFocused(true)}
                onBlur={() => { setNameFocused(false); setTouched((p) => ({ ...p, name: true })); }}
                onSubmitEditing={() => phoneRef.current?.focus()}
                placeholder="Priya Sharma"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
              />
            </View>
            {showNameError ? (
              <Text style={styles.errorText}>Please enter your full name</Text>
            ) : null}

            {/* Mobile Number */}
            <Text style={[styles.inputLabel, { marginTop: 20 }]}>MOBILE NUMBER</Text>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => phoneRef.current?.focus()}
              style={[
                styles.phoneRow,
                phoneFocused && styles.phoneRowFocused,
                showPhoneError && styles.phoneRowError,
              ]}
            >
              <View style={styles.countryPrefix}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                ref={phoneRef}
                style={styles.phoneInput}
                value={sessionStore.phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => { setPhoneFocused(false); setTouched((p) => ({ ...p, phone: true })); }}
                onSubmitEditing={handleContinue}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="9876543210"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </TouchableOpacity>
            {showPhoneError && phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            {/* API error */}
            {apiError ? (
              <View style={styles.apiErrorBox}>
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Fixed footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[
                styles.cta,
                canSubmit && !isLoading ? styles.ctaEnabled : styles.ctaDisabled,
              ]}
              onPress={handleContinue}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={!canSubmit || isLoading}
              activeOpacity={1}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.ctaText, !canSubmit && styles.ctaTextDisabled]}>
                    Send OTP
                  </Text>
                  {canSubmit && <ArrowRight size={18} color={Colors.white} strokeWidth={2.5} />}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <TouchableOpacity
            style={styles.signUpRow}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/create-account')}
          >
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <Text style={styles.signUpAccent}> Create Account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});
