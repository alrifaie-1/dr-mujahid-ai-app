import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip, RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import paymentService from '../services/paymentService';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const SubscriptionScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [userRegion, setUserRegion] = useState('SA'); // Default to Saudi Arabia
  
  const { 
    isSubscribed, 
    subscriptionType, 
    trialUsed, 
    subscribe, 
    startTrial,
    getSubscriptionStatus,
    getDaysUntilExpiry,
    freeLimits,
    monthlyUsage,
  } = useSubscriptionStore();

  const subscriptionStatus = getSubscriptionStatus();
  const daysLeft = getDaysUntilExpiry();

  const plans = [
    {
      id: 'trial',
      name: 'تجربة مجانية',
      duration: '7 أيام',
      price: 'مجاناً',
      originalPrice: null,
      features: [
        'جميع الميزات المتقدمة',
        'بدون علامة مائية',
        'استخدام غير محدود',
        'دعم فني مميز',
      ],
      color: ['#10b981', '#059669'],
      disabled: trialUsed,
    },
    {
      id: 'monthly',
      name: 'اشتراك شهري',
      duration: 'شهر واحد',
      price: '29.99 ريال',
      originalPrice: null,
      features: [
        'جميع الميزات المتقدمة',
        'بدون علامة مائية',
        'استخدام غير محدود',
        'دعم فني مميز',
        'تحديثات مجانية',
      ],
      color: ['#6366f1', '#4f46e5'],
      popular: false,
    },
    {
      id: 'yearly',
      name: 'اشتراك سنوي',
      duration: 'سنة كاملة',
      price: '299.99 ريال',
      originalPrice: '359.88 ريال',
      savings: 'وفر 17%',
      features: [
        'جميع ميزات الاشتراك الشهري',
        'خصم كبير على السعر',
        'ميزات حصرية إضافية',
        'أولوية في الدعم الفني',
        'وصول مبكر للميزات الجديدة',
      ],
      color: ['#f59e0b', '#d97706'],
      popular: true,
    },
  ];

  const freeFeatures = [
    { name: 'تحويل النص إلى فيديو', limit: freeLimits.textToVideo, used: monthlyUsage.textToVideo },
    { name: 'تحسين الصور', limit: freeLimits.imageEnhancement, used: monthlyUsage.imageEnhancement },
    { name: 'الاستديو الأساسي', limit: freeLimits.studioPhotos, used: monthlyUsage.studioPhotos },
  ];

  const proFeatures = [
    'تحويل الصورة إلى فيديو',
    'تحويل الشعر إلى فيديو',
    'تحويل السيناريو إلى فيديو',
    'الاستديو الاحترافي مع خلفيات متنوعة',
    'جودة عالية 4K',
    'بدون علامة مائية',
    'استخدام غير محدود',
    'دعم فني مميز',
  ];

  const handleSubscribe = async (planId) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (planId === 'trial') {
        await startTrial();
        Alert.alert(
          'تم تفعيل التجربة المجانية!',
          'يمكنك الآن الاستمتاع بجميع الميزات المتقدمة لمدة 7 أيام.',
          [{ text: 'ممتاز!', onPress: () => navigation.goBack() }]
        );
      } else {
        // In a real app, this would integrate with payment providers
        await simulatePayment(planId);
        await subscribe(planId);
        
        Alert.alert(
          'تم الاشتراك بنجاح!',
          `تم تفعيل ${planId === 'monthly' ? 'الاشتراك الشهري' : 'الاشتراك السنوي'} بنجاح.`,
          [{ text: 'ممتاز!', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في معالجة الاشتراك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = async (planId) => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  const renderCurrentSubscription = () => {
    if (!isSubscribed) return null;

    return (
      <Animatable.View animation="fadeInDown" style={styles.currentSubscriptionContainer}>
        <LinearGradient
          colors={subscriptionType === 'trial' ? ['#10b981', '#059669'] : ['#6366f1', '#4f46e5']}
          style={styles.currentSubscriptionCard}
        >
          <View style={styles.currentSubscriptionHeader}>
            <Icon name="crown" size={24} color="white" />
            <Text style={styles.currentSubscriptionTitle}>
              {subscriptionType === 'trial' && 'التجربة المجانية نشطة'}
              {subscriptionType === 'monthly' && 'الاشتراك الشهري نشط'}
              {subscriptionType === 'yearly' && 'الاشتراك السنوي نشط'}
            </Text>
          </View>
          <Text style={styles.currentSubscriptionExpiry}>
            {daysLeft > 0 ? `متبقي ${daysLeft} يوم` : 'انتهت صلاحية الاشتراك'}
          </Text>
        </LinearGradient>
      </Animatable.View>
    );
  };

  const renderFreeUsage = () => {
    if (isSubscribed) return null;

    return (
      <Animatable.View animation="fadeInUp" style={styles.freeUsageContainer}>
        <Text style={styles.sectionTitle}>استخدامك الحالي (مجاني)</Text>
        {freeFeatures.map((feature, index) => (
          <View key={index} style={styles.usageItem}>
            <Text style={styles.usageFeatureName}>{feature.name}</Text>
            <View style={styles.usageBar}>
              <View 
                style={[
                  styles.usageProgress, 
                  { width: `${(feature.used / feature.limit) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.usageText}>
              {feature.used} / {feature.limit}
            </Text>
          </View>
        ))}
      </Animatable.View>
    );
  };

  const renderPlanCard = (plan, index) => {
    const isSelected = selectedPlan === plan.id;
    const canSelect = !plan.disabled;

    return (
      <Animatable.View
        key={plan.id}
        animation="fadeInUp"
        delay={index * 100}
        style={styles.planCardContainer}
      >
        <TouchableOpacity
          onPress={() => canSelect && setSelectedPlan(plan.id)}
          activeOpacity={0.8}
          disabled={!canSelect}
        >
          <Card style={[
            styles.planCard,
            isSelected && styles.selectedPlanCard,
            plan.disabled && styles.disabledPlanCard
          ]}>
            <LinearGradient
              colors={plan.color}
              style={styles.planCardGradient}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>الأكثر شعبية</Text>
                </View>
              )}
              
              {plan.disabled && (
                <View style={styles.disabledBadge}>
                  <Text style={styles.disabledText}>مستخدم</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDuration}>{plan.duration}</Text>
              </View>

              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                {plan.originalPrice && (
                  <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                )}
                {plan.savings && (
                  <Chip style={styles.savingsChip} textStyle={styles.savingsText}>
                    {plan.savings}
                  </Chip>
                )}
              </View>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItem}>
                    <Icon name="check" size={16} color="white" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Card>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>خطط الاشتراك</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderCurrentSubscription()}
        {renderFreeUsage()}

        {/* Pro Features */}
        <View style={styles.proFeaturesContainer}>
          <Text style={styles.sectionTitle}>ميزات Pro الحصرية</Text>
          <View style={styles.proFeaturesList}>
            {proFeatures.map((feature, index) => (
              <Animatable.View
                key={index}
                animation="fadeInRight"
                delay={index * 50}
                style={styles.proFeatureItem}
              >
                <Icon name="star" size={16} color={theme.colors.secondary} />
                <Text style={styles.proFeatureText}>{feature}</Text>
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>اختر خطتك</Text>
          {plans.map((plan, index) => renderPlanCard(plan, index))}
        </View>

        {/* Subscribe Button */}
        {!isSubscribed && (
          <View style={styles.subscribeContainer}>
            <Button
              mode="contained"
              onPress={() => handleSubscribe(selectedPlan)}
              loading={isProcessing}
              disabled={isProcessing || plans.find(p => p.id === selectedPlan)?.disabled}
              style={styles.subscribeButton}
              contentStyle={styles.subscribeButtonContent}
            >
              {selectedPlan === 'trial' ? 'بدء التجربة المجانية' : 'اشترك الآن'}
            </Button>
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            بالاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية
          </Text>
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
  currentSubscriptionContainer: {
    margin: 20,
    marginBottom: 10,
  },
  currentSubscriptionCard: {
    padding: 20,
    borderRadius: 16,
  },
  currentSubscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentSubscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    marginLeft: 8,
  },
  currentSubscriptionExpiry: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
  },
  freeUsageContainer: {
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
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageFeatureName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Regular',
  },
  usageBar: {
    width: 80,
    height: 6,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 3,
    marginHorizontal: 10,
  },
  usageProgress: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  usageText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Medium',
    minWidth: 40,
  },
  proFeaturesContainer: {
    margin: 20,
    marginTop: 10,
  },
  proFeaturesList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proFeatureText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    marginLeft: 8,
  },
  plansContainer: {
    margin: 20,
    marginTop: 10,
  },
  planCardContainer: {
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabledPlanCard: {
    opacity: 0.6,
  },
  planCardGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
  },
  disabledBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  disabledText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  planDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Cairo-Regular',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  savingsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 8,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Cairo-Bold',
  },
  planFeatures: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Cairo-Regular',
    marginLeft: 8,
    flex: 1,
  },
  subscribeContainer: {
    margin: 20,
    marginTop: 10,
  },
  subscribeButton: {
    borderRadius: 12,
  },
  subscribeButtonContent: {
    paddingVertical: 8,
  },
  termsContainer: {
    margin: 20,
    marginTop: 10,
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;

