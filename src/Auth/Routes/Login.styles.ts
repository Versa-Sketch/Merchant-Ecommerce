import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  kav: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 28, paddingTop: 24, flex: 1 },
  eyebrow: {
    fontSize: 12, fontWeight: '700', color: Colors.primary,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    lineHeight: 36, letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28,
  },
  inputLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    marginBottom: 8, letterSpacing: 0.3,
  },

  // Full-name text input box
  textInputBox: {
    height: 56, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  textInputBoxFocused: { borderColor: Colors.primary },
  textInputBoxError: { borderColor: Colors.error },
  textInputField: {
    flex: 1, fontSize: 16, fontWeight: '500', color: Colors.textPrimary,
  },

  // Phone row
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 16, backgroundColor: Colors.surface,
    overflow: 'hidden', height: 56,
  },
  phoneRowFocused: { borderColor: Colors.primary },
  phoneRowError: { borderColor: Colors.error },
  countryPrefix: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14,
    borderRightWidth: 1.5, borderRightColor: Colors.border,
    height: '100%', backgroundColor: Colors.background,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  phoneInput: {
    flex: 1, paddingHorizontal: 14,
    fontSize: 16, fontWeight: '500', color: Colors.textPrimary,
  },

  errorText: {
    fontSize: 12, fontWeight: '500', color: Colors.error, marginTop: 6, marginLeft: 2,
  },

  // API error banner
  apiErrorBox: {
    marginTop: 16, padding: 12, borderRadius: 12,
    backgroundColor: Colors.errorBg,
    borderWidth: 1, borderColor: `${Colors.error}30`,
  },
  apiErrorText: { fontSize: 13, color: Colors.error, fontWeight: '500', lineHeight: 18 },

  footer: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 8, gap: 14 },
  cta: {
    height: 56, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaEnabled: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  ctaDisabled: { backgroundColor: Colors.border },
  ctaText: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.2 },
  ctaTextDisabled: { color: Colors.textMuted },
  terms: {
    fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16,
  },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  signUpRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4,
  },
  signUpText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  signUpAccent: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
