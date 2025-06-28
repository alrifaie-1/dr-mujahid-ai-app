import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, Modal, Portal } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useReferralStore } from '../store/referralStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const ReferralScreen = ({ navigation }) => {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    referralCode,
    referralsCount,
    totalBonusDays,
    hasUsedReferral,
    shareReferralCode,
    useReferralCode,
    getReferralStats,
    getReferralRewards,
    initializeReferral,
  } = useReferralStore();

  const subscriptionStore = useSubscriptionStore();

  useEffect(() => {
    initializeReferral();
  }, []);

  const handleShareReferral = async () => {
    try {
      await shareReferralCode();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في مشاركة كود الدعوة');
    }
  };

  const handleCopyReferralCode = async () => {
    try {
      await Clipboard.setString(referralCode);
      Alert.alert('تم النسخ', 'تم نسخ كود الدعوة إلى الحافظة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في نسخ كود الدعوة');
    }
  };

  const handleUseReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال كود الدعوة');
      return;
    }

    setIsProcessing(true);
    
    try {
      await useReferralCode(referralCodeInput.trim().toUpperCase(), subscriptionStore);
      
      Alert.alert(
        'تم بنجاح! 🎉',
        'تم إضافة 7 أيام إضافية لتجربتك المجانية!',
        [{ text: 'ممتاز!', onPress: () => setShowReferralModal(false) }]
      );
      
      setReferralCodeInput('');
    } catch (error) {
      Alert.alert('خطأ', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const rewards = getReferralRewards();

  const renderReferralStats = () => (
    <Animatable.View animation="fadeInDown" style={styles.statsContainer}>
      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.statsCard}
      >
        <View style={styles.statsHeader}>
          <Icon name="account-group" size={24} color="white" />
          <Text style={styles.statsTitle}>إحصائيات الدعوات</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{referralsCount}</Text>
            <Text style={styles.statLabel}>أصدقاء مدعوون</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalBonusDays}</Text>
            <Text style={styles.statLabel}>أيام مكافآت</Text>
          </View>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderReferralCode = () => (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.referralCodeContainer}>
      <Text style={styles.sectionTitle}>كود الدعوة الخاص بك</Text>
      
      <Card style={styles.referralCodeCard}>
        <View style={styles.referralCodeContent}>
          <View style={styles.codeDisplay}>
            <Text style={styles.referralCodeText}>{referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyReferralCode}
            >
              <Icon name="content-copy" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.referralCodeDescription}>
            شارك هذا الكود مع أصدقائك للحصول على 7 أيام إضافية لكل دعوة ناجحة
          </Text>
          
          <Button
            mode="contained"
            onPress={handleShareReferral}
            style={styles.shareButton}
            icon="share"
          >
            مشاركة الكود
          </Button>
        </View>
      </Card>
    </Animatable.View>
  );

  const renderHowItWorks = () => (
    <Animatable.View animation="fadeInUp" delay={400} style={styles.howItWorksContainer}>
      <Text style={styles.sectionTitle}>كيف يعمل نظام الدعوات؟</Text>
      
      <View style={styles.stepsList}>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>شارك كود الدعوة</Text>
            <Text style={styles.stepDescription}>
              أرسل كود الدعوة الخاص بك لأصدقائك
            </Text>
          </View>
        </View>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>صديقك يستخدم الكود</Text>
            <Text style={styles.stepDescription}>
              عندما يدخل صديقك الكود، يحصل على 7 أيام إضافية
            </Text>
          </View>
        </View>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>احصل على مكافأتك</Text>
            <Text style={styles.stepDescription}>
              تحصل أنت أيضاً على 7 أيام إضافية كمكافأة
            </Text>
          </View>
        </View>
      </View>
    </Animatable.View>
  );

  const renderRewards = () => {
    if (rewards.length === 0) return null;

    return (
      <Animatable.View animation="fadeInUp" delay={600} style={styles.rewardsContainer}>
        <Text style={styles.sectionTitle}>مكافآتك</Text>
        
        {rewards.map((reward, index) => (
          <Card key={index} style={styles.rewardCard}>
            <View style={styles.rewardContent}>
              <Icon 
                name={reward.type === 'milestone' ? 'trophy' : 'gift'} 
                size={24} 
                color={theme.colors.secondary} 
              />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.description}</Text>
                <Text style={styles.rewardDays}>+{reward.bonusDays} أيام</Text>
              </View>
            </View>
          </Card>
        ))}
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
          <Text style={styles.headerTitle}>دعوة الأصدقاء</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderReferralStats()}
        {renderReferralCode()}
        {renderHowItWorks()}
        {renderRewards()}

        {/* Use Referral Code Button */}
        {!hasUsedReferral && (
          <Animatable.View animation="fadeInUp" delay={800} style={styles.useCodeContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowReferralModal(true)}
              style={styles.useCodeButton}
              icon="ticket"
            >
              لديك كود دعوة؟ استخدمه الآن
            </Button>
          </Animatable.View>
        )}

        {hasUsedReferral && (
          <View style={styles.usedReferralContainer}>
            <Icon name="check-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.usedReferralText}>
              لقد استخدمت كود دعوة من قبل
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Use Referral Code Modal */}
      <Portal>
        <Modal
          visible={showReferralModal}
          onDismiss={() => setShowReferralModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>استخدم كود الدعوة</Text>
          <Text style={styles.modalDescription}>
            أدخل كود الدعوة الذي حصلت عليه من صديقك للحصول على 7 أيام إضافية
          </Text>
          
          <TextInput
            style={styles.codeInput}
            placeholder="أدخل كود الدعوة (مثال: DR123456)"
            value={referralCodeInput}
            onChangeText={setReferralCodeInput}
            autoCapitalize="characters"
            maxLength={8}
          />
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowReferralModal(false)}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
            <Button
              mode="contained"
              onPress={handleUseReferralCode}
              loading={isProcessing}
              disabled={isProcessing || !referralCodeInput.trim()}
            >
              استخدام الكود
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
  statsContainer: {
    margin: 20,
    marginBottom: 10,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  referralCodeContainer: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
    marginBottom: 15,
  },
  referralCodeCard: {
    borderRadius: 12,
  },
  referralCodeContent: {
    padding: 20,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  referralCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'Cairo-Bold',
    letterSpacing: 2,
  },
  copyButton: {
    marginLeft: 12,
    padding: 8,
  },
  referralCodeDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  shareButton: {
    borderRadius: 8,
  },
  howItWorksContainer: {
    margin: 20,
    marginTop: 10,
  },
  stepsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
  },
  rewardsContainer: {
    margin: 20,
    marginTop: 10,
  },
  rewardCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
  },
  rewardDays: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontFamily: 'Cairo-Medium',
  },
  useCodeContainer: {
    margin: 20,
    marginTop: 10,
  },
  useCodeButton: {
    borderRadius: 8,
  },
  usedReferralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 12,
  },
  usedReferralText: {
    fontSize: 14,
    color: theme.colors.onPrimaryContainer,
    fontFamily: 'Cairo-Medium',
    marginLeft: 8,
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
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReferralScreen;

