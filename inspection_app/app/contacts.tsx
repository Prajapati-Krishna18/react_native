import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

// Safely require expo-contacts for web/compatibility robustness
let Contacts: any = null;
try {
  Contacts = require('expo-contacts');
} catch (e) {
  console.warn('Failed to load expo-contacts package.', e);
}

interface ContactItem {
  id: string;
  name: string;
  phoneNumber: string;
}

export default function ContactsScreen() {
  const router = useRouter();
  const { updateDraft } = useSurveys();

  // States
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback Mock Contacts for Simulators & Web
  const mockContactsList: ContactItem[] = [
    { id: 'mock-1', name: 'Aarav Sharma', phoneNumber: '+91 98765 43210' },
    { id: 'mock-2', name: 'Diya Patel', phoneNumber: '+91 87654 32109' },
    { id: 'mock-3', name: 'Kabir Singh', phoneNumber: '+91 76543 21098' },
    { id: 'mock-4', name: 'Ananya Rao', phoneNumber: '+91 99887 76655' },
    { id: 'mock-5', name: 'Vikram Malhotra', phoneNumber: '' }, // No number test case
    { id: 'mock-6', name: 'Ishaan Verma', phoneNumber: '+91 88990 11223' },
    { id: 'mock-7', name: 'Meera Nair', phoneNumber: '+91 77665 54433' },
  ];

  useEffect(() => {
    checkPermissionAndLoad();
  }, []);

  const checkPermissionAndLoad = async () => {
    if (Platform.OS === 'web' || !Contacts) {
      setPermissionGranted(true);
      loadMockContacts();
      return;
    }

    try {
      const { status } = await Contacts.getPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        fetchDeviceContacts();
      } else {
        setPermissionGranted(false);
        loadMockContacts(); // Display mock default so user has test data
      }
    } catch (err) {
      console.warn('Error fetching contact permissions, using mock data.', err);
      setPermissionGranted(true);
      loadMockContacts();
    }
  };

  const handleRequestPermission = async () => {
    if (Platform.OS === 'web' || !Contacts) {
      setPermissionGranted(true);
      loadMockContacts();
      return;
    }

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        fetchDeviceContacts();
      } else {
        setPermissionGranted(false);
        Alert.alert(
          'Permission Denied',
          'Access to contacts was denied. Displaying mock data for testing purposes.',
          [{ text: 'OK' }]
        );
        loadMockContacts();
      }
    } catch (err) {
      console.error('Request permission failed', err);
    }
  };

  // MODULE 5 - FETCH CONTACTS
  const fetchDeviceContacts = async () => {
    setIsLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const formatted: ContactItem[] = data.map((c: any) => {
          const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unnamed Contact';
          const phoneNumber = c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers[0].number : '';
          return { id: c.id, name, phoneNumber };
        });
        setContacts(formatted);
      } else {
        loadMockContacts();
      }
    } catch (err) {
      console.warn('Failed to get device contacts, falling back to mock data.', err);
      loadMockContacts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockContacts = () => {
    setContacts(mockContactsList);
  };

  // MODULE 5 - PULL TO REFRESH
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (Platform.OS !== 'web' && Contacts && permissionGranted) {
      await fetchDeviceContacts();
    } else {
      setTimeout(() => {
        loadMockContacts();
      }, 800);
    }
    setIsRefreshing(false);
  };

  // MODULE 5 - COPY CONTACT NUMBER
  const handleCopyNumber = async (number: string) => {
    if (number) {
      await Clipboard.setStringAsync(number);
      Alert.alert('Number Copied', `Contact phone (${number}) copied to clipboard.`, [{ text: 'OK' }]);
    } else {
      Alert.alert('Copy Failed', 'This contact has no number stored.');
    }
  };

  // Link selected contact to survey draft
  const handleLinkContact = (contact: ContactItem) => {
    if (!contact.phoneNumber) {
      Alert.alert('Cannot Link', 'This contact does not have a phone number. Survey linked contacts require a phone number.');
      return;
    }
    
    updateDraft({
      contact: {
        name: contact.name,
        phoneNumber: contact.phoneNumber,
      },
    });

    Alert.alert('Contact Linked', `${contact.name} linked to active survey.`, [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)/create'),
      },
    ]);
  };

  // Helper for generating avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Helper for consistent avatar background colors based on letter
  const getAvatarBgColor = (name: string) => {
    const code = name.charCodeAt(0) || 0;
    const colors = [
      '#EF4444', // red
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#06B6D4', // cyan
    ];
    return colors[code % colors.length];
  };

  // MODULE 5 - SEARCH CONTACTS FILTER
  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phoneNumber.includes(query)
    );
  });

  return (
    <View style={styles.container}>
      <CustomHeader title="Select Contact" showBackButton />
      
      {/* Search Input bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts by name or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* MODULE 5 - CONTACT COUNTER BAR */}
      <View style={styles.counterBar}>
        <Text style={styles.counterText}>
          {filteredContacts.length} {filteredContacts.length === 1 ? 'Contact' : 'Contacts'} Found
        </Text>
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loaderText}>Loading Address Book...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#1E3A8A']}
            />
          }
          // MODULE 5 - EMPTY STATE SCREEN
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Contacts Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery
                  ? "Try searching for a different name or number."
                  : "No device contacts available. Pull-to-refresh to try again."}
              </Text>
              {permissionGranted === false && (
                <Pressable style={styles.retryButton} onPress={handleRequestPermission}>
                  <Text style={styles.retryButtonText}>Grant Contacts Access</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const initials = getInitials(item.name);
            const avatarColor = getAvatarBgColor(item.name);
            return (
              <View style={styles.contactItemCard}>
                {/* MODULE 5 - CONTACT AVATAR (INITIAL) */}
                <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  
                  {/* MODULE 5 - DISPLAY 'NO NUMBER' IF UNAVAILABLE */}
                  {item.phoneNumber ? (
                    <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                  ) : (
                    <Text style={styles.noNumberText}>No Number Available</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  {item.phoneNumber ? (
                    <>
                      <Pressable style={styles.iconBtn} onPress={() => handleCopyNumber(item.phoneNumber)}>
                        <Ionicons name="copy-outline" size={18} color="#4B5563" />
                      </Pressable>
                      <Pressable style={styles.linkButton} onPress={() => handleLinkContact(item)}>
                        <Text style={styles.linkButtonText}>Link</Text>
                      </Pressable>
                    </>
                  ) : (
                    <View style={styles.linkButtonDisabled}>
                      <Text style={styles.linkButtonDisabledText}>Link</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
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
    height: 44,
    fontSize: 14,
    color: '#111827',
  },
  clearSearchBtn: {
    padding: 4,
  },
  counterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 10,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loaderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  contactItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
    marginRight: 8,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  contactPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  noNumberText: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  linkButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  linkButtonDisabled: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  linkButtonDisabledText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
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
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 18,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
