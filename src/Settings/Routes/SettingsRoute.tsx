import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Settings, Clock, Compass, ShieldCheck } from 'lucide-react-native';

const settingsStyles = {
  container: { flex: 1, backgroundColor: Colors.background } as const,
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { padding: 8, marginRight: 8, borderRadius: 12, backgroundColor: Colors.background },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800' as const, color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scrollContent: { padding: 16, gap: 16 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(228, 231, 236, 0.5)' as const, padding: 16, ...Shadows.soft },
  sectionHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.textPrimary },
  formLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textPrimary, marginBottom: 6 },
  formInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, height: 42, fontSize: 13, color: Colors.textPrimary, marginBottom: 14, fontWeight: '500' as const },
  inputWithIconRow: { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingLeft: 12, height: 42, marginBottom: 14 },
  inputIcon: { marginRight: 8 },
  formRow: { flexDirection: 'row' as const, gap: 10 },
  toggleRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, marginTop: 4 },
  toggleLabel: { fontSize: 12, fontWeight: '700' as const, color: Colors.textPrimary },
  toggleSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  switch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } as const,
  multilineInput: { height: 72, textAlignVertical: 'top' as const, paddingVertical: 8 },
  saveBtn: { width: '100%' as const, shadowColor: Colors.primary },
};

export default observer(function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { authStore } = useStores();
  const [storeNameInput, setStoreNameInput] = useState(authStore.storeName);
  const [timingsInput, setTimingsInput] = useState(authStore.timings);
  const [radiusInput, setRadiusInput] = useState(authStore.deliveryRadius.toString());
  const [minOrderInput, setMinOrderInput] = useState(authStore.minimumOrder.toString());
  const [surgeInput, setSurgeInput] = useState(authStore.surgeFee.toString());
  const [refundInput, setRefundInput] = useState(authStore.refundPolicy);
  const [returnInput, setReturnInput] = useState(authStore.returnPolicy);

  const handleSaveSettings = () => {
    if (!storeNameInput.trim()) { Alert.alert('Validation Error', 'Store Name cannot be empty.'); return; }
    if (!timingsInput.trim()) { Alert.alert('Validation Error', 'Operating Hours cannot be empty.'); return; }
    const radius = parseFloat(radiusInput);
    if (isNaN(radius) || radius <= 0) { Alert.alert('Validation Error', 'Please enter a valid positive delivery radius.'); return; }
    const minOrder = parseInt(minOrderInput, 10);
    if (isNaN(minOrder) || minOrder < 0) { Alert.alert('Validation Error', 'Please enter a valid minimum order amount.'); return; }
    const surgeFee = parseInt(surgeInput, 10);
    if (isNaN(surgeFee) || surgeFee < 0) { Alert.alert('Validation Error', 'Please enter a valid surge fee.'); return; }
    authStore.updateSettings({ storeName: storeNameInput.trim(), timings: timingsInput.trim(), deliveryRadius: radius, minimumOrder: minOrder, surgeFee, refundPolicy: refundInput.trim(), returnPolicy: returnInput.trim() });
    Alert.alert('Settings Saved', 'Operational rules and policies updated successfully.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[settingsStyles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={settingsStyles.header}>
          <TouchableOpacity style={settingsStyles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
          <View style={settingsStyles.headerText}>
            <Text style={settingsStyles.title}>Operational Settings</Text>
            <Text style={settingsStyles.subtitle}>Configure logistics radius, operating hours & refund policies</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={settingsStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={settingsStyles.sectionCard}>
            <View style={settingsStyles.sectionHeader}>
              <Settings size={16} color={Colors.primary} />
              <Text style={settingsStyles.sectionTitle}>Store Identity & Schedule</Text>
            </View>
            <Text style={settingsStyles.formLabel}>Store Name</Text>
            <TextInput value={storeNameInput} onChangeText={setStoreNameInput} placeholder="e.g. FreshMart Hyperlocal" placeholderTextColor={Colors.textSecondary} style={settingsStyles.formInput} />
            <Text style={settingsStyles.formLabel}>Operating Hours</Text>
            <View style={settingsStyles.inputWithIconRow}>
              <Clock size={16} color={Colors.textSecondary} style={settingsStyles.inputIcon} />
              <TextInput value={timingsInput} onChangeText={setTimingsInput} placeholder="e.g. 07:00 AM - 10:00 PM" placeholderTextColor={Colors.textSecondary} style={[settingsStyles.formInput, { flex: 1, marginBottom: 0 }]} />
            </View>
          </View>

          <View style={settingsStyles.sectionCard}>
            <View style={settingsStyles.sectionHeader}>
              <Compass size={16} color={Colors.primary} />
              <Text style={settingsStyles.sectionTitle}>Logistics & Ordering Rules</Text>
            </View>
            <View style={settingsStyles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={settingsStyles.formLabel}>Radius (km)</Text>
                <TextInput value={radiusInput} onChangeText={setRadiusInput} keyboardType="numeric" placeholder="e.g. 5" placeholderTextColor={Colors.textSecondary} style={settingsStyles.formInput} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={settingsStyles.formLabel}>Min Order (₹)</Text>
                <TextInput value={minOrderInput} onChangeText={setMinOrderInput} keyboardType="numeric" placeholder="e.g. 150" placeholderTextColor={Colors.textSecondary} style={settingsStyles.formInput} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={settingsStyles.formLabel}>Surge Fee (₹)</Text>
                <TextInput value={surgeInput} onChangeText={setSurgeInput} keyboardType="numeric" placeholder="e.g. 20" placeholderTextColor={Colors.textSecondary} style={settingsStyles.formInput} />
              </View>
            </View>
            <View style={settingsStyles.toggleRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={settingsStyles.toggleLabel}>Enable Cash On Delivery (COD)</Text>
                <Text style={settingsStyles.toggleSub}>Allow buyers to pay cash at delivery spot</Text>
              </View>
              <Switch value={authStore.codEnabled} onValueChange={() => authStore.toggleCOD()} trackColor={{ false: '#D1D5DB', true: Colors.success }} thumbColor={Colors.white} style={settingsStyles.switch} />
            </View>
          </View>

          <View style={settingsStyles.sectionCard}>
            <View style={settingsStyles.sectionHeader}>
              <ShieldCheck size={16} color={Colors.primary} />
              <Text style={settingsStyles.sectionTitle}>Legal & Customer Policies</Text>
            </View>
            <Text style={settingsStyles.formLabel}>Refund Policy Terms</Text>
            <TextInput value={refundInput} onChangeText={setRefundInput} multiline numberOfLines={3} placeholder="Enter refund policy details..." placeholderTextColor={Colors.textSecondary} style={[settingsStyles.formInput, settingsStyles.multilineInput]} />
            <Text style={settingsStyles.formLabel}>Return Policy Guidelines</Text>
            <TextInput value={returnInput} onChangeText={setReturnInput} multiline numberOfLines={3} placeholder="Enter return window and items acceptable..." placeholderTextColor={Colors.textSecondary} style={[settingsStyles.formInput, settingsStyles.multilineInput]} />
          </View>

          <Button label="Save Operational Rules" variant="primary" onPress={handleSaveSettings} style={settingsStyles.saveBtn} />
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});
