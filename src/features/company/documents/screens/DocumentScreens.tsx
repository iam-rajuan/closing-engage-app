import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Calendar, Download, FileText, Search } from 'lucide-react-native';
import * as Linking from 'expo-linking';
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

export function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { data: documents, loading, error, reload } = useAsyncResource(() => getDocuments(), []);

  const filteredDocuments = useMemo(() => {
    const items = documents ?? [];
    return items.filter((doc) =>
      !search.trim() ||
      `${doc.name} ${doc.orderId}`.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [documents, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
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
        <Pressable style={[styles.filterBtn, styles.filterBtnActive]}>
          <FileText color={colors.white} size={14} />
          <AppText style={[styles.filterBtnText, styles.filterBtnTextActive]}>Live Documents</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Backend Connected</AppText>
        </Pressable>
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
    </ScreenContainer>
  );
}

export function DocumentViewScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const documentId = params.id ?? '';
  const { data: document, loading, error } = useAsyncResource(() => getDocumentById(documentId), [documentId]);

  const openPreview = async () => {
    const url = await getDocumentPreviewUrl(documentId);
    await Linking.openURL(url);
  };

  const download = async () => {
    const url = await getDocumentDownloadUrl(documentId);
    await Linking.openURL(url);
  };

  return (
    <ScreenContainer>
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
              <FileText color="#cbd5e1" size={140} strokeWidth={1} />
              <AppText muted style={{ marginTop: 12, textAlign: 'center' }}>
                Live document metadata loaded from backend. Tap preview to open the secure file URL.
              </AppText>
            </View>
          </View>

          <View style={styles.viewActionRow}>
            <AppButton
              title="Download"
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
    </ScreenContainer>
  );
}
