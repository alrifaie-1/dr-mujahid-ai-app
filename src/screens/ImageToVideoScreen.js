import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, TextInput, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const ImageToVideoScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [videoSettings, setVideoSettings] = useState({
    duration: '5',
    effect: 'zoom',
    music: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSubscribed, decrementUsage } = useSubscriptionStore();

  const effects = [
    { id: 'zoom', name: 'تكبير', icon: 'magnify-plus' },
    { id: 'pan', name: 'تحريك', icon: 'arrow-all' },
    { id: 'fade', name: 'تلاشي', icon: 'fade' },
    { id: 'rotate', name: 'دوران', icon: 'rotate-3d' },
  ];

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في اختيار الصورة');
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedImage) {
      Alert.alert('خطأ', 'يرجى اختيار صورة أولاً');
      return;
    }

    if (!isSubscribed) {
      const canUse = await decrementUsage('imageToVideo');
      if (!canUse) {
        Alert.alert(
          'انتهت الاستخدامات المجانية',
          'قم بالترقية للحصول على استخدامات غير محدودة',
          [
            { text: 'إلغاء', style: 'cancel' },
            { 
              text: 'ترقية', 
              onPress: () => navigation.navigate('Subscription')
            }
          ]
        );
        return;
      }
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate video generation process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          setIsGenerating(false);
          Alert.alert('تم', 'تم إنشاء الفيديو بنجاح!');
          return 1;
        }
        return prev + 0.1;
      });
    }, 500);
  };

  const renderEffectCard = (effect) => (
    <TouchableOpacity
      key={effect.id}
      style={[
        styles.effectCard,
        videoSettings.effect === effect.id && styles.selectedEffect
      ]}
      onPress={() => setVideoSettings(prev => ({ ...prev, effect: effect.id }))}
    >
      <Icon 
        name={effect.icon} 
        size={32} 
        color={videoSettings.effect === effect.id ? 'white' : theme.colors.primary} 
      />
      <Text style={[
        styles.effectName,
        videoSettings.effect === effect.id && styles.selectedEffectText
      ]}>
        {effect.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>اختيار الصورة</Text>
            
            <TouchableOpacity 
              style={styles.imagePickerContainer}
              onPress={handleImagePicker}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image-plus" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.placeholderText}>اضغط لاختيار صورة</Text>
                </View>
              )}
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Video Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>إعدادات الفيديو</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>مدة الفيديو (ثانية)</Text>
              <TextInput
                value={videoSettings.duration}
                onChangeText={(text) => setVideoSettings(prev => ({ ...prev, duration: text }))}
                style={styles.textInput}
                mode="outlined"
                keyboardType="numeric"
                placeholder="5"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>التأثير</Text>
              <View style={styles.effectsContainer}>
                {effects.map(renderEffectCard)}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الموسيقى (اختياري)</Text>
              <TouchableOpacity style={styles.musicPicker}>
                <Icon name="music" size={24} color={theme.colors.primary} />
                <Text style={styles.musicText}>
                  {videoSettings.music || 'اختر موسيقى خلفية'}
                </Text>
                <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          {isGenerating && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>جاري إنشاء الفيديو...</Text>
              <ProgressBar 
                progress={progress} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressPercentage}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
          
          <Button
            mode="contained"
            onPress={handleGenerateVideo}
            disabled={isGenerating || !selectedImage}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            labelStyle={styles.generateButtonLabel}
          >
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الفيديو'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  imagePickerContainer: {
    height: 200,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  effectCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  selectedEffect: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  effectName: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    marginTop: 8,
  },
  selectedEffectText: {
    color: 'white',
  },
  musicPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  musicText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    marginLeft: 12,
  },
  generateSection: {
    padding: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  generateButton: {
    borderRadius: 12,
    elevation: 4,
  },
  generateButtonContent: {
    height: 50,
  },
  generateButtonLabel: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
  },
});

export default ImageToVideoScreen;

