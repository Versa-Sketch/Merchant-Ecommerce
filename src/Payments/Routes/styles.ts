import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { padding: 8, marginRight: 8, borderRadius: 12, backgroundColor: Colors.background },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scrollContent: { padding: 16 },
  walletCard: { backgroundColor: Colors.primary, borderRadius: 24, padding: 20, ...Shadows.medium, marginBottom: 24 },
  walletCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
  walletLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255, 255, 255, 0.85)', letterSpacing: 0.5 },
  walletBalance: { fontSize: 34, fontWeight: '900', color: Colors.white, marginVertical: 14 },
  walletSubText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 16, fontWeight: '500' },
  withdrawBtn: { width: '100%', shadowColor: Colors.primary },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  gridBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gridCell: { width: (width - 42) / 2, backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(228, 231, 236, 0.5)', borderRadius: 20, padding: 14, ...Shadows.soft },
  cellIconBg: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cellLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  cellVal: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  cellSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  historyContainer: { gap: 8 },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyText: { fontSize: 12, color: Colors.textSecondary },
  payoutCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: 'rgba(228, 231, 236, 0.5)', padding: 16, borderRadius: 20, ...Shadows.soft },
  payoutCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  payoutAmt: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  payoutTxn: { fontSize: 11, color: Colors.textSecondary, marginTop: 6, fontWeight: '500' },
  payoutDate: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
