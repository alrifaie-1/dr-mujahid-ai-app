import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import aiService from '../services/aiService';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const ImageEnhancementScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { canUseFeature, incrementUsage, isSubscribed, getRemainingUsage } = useSubscriptionStore();

  const enhancementOptions = [
    { 
      id: 'auto', 
      name: 'تحسين تلقائي', 
      description: 'تحسين شامل للصورة',
      icon: 'auto-fix', 
      isPro: false 
    },
    { 
      id: 'portrait', 
      name: 'تحسين الوجه', 
      description: 'تحسين الصور الشخصية',
      icon: 'face-recognition', 
      isPro: false 
    },
    { 
      id: 'landscape', 
      name: 'تحسين المناظر', 
      description: 'تحسين صور الطبيعة',
      icon: 'image-filter-hdr', 
      isPro: true 
    },
    { 
      id: 'vintage', 
      name: 'إصلاح الصور القديمة', 
      description: 'استعادة الصور التالفة',
      icon: 'image-broken-variant', 
      isPro: true 
    },
    { 
      id: 'professional', 
      name: 'تحسين احترافي', 
      description: 'جودة طباعة عالية',
      icon: 'professional-hexagon', 
      isPro: true 
    },
  ];

  const checkUsageLimit = () => {
    if (!canUseFeature('imageEnhancement')) {
      Alert.alert(
        'تم الوصول للحد الأقصى',
        `لقد استنفدت استخداماتك المجانية لتحسين الصور هذا الشهر. ${isSubscribed ? '' : 'ترقية إلى Pro للحصول على استخدام غير محدود.'}`,
        [
          { text: 'موافق', style: 'cancel' },
          ...(isSubscribed ? [] : [{ text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }])
        ]
      );
      return false;
    }
    return true;
  };

  const pickImage = async (source) => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('خطأ', 'نحتاج إذن الكاميرا لالتقاط الصور');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('خطأ', 'نحتاج إذن الوصول للصور');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setEnhancedImage(null); // Reset enhanced image
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'اختيار الصورة',
      'من أين تريد اختيار الصورة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الكاميرا', onPress: () => pickImage('camera') },
        { text: 'معرض الصور', onPress: () => pickImage('gallery') },
      ]
    );
  };

  const handleEnhanceImage = async () => {
    if (!selectedImage) {
      Alert.alert('خطأ', 'يرجى اختيار صورة أولاً');
      return;
    }

    if (!checkUsageLimit()) return;

    // Check if selected enhancement requires Pro
    const enhancement = enhancementOptions.find(e => e.id === selectedEnhancement);
    if (enhancement?.isPro && !isSubscribed) {
      Alert.alert(
        'ميزة Pro',
        'هذا النوع من التحسين متاح فقط للمشتركين في Pro',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Validate image
      await aiService.validateImage(selectedImage);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 400);

      const options = {
        enhancement: selectedEnhancement,
        quality: 'high',
        watermark: !isSubscribed,
      };

      const result = await aiService.enhanceImage(selectedImage, options);
      
      clearInterval(progressInterval);
      setProgress(1);

      if (result.success) {
        setEnhancedImage(result.imageUri);
        
        // Increment usage
        await incrementUsage('imageEnhancement');
        
        Alert.alert(
          'تم تحسين الصورة بنجاح! ✨',
          `التحسينات المطبقة:\n${result.improvements?.join('\n') || 'تحسين عام للصورة'}`,
          [
            { text: 'موافق' },
            { text: 'حفظ', onPress: () => {/* Save to gallery */} },
            { text: 'مشاركة', onPress: () => {/* Share image */} }
          ]
        );
        
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'فشل في تحسين الصورة');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUsageIndicator = () => (
    <View style={styles.usageContainer}>
      <View style={styles.usageHeader}>
        <Icon name="chart-line" size={20} color={theme.colors.primary} />
        <Text style={styles.usageTitle}>الاستخدام الشهري</Text>
      </View>
      <Text style={styles.usageText}>
        {isSubscribed ? 'غير محدود' : `${getRemainingUsage('imageEnhancement')} متبقي من 10`}
      </Text>
    </View>
  );

  const renderImageSelector = () => (
    <Animatable.View animation="fadeInUp" style={styles.imageSelectorContainer}>
      <Text style={styles.sectionTitle}>اختيار الصورة</Text>
      
      {!selectedImage ? (
        <TouchableOpacity style={styles.imagePickerButton} onPress={showImagePicker}>
          <Icon name="camera-plus" size={48} color={theme.colors.primary} />
          <Text style={styles.imagePickerText}>اضغط لاختيار صورة</Text>
          <Text style={styles.imagePickerSubtext}>من الكاميرا أو معرض الصور</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.changeImageButton} onPress={showImagePicker}>
              <Icon name="camera-switch" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {enhancedImage && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: enhancedImage }} style={styles.selectedImage} />
              <View style={styles.enhancedLabel}>
                <Icon name="sparkles" size={16} color="white" />
                <Text style={styles.enhancedLabelText}>محسنة</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </Animatable.View>
  );

  const renderEnhancementOptions = () => (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.optionsContainer}>
      <Text style={styles.sectionTitle}>نوع التحسين</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {enhancementOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedEnhancement === option.id && styles.selectedOptionCard,
                option.isPro && !isSubscribed && styles.proOptionCard
              ]}
              onPress={() => {
                if (option.isPro && !isSubscribed) {
                  Alert.alert(
                    'ميزة Pro',
                    'هذا النوع من التحسين متاح فقط للمشتركين في Pro',
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
                    ]
                  );
                  return;
                }
                setSelectedEnhancement(option.id);
              }}
            >
              <Icon 
                name={option.icon} 
                size={32} 
                color={selectedEnhancement === option.id ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.optionName,
                selectedEnhancement === option.id && styles.selectedOptionName
              ]}>
                {option.name}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedEnhancement === option.id && styles.selectedOptionDescription
              ]}>
                {option.description}
              </Text>
              {option.isPro && !isSubscribed && (
                <View style={styles.proIndicator}>
                  <Icon name="crown" size={12} color={theme.colors.secondary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Animatable.View>
  );

  const renderProgressSection = () => {
    if (!isProcessing) return null;

    return (
      <Animatable.View animation="fadeIn" style={styles.progressContainer}>
        <Text style={styles.progressTitle}>جاري تحسين الصورة...</Text>
        <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% مكتمل
        </Text>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-right" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تحسين الصور</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderUsageIndicator()}
        {renderImageSelector()}
        {renderEnhancementOptions()}
        {renderProgressSection()}

        {/* Enhance Button */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.enhanceContainer}>
          <Button
            mode="contained"
            onPress={handleEnhanceImage}
            loading={isProcessing}
            disabled={isProcessing || !selectedImage}
            style={styles.enhanceButton}
            contentStyle={styles.enhanceButtonContent}
            icon="auto-fix"
          >
            {isProcessing ? 'جاري التحسين...' : 'تحسين الصورة'}
          </Button>
        </Animatable.View>

        {/* Tips */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>نصائح للحصول على أفضل النتائج:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>استخدم صور بجودة عالية قدر الإمكان</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>تجنب الصور المهزوزة أو غير الواضحة</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>اختر نوع التحسين المناسب لنوع الصورة</Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
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
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
    marginBottom: 10,
    padding: 16,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 12,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onPrimaryContainer,
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
  },
  usageText: {
    fontSize: 14,
    color: theme.colors.onPrimaryContainer,
    fontFamily: 'Cairo-Medium',
  },
  imageSelectorContainer: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
    marginBottom: 12,
  },
  imagePickerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginTop: 12,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
  },
  changeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  enhancedLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  enhancedLabelText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Cairo-Bold',
    marginLeft: 4,
  },
  optionsContainer: {
    margin: 20,
    marginTop: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedOptionCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  proOptionCard: {
    opacity: 0.7,
  },
  optionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedOptionName: {
    color: 'white',
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedOptionDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  proIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: 8,
    padding: 2,
  },
  progressContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Medium',
  },
  enhanceContainer: {
    margin: 20,
    marginTop: 10,
  },
  enhanceButton: {
    borderRadius: 12,
  },
  enhanceButtonContent: {
    paddingVertical: 8,
  },
  tipsContainer: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Bold',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginLeft: 8,
    flex: 1,
  },
});

export default ImageEnhancementScreen;

