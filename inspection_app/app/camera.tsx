import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSurveys } from '../context/SurveyContext';
import { CustomHeader } from '../components/CustomHeader';

// Expo Camera import wrapped to handle environments gracefully
let CameraView: any = null;
let useCameraPermissions: any = () => [null, () => Promise.resolve({ granted: false })];

try {
  const ExpoCamera = require('expo-camera');
  CameraView = ExpoCamera.CameraView;
  useCameraPermissions = ExpoCamera.useCameraPermissions;
} catch (e) {
  console.warn('Failed to load expo-camera packages. Using fallback mock.', e);
}

export default function CameraScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useSurveys();

  // State Management
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(draft.photoUri);
  const [photoTimestamp, setPhotoTimestamp] = useState<string | null>(draft.photoTimestamp);
  const [isOpeningCamera, setIsOpeningCamera] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  const cameraRef = useRef<any>(null);

  // Loading Indicator Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpeningCamera(false);
    }, 800); // Simulate camera warm-up loading
    return () => clearTimeout(timer);
  }, []);

  const handleRequestPermission = async () => {
    if (requestPermission) {
      await requestPermission();
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  // MODULE 3 - CAPTURE PHOTO ACTION
  const takePicture = async () => {
    if (!CameraView) {
      // Handle Web/Simulator Capture Mock
      simulateCapture();
      return;
    }

    if (cameraRef.current) {
      try {
        setIsCapturing(true);
        const options = { quality: 0.8, skipProcessing: false };
        const photo = await cameraRef.current.takePictureAsync(options);
        
        const timestamp = new Date().toLocaleString();
        setPhotoUri(photo.uri);
        setPhotoTimestamp(timestamp);
      } catch (err) {
        console.error('Failed to take picture', err);
        Alert.alert('Capture Failed', 'An error occurred while taking the photo. Simulating fallback photo.');
        simulateCapture();
      } finally {
        setIsCapturing(false);
      }
    }
  };

  // Mock photo capture for web/simulators
  const simulateCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      // Beautiful mock inspection image of a construction site
      const mockUri = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop';
      const timestamp = new Date().toLocaleString();
      setPhotoUri(mockUri);
      setPhotoTimestamp(timestamp);
      setIsCapturing(false);
    }, 1000);
  };

  // MODULE 3 - DELETE PHOTO WITH CONFIRMATION ALERT
  const handleDeletePhoto = () => {
    const title = 'Delete Captured Photo';
    const message = 'Are you sure you want to discard this photo? You will need to take another one.';
    
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`${title}\n\n${message}`);
      if (confirmDelete) {
        setPhotoUri(null);
        setPhotoTimestamp(null);
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setPhotoUri(null);
              setPhotoTimestamp(null);
            },
          },
        ]
      );
    }
  };

  // Link captured photo to the active survey draft and return
  const handleUsePhoto = () => {
    if (photoUri && photoTimestamp) {
      updateDraft({
        photoUri,
        photoTimestamp,
      });
      Alert.alert('Success', 'Photo attached to survey draft.', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/create'),
        },
      ]);
    }
  };

  // Permission Flow Screen
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Checking Camera Permission...</Text>
      </View>
    );
  }

  if (permission && !permission.granted) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Camera Permission" />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconBg}>
            <Ionicons name="camera" size={60} color="#1E3A8A" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            To take photos of survey sites, we need permission to access your device's camera.
          </Text>
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Render Preview Mode (if photo has already been captured)
  if (photoUri) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Photo Preview" showBackButton />
        <View style={styles.previewContainer}>
          <View style={styles.imageCard}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.timestampOverlay}>
              <Ionicons name="time" size={14} color="#FFFFFF" />
              <Text style={styles.timestampText}>{photoTimestamp}</Text>
            </View>
          </View>

          {/* Preview Action Panel */}
          <View style={styles.previewActions}>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDeletePhoto}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
            </Pressable>

            <Pressable style={[styles.actionBtn, styles.retakeBtn]} onPress={() => { setPhotoUri(null); setPhotoTimestamp(null); }}>
              <Ionicons name="refresh-outline" size={22} color="#1E3A8A" />
              <Text style={[styles.actionBtnText, { color: '#1E3A8A' }]}>Retake</Text>
            </Pressable>

            <Pressable style={[styles.actionBtn, styles.confirmBtn]} onPress={handleUsePhoto}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Attach</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Render Active Camera View
  return (
    <View style={styles.container}>
      <CustomHeader title="Capture Photo" showBackButton />
      
      {isOpeningCamera ? (
        // Loading Indicator While Opening Camera
        <View style={styles.cameraLoadingWrapper}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.cameraLoadingText}>Initializing Lens...</Text>
        </View>
      ) : !CameraView ? (
        // Fallback Mock Camera View for Web/Simulators
        <View style={styles.mockCameraContainer}>
          <View style={styles.mockCameraHeader}>
            <Ionicons name="videocam-off" size={48} color="#9CA3AF" />
            <Text style={styles.mockCameraTitle}>Hardware Lens Offline</Text>
            <Text style={styles.mockCameraSubtitle}>
              Camera view is simulated in web and emulator environments. Tap capture below to generate a mock inspection photo.
            </Text>
          </View>
          
          <View style={styles.mockViewfinder}>
            {isCapturing ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Text style={styles.mockViewfinderText}>Virtual Viewfinder Active</Text>
            )}
          </View>

          <View style={styles.cameraControlBar}>
            <View style={{ width: 44 }} />
            <Pressable style={styles.captureButtonOuter} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </Pressable>
            <View style={{ width: 44 }} />
          </View>
        </View>
      ) : (
        // Live CameraView (Android/iOS Devices)
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            flash={flash}
            ref={cameraRef}
          >
            {isCapturing && (
              <View style={styles.captureLoadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.captureLoadingText}>Processing...</Text>
              </View>
            )}

            {/* Overlays */}
            <View style={styles.cameraOverlay}>
              {/* Top controls */}
              <View style={styles.cameraHeaderActions}>
                <Pressable style={styles.cameraIconBtn} onPress={toggleFlash}>
                  <Ionicons
                    name={flash === 'on' ? 'flash' : 'flash-off'}
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
                <Pressable style={styles.cameraIconBtn} onPress={toggleCameraFacing}>
                  <Ionicons name="camera-reverse" size={22} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Grid overlay for surveyor alignment */}
              <View style={styles.gridOverlay}>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridCellBorderLR]} />
                  <View style={styles.gridCell} />
                </View>
                <View style={[styles.gridRow, styles.gridRowBorderTB]}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridCellBorderLR]} />
                  <View style={styles.gridCell} />
                </View>
                <View style={styles.gridRow}>
                  <View style={styles.gridCell} />
                  <View style={[styles.gridCell, styles.gridCellBorderLR]} />
                  <View style={styles.gridCell} />
                </View>
              </View>

              {/* Bottom controls */}
              <View style={styles.cameraControlBar}>
                <View style={{ width: 44 }} />
                <Pressable style={styles.captureButtonOuter} onPress={takePicture} disabled={isCapturing}>
                  <View style={styles.captureButtonInner} />
                </Pressable>
                <View style={{ width: 44 }} />
              </View>
            </View>
          </CameraView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
    marginTop: 12,
  },
  permissionContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    elevation: 2,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraLoadingWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
    marginTop: 12,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  captureLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  captureLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cameraHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  cameraIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    flex: 1,
    marginVertical: 40,
    justifyContent: 'space-between',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridRowBorderTB: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridCell: {
    flex: 1,
  },
  gridCellBorderLR: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cameraControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  mockCameraContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'space-between',
    padding: 20,
  },
  mockCameraHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  mockCameraTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginTop: 12,
  },
  mockCameraSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  mockViewfinder: {
    height: 240,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  mockViewfinderText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 20,
    justifyContent: 'space-between',
  },
  imageCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    position: 'relative',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 10,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 2,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  retakeBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  confirmBtn: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
