import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

export default function ClipboardScreen() {
  const { draft, updateDraft } = useSurveys();
  
  // Local state for generated mock Survey ID
  const [generatedSurveyId, setGeneratedSurveyId] = useState<string>(() => {
    return `SRV-${Date.now().toString().slice(-6)}`;
  });

  // State to show notes typed or pasted
  const [localNotes, setLocalNotes] = useState<string>(draft.notes);

  const generateNewId = () => {
    setGeneratedSurveyId(`SRV-${Date.now().toString().slice(-6)}`);
  };

  // MODULE 6 - COPY SURVEY ID
  const handleCopySurveyId = async () => {
    await Clipboard.setStringAsync(generatedSurveyId);
    Alert.alert('Copied ID', `Survey ID (${generatedSurveyId}) has been copied to your clipboard.`, [{ text: 'OK' }]);
  };

  // MODULE 6 - COPY LINKED CONTACT NUMBER
  const handleCopyContactNumber = async () => {
    if (draft.contact?.phoneNumber) {
      await Clipboard.setStringAsync(draft.contact.phoneNumber);
      Alert.alert('Copied Phone', `Contact number (${draft.contact.phoneNumber}) copied to clipboard.`, [{ text: 'OK' }]);
    } else {
      Alert.alert('No Number Available', 'No contact is linked to the current survey draft. Linking a contact first is recommended.');
    }
  };

  // MODULE 6 - COPY CURRENT LOCATION
  const handleCopyLocation = async () => {
    if (draft.location) {
      const coordStr = `${draft.location.latitude.toFixed(6)}, ${draft.location.longitude.toFixed(6)}`;
      await Clipboard.setStringAsync(coordStr);
      Alert.alert('Copied Coordinates', `GPS coordinates (${coordStr}) copied to clipboard.`, [{ text: 'OK' }]);
    } else {
      Alert.alert('No GPS Available', 'No coordinates are attached to the current survey draft. Link location first.');
    }
  };

  // MODULE 6 - PASTE NOTES FROM CLIPBOARD
  const handlePasteNotes = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text.trim()) {
        setLocalNotes(text);
        updateDraft({ notes: text });
        Alert.alert('Pasted Notes', 'Text from clipboard successfully pasted into survey notes.', [{ text: 'OK' }]);
      } else {
        Alert.alert('Clipboard Empty', 'No text found on your clipboard to paste.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to read clipboard data.');
    }
  };

  // MODULE 6 - CLEAR CLIPBOARD DATA
  const handleClearClipboard = async () => {
    await Clipboard.setStringAsync('');
    Alert.alert('Clipboard Cleared', 'Clipboard data has been reset to empty.', [{ text: 'OK' }]);
  };

  const handleNotesTextChange = (text: string) => {
    setLocalNotes(text);
    updateDraft({ notes: text });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <CustomHeader title="Clipboard Utility" showBackButton />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Copy Hub Section */}
        <Text style={styles.sectionTitle}>Copy Panel</Text>
        
        <View style={styles.card}>
          {/* Survey ID Row */}
          <View style={styles.copyRow}>
            <View style={styles.copyInfo}>
              <Text style={styles.itemLabel}>Survey ID Generator</Text>
              <View style={styles.idContainer}>
                <Text style={styles.idText}>{generatedSurveyId}</Text>
                <Pressable onPress={generateNewId} style={styles.regenerateBtn}>
                  <Ionicons name="refresh" size={16} color="#1E3A8A" />
                </Pressable>
              </View>
            </View>
            <Pressable style={styles.copyBadge} onPress={handleCopySurveyId}>
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.copyBadgeText}>Copy</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Location Coordinates Row */}
          <View style={styles.copyRow}>
            <View style={styles.copyInfo}>
              <Text style={styles.itemLabel}>Active GPS Coordinates</Text>
              <Text style={[styles.itemValue, !draft.location && styles.placeholderValue]}>
                {draft.location
                  ? `${draft.location.latitude.toFixed(6)}, ${draft.location.longitude.toFixed(6)}`
                  : 'No coordinates attached'}
              </Text>
            </View>
            <Pressable
              style={[styles.copyBadge, !draft.location && styles.copyBadgeDisabled]}
              onPress={handleCopyLocation}
              disabled={!draft.location}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.copyBadgeText}>Copy</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Contact Number Row */}
          <View style={styles.copyRow}>
            <View style={styles.copyInfo}>
              <Text style={styles.itemLabel}>Linked Contact Phone</Text>
              <Text style={[styles.itemValue, !draft.contact && styles.placeholderValue]}>
                {draft.contact
                  ? `${draft.contact.name} (${draft.contact.phoneNumber})`
                  : 'No contact linked'}
              </Text>
            </View>
            <Pressable
              style={[styles.copyBadge, !draft.contact && styles.copyBadgeDisabled]}
              onPress={handleCopyContactNumber}
              disabled={!draft.contact}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
              <Text style={styles.copyBadgeText}>Copy</Text>
            </Pressable>
          </View>
        </View>

        {/* Paste & Input Hub Section */}
        <Text style={styles.sectionTitle}>Paste & Edit Notes</Text>
        
        <View style={styles.card}>
          <Text style={styles.textAreaDesc}>
            Type supplementary inspection comments, or click "Paste Notes" below to retrieve inspection comments copied from external documents:
          </Text>

          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Write survey notes here..."
              value={localNotes}
              onChangeText={handleNotesTextChange}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.notesActionsRow}>
            <Pressable style={[styles.btn, styles.btnPaste]} onPress={handlePasteNotes}>
              <Ionicons name="clipboard" size={18} color="#1E3A8A" />
              <Text style={[styles.btnText, { color: '#1E3A8A' }]}>Paste Notes</Text>
            </Pressable>

            <Pressable style={[styles.btn, styles.btnClear]} onPress={handleClearClipboard}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.btnText, { color: '#EF4444' }]}>Clear Clipboard</Text>
            </Pressable>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoNotice}>
          <Ionicons name="information-circle-outline" size={20} color="#1E40AF" />
          <Text style={styles.infoNoticeText}>
            Use clipboard commands to import inspection parameters from standard PDF templates or copy site records for surveyor logs.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  copyInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  idText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  regenerateBtn: {
    padding: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
  },
  placeholderValue: {
    color: '#9CA3AF',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  copyBadge: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyBadgeDisabled: {
    backgroundColor: '#9CA3AF',
  },
  copyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  textAreaDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  textAreaWrapper: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textArea: {
    height: 120,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  notesActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  btnPaste: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  btnClear: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  btnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  infoNotice: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
