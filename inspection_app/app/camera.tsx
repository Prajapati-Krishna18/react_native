import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomHeader } from '@/components/CustomHeader';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader title="Camera Utility" />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Camera API Feature Placeholder (Part 3 Implementation)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
