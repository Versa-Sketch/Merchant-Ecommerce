import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 100, gap: 14 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: { width: 60, height: 60, borderRadius: 12, backgroundColor: Colors.surfaceElevated },
  storeName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  storeType: { marginTop: 2, fontSize: 12, color: Colors.textSecondary },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  accountCard: { gap: 4 },
  accountName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  accountPhone: { fontSize: 12, color: Colors.textSecondary },
  trustBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primaryLight, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(45,106,79,0.18)', padding: 14 },
  trustTitle: { fontSize: 13, fontWeight: '600', color: Colors.primaryDark },
  trustSub: { marginTop: 2, fontSize: 11, color: Colors.textSecondary },
  settingsGroup: { backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadows.soft },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingRowLast: { borderBottomWidth: 0 },
  settingIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  settingMeta: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  settingSub: { marginTop: 2, fontSize: 11, color: Colors.textSecondary },
  logoutButton: { minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(230,57,70,0.20)', backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontSize: 14, fontWeight: '600', color: Colors.error },
});
