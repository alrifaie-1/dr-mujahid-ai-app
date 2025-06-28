import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Avatar, Badge } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { isSubscribed, getSubscriptionStatus, getRemainingUsage } = useSubscriptionStore();
  const subscriptionStatus = getSubscriptionS  const features = [
    {
      id: 'text-to-video',
      title: 'نص إلى فيديو',
      description: 'تحويل النصوص لفيديوهات احترافية',
      icon: 'video-plus',
      gradient: ['#667eea', '#764ba2'],
      screen: 'TextToVideo',
      isPro: false,
    },
    {
      id: 'image-to-video',
      title: 'صورة إلى فيديو',
      description: 'تحريك الصور بتأثيرات مذهلة',
      icon: 'image-multiple',
      gradient: ['#f093fb', '#f5576c'],
      screen: 'ImageToVideo',
      isPro: false,
    },
    {
      id: 'poetry-to-video',
      title: 'شعر إلى فيديو',
      description: 'إلقاء شعري احترافي',
      icon: 'microphone-variant',
      gradient: ['#4facfe', '#00f2fe'],
      screen: 'PoetryToVideo',
      isPro: true,
    },
    {
      id: 'script-to-video',
      title: 'سيناريو إلى فيديو',
      description: 'إنتاج أفلام قصيرة',
      icon: 'movie-open',
      gradient: ['#43e97b', '#38f9d7'],
      screen: 'ScriptToVideo',
      isPro: true,
    },
    {
      id: 'image-enhancement',
      title: 'تحسين الصور',
      description: 'تحسين الصور بالذكاء الاصطناعي',
      icon: 'image-edit',
      gradient: ['#fa709a', '#fee140'],
      screen: 'ImageEnhancement',
      isPro: false,
    },
    {
      id: 'studio',
      title: 'الاستديو الاحترافي',
      description: 'تصوير احترافي مع خلفيات مميزة',
      icon: 'camera-enhance',
      gradient: ['#a8edea', '#fed6e3'],
      screen: 'Studio',
      isPro: false,
    },
    {
      id: 'cv-maker',
      title: 'صانع السيرة الذاتية',
      description: 'إنشاء CV احترافي مع الصورة الشخصية',
      icon: 'file-document-edit',
      gradient: ['#d299c2', '#fef9d7'],
      screen: 'CVMaker',
      isPro: false,
    },
    {
      id: 'certificate-maker',
      title: 'صانع الشهادات',
      description: 'تصميم شهادات الشكر والتقدير',
      icon: 'certificate',
      gradient: ['#ff9a9e', '#fecfef'],
      screen: 'Certificate',
      isPro: false,
      isNew: true,
    },
    {
      id: 'bulk-certificate-maker',
      title: 'الشهادات المتعددة',
      description: 'إنشاء شهادات متعددة للطلاب والموظفين',
      icon: 'certificate-outline',
      gradient: ['#a8e6cf', '#dcedc1'],
      screen: 'BulkCertificate',
      isPro: false,
      isNew: true,
    },
  ];

  const handleFeaturePress = (feature) => {
    if (feature.isPro && !isSubscribed) {
      navigation.navigate('Subscription');
      return;
    }

    if (!isSubscribed && getRemainingUsage(feature.id) <= 0) {
      navigation.navigate('Subscription');
      return;
    }

    navigation.navigate(feature.screen);
  };

  const renderFeatureCard = (feature, index) => {
    const remaining = getRemainingUsage(feature.id);
    const canUse = feature.isPro ? isSubscribed : (isSubscribed || remaining > 0);

    return (
      <Animatable.View
        key={feature.id}
        animation="fadeInUp"
        delay={index * 100}
        style={styles.cardContainer}
      >
        <TouchableOpacity
          onPress={() => handleFeaturePress(feature)}
          activeOpacity={0.8}
        >
          <Card style={[styles.featureCard, !canUse && styles.disabledCard]}>
            <LinearGradient
              colors={feature.gradient}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Icon name={feature.icon} size={32} color="white" />
                {feature.isPro && (
                  <Badge style={styles.proBadge}>Pro</Badge>
                )}
                {feature.isNew && (
                  <Badge style={styles.newBadge}>جديد</Badge>
                )}
              </View>
              
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
              
              {!isSubscribed && !feature.isPro && (
                <View style={styles.usageContainer}>
                  <Text style={styles.usageText}>
                    المتبقي: {remaining} استخدام
                  </Text>
                </View>
              )}
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
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>مرحباً بك في</Text>
              <Text style={styles.appTitle}>د. مجاهد للذكاء الاصطناعي</Text>
            </View>
            <Avatar.Image
              size={50}
              source={require('../../assets/dr-mujahid-avatar.png')}
              style={styles.avatar}
            />
          </View>
          
          {/* Subscription Status */}
          <View style={styles.subscriptionStatus}>
            <LinearGradient
              colors={isSubscribed ? ['#10b981', '#059669'] : ['#6b7280', '#4b5563']}
              style={styles.statusGradient}
            >
              <Icon 
                name={isSubscribed ? 'crown' : 'account'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.statusText}>
                {subscriptionStatus === 'free' && 'مستخدم مجاني'}
                {subscriptionStatus === 'trial' && 'تجربة مجانية'}
                {subscriptionStatus === 'monthly' && 'اشتراك شهري'}
                {subscriptionStatus === 'yearly' && 'اشتراك سنوي'}
              </Text>
            </LinearGradient>
          </View>
        </Animatable.View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>الميزات المتاحة</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => renderFeatureCard(feature, index))}
          </View>
        </View>

        {/* Upgrade Banner */}
        {!isSubscribed && (
          <Animatable.View animation="pulse" iterationCount="infinite" style={styles.upgradeContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.upgradeBanner}
              >
                <Icon name="crown" size={24} color="white" />
                <View style={styles.upgradeContent}>
                  <Text style={styles.upgradeTitle}>ترقية إلى Pro</Text>
                  <Text style={styles.upgradeDescription}>
                    احصل على جميع الميزات بدون حدود
                  </Text>
                </View>
                <Icon name="chevron-left" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        )}
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
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
  },
  avatar: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  subscriptionStatus: {
    alignSelf: 'flex-start',
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Cairo-Medium',
    marginLeft: 6,
  },
  featuresContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    fontFamily: 'Cairo-Bold',
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardGradient: {
    padding: 16,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  proBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: 10,
  },
  newBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    lineHeight: 16,
  },
  usageContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  usageText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Medium',
  },
  upgradeContainer: {
    margin: 20,
    marginTop: 0,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  upgradeContent: {
    flex: 1,
    marginLeft: 12,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  upgradeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
  },
});

export default HomeScreen;

