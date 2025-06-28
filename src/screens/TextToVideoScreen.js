import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import aiService from '../services/aiService';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const TextToVideoScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('male');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedQuality, setSelectedQuality] = useState('hd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { canUseFeature, incrementUsage, isSubscribed, getRemainingUsage } = useSubscriptionStore();

  const voiceOptions = [
    { id: 'male', name: 'صوت رجالي', icon: 'account', isPro: false },
    { id: 'female', name: 'صوت نسائي', icon: 'account-outline', isPro: false },
    { id: 'child', name: 'صوت طفل', icon: 'baby-face', isPro: true },
    { id: 'elderly', name: 'صوت كبير السن', icon: 'account-supervisor', isPro: true },
  ];

  const styleOptions = [
    { id: 'professional', name: 'احترافي', icon: 'tie', isPro: false },
    { id: 'casual', name: 'عادي', icon: 'account-casual', isPro: false },
    { id: 'dramatic', name: 'درامي', icon: 'drama-masks', isPro: true },
    { id: 'educational', name: 'تعليمي', icon: 'school', isPro: true },
    { id: 'news', name: 'إخباري', icon: 'newspaper', isPro: true },
  ];

  const qualityOptions = [
    { id: 'sd', name: 'جودة عادية', description: '720p', isPro: false },
    { id: 'hd', name: 'جودة عالية', description: '1080p', isPro: false },
    { id: '4k', name: 'جودة فائقة', description: '4K', isPro: true },
  ];

  const checkUsageLimit = () => {
    if (!canUseFeature('textToVideo')) {
      Alert.alert(
        'تم الوصول للحد الأقصى',
        `لقد استنفدت استخداماتك المجانية لتحويل النص إلى فيديو هذا الشهر. ${isSubscribed ? '' : 'ترقية إلى Pro للحصول على استخدام غير محدود.'}`,
        [
          { text: 'موافق', style: 'cancel' },
          ...(isSubscribed ? [] : [{ text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }])
        ]
      );
      return false;
    }
    return true;
  };

  const validateInputs = () => {
    try {
      aiService.validateText(text);
      
      // Check if selected options require Pro
      const voice = voiceOptions.find(v => v.id === selectedVoice);
      const style = styleOptions.find(s => s.id === selectedStyle);
      const quality = qualityOptions.find(q => q.id === selectedQuality);
      
      if (!isSubscribed) {
        if (voice?.isPro) {
          throw new Error('هذا الصوت متاح فقط للمشتركين في Pro');
        }
        if (style?.isPro) {
          throw new Error('هذا الأسلوب متاح فقط للمشتركين في Pro');
        }
        if (quality?.isPro) {
          throw new Error('هذه الجودة متاحة فقط للمشتركين في Pro');
        }
      }
      
      return true;
    } catch (error) {
      Alert.alert('خطأ في المدخلات', error.message);
      return false;
    }
  };

  const handleGenerateVideo = async () => {
    if (!checkUsageLimit()) return;
    if (!validateInputs()) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 300);

      const options = {
        voice: selectedVoice,
        style: selectedStyle,
        quality: selectedQuality,
        watermark: !isSubscribed, // Add watermark for free users
      };

      const result = await aiService.generateTextToVideo(text, options);
      
      clearInterval(progressInterval);
      setProgress(1);

      if (result.success) {
        // Increment usage
        await incrementUsage('textToVideo');
        
        Alert.alert(
          'تم إنشاء الفيديو بنجاح! 🎉',
          `تم حفظ الفيديو في معرض الصور\nالمدة: ${result.duration} ثانية`,
          [
            { text: 'موافق' },
            { text: 'مشاهدة', onPress: () => {/* Open video player */} },
            { text: 'مشاركة', onPress: () => {/* Share video */} }
          ]
        );
        
        // Reset form
        setText('');
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'فشل في إنشاء الفيديو');
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
        {isSubscribed ? 'غير محدود' : `${getRemainingUsage('textToVideo')} متبقي من 5`}
      </Text>
    </View>
  );

  const renderTextInput = () => (
    <Animatable.View animation="fadeInUp" style={styles.inputContainer}>
      <Text style={styles.sectionTitle}>النص المراد تحويله</Text>
      <TextInput
        style={styles.textInput}
        placeholder="اكتب النص الذي تريد تحويله إلى فيديو..."
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={5000}
      />
      <Text style={styles.characterCount}>
        {text.length} / 5000 حرف
      </Text>
    </Animatable.View>
  );

  const renderOptionSelector = (title, options, selectedValue, onSelect, delay = 0) => (
    <Animatable.View animation="fadeInUp" delay={delay} style={styles.optionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedValue === option.id && styles.selectedOptionCard,
                option.isPro && !isSubscribed && styles.proOptionCard
              ]}
              onPress={() => {
                if (option.isPro && !isSubscribed) {
                  Alert.alert(
                    'ميزة Pro',
                    'هذا الخيار متاح فقط للمشتركين في Pro',
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
                    ]
                  );
                  return;
                }
                onSelect(option.id);
              }}
            >
              <Icon 
                name={option.icon} 
                size={24} 
                color={selectedValue === option.id ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.optionName,
                selectedValue === option.id && styles.selectedOptionName
              ]}>
                {option.name}
              </Text>
              {option.description && (
                <Text style={[
                  styles.optionDescription,
                  selectedValue === option.id && styles.selectedOptionDescription
                ]}>
                  {option.description}
                </Text>
              )}
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
        <Text style={styles.progressTitle}>جاري إنشاء الفيديو...</Text>
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
          <Text style={styles.headerTitle}>تحويل النص إلى فيديو</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderUsageIndicator()}
        {renderTextInput()}
        {renderOptionSelector('نوع الصوت', voiceOptions, selectedVoice, setSelectedVoice, 100)}
        {renderOptionSelector('أسلوب العرض', styleOptions, selectedStyle, setSelectedStyle, 200)}
        {renderOptionSelector('جودة الفيديو', qualityOptions, selectedQuality, setSelectedQuality, 300)}
        {renderProgressSection()}

        {/* Generate Button */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.generateContainer}>
          <Button
            mode="contained"
            onPress={handleGenerateVideo}
            loading={isProcessing}
            disabled={isProcessing || !text.trim()}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            icon="video"
          >
            {isProcessing ? 'جاري الإنشاء...' : 'إنشاء الفيديو'}
          </Button>
        </Animatable.View>

        {/* Tips */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>نصائح للحصول على أفضل النتائج:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>استخدم نصوص واضحة ومفهومة</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>تجنب النصوص القصيرة جداً أو الطويلة جداً</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>اختر الصوت والأسلوب المناسب للمحتوى</Text>
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
  inputContainer: {
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
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    backgroundColor: theme.colors.surface,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'left',
    marginTop: 8,
  },
  optionContainer: {
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
    minWidth: 100,
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
  generateContainer: {
    margin: 20,
    marginTop: 10,
  },
  generateButton: {
    borderRadius: 12,
  },
  generateButtonContent: {
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

export default TextToVideoScreen;

