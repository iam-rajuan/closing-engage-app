import { StyleSheet } from 'react-native';
import { colors, shadows } from '@/theme';

export const notaryStyles = StyleSheet.create({
  /* ─── Header (kept for legacy; screens now prefer AppHeader) ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  profileAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── Hero Banner (mirrored from CompanyHomeScreen) ─── */
  heroBanner: {
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroContent: {
    zIndex: 2,
    gap: 4,
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  heroSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 18,
  },
  heroDecor1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -30,
    right: -20,
  },
  heroDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    right: 40,
  },

  /* ─── Stats Grid (2×2, mirrored from Company) ─── */
  statsGrid: {
    gap: 8,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
    ...shadows.sm,
  },
  statCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContent: {
    flex: 1,
    gap: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    lineHeight: 26,
  },

  /* ─── Pipeline Bar ─── */
  pipelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
    padding: 14,
    gap: 8,
    ...shadows.sm,
  },
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  pipelineItem: {
    gap: 5,
  },
  pipelineLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipelineDotAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pipelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pipelineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  pipelinePct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 32,
    textAlign: 'right',
  },
  pipelineTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    marginLeft: 16,
  },
  pipelineFill: {
    height: '100%',
    borderRadius: 3,
  },
  pipelineWrap: {
    marginTop: 12,
  },

  /* ─── Section Headers (matching Company pattern) ─── */
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 14,
  },

  /* ─── Page Layout ─── */
  pageHeader: {
    marginTop: 20,
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0a49a8',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  /* ─── Order Card (aligned with Company OrderCard) ─── */
  orderCard: {
    padding: 12,
    marginBottom: 10,
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8edf4',
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdWrap: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  orderNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderClientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  orderInfoSection: {
    gap: 10,
    marginVertical: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 18,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  miniAvatarFallback: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 8,
  },
  viewDetailsBtn: {
    backgroundColor: '#f0f5ff',
    height: 34,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#dce6f4',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  /* ─── Live Badge ─── */
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
  },

  /* ─── Search & Filters (aligned with Company) ─── */
  searchContainer: {
    marginTop: 20,
    position: 'relative',
  },
  searchBox: {
    backgroundColor: '#f8fafc',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 38,
    fontSize: 14,
    color: '#334155',
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: 14,
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: {
    backgroundColor: '#0a49a8',
    borderColor: '#0a49a8',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },

  /* ─── Stat Cards Summary (for Assigned screen) ─── */
  statsContainer: {
    gap: 14,
    marginTop: 20,
    marginBottom: 4,
  },
  statCardLarge: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelLarge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLargeAssigned: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  statRowSmall: {
    flexDirection: 'row',
    gap: 14,
  },
  statCardSmall: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  statLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  statValueSmall: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    letterSpacing: -0.3,
  },

  /* ─── Tab Container (aligned with Company filter chip aesthetics) ─── */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    marginTop: 12,
    padding: 3,
    borderRadius: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  tabItemActive: {
    backgroundColor: '#0a49a8',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },

  /* ─── Order List ─── */
  orderList: {
    gap: 8,
    marginTop: 16,
    paddingBottom: 40,
  },

  /* ─── Status Reference ─── */
  statusRefCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e8edf4',
    ...shadows.sm,
  },
  statusRefItem: {
    flexDirection: 'row',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  /* ─── Order Details ─── */
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  /* ─── Timeline (mirrored from Company) ─── */
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineDotDone: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  timelineDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineActiveInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timelineLineDone: {
    backgroundColor: '#10b981',
  },

  /* ─── Info Strips ─── */
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── Schedule Link ─── */
  scheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingVertical: 4,
  },

  /* ─── Document Items ─── */
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },

  /* ─── Date/Time Cells ─── */
  dateCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCellActive: {
    backgroundColor: '#1d4ed8',
    ...shadows.button,
  },
  dateText: {
    fontSize: 14,
    color: '#334155',
  },
  timeButton: {
    width: '31%',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  timeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  timeButtonText: {
    fontSize: 13,
    color: '#475569',
  },

  /* ─── Floating Chat ─── */
  floatingChat: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  onlineDotSmall: {
    position: 'absolute',
    top: 0,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0a49a8',
  },

  /* ─── Chat ─── */
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#fff',
  },
  phoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMsgWrapper: {
    marginBottom: 24,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 14,
  },
  adminBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0a49a8',
    borderTopRightRadius: 4,
    ...shadows.sm,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  chatInputArea: {
    padding: 14,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 48,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    paddingHorizontal: 10,
  },
  sendCircle: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
