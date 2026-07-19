import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  Image,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useSurveys, Survey } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

export default function HistoryScreen() {
  const { surveys, deleteSurvey } = useSurveys();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

  // Detail Modal States
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // MODULE 8 - DELETE SURVEY WITH CONFIRMATION
  const handleDeleteSurvey = (id: string) => {
    const title = 'Delete Survey Log';
    const message = 'Are you sure you want to permanently delete this field survey? This action cannot be undone.';
    
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`${title}\n\n${message}`);
      if (confirmDelete) {
        deleteSurvey(id);
        setIsModalVisible(false);
        setSelectedSurvey(null);
        alert('The survey log has been deleted.');
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Log',
            style: 'destructive',
            onPress: async () => {
              await deleteSurvey(id);
              setIsModalVisible(false);
              setSelectedSurvey(null);
              Alert.alert('Deleted', 'The survey log has been deleted.');
            },
          },
        ]
      );
    }
  };

  const openSurveyDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setIsModalVisible(true);
  };

  const closeSurveyDetails = () => {
    setIsModalVisible(false);
    setSelectedSurvey(null);
  };

  const handleCopyCoord = async (lat: number, lng: number) => {
    await Clipboard.setStringAsync(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    Alert.alert('Copied', 'Coordinates copied to clipboard.');
  };

  const handleCopyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    Alert.alert('Copied', 'Phone number copied to clipboard.');
  };

  // Helper for priority color badge
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' }; // Red
      case 'Medium':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }; // Orange
      case 'Low':
      default:
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' }; // Blue
    }
  };

  // MODULE 8 - SEARCH & FILTER LOGIC
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      selectedPriority === 'All' || survey.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  return (
    <View style={styles.container}>
      <CustomHeader title="Survey History" />

      {/* MODULE 8 - SEARCH SURVEY HISTORY BAR */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by site or client..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* MODULE 8 - FILTER BY PRIORITY SEGMENTS */}
      <View style={styles.filterContainer}>
        {(['All', 'Low', 'Medium', 'High'] as const).map((priority) => {
          const isActive = selectedPriority === priority;
          return (
            <Pressable
              key={priority}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
              onPress={() => setSelectedPriority(priority)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {priority}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* MODULE 8 - DISPLAY SURVEYS FLATLIST */}
      <FlatList
        data={filteredSurveys}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No Logs Found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery || selectedPriority !== 'All'
                ? 'Try adjusting your search query or priority filters.'
                : 'No survey history recorded yet. Add logs in New Survey.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors = getPriorityColor(item.priority);
          return (
            <Pressable style={styles.surveyCard} onPress={() => openSurveyDetails(item)}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleGroup}>
                  <Text style={styles.siteName} numberOfLines={1}>
                    {item.siteName}
                  </Text>
                  <Text style={styles.clientName} numberOfLines={1}>
                    Client: {item.clientName}
                  </Text>
                </View>

                {/* Priority Badge */}
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: colors.bg, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.priorityText, { color: colors.text }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.footerText}>{item.date}</Text>
                </View>

                {/* Indicators for attachments */}
                <View style={styles.indicatorsRow}>
                  {item.photoUri && <Ionicons name="camera" size={14} color="#10B981" />}
                  {item.location && <Ionicons name="location" size={14} color="#3B82F6" />}
                  {item.contact && <Ionicons name="person" size={14} color="#8B5CF6" />}
                  {item.notes ? <Ionicons name="document-text" size={14} color="#F59E0B" /> : null}
                </View>

                {/* Delete button */}
                <Pressable
                  style={styles.deleteCardBtn}
                  onPress={() => handleDeleteSurvey(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />

      {/* MODULE 8 - VIEW SURVEY DETAILS MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeSurveyDetails}
      >
        {selectedSurvey && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeSurveyDetails} style={styles.modalCloseBtn}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.modalHeaderTitle}>Survey Details</Text>
              <Pressable
                onPress={() => handleDeleteSurvey(selectedSurvey.id)}
                style={styles.modalDeleteBtn}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {/* site banner */}
              <View style={styles.modalBanner}>
                <Text style={styles.modalSiteName}>{selectedSurvey.siteName}</Text>
                <Text style={styles.modalClientName}>Client: {selectedSurvey.clientName}</Text>
                
                <View style={styles.modalHeaderBadges}>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: getPriorityColor(selectedSurvey.priority).bg,
                        borderColor: getPriorityColor(selectedSurvey.priority).border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(selectedSurvey.priority).text },
                      ]}
                    >
                      {selectedSurvey.priority} Priority
                    </Text>
                  </View>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={12} color="#4B5563" />
                    <Text style={styles.dateBadgeText}>{selectedSurvey.date}</Text>
                  </View>
                </View>
              </View>

              {/* Description Card */}
              <Text style={styles.modalSectionTitle}>Description</Text>
              <View style={styles.detailsBlockCard}>
                <Text style={styles.modalDescriptionText}>{selectedSurvey.description}</Text>
              </View>

              {/* Photo Card */}
              <Text style={styles.modalSectionTitle}>Photo Log</Text>
              <View style={styles.detailsBlockCard}>
                {selectedSurvey.photoUri ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: selectedSurvey.photoUri }} style={styles.photoImage} />
                    <Text style={styles.photoTimeText}>Captured: {selectedSurvey.photoTimestamp}</Text>
                  </View>
                ) : (
                  <Text style={styles.noAttachmentText}>No photo attached to this report.</Text>
                )}
              </View>

              {/* Location Card */}
              <Text style={styles.modalSectionTitle}>GPS Telemetry</Text>
              <View style={styles.detailsBlockCard}>
                {selectedSurvey.location ? (
                  <View style={styles.actionItemRow}>
                    <Ionicons name="navigate" size={20} color="#1E3A8A" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTextMain}>
                        Lat: {selectedSurvey.location.latitude.toFixed(6)}, Long:{' '}
                        {selectedSurvey.location.longitude.toFixed(6)}
                      </Text>
                      <Text style={styles.actionTextSub}>
                        Accuracy: ± {selectedSurvey.location.accuracy.toFixed(1)} meters
                      </Text>
                    </View>
                    <Pressable
                      style={styles.modalCopyIcon}
                      onPress={() =>
                        handleCopyCoord(
                          selectedSurvey.location!.latitude,
                          selectedSurvey.location!.longitude
                        )
                      }
                    >
                      <Ionicons name="copy-outline" size={18} color="#1E3A8A" />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.noAttachmentText}>No GPS location coordinates linked.</Text>
                )}
              </View>

              {/* Contact Card */}
              <Text style={styles.modalSectionTitle}>Linked Contact</Text>
              <View style={styles.detailsBlockCard}>
                {selectedSurvey.contact ? (
                  <View style={styles.actionItemRow}>
                    <Ionicons name="person" size={20} color="#8B5CF6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTextMain}>{selectedSurvey.contact.name}</Text>
                      <Text style={styles.actionTextSub}>{selectedSurvey.contact.phoneNumber}</Text>
                    </View>
                    <Pressable
                      style={styles.modalCopyIcon}
                      onPress={() => handleCopyPhone(selectedSurvey.contact!.phoneNumber)}
                    >
                      <Ionicons name="copy-outline" size={18} color="#8B5CF6" />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.noAttachmentText}>No client contact linked to this log.</Text>
                )}
              </View>

              {/* Notes Card */}
              <Text style={styles.modalSectionTitle}>Survey Notes</Text>
              <View style={styles.detailsBlockCard}>
                {selectedSurvey.notes ? (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{selectedSurvey.notes}</Text>
                  </View>
                ) : (
                  <Text style={styles.noAttachmentText}>No supplementary notes added.</Text>
                )}
              </View>

              {/* Footer ID info */}
              <View style={styles.modalFooter}>
                <Text style={styles.surveyIdLabel}>Survey Record ID</Text>
                <Text style={styles.surveyIdValue}>{selectedSurvey.id}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  siteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  clientName: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  priorityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  indicatorsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  deleteCardBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    height: 64,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDeleteBtn: {
    padding: 6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modalBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  modalSiteName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClientName: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 4,
  },
  modalHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
    paddingLeft: 4,
  },
  detailsBlockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    marginBottom: 4,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  photoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  photoTimeText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  noAttachmentText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTextMain: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionTextSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCopyIcon: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  notesContainer: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notesText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  modalFooter: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  surveyIdLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  surveyIdValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 4,
  },
});
