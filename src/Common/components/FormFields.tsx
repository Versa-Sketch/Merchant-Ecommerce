import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

export interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

export function FormSectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabelWrap}>
      <Text style={styles.sectionLabel}>{text.toUpperCase()}</Text>
    </View>
  );
}

export function FieldHelper({ text }: { text: string }) {
  return <Text style={styles.helper}>{text}</Text>;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  error,
  hint,
  prefix,
  editable,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
  error?: string;
  hint?: string;
  prefix?: string;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.input,
          multiline ? styles.inputMulti : null,
          error ? styles.inputError : null,
          editable === false ? styles.inputDisabled : null,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType ?? 'default'}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={editable !== false}
          autoCapitalize={autoCapitalize}
          style={[styles.textInput, multiline && { minHeight: 72, textAlignVertical: 'top' }]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.helper}>{hint}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  hint,
  placeholder,
  loading,
  disabled,
  emptyText,
}: {
  label: string;
  value: string | null;
  options: SelectOption[];
  onChange: (id: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.selectRow,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
        onPress={() => !disabled && !loading && setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={[styles.selectText, !selected && styles.placeholderText]} numberOfLines={1}>
          {selected?.label ?? placeholder ?? 'Select…'}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <ChevronDown size={15} color={Colors.textMuted} />
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.helper}>{hint}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.length === 0 ? (
                <Text style={styles.pickerEmpty}>{emptyText ?? 'No options available.'}</Text>
              ) : (
                options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.pickerRow, opt.id === value && styles.pickerRowActive]}
                    onPress={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.pickerRowText, opt.id === value && styles.pickerRowTextActive]}
                      >
                        {opt.label}
                      </Text>
                      {opt.sublabel ? (
                        <Text style={styles.pickerRowSub}>{opt.sublabel}</Text>
                      ) : null}
                    </View>
                    {opt.id === value && <Check size={15} color={Colors.primary} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export function ToggleField({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {subtitle ? <Text style={styles.toggleSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputMulti: { alignItems: 'flex-start', paddingVertical: 10 },
  inputError: { borderColor: Colors.error },
  inputDisabled: { opacity: 0.55 },
  prefix: { fontSize: 14, color: Colors.textSecondary, marginRight: 6, fontWeight: '600' },
  textInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 10 },
  selectRow: { justifyContent: 'space-between', paddingVertical: 12 },
  selectText: { fontSize: 14, color: Colors.textPrimary, flex: 1, marginRight: 8 },
  placeholderText: { color: Colors.textMuted },
  error: { fontSize: 11, color: Colors.error, marginTop: 4, fontWeight: '500' },
  helper: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },

  sectionLabelWrap: { marginTop: 10, marginBottom: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toggleSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  pickerOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayBg,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  pickerSheet: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  pickerEmpty: { fontSize: 13, color: Colors.textMuted, paddingVertical: 14 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  pickerRowActive: { backgroundColor: Colors.primaryLight },
  pickerRowText: { fontSize: 14, color: Colors.textPrimary },
  pickerRowTextActive: { color: Colors.primaryDark, fontWeight: '700' },
  pickerRowSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
