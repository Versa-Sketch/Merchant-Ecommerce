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
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import type { PickedFile } from '../Store';

import { useOnboardingBack } from '../hooks/useOnboardingBack';

export default observer(function BankDetailsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [chequeFile, setChequeFile] = useState<PickedFile | null>(null);
  
  const [existingCheque, setExistingCheque] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);

  const [touched, setTouched] = useState(false);
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('BANK_DETAILS');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const isIndividual = sessionStore.onboardingBusinessType === 'individual';

  const handleBack = () => {
    if (isIndividual) {
      router.replace('/(auth)/onboarding-compliance-docs');
    } else {
      router.replace('/(auth)/onboarding-directors-kyc');
    }
  };

  useOnboardingBack(handleBack);

  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
  const canSubmit = accountName.trim().length >= 2 && accountNumber.trim().length >= 9 && ifscValid && bankName.trim().length >= 2 && (!!chequeFile || !!existingCheque);

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchBankDetails().then((data) => {
        if (data) {
          setAccountName(data.bank_account_name || '');
          setAccountNumber(data.bank_account_number || '');
          setIfsc(data.bank_ifsc_code || '');
          setBankName(data.bank_name || '');
          setBranch(data.bank_branch || '');
          const chequeUrl = data.cancelled_cheque_or_passbook || data.cancelled_cheque;
          if (chequeUrl) {
            setExistingCheque(chequeUrl);
            setChequeFile({ uri: chequeUrl, name: 'Cancelled Cheque', type: 'image/jpeg' });
          }
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
      const patchFields: any = {};
      if (accountName.trim() !== originalData.bank_account_name) patchFields.bank_account_name = accountName.trim();
      if (accountNumber.trim() !== originalData.bank_account_number) patchFields.bank_account_number = accountNumber.trim();
      if (ifsc.toUpperCase() !== originalData.bank_ifsc_code) patchFields.bank_ifsc_code = ifsc.toUpperCase();
      if (bankName.trim() !== originalData.bank_name) patchFields.bank_name = bankName.trim();
      if (branch.trim() !== (originalData.bank_branch || '')) patchFields.bank_branch = branch.trim() || null;

      const newCheque = chequeFile && !chequeFile.uri.startsWith('http') ? chequeFile : undefined;

      if (Object.keys(patchFields).length === 0 && !newCheque) {
        ok = true;
      } else {
        ok = await onboardingStore.patchBankDetails(patchFields, newCheque);
      }
    } else {
      ok = await onboardingStore.submitBankDetails(
        { bank_account_name: accountName.trim(), bank_account_number: accountNumber.trim(), bank_ifsc_code: ifsc.toUpperCase(), bank_name: bankName.trim(), bank_branch: branch.trim() || undefined },
        chequeFile!,
      );
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  const stepNum = isIndividual ? 5 : 6;
  const totalSteps = isIndividual ? 8 : 9;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={stepNum} totalSteps={totalSteps} title="Bank Details" subtitle="Your payouts will be sent to this account." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
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
        )}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]} onPress={handleSubmit} disabled={isLoading || isFetching} activeOpacity={0.88}>
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
