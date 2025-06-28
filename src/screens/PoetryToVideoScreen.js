import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, TextInput, Button, ProgressBar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const PoetryToVideoScreen = ({ navigation }) => {
  const [poetryText, setPoetryText] = useState('');
  const [poetName, setPoetName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('classical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSubscribed, decrementUsage } = useSubscriptionStore();

  const poetryStyles = [
    { id: 'classical', name: 'كلاسيكي', description: 'أسلوب تقليدي رصين' },
    { id: 'modern', name: 'حديث', description: 'أسلوب عصري متطور' },
    { id: 'romantic', name: 'رومانسي', description: 'أسلوب عاطفي مؤثر' },
    { id: 'epic', name: 'ملحمي', description: 'أسلوب قوي وجليل' },
  ];

  const samplePoems = [
    {
      title: 'من الشعر العربي الكلاسيكي',
      text: 'أَلا يا صَبا نَجدٍ مَتى هِجتَ مِن نَجدِ\nلَقَد زادَني مَسراكَ وَجداً عَلى وَجدِ',
      poet: 'ابن الدمينة'
    },
    {
      title: 'من الشعر الحديث',
      text: 'في قلبي حديقة من الأمل\nتنمو فيها الأحلام كالزهر\nوتغرد فيها العصافير بالأمل',
      poet: 'شاعر معاصر'
    }
  ];

  const handleGenerateVideo = async () => {
    if (!poetryText.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال النص الشعري');
      return;
    }

    if (!isSubscribed) {
      const canUse = await decrementUsage('poetryToVideo');
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
          Alert.alert('تم', 'تم إنشاء فيديو الشعر بنجاح!');
          return 1;
        }
        return prev + 0.08;
      });
    }, 600);
  };

  const handleUseSample = (sample) => {
    setPoetryText(sample.text);
    setPoetName(sample.poet);
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
                تحويل الشعر إلى فيديو متاح للمشتركين فقط. احصل على إلقاء شعري احترافي بالذكاء الاصطناعي.
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Poetry Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>النص الشعري</Text>
            
            <TextInput
              value={poetryText}
              onChangeText={setPoetryText}
              style={styles.poetryInput}
              mode="outlined"
              multiline
              numberOfLines={8}
              placeholder="أدخل النص الشعري هنا..."
              textAlignVertical="top"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اسم الشاعر (اختياري)</Text>
              <TextInput
                value={poetName}
                onChangeText={setPoetName}
                style={styles.textInput}
                mode="outlined"
                placeholder="اسم الشاعر"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Sample Poems */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>نماذج شعرية</Text>
            <Text style={styles.sectionDescription}>
              يمكنك استخدام هذه النماذج للتجربة
            </Text>
            
            {samplePoems.map((sample, index) => (
              <View key={index} style={styles.sampleCard}>
                <Text style={styles.sampleTitle}>{sample.title}</Text>
                <Text style={styles.sampleText}>{sample.text}</Text>
                <View style={styles.sampleFooter}>
                  <Text style={styles.samplePoet}>- {sample.poet}</Text>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleUseSample(sample)}
                    style={styles.useButton}
                  >
                    استخدام
                  </Button>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Style Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>أسلوب الإلقاء</Text>
            
            <View style={styles.stylesContainer}>
              {poetryStyles.map((style) => (
                <Chip
                  key={style.id}
                  selected={selectedStyle === style.id}
                  onPress={() => setSelectedStyle(style.id)}
                  style={[
                    styles.styleChip,
                    selectedStyle === style.id && styles.selectedStyleChip
                  ]}
                  textStyle={[
                    styles.styleChipText,
                    selectedStyle === style.id && styles.selectedStyleChipText
                  ]}
                >
                  {style.name}
                </Chip>
              ))}
            </View>

            <Text style={styles.styleDescription}>
              {poetryStyles.find(s => s.id === selectedStyle)?.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Generate Button */}
        <View style={styles.generateSection}>
          {isGenerating && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>جاري إنشاء فيديو الشعر...</Text>
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
            disabled={isGenerating || !poetryText.trim()}
            style={styles.generateButton}
            contentStyle={styles.generateButtonContent}
            labelStyle={styles.generateButtonLabel}
          >
            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء فيديو الشعر'}
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
  poetryInput: {
    backgroundColor: theme.colors.surface,
    minHeight: 120,
    marginBottom: 16,
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
    lineHeight: 22,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  sampleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  samplePoet: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
  },
  useButton: {
    borderColor: theme.colors.primary,
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
    textAlign: 'center',
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

export default PoetryToVideoScreen;

