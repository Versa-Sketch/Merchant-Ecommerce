import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { ChevronLeft, ChevronDown, Check, MapPin, Navigation, ArrowRight } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { STORE_CATEGORIES } from '../Constants/storeCategories';
import styles from './StoreDetails.styles';

type LocationState = 'idle' | 'loading' | 'success' | 'error';

export default observer(function StoreDetailsRoute() {
  const { sessionStore } = useStores();
  const insets = useSafeAreaInsets();
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);
  const [locationState, setLocationState] = useState<LocationState>('idle');

  const selectedCategory = STORE_CATEGORIES.find((c) => c.id === sessionStore.storeCategory);
  const isValid = !!sessionStore.storeCategory && !!sessionStore.storeAddress.trim();
  const isCreating = sessionStore.isCreatingAccount;

  const handleGetLocation = async () => {
    setLocationState('loading');
    // Simulate location fetch
    await new Promise((r) => setTimeout(r, 2000));
    setLocationState('success');
    sessionStore.setStoreAddress('HSR Layout, Bengaluru, Karnataka 560102');
  };

  const handleCreate = async () => {
    if (!isValid || isCreating) return;
    const ok = await sessionStore.createAccount();
    if (ok) router.replace('/(auth)/success');
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
            <View style={styles.stepIndicator}>
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.eyebrow}>Step 2 of 2</Text>
            <Text style={styles.title}>Set up your store</Text>
            <Text style={styles.subtitle}>Help customers discover your local business.</Text>

            <View style={styles.fieldGroup}>
              {/* Store Category */}
              <View>
                <Text style={styles.fieldLabel}>STORE CATEGORY</Text>
                <TouchableOpacity
                  style={[
                    styles.categorySelectorBtn,
                    selectedCategory && styles.categorySelectorFilled,
                  ]}
                  onPress={() => setShowCategorySheet(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categorySelectorContent}>
                    {selectedCategory ? (
                      <>
                        <Text style={styles.categoryEmoji}>{selectedCategory.icon}</Text>
                        <Text style={styles.categorySelectorTextFilled}>{selectedCategory.label}</Text>
                      </>
                    ) : (
                      <Text style={styles.categorySelectorText}>Select category…</Text>
                    )}
                  </View>
                  <ChevronDown size={16} color={selectedCategory ? Colors.primary : Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Store Address */}
              <View>
                <Text style={styles.fieldLabel}>STORE ADDRESS</Text>
                <TextInput
                  style={[styles.addressInput, addressFocused && styles.addressInputFocused]}
                  value={sessionStore.storeAddress}
                  onChangeText={sessionStore.setStoreAddress.bind(sessionStore)}
                  onFocus={() => setAddressFocused(true)}
                  onBlur={() => setAddressFocused(false)}
                  placeholder="Enter your store address"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Location OR divider */}
              <View>
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                {/* Auto-detect location */}
                <TouchableOpacity
                  style={[
                    styles.locationBtn,
                    locationState === 'idle' && styles.locationBtnDefault,
                    locationState === 'loading' && styles.locationBtnLoading,
                    locationState === 'success' && styles.locationBtnSuccess,
                  ]}
                  onPress={handleGetLocation}
                  disabled={locationState === 'loading' || locationState === 'success'}
                  activeOpacity={0.7}
                >
                  {locationState === 'loading' ? (
                    <>
                      <ActivityIndicator size="small" color={Colors.textMuted} />
                      <Text style={[styles.locationBtnText, styles.locationBtnTextLoading]}>
                        Detecting location…
                      </Text>
                    </>
                  ) : locationState === 'success' ? (
                    <>
                      <Check size={16} color={Colors.success} strokeWidth={2.5} />
                      <Text style={[styles.locationBtnText, styles.locationBtnTextSuccess]}>
                        Location detected
                      </Text>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} color={Colors.primary} />
                      <Text style={[styles.locationBtnText, styles.locationBtnTextDefault]}>
                        Use Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.cta, !isValid && styles.ctaDisabled]}
            onPress={handleCreate}
            disabled={!isValid || isCreating}
            activeOpacity={0.88}
          >
            {isCreating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.ctaText, !isValid && styles.ctaTextDisabled]}>
                  Create Store
                </Text>
                {isValid && <ArrowRight size={18} color={Colors.white} strokeWidth={2.5} />}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Category Bottom Sheet */}
      <BottomSheet
        isVisible={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
        title="Store Category"
        height={0.65}
      >
        <ScrollView
          contentContainerStyle={styles.sheetCategoryList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {STORE_CATEGORIES.map((cat) => {
            const isSelected = sessionStore.storeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.sheetCategoryItem, isSelected && styles.sheetCategorySelected]}
                onPress={() => {
                  sessionStore.setStoreCategory(cat.id);
                  setShowCategorySheet(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCategoryEmoji}>{cat.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetCategoryLabel}>{cat.label}</Text>
                  <Text style={styles.sheetCategoryDesc}>{cat.description}</Text>
                </View>
                {isSelected && (
                  <View style={styles.sheetCategoryCheck}>
                    <Check size={13} color={Colors.white} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
});
