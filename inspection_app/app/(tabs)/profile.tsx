import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSurveys } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

export default function ProfileScreen() {
  const { surveys, clearDraft, deleteSurvey, loadSurveys } = useSurveys();
  
  // Custom states for simulation settings
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);
  const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = React.useState(true);

  // Clear all survey data action
  const handleClearAllData = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to delete all saved surveys? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem('@field_surveys_list');
              // Reload context
              await loadSurveys();
              clearDraft();
              Alert.alert('Reset Success', 'All survey data has been cleared.');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Surveyor Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>KS</Text>
          </View>
          <Text style={styles.profileName}>Krish Surveyor</Text>
          <Text style={styles.profileRole}>Lead Surveyor</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.profileBadge, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.profileBadgeText, { color: '#0369A1' }]}>Civil Eng.</Text>
            </View>
            <View style={[styles.profileBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.profileBadgeText, { color: '#15803D' }]}>Semester 6</Text>
            </View>
          </View>
        </View>

        {/* Academic Details Card */}
        <Text style={styles.sectionTitle}>Surveyor Credentials</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>Krish Surveyor</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Roll Number</Text>
            <Text style={styles.detailValue}>20BCE1023</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>Civil & Geo-Informatics Engineering</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Institution</Text>
            <Text style={styles.detailValue}>State Institute of Technology</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Logs Saved</Text>
            <Text style={styles.detailValue}>{surveys.length} survey(s)</Text>
          </View>
        </View>

        {/* Settings Card */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.detailsCard}>
          <View style={styles.settingToggleItem}>
            <View style={styles.settingItemLabelGroup}>
              <Ionicons name="notifications-outline" size={20} color="#4B5563" />
              <Text style={styles.settingItemText}>Push Notifications</Text>
            </View>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={isNotificationsEnabled ? '#1E3A8A' : '#F3F4F6'}
            />
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.settingToggleItem}>
            <View style={styles.settingItemLabelGroup}>
              <Ionicons name="location-outline" size={20} color="#4B5563" />
              <Text style={styles.settingItemText}>Background GPS</Text>
            </View>
            <Switch
              value={isLocationTrackingEnabled}
              onValueChange={setIsLocationTrackingEnabled}
              trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
              thumbColor={isLocationTrackingEnabled ? '#1E3A8A' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Info & Utility Actions */}
        <Text style={styles.sectionTitle}>System Maintenance</Text>
        <View style={styles.detailsCard}>
          <Pressable style={styles.utilityAction} onPress={handleClearAllData}>
            <View style={styles.utilityActionLabelGroup}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.utilityActionText, { color: '#EF4444' }]}>Clear All Survey History</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </Pressable>
        </View>

        {/* About App Footer */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>Smart Field Survey App</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0 (Expo v54)</Text>
          <Text style={styles.aboutDescription}>
            Developed with Expo Router, React Native Gesture Handler, Camera, Contacts, Location, and Clipboard APIs.
          </Text>
        </View>

      </ScrollView>
    </View>
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
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  profileBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 16,
    paddingLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 8,
  },
  detailItem: {
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  settingToggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingItemLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  utilityAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  utilityActionLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  utilityActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  aboutVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  aboutDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});
