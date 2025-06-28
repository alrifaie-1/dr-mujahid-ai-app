import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import { Button, Card, Modal, Portal, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const StudioScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('white');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  
  const { canUseFeature, incrementUsage, isSubscribed, getRemainingUsage } = useSubscriptionStore();

  const backgrounds = [
    { id: 'white', name: 'خلفية بيضاء', preview: '#ffffff', isPro: false },
    { id: 'office', name: 'مكتب احترافي', preview: '#4a5568', isPro: true },
    { id: 'nature', name: 'طبيعة خضراء', preview: '#38a169', isPro: true },
    { id: 'studio', name: 'استديو رمادي', preview: '#718096', isPro: true },
    { id: 'gradient', name: 'تدرج أزرق', preview: '#4299e1', isPro: true },
    { id: 'custom', name: 'خلفية مخصصة', preview: '#805ad5', isPro: true },
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const checkUsageLimit = () => {
    if (!canUseFeature('studioPhotos')) {
      Alert.alert(
        'تم الوصول للحد الأقصى',
        `لقد استنفدت استخداماتك المجانية للاستديو هذا الشهر. ${isSubscribed ? '' : 'ترقية إلى Pro للحصول على استخدام غير محدود.'}`,
        [
          { text: 'موافق', style: 'cancel' },
          ...(isSubscribed ? [] : [{ text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }])
        ]
      );
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    if (!checkUsageLimit()) return;

    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: false,
        });
        setCapturedImage(photo.uri);
        setShowBackgroundModal(true);
      } catch (error) {
        Alert.alert('خطأ', 'فشل في التقاط الصورة');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const selectBackgroundAndProcess = async () => {
    if (!capturedImage) return;

    const background = backgrounds.find(bg => bg.id === selectedBackground);
    if (background?.isPro && !isSubscribed) {
      Alert.alert(
        'ميزة Pro',
        'هذه الخلفية متاحة فقط للمشتركين في Pro',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    setShowBackgroundModal(false);
    setIsProcessing(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would call an AI service to remove background and add new one
      const processedImage = await processImageWithBackground(capturedImage, selectedBackground);
      
      // Save to gallery
      const asset = await MediaLibrary.saveToLibraryAsync(processedImage);
      
      // Increment usage
      await incrementUsage('studioPhotos');
      
      Alert.alert(
        'تم بنجاح!',
        'تم حفظ الصورة المحسنة في معرض الصور',
        [
          { text: 'موافق' },
          { text: 'مشاركة', onPress: () => shareImage(processedImage) }
        ]
      );
      
      setCapturedImage(null);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageWithBackground = async (imageUri, backgroundType) => {
    // This is a placeholder - in a real app, you would call an AI service
    // For now, we'll just return the original image
    return imageUri;
  };

  const shareImage = async (imageUri) => {
    // Implement sharing functionality
  };

  const selectCustomBackground = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle custom background
      setSelectedBackground('custom');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setShowBackgroundModal(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>طلب إذن الكاميرا...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>لا يمكن الوصول للكاميرا</Text>
        <Button mode="contained" onPress={() => Camera.requestCameraPermissionsAsync()}>
          طلب الإذن
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={24} color={theme.colors.onBackground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الاستديو الاحترافي</Text>
        <View style={styles.usageIndicator}>
          <Text style={styles.usageText}>
            {isSubscribed ? '∞' : getRemainingUsage('studioPhotos')}
          </Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {/* Camera Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setCameraType(
                  cameraType === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                )}
              >
                <Icon name="camera-flip" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Center Guide */}
            <View style={styles.centerGuide}>
              <View style={styles.guideFrame} />
              <Text style={styles.guideText}>ضع وجهك في الإطار</Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.captureContainer}>
                <TouchableOpacity
                  style={[styles.captureButton, isRecording && styles.captureButtonActive]}
                  onPress={takePicture}
                  disabled={isRecording}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Camera>
      </View>

      {/* Features Info */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>ميزات الاستديو الاحترافي</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Icon name="auto-fix" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>تحسين الإضاءة تلقائياً</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="image-filter-hdr" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>جودة عالية للطباعة</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="palette" size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>خلفيات متنوعة</Text>
          </View>
        </View>
      </View>

      {/* Background Selection Modal */}
      <Portal>
        <Modal
          visible={showBackgroundModal}
          onDismiss={() => setShowBackgroundModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>اختر الخلفية</Text>
          
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}

          <View style={styles.backgroundOptions}>
            {backgrounds.map((bg) => (
              <TouchableOpacity
                key={bg.id}
                style={[
                  styles.backgroundOption,
                  selectedBackground === bg.id && styles.selectedBackground
                ]}
                onPress={() => {
                  if (bg.isPro && !isSubscribed) {
                    Alert.alert('ميزة Pro', 'هذه الخلفية متاحة فقط للمشتركين');
                    return;
                  }
                  if (bg.id === 'custom') {
                    selectCustomBackground();
                  } else {
                    setSelectedBackground(bg.id);
                  }
                }}
              >
                <View style={[styles.backgroundPreview, { backgroundColor: bg.preview }]} />
                <Text style={styles.backgroundName}>{bg.name}</Text>
                {bg.isPro && !isSubscribed && (
                  <Icon name="crown" size={16} color={theme.colors.secondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={retakePicture}>
              إعادة التصوير
            </Button>
            <Button 
              mode="contained" 
              onPress={selectBackgroundAndProcess}
              loading={isProcessing}
            >
              معالجة الصورة
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
  },
  usageIndicator: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usageText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
  },
  centerGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 200,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bottomControls: {
    padding: 20,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
  },
  featuresContainer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 10,
  },
  featuresList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  noPermissionText: {
    fontSize: 16,
    color: theme.colors.onBackground,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  backgroundOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backgroundOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBackground: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  backgroundPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  backgroundName: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default StudioScreen;

