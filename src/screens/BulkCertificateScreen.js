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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import JSZip from 'jszip';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';
import CertificateService from '../services/certificateService';
import CertificateRenderer from '../components/CertificateRenderer';
import ImageProcessingService from '../services/imageProcessingService';

const { width, height } = Dimensions.get('window');

const BulkCertificateScreen = ({ navigation }) => {
  const { isSubscribed, decrementUsage } = useSubscriptionStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('appreciation');
  const [certificateType, setCertificateType] = useState('student'); // 'student' or 'employee'
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalCertificates, setTotalCertificates] = useState(0);
  
  const [baseData, setBaseData] = useState({
    title: 'شهادة تقدير',
    description: 'تقديراً لجهودكم المتميزة والمثمرة',
    organizationName: 'المؤسسة',
    date: new Date().toLocaleDateString('ar-SA'),
    signatureName: 'المدير العام',
    signatureTitle: 'المدير العام',
  });

  const [newRecipient, setNewRecipient] = useState({
    name: '',
    grade: '', // للطلاب: الفصل الدراسي
    achievement: '', // للطلاب: التقدير العلمي، للموظفين: المنصب
    department: '', // للموظفين: القسم
  });

  const [recipients, setRecipients] = useState([]);
  const [selectedImages, setSelectedImages] = useState({
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

  const handleAddRecipient = () => {
    if (!newRecipient.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستلم');
      return;
    }

    if (certificateType === 'student' && (!newRecipient.grade.trim() || !newRecipient.achievement.trim())) {
      Alert.alert('خطأ', 'يرجى إدخال الفصل الدراسي والتقدير العلمي');
      return;
    }

    if (certificateType === 'employee' && (!newRecipient.achievement.trim() || !newRecipient.department.trim())) {
      Alert.alert('خطأ', 'يرجى إدخال المنصب والقسم');
      return;
    }

    setRecipients(prev => [...prev, { ...newRecipient, id: Date.now() }]);
    setNewRecipient({
      name: '',
      grade: '',
      achievement: '',
      department: '',
    });
    setShowAddModal(false);
  };

  const handleRemoveRecipient = (id) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const generateCertificateForRecipient = async (recipient) => {
    try {
      // Create certificate data for this recipient
      const certificateData = {
        ...baseData,
        recipientName: recipient.name,
        description: CertificateService.generateDescription(baseData.description, recipient),
      };

      // Validate certificate data
      CertificateService.validateCertificateData(certificateData);

      // Generate certificate using the service
      const certificateUri = await CertificateService.generateCertificateForRecipient(
        certificateData,
        selectedTemplate,
        selectedImages,
        recipient
      );

      return {
        filename: `certificate_${CertificateService.sanitizeFilename(recipient.name)}_${Date.now()}.png`,
        uri: certificateUri,
        data: await FileSystem.readAsStringAsync(certificateUri),
      };
    } catch (error) {
      console.error(`Error generating certificate for ${recipient.name}:`, error);
      throw error;
    }
  };

  const handleGenerateAllCertificates = async () => {
    if (recipients.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة مستلمين للشهادات');
      return;
    }

    if (!isSubscribed) {
      const canUse = await decrementUsage('bulk-certificate-maker');
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
    setTotalCertificates(recipients.length);
    setCurrentProgress(0);

    try {
      const zip = new JSZip();
      const certificatesFolder = zip.folder('certificates');

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        setCurrentProgress(i + 1);

        // Generate certificate for this recipient
        const certificateResult = await generateCertificateForRecipient(recipient);
        
        // In a real implementation, you would add the actual image data to the zip
        certificatesFolder.file(certificateResult.filename, certificateResult.data);
      }

      // Generate the zip file
      const zipData = await zip.generateAsync({ type: 'base64' });
      
      // Save zip file
      const filename = `certificates_${Date.now()}.zip`;
      const zipPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(zipPath, zipData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the zip file
      await Sharing.shareAsync(zipPath, {
        mimeType: 'application/zip',
        dialogTitle: 'مشاركة الشهادات',
      });

      Alert.alert('تم بنجاح', `تم إنشاء ${recipients.length} شهادة بنجاح!`);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في إنشاء الشهادات');
      console.error('Error generating certificates:', error);
    } finally {
      setIsGenerating(false);
      setCurrentProgress(0);
      setTotalCertificates(0);
    }
  };

  const handleImportFromText = () => {
    Alert.prompt(
      'استيراد من نص',
      certificateType === 'student' 
        ? 'أدخل البيانات بالتنسيق التالي (كل سطر منفصل):\nالاسم | الفصل الدراسي | التقدير العلمي'
        : 'أدخل البيانات بالتنسيق التالي (كل سطر منفصل):\nالاسم | المنصب | القسم',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد',
          onPress: (text) => {
            if (text) {
              const lines = text.split('\n').filter(line => line.trim());
              const newRecipients = [];

              lines.forEach((line, index) => {
                const parts = line.split('|').map(part => part.trim());
                if (parts.length >= 3) {
                  const recipient = {
                    id: Date.now() + index,
                    name: parts[0],
                    grade: certificateType === 'student' ? parts[1] : '',
                    achievement: parts[certificateType === 'student' ? 2 : 1],
                    department: certificateType === 'employee' ? parts[2] : '',
                  };
                  newRecipients.push(recipient);
                }
              });

              if (newRecipients.length > 0) {
                setRecipients(prev => [...prev, ...newRecipients]);
                Alert.alert('تم بنجاح', `تم استيراد ${newRecipients.length} مستلم`);
              } else {
                Alert.alert('خطأ', 'لم يتم العثور على بيانات صحيحة');
              }
            }
          },
        },
      ],
      'plain-text'
    );
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

  const renderRecipientItem = ({ item }) => (
    <Card style={styles.recipientCard}>
      <View style={styles.recipientContent}>
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>{item.name}</Text>
          {certificateType === 'student' ? (
            <Text style={styles.recipientDetails}>
              {item.grade} - {item.achievement}
            </Text>
          ) : (
            <Text style={styles.recipientDetails}>
              {item.achievement} - {item.department}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveRecipient(item.id)}
          style={styles.removeButton}
        >
          <Icon name="close" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderAddModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              إضافة {certificateType === 'student' ? 'طالب' : 'موظف'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Icon name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الاسم *</Text>
              <TextInput
                style={styles.textInput}
                value={newRecipient.name}
                onChangeText={(text) => setNewRecipient(prev => ({ ...prev, name: text }))}
                placeholder="أدخل الاسم"
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>

            {certificateType === 'student' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>الفصل الدراسي *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecipient.grade}
                    onChangeText={(text) => setNewRecipient(prev => ({ ...prev, grade: text }))}
                    placeholder="مثال: الصف الثالث الثانوي"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>التقدير العلمي *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecipient.achievement}
                    onChangeText={(text) => setNewRecipient(prev => ({ ...prev, achievement: text }))}
                    placeholder="مثال: ممتاز، جيد جداً، جيد"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>المنصب *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecipient.achievement}
                    onChangeText={(text) => setNewRecipient(prev => ({ ...prev, achievement: text }))}
                    placeholder="مثال: مدير، مشرف، موظف"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>القسم *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newRecipient.department}
                    onChangeText={(text) => setNewRecipient(prev => ({ ...prev, department: text }))}
                    placeholder="مثال: قسم المبيعات، قسم التسويق"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              >
                إلغاء
              </Button>
              <Button
                mode="contained"
                onPress={handleAddRecipient}
                style={styles.modalButton}
              >
                إضافة
              </Button>
            </View>
          </View>
        </Card>
      </Modal>
    </Portal>
  );

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
          <Text style={styles.headerTitle}>الشهادات المتعددة</Text>
          <View style={styles.headerSpacer} />
        </Animatable.View>

        {/* Certificate Type */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>نوع الشهادات</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              onPress={() => setCertificateType('student')}
              style={[
                styles.typeButton,
                certificateType === 'student' && styles.selectedTypeButton,
              ]}
            >
              <Icon 
                name="school" 
                size={20} 
                color={certificateType === 'student' ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.typeButtonText,
                certificateType === 'student' && styles.selectedTypeButtonText,
              ]}>
                للطلاب
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCertificateType('employee')}
              style={[
                styles.typeButton,
                certificateType === 'employee' && styles.selectedTypeButton,
              ]}
            >
              <Icon 
                name="briefcase" 
                size={20} 
                color={certificateType === 'employee' ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.typeButtonText,
                certificateType === 'employee' && styles.selectedTypeButtonText,
              ]}>
                للموظفين
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Templates */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>اختر نوع الشهادة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
            {templates.map(renderTemplateCard)}
          </ScrollView>
        </Animatable.View>

        {/* Base Data */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات الأساسية</Text>
          <Card style={styles.formCard}>
            <View style={styles.formContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الشهادة</Text>
                <TextInput
                  style={styles.textInput}
                  value={baseData.title}
                  onChangeText={(text) => setBaseData(prev => ({ ...prev, title: text }))}
                  placeholder="عنوان الشهادة"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>وصف الشهادة</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={baseData.description}
                  onChangeText={(text) => setBaseData(prev => ({ ...prev, description: text }))}
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
                    value={baseData.organizationName}
                    onChangeText={(text) => setBaseData(prev => ({ ...prev, organizationName: text }))}
                    placeholder="اسم المؤسسة"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>التاريخ</Text>
                  <TextInput
                    style={styles.textInput}
                    value={baseData.date}
                    onChangeText={(text) => setBaseData(prev => ({ ...prev, date: text }))}
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
                    value={baseData.signatureName}
                    onChangeText={(text) => setBaseData(prev => ({ ...prev, signatureName: text }))}
                    placeholder="اسم الموقع"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>المنصب</Text>
                  <TextInput
                    style={styles.textInput}
                    value={baseData.signatureTitle}
                    onChangeText={(text) => setBaseData(prev => ({ ...prev, signatureTitle: text }))}
                    placeholder="المنصب"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                  />
                </View>
              </View>
            </View>
          </Card>
        </Animatable.View>

        {/* Recipients */}
        <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
          <View style={styles.recipientsHeader}>
            <Text style={styles.sectionTitle}>
              قائمة {certificateType === 'student' ? 'الطلاب' : 'الموظفين'} ({recipients.length})
            </Text>
            <View style={styles.recipientsActions}>
              <TouchableOpacity
                onPress={handleImportFromText}
                style={styles.actionButton}
              >
                <Icon name="import" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.actionButton}
              >
                <Icon name="plus" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {recipients.length > 0 ? (
            <FlatList
              data={recipients}
              renderItem={renderRecipientItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              style={styles.recipientsList}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Icon name="account-plus" size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyText}>
                  لم يتم إضافة أي {certificateType === 'student' ? 'طلاب' : 'موظفين'} بعد
                </Text>
                <Text style={styles.emptySubtext}>
                  اضغط على + لإضافة {certificateType === 'student' ? 'طالب' : 'موظف'} جديد
                </Text>
              </View>
            </Card>
          )}
        </Animatable.View>

        {/* Generate Button */}
        {recipients.length > 0 && (
          <Animatable.View animation="fadeInUp" delay={1000} style={styles.generateSection}>
            {isGenerating && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  جاري إنشاء الشهادات... ({currentProgress}/{totalCertificates})
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentProgress / totalCertificates) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleGenerateAllCertificates}
              loading={isGenerating}
              disabled={isGenerating}
              style={styles.generateButton}
              contentStyle={styles.generateButtonContent}
              labelStyle={styles.generateButtonLabel}
            >
              {isGenerating ? 'جاري الإنشاء...' : `إنشاء ${recipients.length} شهادة`}
            </Button>
          </Animatable.View>
        )}
      </ScrollView>

      {renderAddModal()}
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: 'Cairo-SemiBold',
    marginLeft: 8,
  },
  selectedTypeButtonText: {
    color: 'white',
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
  recipientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recipientsActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  recipientsList: {
    maxHeight: 300,
  },
  recipientCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
  },
  recipientDetails: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  modalContainer: {
    margin: 20,
  },
  modalCard: {
    borderRadius: 12,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
  },
  modalContent: {
    padding: 20,
    paddingTop: 0,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    marginLeft: 12,
  },
  generateSection: {
    padding: 20,
    paddingTop: 0,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
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

export default BulkCertificateScreen;

