import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileText,
  FolderOpen,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { SuccessModal } from '@/components/common/SuccessModal';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getNotaryOrders } from '@/services/orders.service';
import { uploadDocumentBinary } from '@/services/documents.service';
import { colors, shadows } from '@/theme';
import { pickDocuments } from '@/utils/fileUpload';
import type { Order } from '@/types/order';

const GUIDE_ITEMS = [
  { text: 'Legibility (No blur or glare)', key: 'legibility' },
  { text: 'Order of Pages (Per instructions)', key: 'order' },
  { text: 'Full Stack (Include all pages)', key: 'fullstack' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Assigned: { bg: '#dbeafe', text: '#1d4ed8' },
  Completed: { bg: '#dcfce7', text: '#15803d' },
  Approved: { bg: '#dcfce7', text: '#15803d' },
  'Under Review': { bg: '#ede9fe', text: '#7c3aed' },
  'Pending Upload': { bg: '#fef3c7', text: '#b45309' },
  Rejected: { bg: '#fee2e2', text: '#dc2626' },
  Received: { bg: '#e0f2fe', text: '#0369a1' },
  'In Progress': { bg: '#fef3c7', text: '#b45309' },
  Submitted: { bg: '#ede9fe', text: '#7c3aed' },
};

function formatFileSize(bytes?: number) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type PickedFile = { id: string; uri: string; name: string; mimeType?: string; size?: number };

function OrderPickerModal({
  visible,
  orders,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  orders: Order[];
  selectedId: string | null;
  onSelect: (order: Order) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) setSearch('');
  }, [visible]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      (o.address ?? '').toLowerCase().includes(q)
    );
  });

  const statusColor = (status: string) =>
    STATUS_COLORS[status] ?? { bg: '#f1f5f9', text: '#64748b' };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={m.backdrop} onPress={onClose} />
      <View style={m.sheet}>
        {/* Handle */}
        <View style={m.handle} />

        {/* Header */}
        <View style={m.sheetHeader}>
          <AppText style={m.sheetTitle} weight="bold">Select Order</AppText>
          <Pressable style={m.closeBtn} onPress={onClose} hitSlop={12}>
            <X color="#64748b" size={20} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={m.searchRow}>
          <Search color="#94a3b8" size={16} style={m.searchIcon} />
          <TextInput
            style={m.searchInput}
            placeholder="Search by order #, client name…"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="done"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <X color="#94a3b8" size={14} />
            </Pressable>
          )}
        </View>

        {/* Count */}
        <AppText style={m.countText} muted>
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
        </AppText>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={m.listContent}
          ItemSeparatorComponent={() => <View style={m.separator} />}
          ListEmptyComponent={
            <View style={m.emptySearch}>
              <AppText muted style={m.emptySearchText}>No orders match &quot;{search}&quot;</AppText>
            </View>
          }
          renderItem={({ item }) => {
            const sc = statusColor(item.status);
            const isSelected = item.id === selectedId;
            return (
              <Pressable
                style={({ pressed }) => [m.orderItem, isSelected && m.orderItemSelected, pressed && m.orderItemPressed]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <View style={m.orderItemLeft}>
                  <View style={m.orderNumRow}>
                    <AppText weight="bold" style={m.orderNum}>{item.orderNumber}</AppText>
                    <View style={[m.statusBadge, { backgroundColor: sc.bg }]}>
                      <AppText style={[m.statusBadgeText, { color: sc.text }]}>{item.status}</AppText>
                    </View>
                  </View>
                  <AppText style={m.orderClient}>{item.clientName}</AppText>
                  {item.address ? (
                    <AppText muted style={m.orderAddress} numberOfLines={1}>{item.address}</AppText>
                  ) : null}
                </View>
                {isSelected && (
                  <CheckCircle2 color={colors.primary} size={20} />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

export function UploadDocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessVisible, setUploadSuccessVisible] = useState(false);

  const { data: orders, loading, error, reload } = useAsyncResource(
    () => getNotaryOrders(),
    [],
    { cacheKey: 'notary-orders' },
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const browseFiles = async () => {
    const picked = await pickDocuments();
    if (picked.length === 0) return;
    setSelectedFiles((prev) => {
      const next = [...prev];
      for (const asset of picked) {
        const id = `${asset.name}-${asset.size ?? 0}-${asset.uri}`;
        if (!next.some((f) => f.id === id)) {
          next.push({ id, uri: asset.uri, name: asset.name, size: asset.size, mimeType: asset.mimeType });
        }
      }
      return next;
    });
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const submitUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please browse and select at least one document before submitting.');
      return;
    }
    if (!selectedOrder) {
      Alert.alert('No Order Selected', 'Please select an order from the dropdown before submitting.');
      return;
    }
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadDocumentBinary({ orderNumber: selectedOrder.orderNumber, file });
      }
      setSelectedFiles([]);
      setUploadSuccessVisible(true);
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = selectedFiles.length > 0 && !!selectedOrder && !uploading;

  return (
    <ScreenContainer scroll contentStyle={s.container} refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader onProfilePress={() => router.push('/notary/settings')} />

      {/* Page Header */}
      <View style={s.pageHeader}>
        <AppText style={s.pageTitle}>Upload Documents</AppText>
        <AppText muted style={s.pageSubtitle}>Upload your signed scanbacks for review</AppText>
      </View>

      {loading && !orders ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {/* Order Selection */}
      <View style={s.section}>
        <AppText style={s.sectionLabel}>SELECTED ORDER</AppText>
        <Pressable
          style={({ pressed }) => [s.dropdownTrigger, pressed && s.dropdownTriggerPressed]}
          onPress={() => setDropdownOpen(true)}
        >
          <View style={s.dropdownLeft}>
            {selectedOrder ? (
              <>
                <AppText weight="bold" style={s.dropdownOrderNum}>{selectedOrder.orderNumber}</AppText>
                <AppText style={s.dropdownClientName} numberOfLines={1}>{selectedOrder.clientName}</AppText>
              </>
            ) : (
              <AppText style={s.dropdownPlaceholder}>
                {loading ? 'Loading orders…' : 'Tap to select an order'}
              </AppText>
            )}
          </View>
          <View style={s.dropdownChevron}>
            <ChevronDown color={colors.primary} size={18} />
          </View>
        </Pressable>
      </View>

      {/* Upload Zone */}
      <AppCard style={s.uploadCard}>
        <Pressable style={({ pressed }) => [s.dropZone, pressed && s.dropZonePressed]} onPress={() => void browseFiles()}>
          <View style={s.cloudIconCircle}>
            <CloudUpload color={colors.primary} size={30} />
          </View>
          <View style={s.dropTextGroup}>
            <AppText weight="bold" style={s.dropTitle}>Select Scanbacks</AppText>
            <AppText muted style={s.dropSubtitle}>Select one or multiple · PDF, JPG, or PNG</AppText>
          </View>
        </Pressable>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <AppText muted style={s.dividerText}>or</AppText>
          <View style={s.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [s.browseBtn, pressed && s.browseBtnPressed]}
          onPress={() => void browseFiles()}
        >
          <FolderOpen color="#fff" size={18} />
          <AppText weight="bold" style={s.browseBtnText}>Browse Files</AppText>
        </Pressable>
      </AppCard>

      {/* Uploaded Files */}
      <View style={s.section}>
        <View style={s.filesHeaderRow}>
          <AppText style={s.sectionLabel}>SELECTED FILES</AppText>
          {selectedFiles.length > 0 ? (
            <View style={s.fileCountPill}>
              <AppText style={s.fileCountText}>{selectedFiles.length}</AppText>
            </View>
          ) : null}
        </View>
        {selectedFiles.length > 0 ? (
          <View style={s.fileList}>
            {selectedFiles.map((file) => (
              <AppCard key={file.id} style={s.fileCard}>
                <View style={s.fileRow}>
                  <View style={s.fileIconBox}>
                    <FileText color="#dc2626" size={22} />
                  </View>
                  <View style={s.fileInfo}>
                    <AppText weight="bold" style={s.fileName} numberOfLines={2}>{file.name}</AppText>
                    <AppText muted style={s.fileSize}>{formatFileSize(file.size)}</AppText>
                  </View>
                  <Pressable
                    style={({ pressed }) => [s.deleteBtn, pressed && s.deleteBtnPressed]}
                    onPress={() => removeFile(file.id)}
                    hitSlop={8}
                  >
                    <Trash2 color="#94a3b8" size={18} />
                  </Pressable>
                </View>
              </AppCard>
            ))}
          </View>
        ) : (
          <View style={s.emptyFileCard}>
            <FileText color="#cbd5e1" size={24} />
            <AppText muted style={s.emptyFileText}>No files selected yet</AppText>
          </View>
        )}
      </View>

      {/* Submission Guide */}
      <AppCard style={s.guideCard}>
        <View style={s.guideTitleRow}>
          <CheckCircle2 color={colors.primary} size={18} />
          <AppText weight="bold" style={s.guideTitle}>SUBMISSION GUIDE</AppText>
        </View>
        <View style={s.guideDivider} />
        {GUIDE_ITEMS.map((item) => (
          <View key={item.key} style={s.guideItem}>
            <CheckCircle2 color={colors.success} size={17} />
            <AppText style={s.guideText}>{item.text}</AppText>
          </View>
        ))}
      </AppCard>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [s.submitBtn, !canSubmit && s.submitBtnDisabled, pressed && canSubmit && s.submitBtnPressed]}
        onPress={() => void submitUpload()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <AppText weight="bold" style={s.submitBtnText}>Uploading…</AppText>
          </>
        ) : (
          <>
            <AppText weight="bold" style={s.submitBtnText}>
              {selectedFiles.length > 1 ? `Upload & Submit (${selectedFiles.length})` : 'Upload & Submit'}
            </AppText>
            <Send color="#fff" size={18} />
          </>
        )}
      </Pressable>

      {/* Order Picker Modal */}
      <OrderPickerModal
        visible={dropdownOpen}
        orders={orders ?? []}
        selectedId={selectedOrder?.id ?? null}
        onSelect={setSelectedOrder}
        onClose={() => setDropdownOpen(false)}
      />

      <SuccessModal
        visible={uploadSuccessVisible}
        title="Upload Complete"
        description="Your document was submitted successfully for review."
        buttonTitle="Done"
        onClose={() => setUploadSuccessVisible(false)}
      />
    </ScreenContainer>
  );
}

export function NotaryDocumentsScreen() {
  return <UploadDocumentsScreen />;
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  container: { paddingBottom: 32 },

  pageHeader: { marginTop: 20, marginBottom: 24, gap: 4 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#0a49a8', letterSpacing: -0.4, lineHeight: 32 },
  pageSubtitle: { fontSize: 14, lineHeight: 20 },

  section: { marginBottom: 16, gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },

  /* Dropdown */
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#dce6f4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    ...shadows.sm,
  },
  dropdownTriggerPressed: { backgroundColor: '#f0f7ff', borderColor: colors.primary },
  dropdownLeft: { flex: 1, gap: 2 },
  dropdownOrderNum: { fontSize: 15, color: '#0f172a' },
  dropdownClientName: { fontSize: 13, color: '#64748b' },
  dropdownPlaceholder: { fontSize: 15, color: '#94a3b8' },
  dropdownChevron: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Upload Card */
  uploadCard: { padding: 20, borderRadius: 16, marginBottom: 16, gap: 16 },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#bfdbfe',
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  dropZonePressed: { backgroundColor: '#eff6ff', borderColor: colors.primary },
  cloudIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTextGroup: { alignItems: 'center', gap: 4 },
  dropTitle: { fontSize: 16, color: '#0f172a' },
  dropSubtitle: { fontSize: 13 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e8edf4' },
  dividerText: { fontSize: 12 },

  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    ...shadows.button,
  },
  browseBtnPressed: { backgroundColor: '#0a3d9e' },
  browseBtnText: { color: '#fff', fontSize: 15 },

  /* File Card */
  filesHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileCountPill: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileCountText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  fileList: { gap: 10 },
  fileCard: { padding: 16, borderRadius: 14, gap: 14 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  fileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileInfo: { flex: 1, gap: 3 },
  fileName: { fontSize: 14, color: '#0f172a', lineHeight: 19 },
  fileSize: { fontSize: 12 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },

  /* Empty file */
  emptyFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emptyFileText: { fontSize: 14 },

  /* Guide Card */
  guideCard: {
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginBottom: 24,
    backgroundColor: '#f8fbff',
    borderColor: '#dbeafe',
  },
  guideTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guideTitle: { fontSize: 12, color: '#0f172a', letterSpacing: 0.6 },
  guideDivider: { height: 1, backgroundColor: '#dbeafe', marginVertical: 2 },
  guideItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  guideText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },

  /* Submit Button */
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    ...shadows.button,
  },
  submitBtnDisabled: { backgroundColor: '#93b4e0', shadowOpacity: 0 },
  submitBtnPressed: { backgroundColor: '#0a3d9e' },
  submitBtnText: { color: '#fff', fontSize: 16 },
});

/* ─── Modal Styles ───────────────────────────────────────────────────────── */

const m = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: '80%',
    ...shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sheetTitle: { fontSize: 17, color: '#0f172a' },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 0,
  },

  countText: { fontSize: 12, paddingHorizontal: 20, marginBottom: 4 },

  listContent: { paddingHorizontal: 16, paddingBottom: 8 },
  separator: { height: 1, backgroundColor: '#f1f5f9' },

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 12,
  },
  orderItemSelected: { },
  orderItemPressed: { backgroundColor: '#f8fbff' },
  orderItemLeft: { flex: 1, gap: 3 },
  orderNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  orderNum: { fontSize: 15, color: '#0f172a' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  orderClient: { fontSize: 13, color: '#334155' },
  orderAddress: { fontSize: 12, color: '#94a3b8' },

  emptySearch: { paddingVertical: 32, alignItems: 'center' },
  emptySearchText: { fontSize: 14 },
});
