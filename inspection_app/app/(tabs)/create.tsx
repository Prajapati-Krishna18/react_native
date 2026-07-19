import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSurveys } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

export default function CreateSurveyScreen() {
  const router = useRouter();
  const { draft, updateDraft, clearDraft, submitSurvey } = useSurveys();

  // Mode: form editing vs previewing
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState<{
    siteName?: string;
    clientName?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!draft.siteName.trim()) {
      newErrors.siteName = 'Site Name is required';
    }
    if (!draft.clientName.trim()) {
      newErrors.clientName = 'Client Name is required';
    }
    if (!draft.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setIsPreviewMode(true);
    } else {
      Alert.alert('Validation Failed', 'Please fill in all required fields.');
    }
  };

  const handleSubmit = () => {
    const result = submitSurvey();
    if (result.success) {
      Alert.alert(
        'Survey Saved',
        'Your field survey has been submitted and stored in local history.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsPreviewMode(false);
              // Navigate to the History tab
              router.push('/(tabs)/history');
            },
          },
        ]
      );
    } else {
      Alert.alert('Submission Error', result.error || 'Failed to submit survey.');
    }
  };

  // Helper for priority styling
  const getPriorityStyle = (priority: 'Low' | 'Medium' | 'High', active: boolean) => {
    if (!active) {
      return {
        card: styles.priorityInactive,
        text: styles.priorityInactiveText,
      };
    }
    switch (priority) {
      case 'High':
        return {
          card: [styles.priorityActive, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }],
          text: { color: '#EF4444', fontWeight: 'bold' as const },
        };
      case 'Medium':
        return {
          card: [styles.priorityActive, { backgroundColor: '#FEF3C7', borderColor: '#D97706' }],
          text: { color: '#D97706', fontWeight: 'bold' as const },
        };
      case 'Low':
      default:
        return {
          card: [styles.priorityActive, { backgroundColor: '#E0F2FE', borderColor: '#0284C7' }],
          text: { color: '#0284C7', fontWeight: 'bold' as const },
        };
    }
  };

  if (isPreviewMode) {
    // MODULE 7 - SURVEY PREVIEW SCREEN
    return (
      <View style={styles.container}>
        <CustomHeader title="Survey Preview" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeaderRow}>
              <Text style={styles.previewTitle}>Review Inspection Details</Text>
              <View
                style={[
                  styles.priorityBadge,
                  draft.priority === 'High'
                    ? styles.badgeHigh
                    : draft.priority === 'Medium'
                    ? styles.badgeMedium
                    : styles.badgeLow,
                ]}
              >
                <Text
                  style={[
                    styles.priorityBadgeText,
                    draft.priority === 'High'
                      ? styles.textHigh
                      : draft.priority === 'Medium'
                      ? styles.textMedium
                      : styles.textLow,
                  ]}
                >
                  {draft.priority} Priority
                </Text>
              </View>
            </View>

            {/* Field Details */}
            <View style={styles.previewInfoGroup}>
              <Text style={styles.previewLabel}>Site Name</Text>
              <Text style={styles.previewValue}>{draft.siteName}</Text>
            </View>

            <View style={styles.previewInfoGroup}>
              <Text style={styles.previewLabel}>Client Name</Text>
              <Text style={styles.previewValue}>{draft.clientName}</Text>
            </View>

            <View style={styles.previewInfoGroup}>
              <Text style={styles.previewLabel}>Scheduled Date</Text>
              <Text style={styles.previewValue}>{draft.date}</Text>
            </View>

            <View style={styles.previewInfoGroup}>
              <Text style={styles.previewLabel}>Description</Text>
              <Text style={styles.previewDescriptionValue}>{draft.description}</Text>
            </View>

            {/* Photo Attachment Section */}
            <View style={styles.attachmentTitleRow}>
              <Ionicons name="camera-outline" size={18} color="#4B5563" />
              <Text style={styles.attachmentSectionHeader}>Photo Attachment</Text>
            </View>
            {draft.photoUri ? (
              <View style={styles.previewPhotoWrapper}>
                <Image source={{ uri: draft.photoUri }} style={styles.previewPhoto} />
                <Text style={styles.photoTimeText}>Captured: {draft.photoTimestamp}</Text>
              </View>
            ) : (
              <Text style={styles.noAttachmentText}>No photo attached to this survey.</Text>
            )}

            {/* Location Section */}
            <View style={styles.attachmentTitleRow}>
              <Ionicons name="location-outline" size={18} color="#4B5563" />
              <Text style={styles.attachmentSectionHeader}>GPS Location</Text>
            </View>
            {draft.location ? (
              <View style={styles.attachedDetailItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.attachedDetailMain}>
                    Lat: {draft.location.latitude.toFixed(6)}, Long: {draft.location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.attachedDetailSub}>Accuracy: {draft.location.accuracy.toFixed(1)}m</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noAttachmentText}>No coordinates linked to this survey.</Text>
            )}

            {/* Contact Section */}
            <View style={styles.attachmentTitleRow}>
              <Ionicons name="people-outline" size={18} color="#4B5563" />
              <Text style={styles.attachmentSectionHeader}>Linked Contact</Text>
            </View>
            {draft.contact ? (
              <View style={styles.attachedDetailItem}>
                <Ionicons name="person" size={18} color="#1E3A8A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.attachedDetailMain}>{draft.contact.name}</Text>
                  <Text style={styles.attachedDetailSub}>{draft.contact.phoneNumber}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noAttachmentText}>No contact linked to this survey.</Text>
            )}

            {/* Clipboard Notes Section */}
            <View style={styles.attachmentTitleRow}>
              <Ionicons name="clipboard-outline" size={18} color="#4B5563" />
              <Text style={styles.attachmentSectionHeader}>Survey Notes</Text>
            </View>
            {draft.notes ? (
              <View style={styles.notesPreviewWrapper}>
                <Text style={styles.notesPreviewText}>{draft.notes}</Text>
              </View>
            ) : (
              <Text style={styles.noAttachmentText}>No supplementary notes added.</Text>
            )}
          </View>

          {/* Preview Buttons */}
          <View style={styles.previewActionRow}>
            <Pressable style={styles.editButton} onPress={() => setIsPreviewMode(false)}>
              <Ionicons name="create-outline" size={20} color="#1E3A8A" />
              <Text style={styles.editButtonText}>Edit Survey</Text>
            </Pressable>

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Survey</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // MODULE 2 - CREATE SURVEY SCREEN
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <CustomHeader title="New Survey" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Enter Site Inspection Info</Text>

          {/* Site Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Site Name <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWrapper, errors.siteName && styles.inputErrorBorder]}>
              <Ionicons name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Metro Tunnel Shaft 4"
                value={draft.siteName}
                onChangeText={(text) => {
                  updateDraft({ siteName: text });
                  if (errors.siteName) setErrors((prev) => ({ ...prev, siteName: undefined }));
                }}
              />
            </View>
            {errors.siteName && <Text style={styles.errorText}>{errors.siteName}</Text>}
          </View>

          {/* Client Name Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Client Name <Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWrapper, errors.clientName && styles.inputErrorBorder]}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. State Infra Authority"
                value={draft.clientName}
                onChangeText={(text) => {
                  updateDraft({ clientName: text });
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: undefined }));
                }}
              />
            </View>
            {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}
          </View>

          {/* Date Picker Field (Manual for robust cross-platform validation) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={draft.date}
                onChangeText={(text) => updateDraft({ date: text })}
              />
            </View>
          </View>

          {/* Priority Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['Low', 'Medium', 'High'] as const).map((priority) => {
                const style = getPriorityStyle(priority, draft.priority === priority);
                return (
                  <Pressable
                    key={priority}
                    style={[styles.priorityCard, style.card]}
                    onPress={() => updateDraft({ priority })}
                  >
                    <Text style={style.text}>{priority}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description / Inspection Parameters <Text style={styles.required}>*</Text></Text>
            <View
              style={[
                styles.inputWrapper,
                styles.textAreaWrapper,
                errors.description && styles.inputErrorBorder,
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#6B7280"
                style={[styles.inputIcon, { marginTop: 10 }]}
              />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Detail the site conditions, equipment checks, defects found, etc..."
                value={draft.description}
                onChangeText={(text) => {
                  updateDraft({ description: text });
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                multiline
                numberOfLines={4}
              />
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Supplementary Attachments Info Panel */}
          <View style={styles.attachmentPanel}>
            <Text style={styles.attachmentPanelTitle}>Survey Attachments</Text>
            <Text style={styles.attachmentPanelDesc}>
              Use the sidebar utilities to attach hardware logs:
            </Text>

            <View style={styles.attachmentIndicators}>
              {/* Photo Status */}
              <Pressable
                style={styles.indicatorBadge}
                onPress={() => router.push('/camera')}
              >
                <Ionicons
                  name={draft.photoUri ? 'checkmark-circle' : 'camera-outline'}
                  size={16}
                  color={draft.photoUri ? '#10B981' : '#6B7280'}
                />
                <Text style={[styles.indicatorText, draft.photoUri && styles.indicatorTextActive]}>
                  Photo {draft.photoUri ? '(Attached)' : '(None)'}
                </Text>
              </Pressable>

              {/* Location Status */}
              <Pressable
                style={styles.indicatorBadge}
                onPress={() => router.push('/location')}
              >
                <Ionicons
                  name={draft.location ? 'checkmark-circle' : 'location-outline'}
                  size={16}
                  color={draft.location ? '#10B981' : '#6B7280'}
                />
                <Text style={[styles.indicatorText, draft.location && styles.indicatorTextActive]}>
                  GPS {draft.location ? '(Attached)' : '(None)'}
                </Text>
              </Pressable>

              {/* Contact Status */}
              <Pressable
                style={styles.indicatorBadge}
                onPress={() => router.push('/contacts')}
              >
                <Ionicons
                  name={draft.contact ? 'checkmark-circle' : 'people-outline'}
                  size={16}
                  color={draft.contact ? '#10B981' : '#6B7280'}
                />
                <Text style={[styles.indicatorText, draft.contact && styles.indicatorTextActive]}>
                  Contact {draft.contact ? '(Linked)' : '(None)'}
                </Text>
              </Pressable>

              {/* Notes Status */}
              <Pressable
                style={styles.indicatorBadge}
                onPress={() => router.push('/clipboard')}
              >
                <Ionicons
                  name={draft.notes ? 'checkmark-circle' : 'clipboard-outline'}
                  size={16}
                  color={draft.notes ? '#10B981' : '#6B7280'}
                />
                <Text style={[styles.indicatorText, draft.notes && styles.indicatorTextActive]}>
                  Notes {draft.notes ? '(Filled)' : '(None)'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Form Action Row */}
          <View style={styles.formActionRow}>
            <Pressable style={styles.resetButton} onPress={clearDraft}>
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </Pressable>

            <Pressable style={styles.previewBtn} onPress={handlePreview}>
              <Text style={styles.previewBtnText}>Preview & Submit</Text>
              <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
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
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111827',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityCard: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityInactive: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  priorityInactiveText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  priorityActive: {
    borderWidth: 1.5,
  },
  attachmentPanel: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 10,
  },
  attachmentPanelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  attachmentPanelDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  attachmentIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  indicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  indicatorText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  indicatorTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  formActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  previewBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
  },
  previewBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeHigh: { backgroundColor: '#FEE2E2' },
  badgeMedium: { backgroundColor: '#FEF3C7' },
  badgeLow: { backgroundColor: '#E0F2FE' },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textHigh: { color: '#EF4444' },
  textMedium: { color: '#D97706' },
  textLow: { color: '#0284C7' },
  previewInfoGroup: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  previewDescriptionValue: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachmentSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  attachmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 4,
  },
  noAttachmentText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  previewPhotoWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  previewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoTimeText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
  attachedDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
  },
  attachedDetailMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#15803D',
  },
  attachedDetailSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  notesPreviewWrapper: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
  },
  notesPreviewText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  previewActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  editButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
