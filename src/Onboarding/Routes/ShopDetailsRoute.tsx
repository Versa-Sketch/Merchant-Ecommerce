import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router, useFocusEffect } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import { routeToOnboardingStep } from '../utils/routing';
import { useOnboardingBack } from '../hooks/useOnboardingBack';

export default observer(function ShopDetailsRoute() {
  const { onboardingStore, sessionStore } = useStores();

  // Intercept and disable back button actions on Step 1 to keep user inside the onboarding flow
  useOnboardingBack(() => {});

  const [shopName, setShopName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  const isCompleted = sessionStore.onboardingCompletedSteps.includes('SHOP_DETAILS');
  const [originalData, setOriginalData] = useState<any>(null);

  const pincodeValid = /^\d{6}$/.test(pincode);
  const canSubmit = shopName.trim().length >= 2 && addressLine1.trim().length >= 5 && state.trim().length >= 2 && pincodeValid;
  const isLoading = onboardingStore.stepState === 'submitting';

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchShopDetails().then((data) => {
        if (data) {
          setShopName(data.shop_name || '');
          setAddressLine1(data.address_line1 || '');
          setAddressLine2(data.address_line2 || '');
          setState(data.state || '');
          setPincode(data.pincode || '');
          setShopPhone(data.shop_phone_number || '');
          setDescription(data.shop_description || '');
          setOriginalData(data);
        }
      });
    }, [])
  );

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;

    let ok = false;
    if (isCompleted && originalData) {
      const updates: any = {};
      if (shopName.trim() !== originalData.shop_name) updates.shop_name = shopName.trim();
      if (addressLine1.trim() !== originalData.address_line1) updates.address_line1 = addressLine1.trim();
      if (addressLine2.trim() !== (originalData.address_line2 || '')) updates.address_line2 = addressLine2.trim() || null;
      if (state.trim() !== originalData.state) updates.state = state.trim();
      if (pincode.trim() !== originalData.pincode) updates.pincode = pincode.trim();
      if (shopPhone.trim() !== (originalData.shop_phone_number || '')) updates.shop_phone_number = shopPhone.trim() || null;
      if (description.trim() !== (originalData.shop_description || '')) updates.shop_description = description.trim() || null;

      if (Object.keys(updates).length === 0) {
        ok = true;
      } else {
        ok = await onboardingStore.patchShopDetails(updates);
      }
    } else {
      ok = await onboardingStore.submitShopDetails({
        shop_name: shopName.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || undefined,
        state: state.trim(),
        pincode: pincode.trim(),
        shop_phone_number: shopPhone.trim() || undefined,
        shop_description: description.trim() || undefined,
      });
    }

    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader
        currentStep={1}
        totalSteps={8}
        title="Shop Details"
        subtitle="Tell us about your store."
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Field label="SHOP NAME" required value={shopName} onChangeText={setShopName} placeholder="Ravi General Store" error={touched && shopName.trim().length < 2 ? 'Required' : null} />
            <Field label="ADDRESS LINE 1" required value={addressLine1} onChangeText={setAddressLine1} placeholder="Main Road, Near Temple" error={touched && addressLine1.trim().length < 5 ? 'Required' : null} />
            <Field label="ADDRESS LINE 2" value={addressLine2} onChangeText={setAddressLine2} placeholder="Gundlupet (optional)" />
            <Field label="STATE" required value={state} onChangeText={setState} placeholder="Karnataka" error={touched && state.trim().length < 2 ? 'Required' : null} />
            <Field label="PINCODE" required value={pincode} onChangeText={(t) => setPincode(t.replace(/\D/g, '').slice(0, 6))} placeholder="571111" keyboardType="number-pad" error={touched && !pincodeValid ? '6-digit pincode required' : null} />
            <Field label="SHOP PHONE (optional)" value={shopPhone} onChangeText={setShopPhone} placeholder="+919876543211" keyboardType="phone-pad" />
            <Field label="DESCRIPTION (optional)" value={description} onChangeText={setDescription} placeholder="Daily essentials" multiline />

            {onboardingStore.stepError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.88}
          >
            {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

function Field({ label, value, onChangeText, placeholder, required, error, keyboardType, multiline }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  required?: boolean; error?: string | null; keyboardType?: 'number-pad' | 'phone-pad'; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error ? styles.inputError : null, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase' },
  required: { fontSize: 12, fontWeight: '700', color: Colors.error },
  input: { height: 52, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, fontSize: 15, fontWeight: '500', color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  fieldError: { fontSize: 11, color: Colors.error, marginTop: 4 },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
