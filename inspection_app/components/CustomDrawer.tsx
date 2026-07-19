import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface DrawerItemProps {
  label: string;
  iconName: string;
  targetPath: string;
  isActive: boolean;
  onPress: () => void;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ label, iconName, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.drawerItem,
        isActive && styles.drawerItemActive,
      ]}
    >
      <Ionicons
        name={iconName as any}
        size={22}
        color={isActive ? '#1E3A8A' : '#4B5563'}
        style={styles.drawerIcon}
      />
      <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
};

export const CustomDrawer: React.FC<DrawerContentComponentProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation config for drawer items
  const menuItems = [
    { label: 'Dashboard', iconName: 'home', path: '/(tabs)' },
    { label: 'Survey', iconName: 'document-text', path: '/(tabs)/create' },
    { label: 'Camera', iconName: 'camera', path: '/camera' },
    { label: 'Location', iconName: 'location', path: '/location' },
    { label: 'Contacts', iconName: 'people', path: '/contacts' },
    { label: 'Clipboard', iconName: 'clipboard', path: '/clipboard' },
  ];

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  // Helper to determine if a route is active
  const isRouteActive = (path: string) => {
    if (path === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)';
    }
    return pathname.startsWith(path);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Student Profile / Custom Header in Drawer */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>KS</Text>
        </View>
        <Text style={styles.studentName}>Krish Surveyor</Text>
        <Text style={styles.studentId}>Roll No: 20BCE1023</Text>
        <Text style={styles.studentBranch}>Civil & Geo-Informatics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.drawerList}>
        {menuItems.map((item) => (
          <DrawerItem
            key={item.label}
            label={item.label}
            iconName={item.iconName}
            targetPath={item.path}
            isActive={isRouteActive(item.path)}
            onPress={() => handleNavigate(item.path)}
          />
        ))}

        <View style={styles.divider} />

        {/* Settings at the bottom */}
        <DrawerItem
          label="Settings"
          iconName="settings"
          targetPath="/(tabs)/profile"
          isActive={isRouteActive('/(tabs)/profile')}
          onPress={() => handleNavigate('/(tabs)/profile')}
        />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Smart Field Survey App</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileSection: {
    padding: 24,
    backgroundColor: '#1E3A8A', // Match header theme
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentId: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 4,
  },
  studentBranch: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  drawerList: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: '#EFF6FF', // Light blue background for active item
  },
  drawerIcon: {
    marginRight: 16,
  },
  drawerLabel: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  drawerLabelActive: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  versionText: {
    fontSize: 10,
    color: '#D1D5DB',
    marginTop: 2,
  },
});
