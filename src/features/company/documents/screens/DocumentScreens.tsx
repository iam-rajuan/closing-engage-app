import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, StyleSheet, View, Alert } from 'react-native';
import { Calendar, Download, FileText, Search, ShieldCheck } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { downloadFileToDevice } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { DocumentIcon } from '@/components/common/DocumentIcon';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  getDocumentById,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  getDocuments,
} from '@/services/documents.service';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors } from '@/theme';
import { DocumentFile } from '@/types/document';

type DateFilter = 'All Dates' | 'Newest First' | 'Oldest First';

const PAGE_SIZE = 8;

const parseDocumentTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

function FilterPickerModal({
  visible,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedValue: DateFilter;
  onClose: () => void;
  onSelect: (value: DateFilter) => void;
}) {
  const options: DateFilter[] = ['All Dates', 'Newest First', 'Oldest First'];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={localStyles.overlay} onPress={onClose}>
        <Pressable style={localStyles.dialog} onPress={(event) => event.stopPropagation()}>
          <AppText variant="subtitle" weight="bold" style={localStyles.dialogTitle}>
            Filter by date
          </AppText>
          <View style={localStyles.dialogOptions}>
            {options.map((option) => {
              const active = option === selectedValue;
              return (
                <Pressable
                  key={option}
                  style={[localStyles.dialogOption, active && localStyles.dialogOptionActive]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <AppText weight="bold" style={[localStyles.dialogOptionText, active && localStyles.dialogOptionTextActive]}>
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppButton title="Close" variant="secondary" onPress={onClose} style={localStyles.dialogCloseButton} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [pdfOnly, setPdfOnly] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('All Dates');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data: documents, loading, error, reload } = useAsyncResource(() => getDocuments(), [], {
    cacheKey: 'company-documents',
  });

  const filteredDocuments = useMemo(() => {
    let items = [...(documents ?? [])].filter(
      (doc) =>
        doc.uploaderRole === 'notary' &&
        (doc.status === 'Approved' || doc.status === 'Verified'),
    );

    items = items.filter((doc) =>
      !search.trim() ||
      `${doc.name} ${doc.orderId}`.toLowerCase().includes(search.trim().toLowerCase()),
    );

    if (pdfOnly) {
      items = items.filter((doc) => doc.name.toLowerCase().endsWith('.pdf') || doc.mimeType?.includes('pdf'));
    }

    if (dateFilter === 'Newest First') {
      items.sort((left, right) => parseDocumentTimestamp(right.uploadedDate) - parseDocumentTimestamp(left.uploadedDate));
    } else if (dateFilter === 'Oldest First') {
      items.sort((left, right) => parseDocumentTimestamp(left.uploadedDate) - parseDocumentTimestamp(right.uploadedDate));
    }

    return items;
  }, [dateFilter, documents, pdfOnly, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, pdfOnly, dateFilter]);

  const visibleDocuments = useMemo(
    () => filteredDocuments.slice(0, visibleCount),
    [filteredDocuments, visibleCount],
  );
  const hasMoreDocuments = visibleCount < filteredDocuments.length;

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const hasActiveFilters = pdfOnly || dateFilter !== 'All Dates' || !!search.trim();

  const clearFilters = () => {
    setSearch('');
    setPdfOnly(true);
    setDateFilter('All Dates');
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />

      <View style={styles.pageHeader}>
        <AppText style={localStyles.pageTitle} maxFontSizeMultiplier={1.1}>Documents</AppText>
        <AppText muted style={localStyles.pageSubtitle} maxFontSizeMultiplier={1.15}>Approved notary scanbacks ready for review and download</AppText>
      </View>

      <View style={localStyles.searchContainer}>
        <Search color="#94a3b8" size={16} style={localStyles.searchIcon} />
        <AppInput
          placeholder="Search by file name or order"
          style={localStyles.searchInput}
          containerStyle={localStyles.searchBox}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={localStyles.filterRow}>
        <Pressable
          style={[styles.filterBtn, pdfOnly && styles.filterBtnActive, localStyles.documentsFilterBtn]}
          onPress={() => setPdfOnly((current) => !current)}
        >
          <FileText color={pdfOnly ? colors.white : '#64748b'} size={14} />
          <AppText style={[localStyles.filterBtnText, pdfOnly && localStyles.filterBtnTextActive]} maxFontSizeMultiplier={1.05}>PDF Only</AppText>
        </Pressable>
        <Pressable style={[styles.filterBtn, localStyles.documentsFilterBtn]} onPress={() => setIsDatePickerOpen(true)}>
          <Calendar color="#64748b" size={14} />
          <AppText style={localStyles.filterBtnText} maxFontSizeMultiplier={1.05}>Filter by Date</AppText>
        </Pressable>
        {hasActiveFilters ? (
          <Pressable onPress={clearFilters} style={localStyles.clearBtn}>
            <AppText style={localStyles.clearBtnText} maxFontSizeMultiplier={1.05}>Clear</AppText>
          </Pressable>
        ) : null}
      </View>

      {!loading && !error ? (
        <View style={localStyles.resultsRow}>
          <AppText muted style={localStyles.resultsText} maxFontSizeMultiplier={1.05}>
            {filteredDocuments.length} approved {filteredDocuments.length === 1 ? 'document' : 'documents'}
          </AppText>
        </View>
      ) : null}

      {loading && !documents ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <View style={styles.documentList}>
        {visibleDocuments.length ? (
          visibleDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onView={() => router.push(`/company/documents/${doc.id}`)}
            />
          ))
        ) : (
          !loading && <EmptyState title="No approved notary documents found" />
        )}
      </View>
      {hasMoreDocuments ? (
        <AppButton
          title={`Load More (${filteredDocuments.length - visibleCount} remaining)`}
          variant="secondary"
          onPress={() => setVisibleCount((current) => current + PAGE_SIZE)}
          style={localStyles.loadMoreButton}
          textStyle={localStyles.loadMoreButtonText}
        />
      ) : null}
      <FilterPickerModal
        visible={isDatePickerOpen}
        selectedValue={dateFilter}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={setDateFilter}
      />
    </ScreenContainer>
  );
}

export function DocumentViewScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const documentId = params.id ?? '';
  const { data: document, loading, error, reload } = useAsyncResource(() => getDocumentById(documentId), [documentId], {
    cacheKey: `document:${documentId}`,
  });
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const openPreview = async () => {
    const url = await getDocumentPreviewUrl(documentId);
    await Linking.openURL(url);
  };

  const download = async () => {
    if (!document) return;
    try {
      setDownloading(true);
      const url = await getDocumentDownloadUrl(documentId);
      const mimeTypeParam = document.mimeType || 'application/pdf';
      const { localUri, mimeType } = await downloadFileToDevice(url, document.name, mimeTypeParam);
      setDownloadSuccess({ name: document.name, localUri, mimeType });
    } catch (caught) {
      console.error('Download failed:', caught);
      Alert.alert(
        'Download failed',
        caught instanceof Error ? caught.message : 'Could not download or save this document.'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader
        back
        centerTitle
        title="Document"
        onProfilePress={() => router.push('/company/settings')}
      />

      {loading && !document ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {document ? (
        <>
          <View style={localStyles.viewerHero}>
            <View style={localStyles.viewerHeroHeader}>
              <DocumentIcon fileName={document.name} size={48} iconSize={22} />
              <View style={localStyles.viewerHeroCopy}>
                <AppText weight="semibold" style={localStyles.viewerHeroTitle} numberOfLines={2} maxFontSizeMultiplier={1.1}>
                  {document.name}
                </AppText>
                <AppText muted style={localStyles.viewerHeroMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                  Order #{document.orderId} • {document.size}
                </AppText>
              </View>
              <Badge
                label={document.status.toUpperCase()}
                tone={document.status === 'Approved' || document.status === 'Verified' ? 'green' : 'orange'}
                style={localStyles.viewerStatusBadge}
              />
            </View>

            <View style={localStyles.viewerStage}>
              <View style={localStyles.viewerSheetShadow} />
              <View style={localStyles.viewerSheet}>
                <View style={localStyles.viewerSheetHeader}>
                  <View style={localStyles.viewerSheetAccent} />
                  <AppText weight="semibold" style={localStyles.viewerSheetTitle} numberOfLines={2} maxFontSizeMultiplier={1.05}>
                    Secure file preview
                  </AppText>
                </View>
                <View style={localStyles.viewerSheetBody}>
                  <View style={localStyles.viewerLineWide} />
                  <View style={localStyles.viewerLine} />
                  <View style={localStyles.viewerLineShort} />
                  <View style={localStyles.viewerGridRow}>
                    <View style={localStyles.viewerInfoBox} />
                    <View style={localStyles.viewerInfoBox} />
                  </View>
                </View>
              </View>
            </View>

            <View style={localStyles.viewerHint}>
              <ShieldCheck color="#2563eb" size={14} />
              <AppText muted style={localStyles.viewerHintText} maxFontSizeMultiplier={1.05}>
                Preview opens a secure file URL on your device
              </AppText>
            </View>
          </View>

          <View style={localStyles.viewerActionRow}>
            <AppButton
              title="Preview"
              variant="secondary"
              icon={<FileText color={colors.primary} size={16} />}
              style={localStyles.viewerPreviewBtn}
              textStyle={localStyles.viewerPreviewBtnText}
              onPress={() => void openPreview()}
            />
            <AppButton
              title="Download"
              loading={downloading}
              icon={<Download color={colors.white} size={16} />}
              style={localStyles.viewerDownloadBtn}
              textStyle={localStyles.viewerDownloadBtnText}
              onPress={() => void download()}
            />
          </View>

          <AppCard style={localStyles.detailCard}>
            <View style={localStyles.detailCardHeader}>
              <AppText weight="semibold" style={localStyles.detailCardTitle} maxFontSizeMultiplier={1.05}>File Details</AppText>
              <AppText muted style={localStyles.detailCardSubtitle} maxFontSizeMultiplier={1.05}>Production-ready notary scanback</AppText>
            </View>

            <View style={localStyles.detailGrid}>
              <View style={localStyles.detailBlockFull}>
                <AppText variant="caption" muted style={localStyles.detailLabel} maxFontSizeMultiplier={1.05}>NAME</AppText>
                <AppText weight="semibold" style={localStyles.detailValuePrimary} maxFontSizeMultiplier={1.1}>{document.name}</AppText>
              </View>
              <View style={localStyles.detailBlockHalf}>
                <AppText variant="caption" muted style={localStyles.detailLabel} maxFontSizeMultiplier={1.05}>SIZE</AppText>
                <AppText weight="semibold" style={localStyles.detailValue} maxFontSizeMultiplier={1.05}>{document.size}</AppText>
              </View>
              <View style={localStyles.detailBlockHalf}>
                <AppText variant="caption" muted style={localStyles.detailLabel} maxFontSizeMultiplier={1.05}>ORDER</AppText>
                <AppText weight="semibold" style={localStyles.detailValue} maxFontSizeMultiplier={1.05}>#{document.orderId}</AppText>
              </View>
              <View style={localStyles.detailBlockFull}>
                <AppText variant="caption" muted style={localStyles.detailLabel} maxFontSizeMultiplier={1.05}>UPLOADED BY</AppText>
                <AppText weight="semibold" style={localStyles.detailValue} maxFontSizeMultiplier={1.05}>{document.uploadedBy || 'Closing Engage'}</AppText>
              </View>
            </View>
          </AppCard>
        </>
      ) : null}

      <DownloadSuccessModal
        visible={downloadSuccess !== null}
        fileName={downloadSuccess?.name ?? ''}
        localUri={downloadSuccess?.localUri}
        mimeType={downloadSuccess?.mimeType}
        onClose={() => setDownloadSuccess(null)}
      />
    </ScreenContainer>
  );
}

const localStyles = StyleSheet.create({
  pageTitle: {
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.25,
  },
  pageSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: '92%',
  },
  searchContainer: {
    marginTop: 14,
    position: 'relative',
  },
  searchBox: {
    marginBottom: 0,
    gap: 0,
  },
  searchInput: {
    paddingLeft: 28,
    minHeight: 44,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  documentsFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 36,
    borderRadius: 10,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    lineHeight: 16,
  },
  filterBtnTextActive: {
    color: colors.white,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#eff6ff',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a49a8',
    lineHeight: 16,
  },
  resultsRow: {
    marginTop: 14,
    marginBottom: -2,
  },
  resultsText: {
    fontSize: 12,
    lineHeight: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  dialogTitle: {
    color: '#0f172a',
    marginBottom: 14,
  },
  dialogOptions: {
    gap: 10,
  },
  dialogOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dialogOptionActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  dialogOptionText: {
    fontSize: 14,
    color: '#334155',
  },
  dialogOptionTextActive: {
    color: '#2563eb',
  },
  dialogCloseButton: {
    marginTop: 16,
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 12,
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignSelf: 'center',
  },
  loadMoreButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewerHero: {
    marginTop: 10,
    borderRadius: 22,
    backgroundColor: '#f7fbff',
    borderWidth: 1,
    borderColor: '#e3edf8',
    padding: 14,
    gap: 12,
  },
  viewerHeroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  viewerHeroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  viewerHeroTitle: {
    fontSize: 16,
    lineHeight: 21,
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  viewerHeroMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748b',
  },
  viewerStatusBadge: {
    flexShrink: 0,
    marginLeft: 4,
  },
  viewerStage: {
    height: 210,
    borderRadius: 18,
    backgroundColor: '#edf4fb',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  viewerSheetShadow: {
    position: 'absolute',
    width: 166,
    height: 182,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.16)',
    transform: [{ rotate: '-4deg' }, { translateY: 6 }],
  },
  viewerSheet: {
    width: 166,
    height: 182,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 14,
    borderWidth: 1,
    borderColor: '#edf2f7',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  viewerSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  viewerSheetAccent: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  viewerSheetTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 15,
    color: '#1e293b',
  },
  viewerSheetBody: {
    gap: 8,
  },
  viewerLineWide: {
    height: 8,
    width: '74%',
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  viewerLine: {
    height: 6,
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#eef2f7',
  },
  viewerLineShort: {
    height: 6,
    width: '58%',
    borderRadius: 999,
    backgroundColor: '#eef2f7',
  },
  viewerGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  viewerInfoBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  viewerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  viewerHintText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#475569',
  },
  viewerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  viewerPreviewBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderColor: '#dbe6f2',
  },
  viewerDownloadBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0a49a8',
  },
  viewerPreviewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewerDownloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e8eef7',
  },
  detailCardHeader: {
    gap: 3,
  },
  detailCardTitle: {
    fontSize: 15,
    lineHeight: 19,
    color: '#0f172a',
  },
  detailCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748b',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailBlockFull: {
    width: '100%',
    gap: 4,
  },
  detailBlockHalf: {
    width: '47%',
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    color: '#94a3b8',
  },
  detailValuePrimary: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
  },
  detailValue: {
    fontSize: 12,
    lineHeight: 17,
    color: '#1e293b',
  },
});
