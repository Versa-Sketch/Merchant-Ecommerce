import React, { useState, useCallback } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router, useFocusEffect } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import type { PickedFile } from '../Store';

import { useOnboardingBack } from '../hooks/useOnboardingBack';

type ProofType = 'electricity_bill' | 'rent_agreement' | 'property_tax_receipt';

const PROOF_OPTIONS: { type: ProofType; label: string }[] = [
  { type: 'electricity_bill', label: 'Electricity Bill' },
  { type: 'rent_agreement', label: 'Rent Agreement' },
  { type: 'property_tax_receipt', label: 'Property Tax Receipt' },
];

export default observer(function AddressProofRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [proofType, setProofType] = useState<ProofType | null>(null);
  const [docFile, setDocFile] = useState<PickedFile | null>(null);
  
  const [existingDoc, setExistingDoc] = useState<string | null>(null);
  const [originalType, setOriginalType] = useState<ProofType | null>(null);

  const [touched, setTouched] = useState(false);
  const isCompleted = sessionStore.onboardingCompletedSteps.includes('ADDRESS_PROOF');
  const isFetching = onboardingStore.fetchingState === 'loading';
  const isLoading = onboardingStore.stepState === 'submitting';

  const handleBack = () => {
    router.replace('/(auth)/onboarding-bank-details');
  };

  useOnboardingBack(handleBack);

  const canSubmit = !!proofType && (!!docFile || !!existingDoc);

  useFocusEffect(
    useCallback(() => {
      onboardingStore.fetchAddressProof().then((data) => {
        if (data) {
          setProofType(data.address_proof_type);
          setOriginalType(data.address_proof_type);
          if (data.address_proof_document) {
            setExistingDoc(data.address_proof_document);
            setDocFile({ uri: data.address_proof_document, name: 'Address Proof', type: 'image/jpeg' });
          }
        }
      });
    }, [])
  );

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;

    let ok = false;
    if (isCompleted) {
      const isTypeChanged = proofType !== originalType;
      const isFileChanged = docFile && !docFile.uri.startsWith('http');

      if (!isTypeChanged && !isFileChanged) {
        ok = true;
      } else {
        ok = await onboardingStore.patchAddressProof(
          isTypeChanged ? proofType! : undefined,
          isFileChanged ? docFile! : undefined,
        );
      }
    } else {
      ok = await onboardingStore.submitAddressProof(proofType!, docFile!);
    }
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  const stepNum = sessionStore.onboardingBusinessType === 'individual' ? 6 : 7;
  const totalSteps = sessionStore.onboardingBusinessType === 'individual' ? 8 : 9;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={stepNum} totalSteps={totalSteps} title="Address Proof" subtitle="Prove the physical address of your shop." onBack={handleBack} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {isFetching ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.sectionLabel}>DOCUMENT TYPE *</Text>
              {touched && !proofType ? <Text style={styles.fieldError}>Please select a document type</Text> : null}
              {PROOF_OPTIONS.map((opt) => {
                const selected = proofType === opt.type;
                return (
                  <TouchableOpacity key={opt.type} style={[styles.optionRow, selected && styles.optionRowSelected]} onPress={() => setProofType(opt.type)} activeOpacity={0.8}>
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{opt.label}</Text>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <Check size={12} color={Colors.white} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View style={{ marginTop: 20 }}>
                <FilePickerField label="Upload Document" value={docFile} onChange={setDocFile} accept="any" required hint="Clear photo or scan (PDF/JPG/PNG)" error={touched && !docFile ? 'Required' : null} />
              </View>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 10 },
  fieldError: { fontSize: 11, color: Colors.error, marginTop: -4, marginBottom: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 10, backgroundColor: Colors.surface },
  optionRowSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  optionLabelSelected: { color: Colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
