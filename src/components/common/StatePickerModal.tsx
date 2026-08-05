import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { US_STATES_LIST } from '@/constants/usStates';

interface StatePickerModalProps {
  visible: boolean;
  selectedValue: string;
  onSelect: (stateCode: string) => void;
  onClose: () => void;
}

export function StatePickerModal({
  visible,
  selectedValue,
  onSelect,
  onClose,
}: StatePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = US_STATES_LIST.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelect(code);
    onClose();
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.modalContainer}>
          <View style={s.header}>
            <View>
              <AppText weight="bold" style={s.title}>
                Select State
              </AppText>
              <AppText muted style={s.subtitle}>
                Choose your notary commission state
              </AppText>
            </View>
            <Pressable style={s.closeBtn} onPress={onClose}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          <View style={s.searchBox}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={s.searchInput}
              placeholder="Search state name or code..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={16} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item.code}
            contentContainerStyle={s.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = selectedValue.toUpperCase() === item.code.toUpperCase();
              return (
                <Pressable
                  style={[s.itemRow, selected && s.itemRowSelected]}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={s.itemTextGroup}>
                    <AppText weight="bold" style={[s.itemName, selected && s.itemNameSelected]}>
                      {item.name}
                    </AppText>
                    <AppText style={s.itemCode}>State Code: {item.code}</AppText>
                  </View>
                  {selected && (
                    <View style={s.checkBadge}>
                      <Check size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={s.emptyBox}>
                <AppText muted style={s.emptyText}>
                  No states found matching "{searchQuery}"
                </AppText>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemRowSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  itemTextGroup: {
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    color: '#1e293b',
  },
  itemNameSelected: {
    color: '#0a49a8',
  },
  itemCode: {
    fontSize: 12,
    color: '#64748b',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
