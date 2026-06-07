import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import StepHeader from '../Components/StepHeader';
import FilePickerField from '../Components/FilePickerField';
import { routeToOnboardingStep } from '../utils/routing';
import type { PickedFile } from '../Store';

export default observer(function StorePhotosRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [frontPhoto, setFrontPhoto] = useState<PickedFile | null>(null);
  const [interiorPhoto, setInteriorPhoto] = useState<PickedFile | null>(null);
  const [signaturePhoto, setSignaturePhoto] = useState<PickedFile | null>(null);
  const [touched, setTouched] = useState(false);
  const isLoading = onboardingStore.stepState === 'submitting';
  const canSubmit = !!frontPhoto && !!interiorPhoto;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;
    const ok = await onboardingStore.submitStorePhotos(frontPhoto!, interiorPhoto!, signaturePhoto ?? undefined);
    if (!ok) return;
    // After store photos, submit for review
    await onboardingStore.submitOnboarding();
    router.replace('/(auth)/onboarding-under-review');
  };

  const stepNum = sessionStore.onboardingBusinessType === 'individual' ? 7 : 8;
  const totalSteps = sessionStore.onboardingBusinessType === 'individual' ? 8 : 9;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={stepNum} totalSteps={totalSteps} title="Store Photos" subtitle="Help buyers recognise your store." onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <FilePickerField label="Store Front Photo" value={frontPhoto} onChange={setFrontPhoto} accept="image" required hint="Clear daytime photo of your shop entrance" error={touched && !frontPhoto ? 'Required' : null} />
          <FilePickerField label="Store Interior Photo" value={interiorPhoto} onChange={setInteriorPhoto} accept="image" required hint="Inside view showing shelves/products" error={touched && !interiorPhoto ? 'Required' : null} />
          <FilePickerField label="Signature Photo" value={signaturePhoto} onChange={setSignaturePhoto} accept="image" hint="Optional — your signature on white paper" />
          {onboardingStore.stepError ? (
            <View style={styles.errorBox}><Text style={styles.errorBoxText}>{onboardingStore.stepError}</Text></View>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.cta, !isLoading ? styles.ctaEnabled : styles.ctaDisabled]} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.88}>
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.ctaText}>Submit for Review</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  errorBox: { padding: 12, borderRadius: 12, backgroundColor: Colors.errorBg, marginTop: 8 },
  errorBoxText: { fontSize: 13, color: Colors.error, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaEnabled: { backgroundColor: Colors.primary },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
