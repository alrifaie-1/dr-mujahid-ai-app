import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';
import CertificateRenderer from '../components/CertificateRenderer';
import ImageProcessingService from '../services/imageProcessingService';

const { width, height } = Dimensions.get('window');

const CertificateScreen = ({ navigation }) => {
  const { isSubscribed, decrementUsage } = useSubscriptionStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('appreciation');
  const [certificateData, setCertificateData] = useState({
    recipientName: '',
    title: 'شهادة تقدير',
    description: 'تقديراً لجهودكم المتميزة والمثمرة',
    organizationName: 'المؤسسة',
    date: new Date().toLocaleDateString('ar-SA'),
    signatureName: 'المدير العام',
    signatureTitle: 'المدير العام',
  });
  const [selectedImages, setSelectedImages] = useState({
    recipientPhoto: null,
    signature: null,
    stamp: null,
    logo: null,
  });
  const certificateRef = useRef();

  const templates = [
    {
      id: 'appreciation',
      name: 'شهادة تقدير',
      description: 'شهادة تقدير كلاسيكية',
      gradient: ['#667eea', '#764ba2'],
      icon: 'certificate',
    },
    {
      id: 'achievement',
      name: 'شهادة إنجاز',
      description: 'شهادة إنجاز للطلاب',
      gradient: ['#f093fb', '#f5576c'],
      icon: 'school',
    },
    {
      id: 'excellence',
      name: 'شهادة تميز',
      description: 'شهادة تميز للموظفين',
      gradient: ['#4facfe', '#00f2fe'],
      icon: 'star',
    },
    {
      id: 'participation',
      name: 'شهادة مشاركة',
      description: 'شهادة مشاركة في فعالية',
      gradient: ['#43e97b', '#38f9d7'],
      icon: 'account-group',
    },
  ];

  const handleImagePicker = async (imageType) => {
    try {
      let image;
      
      switch (imageType) {
        case 'signature':
          image = await ImageProcessingService.pickSignatureImage();
          break;
        case 'stamp':
          image = await ImageProcessingService.pickStampImage();
          break;
        case 'logo':
          image = await ImageProcessingService.pickLogoImage();
          break;
        case 'recipientPhoto':
          image = await ImageProcessingService.pickRecipientPhoto();
          break;
        default:
          image = await ImageProcessingService.pickImage();
      }

      if (image) {
        // Process the image for certificate use
        const processedUri = await ImageProcessingService.processImageForCertificate(
          image.uri,
          imageType
        );

        setSelectedImages(prev => ({
          ...prev,
          [imageType]: processedUri,
        }));
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'حدث خطأ في اختيار الصورة');
    }
  };

  const handleGenerateCertificate = async () => {
    if (!certificateData.recipientName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستلم');
      return;
    }

    if (!isSubscribed) {
      const canUse = await decrementUsage('certificate-maker');
      if (!canUse) {
        Alert.alert(
          'انتهت الاستخدامات المجانية',
          'قم بالترقية للحصول على استخدامات غير محدودة',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'ترقية', onPress: () => navigation.navigate('Subscription') },
          ]
        );
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      // Capture the certificate as image
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1.0,
      });

      // Save to device
      const filename = `certificate_${Date.now()}.png`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });

      // Share the certificate
      await Sharing.shareAsync(newPath, {
        mimeType: 'image/png',
        dialogTitle: 'مشاركة الشهادة',
      });

      Alert.alert('تم بنجاح', 'تم إنشاء الشهادة بنجاح!');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في إنشاء الشهادة');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTemplateCard = (template) => (
    <TouchableOpacity
      key={template.id}
      onPress={() => setSelectedTemplate(template.id)}
      style={[
        styles.templateCard,
        selectedTemplate === template.id && styles.selectedTemplate,
      ]}
    >
      <LinearGradient
        colors={template.gradient}
        style={styles.templateGradient}
      >
        <Icon name={template.icon} size={24} color="white" />
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateDescription}>{template.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderImagePicker = (imageType, label, icon) => (
    <TouchableOpacity
      style={styles.imagePickerContainer}
      onPress={() => handleImagePicker(imageType)}
    >
      <View style={styles.imagePickerContent}>
        {selectedImages[imageType] ? (
          <Image source={{ uri: selectedImages[imageType] }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name={icon} size={32} color={theme.colors.primary} />
            <Text style={styles.imagePickerText}>{label}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCertificatePreview = () => {
    return (
      <CertificateRenderer
        ref={certificateRef}
        certificateData={certificateData}
        templateId={selectedTemplate}
        images={selectedImages}
        style={styles.certificateContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-right" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>صانع الشهادات</Text>
          <View style={styles.headerSpacer} />
        </Animatable.View>

        {/* Templates */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>اختر نوع الشهادة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
            {templates.map(renderTemplateCard)}
          </ScrollView>
        </Animatable.View>

        {/* Form */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الشهادة</Text>
          <Card style={styles.formCard}>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اسم المستلم *</Text>
                <TextInput
                  style={styles.textInput}
                  value={certificateData.recipientName}
                  onChangeText={(text) => setCertificateData(prev => ({ ...prev, recipientName: text }))}
                  placeholder="أدخل اسم المستلم"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الشهادة</Text>
                <TextInput
                  style={styles.textInput}
                  value={certificateData.title}
                  onChangeText={(text) => setCertificateData(prev => ({ ...prev, title: text }))}
                  placeholder="عنوان الشهادة"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>وصف الشهادة</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={certificateData.description}
                  onChangeText={(text) => setCertificateData(prev => ({ ...prev, description: text }))}
                  placeholder="وصف سبب منح الشهادة"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>اسم المؤسسة</Text>
                  <TextInput
                    style={styles.textInput}
                    value={certificateData.organizationName}
                    onChangeText={(text) => setCertificateData(prev => ({ ...prev, organizationName: text }))}
                    placeholder="اسم المؤسسة"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>التاريخ</Text>
                  <TextInput
                    style={styles.textInput}
                    value={certificateData.date}
                    onChangeText={(text) => setCertificateData(prev => ({ ...prev, date: text }))}
                    placeholder="التاريخ"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>اسم الموقع</Text>
                  <TextInput
                    style={styles.textInput}
                    value={certificateData.signatureName}
                    onChangeText={(text) => setCertificateData(prev => ({ ...prev, signatureName: text }))}
                    placeholder="اسم الموقع"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>المنصب</Text>
                  <TextInput
                    style={styles.textInput}
                    value={certificateData.signatureTitle}
                    onChangeText={(text) => setCertificateData(prev => ({ ...prev, signatureTitle: text }))}
                    placeholder="المنصب"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Animatable.View>

        {/* Images */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>الصور والتوقيعات (اختيارية)</Text>
          <Card style={styles.imagesCard}>
            <View style={styles.imagesGrid}>
              {renderImagePicker('recipientPhoto', 'صورة المستلم', 'account-circle')}
              {renderImagePicker('logo', 'شعار المؤسسة', 'domain')}
              {renderImagePicker('signature', 'التوقيع', 'draw')}
              {renderImagePicker('stamp', 'الختم الرسمي', 'seal')}
            </View>
          </Card>
        </Animatable.View>

        {/* Preview */}
        <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
          <Text style={styles.sectionTitle}>معاينة الشهادة</Text>
          {renderCertificatePreview()}
        </Animatable.View>

        {/* Generate Button */}
        <Animatable.View animation="fadeInUp" delay={1000} style={styles.generateSection}>
          <Button
            mode="contained"
            onPress={handleGenerateCertificate}
            loading={isGenerating}
            disabled={isGenerating}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            labelStyle={styles.generateButtonLabel}
          >
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء الشهادة'}
          </Button>
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
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
    marginBottom: 15,
  },
  templatesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  templateCard: {
    width: 120,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedTemplate: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  templateGradient: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginTop: 4,
  },
  templateDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  formCard: {
    borderRadius: 12,
    elevation: 2,
  },
  formContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imagesCard: {
    borderRadius: 12,
    elevation: 2,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  imagePickerContainer: {
    width: (width - 80) / 2,
    height: 100,
    marginBottom: 16,
  },
  imagePickerContent: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  imagePickerText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  certificateContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  generateSection: {
    padding: 20,
    paddingTop: 0,
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

export default CertificateScreen;

