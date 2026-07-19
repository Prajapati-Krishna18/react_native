import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBackButton = false }) => {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <View style={styles.leftContainer}>
        {showBackButton ? (
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable onPress={toggleDrawer} style={styles.iconButton}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: Platform.OS === 'ios' ? 90 : 64,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    backgroundColor: '#1E3A8A', // Premium Royal Blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: 4,
    borderRadius: 20,
  },
});
