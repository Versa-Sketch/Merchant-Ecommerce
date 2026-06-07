import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import type { PickedFile } from '../Store';

export default observer(function BankDetailsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [chequeFile, setChequeFile] = useState<PickedFile | null>(null);
  const [touched, setTouched] = useState(false);
  const isLoading = onboardingStore.stepState === 'submitting';

  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
  const canSubmit = accountName.trim().length >= 2 && accountNumber.trim().length >= 9 && ifscValid && bankName.trim().length >= 2 && !!chequeFile;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;
    const ok = await onboardingStore.submitBankDetails(
      { bank_account_name: accountName.trim(), bank_account_number: accountNumber.trim(), bank_ifsc_code: ifsc.toUpperCase(), bank_name: bankName.trim(), bank_branch: branch.trim() || undefined },
      chequeFile!,
    );
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  const stepNum = sessionStore.onboardingBusinessType === 'individual' ? 5 : 6;
  const totalSteps = sessionStore.onboardingBusinessType === 'individual' ? 8 : 9;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={stepNum} totalSteps={totalSteps} title="Bank Details" subtitle="Your payouts will be sent to this account." onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Field label="ACCOUNT HOLDER NAME" required value={accountName} onChangeText={setAccountName} placeholder="Ravi Kumar" error={touched && accountName.trim().length < 2 ? 'Required' : null} />
            <Field label="ACCOUNT NUMBER" required value={accountNumber} onChangeText={(t) => setAccountNumber(t.replace(/\D/g, ''))} placeholder="0123456789" keyboardType="number-pad" error={touched && accountNumber.trim().length < 9 ? 'Minimum 9 digits' : null} />
            <Field label="IFSC CODE" required value={ifsc} onChangeText={(t) => setIfsc(t.toUpperCase())} placeholder="SBIN0001234" autoCapitalize="characters" error={touched && !ifscValid ? 'Invalid IFSC code' : null} />
            <Field label="BANK NAME" required value={bankName} onChangeText={setBankName} placeholder="State Bank of India" error={touched && bankName.trim().length < 2 ? 'Required' : null} />
            <Field label="BRANCH (optional)" value={branch} onChangeText={setBranch} placeholder="Gundlupet Branch" />
            <FilePickerField label="Cancelled Cheque / Passbook" value={chequeFile} onChange={setChequeFile} accept="any" required hint="Clear photo or scan" error={touched && !chequeFile ? 'Required' : null} />
            {onboardingStore.stepError ? (
              <View style={styles.errorBox}><Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text></View>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.88}>
            {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

function Field({ label, value, onChangeText, placeholder, required, error, keyboardType, autoCapitalize }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  required?: boolean; error?: string | null; keyboardType?: 'number-pad'; autoCapitalize?: 'characters';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
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
