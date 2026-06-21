import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, StyleSheet, View, Alert } from 'react-native';
import { Calendar, Download, FileText, Search } from 'lucide-react-native';
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
  const { data: documents, loading, error, reload } = useAsyncResource(() => getDocuments(), []);

  const filteredDocuments = useMemo(() => {
    let items = [...(documents ?? [])];

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
        <AppText style={styles.pageTitle}>Documents</AppText>
        <AppText muted style={styles.pageSubtitle}>Access and download your approved files</AppText>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput
          placeholder="Filter by Order"
          style={styles.searchInput}
          containerStyle={styles.searchBox}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterBtn, pdfOnly && styles.filterBtnActive, localStyles.documentsFilterBtn]}
          onPress={() => setPdfOnly((current) => !current)}
        >
          <FileText color={pdfOnly ? colors.white : '#64748b'} size={14} />
          <AppText style={[styles.filterBtnText, pdfOnly && styles.filterBtnTextActive]}>PDF Only</AppText>
        </Pressable>
        <Pressable style={[styles.filterBtn, localStyles.documentsFilterBtn]} onPress={() => setIsDatePickerOpen(true)}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Filter by Date</AppText>
        </Pressable>
        {hasActiveFilters ? (
          <Pressable onPress={clearFilters} style={styles.clearBtn}>
            <AppText style={styles.clearBtnText}>Clear</AppText>
          </Pressable>
        ) : null}
      </View>

      {loading && !documents ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      <View style={styles.documentList}>
        {filteredDocuments.length ? (
          filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onView={() => router.push(`/company/documents/${doc.id}`)}
            />
          ))
        ) : (
          !loading && <EmptyState title="No documents found" />
        )}
      </View>
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
  const { data: document, loading, error, reload } = useAsyncResource(() => getDocumentById(documentId), [documentId]);
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
    <ScreenContainer scroll refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader
        back
        centerTitle
        title="Document View"
        onProfilePress={() => router.push('/company/settings')}
      />

      {loading && !document ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {document ? (
        <>
          <View style={styles.previewContainer}>
            <View style={styles.previewContent}>
              <DocumentIcon fileName={document.name} size={140} iconSize={64} />
              <AppText muted style={{ marginTop: 12, textAlign: 'center' }}>
                Live document metadata loaded from backend. Tap preview to open the secure file URL.
              </AppText>
            </View>
          </View>

          <View style={styles.viewActionRow}>
            <AppButton
              title="Download"
              loading={downloading}
              icon={<Download color={colors.white} size={18} />}
              style={styles.viewDownloadBtn}
              onPress={() => void download()}
            />
            <AppButton
              title="Preview"
              variant="secondary"
              icon={<FileText color={colors.primary} size={18} />}
              style={styles.viewPrintBtn}
              onPress={() => void openPreview()}
            />
          </View>

          <AppCard style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <AppText weight="bold" style={styles.infoCardTitle}>File Details</AppText>
              <Badge label={document.status.toUpperCase()} tone={document.status === 'Approved' ? 'green' : 'orange'} />
            </View>

            <View style={styles.fieldGrid}>
              <View style={styles.fieldFull}>
                <AppText variant="caption" muted style={styles.fieldLabel}>NAME</AppText>
                <AppText weight="bold" style={styles.fieldValue}>{document.name}</AppText>
              </View>
              <View style={styles.fieldHalf}>
                <AppText variant="caption" muted style={styles.fieldLabel}>SIZE</AppText>
                <AppText weight="bold" style={styles.fieldValue}>{document.size}</AppText>
              </View>
              <View style={styles.fieldHalf}>
                <AppText variant="caption" muted style={styles.fieldLabel}>ORDER</AppText>
                <AppText weight="bold" style={styles.fieldValue}>{document.orderId}</AppText>
              </View>
              <View style={styles.fieldFull}>
                <AppText variant="caption" muted style={styles.fieldLabel}>UPLOADED BY</AppText>
                <AppText weight="bold" style={styles.fieldValue}>{document.uploadedBy || 'Closing Engage'}</AppText>
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
  documentsFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 40,
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
});
