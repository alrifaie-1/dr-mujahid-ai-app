import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Animation */}
        <Animatable.View
          animation="zoomIn"
          duration={1500}
          style={styles.logoContainer}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>د.م</Text>
          </View>
        </Animatable.View>

        {/* App Title */}
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={1000}
          style={styles.titleContainer}
        >
          <Text style={styles.appTitle}>د. مجاهد</Text>
          <Text style={styles.appSubtitle}>للذكاء الاصطناعي</Text>
        </Animatable.View>

        {/* Tagline */}
        <Animatable.View
          animation="fadeInUp"
          delay={1200}
          duration={1000}
          style={styles.taglineContainer}
        >
          <Text style={styles.tagline}>
            إنشاء الفيديوهات والمحتوى الرقمي
          </Text>
          <Text style={styles.taglineSubtext}>
            بتقنية الذكاء الاصطناعي المتطورة
          </Text>
        </Animatable.View>

        {/* Loading Animation */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          delay={1500}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </Animatable.View>
      </View>

      {/* Footer */}
      <Animatable.View
        animation="fadeIn"
        delay={2000}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          © 2024 د. مجاهد للذكاء الاصطناعي
        </Text>
        <Text style={styles.versionText}>الإصدار 2.0</Text>
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 5,
  },
  taglineSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
});

export default SplashScreen;

