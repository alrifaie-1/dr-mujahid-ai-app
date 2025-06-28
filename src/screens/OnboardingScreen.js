import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onboardingData = [
    {
      id: '1',
      title: 'مرحباً بك في د. مجاهد',
      subtitle: 'للذكاء الاصطناعي',
      description: 'تطبيق متطور لإنشاء الفيديوهات والمحتوى الرقمي باستخدام أحدث تقنيات الذكاء الاصطناعي',
      icon: 'robot',
      gradient: ['#6366f1', '#4f46e5'],
    },
    {
      id: '2',
      title: 'إنشاء الفيديوهات',
      subtitle: 'بسهولة وإبداع',
      description: 'حول النصوص والصور والشعر والسيناريوهات إلى فيديوهات احترافية بجودة عالية',
      icon: 'video',
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      id: '3',
      title: 'الاستديو الاحترافي',
      subtitle: 'تصوير بجودة عالية',
      description: 'التقط صوراً احترافية مع خلفيات متنوعة وإضاءة محسنة جاهزة للطباعة',
      icon: 'camera-enhance',
      gradient: ['#10b981', '#059669'],
    },
    {
      id: '4',
      title: 'ابدأ رحلتك الآن',
      subtitle: 'مع التجربة المجانية',
      description: 'استمتع بجميع الميزات المتقدمة مجاناً لمدة 7 أيام، ثم اختر الخطة المناسبة لك',
      icon: 'crown',
      gradient: ['#ef4444', '#dc2626'],
    },
  ];

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderOnboardingItem = ({ item, index }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={styles.slideGradient}
      >
        <View style={styles.slideContent}>
          {/* Icon */}
          <Animatable.View
            animation="zoomIn"
            duration={1000}
            style={styles.iconContainer}
          >
            <View style={styles.iconCircle}>
              <Icon name={item.icon} size={60} color="white" />
            </View>
          </Animatable.View>

          {/* Title */}
          <Animatable.View
            animation="fadeInUp"
            delay={300}
            duration={800}
            style={styles.titleContainer}
          >
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </Animatable.View>

          {/* Description */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={800}
            style={styles.descriptionContainer}
          >
            <Text style={styles.slideDescription}>{item.description}</Text>
          </Animatable.View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                currentIndex === index && styles.activePaginationDot
              ]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onComplete}
          >
            <Text style={styles.skipText}>تخطي</Text>
          </TouchableOpacity>

          {/* Navigation Buttons */}
          <View style={styles.navButtons}>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={prevSlide}
              >
                <Icon name="chevron-right" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                currentIndex === onboardingData.length - 1 && styles.finishButton
              ]}
              onPress={nextSlide}
            >
              {currentIndex === onboardingData.length - 1 ? (
                <Text style={styles.finishText}>ابدأ</Text>
              ) : (
                <Icon name="chevron-left" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slide: {
    width,
    height: height * 0.8,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
  },
  descriptionContainer: {
    alignItems: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    height: height * 0.2,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.outline,
    marginHorizontal: 5,
  },
  activePaginationDot: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Medium',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
  finishButton: {
    width: 80,
    backgroundColor: theme.colors.primary,
  },
  finishText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
});

export default OnboardingScreen;

