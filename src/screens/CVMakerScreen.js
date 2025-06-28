import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import aiService from '../services/aiService';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const CVMakerScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedCV, setGeneratedCV] = useState(null);
  
  const { canUseFeature, incrementUsage, isSubscribed, getRemainingUsage } = useSubscriptionStore();

  // CV Data State
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
    projects: [],
  });

  const cvTemplates = [
    {
      id: 'modern',
      name: 'عصري',
      description: 'تصميم حديث وأنيق',
      preview: 'modern_preview.png',
      isPro: false,
    },
    {
      id: 'professional',
      name: 'احترافي',
      description: 'تصميم كلاسيكي للشركات',
      preview: 'professional_preview.png',
      isPro: false,
    },
    {
      id: 'creative',
      name: 'إبداعي',
      description: 'تصميم مبتكر للمجالات الإبداعية',
      preview: 'creative_preview.png',
      isPro: true,
    },
    {
      id: 'minimalist',
      name: 'بسيط',
      description: 'تصميم نظيف ومرتب',
      preview: 'minimalist_preview.png',
      isPro: true,
    },
    {
      id: 'executive',
      name: 'تنفيذي',
      description: 'للمناصب الإدارية العليا',
      preview: 'executive_preview.png',
      isPro: true,
    },
  ];

  const steps = [
    { title: 'المعلومات الشخصية', icon: 'account' },
    { title: 'الخبرات العملية', icon: 'briefcase' },
    { title: 'التعليم', icon: 'school' },
    { title: 'المهارات', icon: 'star' },
    { title: 'اختيار التصميم', icon: 'palette' },
    { title: 'المعاينة والتصدير', icon: 'file-export' },
  ];

  const checkUsageLimit = () => {
    if (!canUseFeature('cvGeneration')) {
      Alert.alert(
        'تم الوصول للحد الأقصى',
        `لقد استنفدت استخداماتك المجانية لإنشاء السيرة الذاتية هذا الشهر. ${isSubscribed ? '' : 'ترقية إلى Pro للحصول على استخدام غير محدود.'}`,
        [
          { text: 'موافق', style: 'cancel' },
          ...(isSubscribed ? [] : [{ text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }])
        ]
      );
      return false;
    }
    return true;
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إذن الوصول للصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      }]
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
        description: '',
      }]
    }));
  };

  const addSkill = (skillText) => {
    if (skillText.trim()) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, {
          id: Date.now(),
          name: skillText.trim(),
          level: 'متوسط',
        }]
      }));
    }
  };

  const generateCV = async () => {
    if (!checkUsageLimit()) return;

    // Validate required fields
    if (!cvData.personalInfo.fullName || !cvData.personalInfo.email) {
      Alert.alert('خطأ', 'يرجى ملء الحقول المطلوبة (الاسم والبريد الإلكتروني)');
      return;
    }

    // Check if selected template requires Pro
    const template = cvTemplates.find(t => t.id === selectedTemplate);
    if (template?.isPro && !isSubscribed) {
      Alert.alert(
        'قالب Pro',
        'هذا القالب متاح فقط للمشتركين في Pro',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
        ]
      );
      return;
    }

    setIsGenerating(true);
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
      }, 500);

      const cvOptions = {
        template: selectedTemplate,
        data: cvData,
        profileImage: profileImage,
        language: 'ar',
        format: 'pdf',
        watermark: !isSubscribed,
      };

      const result = await aiService.generateCV(cvOptions);
      
      clearInterval(progressInterval);
      setProgress(1);

      if (result.success) {
        setGeneratedCV(result);
        setShowPreview(true);
        
        // Increment usage
        await incrementUsage('cvGeneration');
        
        Alert.alert(
          'تم إنشاء السيرة الذاتية بنجاح! 🎉',
          'يمكنك الآن معاينة وتحميل سيرتك الذاتية',
          [
            { text: 'معاينة', onPress: () => setShowPreview(true) },
            { text: 'تحميل PDF', onPress: () => downloadCV('pdf') },
            { text: 'تحميل Word', onPress: () => downloadCV('docx') }
          ]
        );
        
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'فشل في إنشاء السيرة الذاتية');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCV = async (format) => {
    try {
      // In a real app, this would download the file
      Alert.alert(
        'تحميل السيرة الذاتية',
        `سيتم تحميل السيرة الذاتية بصيغة ${format.toUpperCase()}`,
        [
          { text: 'موافق' },
          { text: 'مشاركة', onPress: () => shareCV(format) }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل السيرة الذاتية');
    }
  };

  const shareCV = async (format) => {
    try {
      // In a real app, this would share the file
      Alert.alert('مشاركة', 'تم فتح خيارات المشاركة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في مشاركة السيرة الذاتية');
    }
  };

  const renderUsageIndicator = () => (
    <View style={styles.usageContainer}>
      <View style={styles.usageHeader}>
        <Icon name="file-document" size={20} color={theme.colors.primary} />
        <Text style={styles.usageTitle}>إنشاء السيرة الذاتية</Text>
      </View>
      <Text style={styles.usageText}>
        {isSubscribed ? 'غير محدود' : `${getRemainingUsage('cvGeneration')} متبقي من 3`}
      </Text>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep && styles.stepCircleActive,
            index < currentStep && styles.stepCircleCompleted
          ]}>
            <Icon 
              name={index < currentStep ? 'check' : step.icon} 
              size={16} 
              color={index <= currentStep ? 'white' : theme.colors.outline} 
            />
          </View>
          <Text style={[
            styles.stepTitle,
            index <= currentStep && styles.stepTitleActive
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStep && styles.stepLineCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderPersonalInfoStep = () => (
    <Animatable.View animation="fadeInRight" style={styles.stepContent}>
      <Text style={styles.stepHeader}>المعلومات الشخصية</Text>
      
      {/* Profile Image */}
      <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Icon name="camera-plus" size={32} color={theme.colors.primary} />
            <Text style={styles.profileImageText}>إضافة صورة شخصية</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Personal Info Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل *"
          value={cvData.personalInfo.fullName}
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, fullName: text }
          }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="المسمى الوظيفي"
          value={cvData.personalInfo.jobTitle}
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, jobTitle: text }
          }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني *"
          value={cvData.personalInfo.email}
          keyboardType="email-address"
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, email: text }
          }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="رقم الهاتف"
          value={cvData.personalInfo.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, phone: text }
          }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="الموقع/المدينة"
          value={cvData.personalInfo.location}
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, location: text }
          }))}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="نبذة مختصرة عنك"
          value={cvData.personalInfo.summary}
          multiline
          numberOfLines={4}
          onChangeText={(text) => setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, summary: text }
          }))}
        />
      </View>
    </Animatable.View>
  );

  const renderTemplateSelection = () => (
    <Animatable.View animation="fadeInRight" style={styles.stepContent}>
      <Text style={styles.stepHeader}>اختيار تصميم السيرة الذاتية</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.templatesContainer}>
          {cvTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.selectedTemplateCard,
                template.isPro && !isSubscribed && styles.proTemplateCard
              ]}
              onPress={() => {
                if (template.isPro && !isSubscribed) {
                  Alert.alert(
                    'قالب Pro',
                    'هذا القالب متاح فقط للمشتركين في Pro',
                    [
                      { text: 'إلغاء', style: 'cancel' },
                      { text: 'ترقية إلى Pro', onPress: () => navigation.navigate('Subscription') }
                    ]
                  );
                  return;
                }
                setSelectedTemplate(template.id);
              }}
            >
              <View style={styles.templatePreview}>
                <Icon name="file-document" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
              {template.isPro && !isSubscribed && (
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
    if (!isGenerating) return null;

    return (
      <Animatable.View animation="fadeIn" style={styles.progressContainer}>
        <Text style={styles.progressTitle}>جاري إنشاء السيرة الذاتية...</Text>
        <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% مكتمل
        </Text>
      </Animatable.View>
    );
  };

  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      {currentStep > 0 && (
        <Button
          mode="outlined"
          onPress={() => setCurrentStep(prev => prev - 1)}
          style={styles.navButton}
        >
          السابق
        </Button>
      )}
      
      {currentStep < steps.length - 1 ? (
        <Button
          mode="contained"
          onPress={() => setCurrentStep(prev => prev + 1)}
          style={styles.navButton}
        >
          التالي
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={generateCV}
          loading={isGenerating}
          disabled={isGenerating}
          style={styles.navButton}
          icon="file-export"
        >
          إنشاء السيرة الذاتية
        </Button>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 4:
        return renderTemplateSelection();
      default:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeader}>{steps[currentStep].title}</Text>
            <Text style={styles.comingSoon}>قريباً...</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-right" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>صانع السيرة الذاتية</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderUsageIndicator()}
        {renderStepIndicator()}
        {renderCurrentStep()}
        {renderProgressSection()}
        {renderNavigationButtons()}

        {/* Tips */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>نصائح لسيرة ذاتية مميزة:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>استخدم صورة شخصية احترافية وواضحة</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>اكتب نبذة مختصرة وجذابة عن نفسك</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>رتب خبراتك من الأحدث إلى الأقدم</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.tipText}>اذكر إنجازاتك بأرقام ونتائج محددة</Text>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    marginTop: 10,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: theme.colors.secondary,
  },
  stepTitle: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  stepTitleActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: theme.colors.outline,
    zIndex: -1,
  },
  stepLineCompleted: {
    backgroundColor: theme.colors.secondary,
  },
  stepContent: {
    margin: 20,
    marginTop: 10,
  },
  stepHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceVariant,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
  },
  profileImageText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Medium',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  templatesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  templateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 140,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedTemplateCard: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary,
  },
  proTemplateCard: {
    opacity: 0.7,
  },
  templatePreview: {
    width: 80,
    height: 100,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
  },
  comingSoon: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
    marginTop: 40,
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

export default CVMakerScreen;

