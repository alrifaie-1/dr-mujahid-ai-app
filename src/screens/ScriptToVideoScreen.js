import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, TextInput, Button, ProgressBar, Chip, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const ScriptToVideoScreen = ({ navigation }) => {
  const [scriptText, setScriptText] = useState('');
  const [videoSettings, setVideoSettings] = useState({
    style: 'cinematic',
    duration: 'auto',
    voiceType: 'male',
    music: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSubscribed, decrementUsage } = useSubscriptionStore();

  const videoStyles = [
    { id: 'cinematic', name: 'سينمائي', description: 'أسلوب سينمائي احترافي' },
    { id: 'documentary', name: 'وثائقي', description: 'أسلوب وثائقي تعليمي' },
    { id: 'commercial', name: 'إعلاني', description: 'أسلوب إعلاني جذاب' },
    { id: 'artistic', name: 'فني', description: 'أسلوب فني إبداعي' },
  ];

  const sampleScripts = [
    {
      title: 'سيناريو قصير - الأمل',
      text: `المشهد الأول: الداخلي - منزل - صباحاً

يجلس أحمد أمام النافذة، ينظر إلى الشارع بحزن.

أحمد (صوت داخلي): "كل يوم يمر كالذي قبله، لا جديد ولا أمل."

فجأة، يرى طفلاً صغيراً يساعد رجلاً مسناً على عبور الشارع.

أحمد (يبتسم): "ربما هناك أمل بعد كل شيء."

النهاية`,
      style: 'cinematic'
    },
    {
      title: 'سيناريو إعلاني - منتج تقني',
      text: `المشهد: الخارجي - مكتب حديث - نهاراً

صوت المعلق: "في عالم يتطور بسرعة البرق..."

تظهر لقطات سريعة لأشخاص يستخدمون التكنولوجيا.

صوت المعلق: "نحن نقدم لك الحل الأمثل."

يظهر المنتج بشكل أنيق ومؤثر.

صوت المعلق: "المستقبل بين يديك الآن."`,
      style: 'commercial'
    }
  ];

  const handleGenerateVideo = async () => {
    if (!scriptText.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال نص السيناريو');
      return;
    }

    if (!isSubscribed) {
      const canUse = await decrementUsage('scriptToVideo');
      if (!canUse) {
        Alert.alert(
          'انتهت الاستخدامات المجانية',
          'هذه ميزة مدفوعة. قم بالترقية للحصول على استخدامات غير محدودة',
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
          Alert.alert('تم', 'تم إنشاء الفيديو من السيناريو بنجاح!');
          return 1;
        }
        return prev + 0.06;
      });
    }, 800);
  };

  const handleUseSample = (sample) => {
    setScriptText(sample.text);
    setVideoSettings(prev => ({ ...prev, style: sample.style }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pro Feature Notice */}
        {!isSubscribed && (
          <Card style={[styles.card, styles.proCard]}>
            <Card.Content>
              <View style={styles.proHeader}>
                <Icon name="crown" size={24} color="#FFD700" />
                <Text style={styles.proTitle}>ميزة مدفوعة</Text>
              </View>
              <Text style={styles.proDescription}>
                تحويل السيناريو إلى فيديو متاح للمشتركين فقط. احصل على أفلام قصيرة احترافية من النصوص.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Script Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>نص السيناريو</Text>
            
            <TextInput
              value={scriptText}
              onChangeText={setScriptText}
              style={styles.scriptInput}
              mode="outlined"
              multiline
              numberOfLines={12}
              placeholder="أدخل نص السيناريو هنا...

مثال:
المشهد الأول: الداخلي - مكتب - نهاراً
يجلس محمد أمام الكمبيوتر...

محمد: 'لقد حان الوقت لتحقيق الحلم.'"
              textAlignVertical="top"
            />
          </Card.Content>
        </Card>

        {/* Sample Scripts */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>نماذج سيناريوهات</Text>
            <Text style={styles.sectionDescription}>
              يمكنك استخدام هذه النماذج للتجربة
            </Text>
            
            {sampleScripts.map((sample, index) => (
              <View key={index} style={styles.sampleCard}>
                <Text style={styles.sampleTitle}>{sample.title}</Text>
                <Text style={styles.sampleText} numberOfLines={6}>
                  {sample.text}
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleUseSample(sample)}
                  style={styles.useButton}
                >
                  استخدام هذا السيناريو
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Video Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>إعدادات الفيديو</Text>
            
            {/* Style Selection */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>أسلوب الفيديو</Text>
              <View style={styles.stylesContainer}>
                {videoStyles.map((style) => (
                  <Chip
                    key={style.id}
                    selected={videoSettings.style === style.id}
                    onPress={() => setVideoSettings(prev => ({ ...prev, style: style.id }))}
                    style={[
                      styles.styleChip,
                      videoSettings.style === style.id && styles.selectedStyleChip
                    ]}
                    textStyle={[
                      styles.styleChipText,
                      videoSettings.style === style.id && styles.selectedStyleChipText
                    ]}
                  >
                    {style.name}
                  </Chip>
                ))}
              </View>
              <Text style={styles.styleDescription}>
                {videoStyles.find(s => s.id === videoSettings.style)?.description}
              </Text>
            </View>

            {/* Voice Type */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>نوع الصوت</Text>
              <SegmentedButtons
                value={videoSettings.voiceType}
                onValueChange={(value) => setVideoSettings(prev => ({ ...prev, voiceType: value }))}
                buttons={[
                  { value: 'male', label: 'ذكر' },
                  { value: 'female', label: 'أنثى' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {/* Duration */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>مدة الفيديو</Text>
              <SegmentedButtons
                value={videoSettings.duration}
                onValueChange={(value) => setVideoSettings(prev => ({ ...prev, duration: value }))}
                buttons={[
                  { value: 'auto', label: 'تلقائي' },
                  { value: 'short', label: 'قصير' },
                  { value: 'medium', label: 'متوسط' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {/* Background Music */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>موسيقى خلفية</Text>
              <SegmentedButtons
                value={videoSettings.music ? 'yes' : 'no'}
                onValueChange={(value) => setVideoSettings(prev => ({ ...prev, music: value === 'yes' }))}
                buttons={[
                  { value: 'yes', label: 'نعم' },
                  { value: 'no', label: 'لا' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          {isGenerating && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>جاري إنشاء الفيديو من السيناريو...</Text>
              <Text style={styles.progressSubText}>
                هذا قد يستغرق عدة دقائق حسب طول السيناريو
              </Text>
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
            disabled={isGenerating || !scriptText.trim()}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            labelStyle={styles.generateButtonLabel}
          >
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء فيديو من السيناريو'}
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
  proCard: {
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
  },
  proDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginBottom: 16,
  },
  scriptInput: {
    backgroundColor: theme.colors.surface,
    minHeight: 200,
  },
  sampleCard: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 8,
  },
  sampleText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  useButton: {
    borderColor: theme.colors.primary,
    alignSelf: 'flex-start',
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 12,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  styleChip: {
    backgroundColor: theme.colors.surface,
  },
  selectedStyleChip: {
    backgroundColor: theme.colors.primary,
  },
  styleChipText: {
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
  },
  selectedStyleChipText: {
    color: 'white',
  },
  styleDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    fontStyle: 'italic',
  },
  segmentedButtons: {
    marginBottom: 8,
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
    marginBottom: 4,
  },
  progressSubText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 12,
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

export default ScriptToVideoScreen;

