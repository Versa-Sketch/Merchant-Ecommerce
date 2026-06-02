import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { useStores } from '../../stores/RootStore';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import {
  ArrowLeft,
  Settings,
  Clock,
  Compass,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';

export const SettingsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const { authStore } = useStores();

  // Settings local state variables initialized with store values
  const [storeNameInput, setStoreNameInput] = useState(authStore.storeName);
  const [timingsInput, setTimingsInput] = useState(authStore.timings);
  const [radiusInput, setRadiusInput] = useState(authStore.deliveryRadius.toString());
  const [minOrderInput, setMinOrderInput] = useState(authStore.minimumOrder.toString());
  const [surgeInput, setSurgeInput] = useState(authStore.surgeFee.toString());
  const [refundInput, setRefundInput] = useState(authStore.refundPolicy);
  const [returnInput, setReturnInput] = useState(authStore.returnPolicy);

  const handleSaveSettings = () => {
    // Validate inputs
    if (!storeNameInput.trim()) {
      Alert.alert('Validation Error', 'Store Name cannot be empty.');
      return;
    }
    if (!timingsInput.trim()) {
      Alert.alert('Validation Error', 'Operating Hours cannot be empty.');
      return;
    }

    const radius = parseFloat(radiusInput);
    if (isNaN(radius) || radius <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive delivery radius.');
      return;
    }

    const minOrder = parseInt(minOrderInput, 10);
    if (isNaN(minOrder) || minOrder < 0) {
      Alert.alert('Validation Error', 'Please enter a valid minimum order amount.');
      return;
    }

    const surgeFee = parseInt(surgeInput, 10);
    if (isNaN(surgeFee) || surgeFee < 0) {
      Alert.alert('Validation Error', 'Please enter a valid surge fee.');
      return;
    }

    // Save back to MobX Store
    authStore.updateSettings({
      storeName: storeNameInput.trim(),
      timings: timingsInput.trim(),
      deliveryRadius: radius,
      minimumOrder: minOrder,
      surgeFee: surgeFee,
      refundPolicy: refundInput.trim(),
      returnPolicy: returnInput.trim(),
    });

    Alert.alert('Settings Saved', 'Operational rules and policies updated successfully.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Operational Settings</Text>
            <Text style={styles.subtitle}>Configure logistics radius, operating hours & refund policies</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section: Identity */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Settings size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Store Identity & Schedule</Text>
            </View>

            <Text style={styles.formLabel}>Store Name</Text>
            <TextInput
              value={storeNameInput}
              onChangeText={setStoreNameInput}
              placeholder="e.g. FreshMart Hyperlocal"
              placeholderTextColor={Colors.textSecondary}
              style={styles.formInput}
            />

            <Text style={styles.formLabel}>Operating Hours</Text>
            <View style={styles.inputWithIconRow}>
              <Clock size={16} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={timingsInput}
                onChangeText={setTimingsInput}
                placeholder="e.g. 07:00 AM - 10:00 PM"
                placeholderTextColor={Colors.textSecondary}
                style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
              />
            </View>
          </View>

          {/* Section: Logistics Settings */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Compass size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Logistics & Ordering Rules</Text>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Radius (km)</Text>
                <TextInput
                  value={radiusInput}
                  onChangeText={radiusInput => setRadiusInput(radiusInput)}
                  keyboardType="numeric"
                  placeholder="e.g. 5"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.formInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Min Order (₹)</Text>
                <TextInput
                  value={minOrderInput}
                  onChangeText={minOrderInput => setMinOrderInput(minOrderInput)}
                  keyboardType="numeric"
                  placeholder="e.g. 150"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.formInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Surge Fee (₹)</Text>
                <TextInput
                  value={surgeInput}
                  onChangeText={surgeInput => setSurgeInput(surgeInput)}
                  keyboardType="numeric"
                  placeholder="e.g. 20"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.formInput}
                />
              </View>
            </View>

            {/* COD Switch Row */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.toggleLabel}>Enable Cash On Delivery (COD)</Text>
                <Text style={styles.toggleSub}>Allow buyers to pay cash at delivery spot</Text>
              </View>
              <Switch
                value={authStore.codEnabled}
                onValueChange={() => authStore.toggleCOD()}
                trackColor={{ false: '#D1D5DB', true: Colors.success }}
                thumbColor={Colors.white}
                style={styles.switch}
              />
            </View>
          </View>

          {/* Section: Legal Policies */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={16} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Legal & Customer Policies</Text>
            </View>

            <Text style={styles.formLabel}>Refund Policy Terms</Text>
            <TextInput
              value={refundInput}
              onChangeText={setRefundInput}
              multiline
              numberOfLines={3}
              placeholder="Enter refund policy details..."
              placeholderTextColor={Colors.textSecondary}
              style={[styles.formInput, styles.multilineInput]}
            />

            <Text style={styles.formLabel}>Return Policy Guidelines</Text>
            <TextInput
              value={returnInput}
              onChangeText={setReturnInput}
              multiline
              numberOfLines={3}
              placeholder="Enter return window and items acceptable..."
              placeholderTextColor={Colors.textSecondary}
              style={[styles.formInput, styles.multilineInput]}
            />
          </View>

          {/* Save Button */}
          <Button
            label="Save Operational Rules"
            variant="primary"
            onPress={handleSaveSettings}
            style={styles.saveBtn}
          />
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    padding: 16,
    ...Shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 42,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 14,
    fontWeight: '500',
  },
  inputWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingLeft: 12,
    height: 42,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  saveBtn: {
    width: '100%',
    shadowColor: Colors.primary,
  },
});
