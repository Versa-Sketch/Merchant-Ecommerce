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

export default observer(function IncorporationDocsRoute() {
  const { onboardingStore, sessionStore } = useStores();
  const [incCert, setIncCert] = useState<PickedFile | null>(null);
  const [moaAoa, setMoaAoa] = useState<PickedFile | null>(null);
  const [boardRes, setBoardRes] = useState<PickedFile | null>(null);
  const [estLicense, setEstLicense] = useState<PickedFile | null>(null);
  const [touched, setTouched] = useState(false);
  const isLoading = onboardingStore.stepState === 'submitting';
  const canSubmit = !!incCert && !!moaAoa;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || isLoading) return;
    const ok = await onboardingStore.submitIncorporationDocs({
      incorporation_certificate: incCert!,
      moa_aoa: moaAoa!,
      board_resolution: boardRes ?? undefined,
      establishment_license: estLicense ?? undefined,
    });
    if (ok) router.replace(routeToOnboardingStep(sessionStore.onboardingCurrentStep, sessionStore.onboardingStatus));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StepHeader currentStep={4} totalSteps={9} title="Incorporation Documents" subtitle="Required: incorporation cert + MOA/AOA. Others are optional." onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <FilePickerField label="Incorporation Certificate / Partnership Deed" value={incCert} onChange={setIncCert} accept="any" required hint="PDF, JPG or PNG" error={touched && !incCert ? 'Required' : null} />
          <FilePickerField label="Memorandum & Articles of Association (MOA/AOA)" value={moaAoa} onChange={setMoaAoa} accept="any" required hint="PDF, JPG or PNG" error={touched && !moaAoa ? 'Required' : null} />
          <FilePickerField label="Board Resolution / Authorization Letter" value={boardRes} onChange={setBoardRes} accept="any" hint="Optional" />
          <FilePickerField label="Shop Establishment / Trade License" value={estLicense} onChange={setEstLicense} accept="any" hint="Optional" />
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
