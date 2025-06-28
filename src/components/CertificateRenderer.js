import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CertificateRenderer = forwardRef(({ 
  certificateData, 
  templateId, 
  images = {},
  style = {} 
}, ref) => {
  const templates = {
    appreciation: {
      gradient: ['#667eea', '#764ba2'],
      titleSize: 28,
      nameSize: 32,
      descriptionSize: 18,
    },
    achievement: {
      gradient: ['#f093fb', '#f5576c'],
      titleSize: 26,
      nameSize: 30,
      descriptionSize: 16,
    },
    excellence: {
      gradient: ['#4facfe', '#00f2fe'],
      titleSize: 30,
      nameSize: 34,
      descriptionSize: 20,
    },
    participation: {
      gradient: ['#43e97b', '#38f9d7'],
      titleSize: 24,
      nameSize: 28,
      descriptionSize: 16,
    },
  };

  const template = templates[templateId] || templates.appreciation;

  const styles = StyleSheet.create({
    container: {
      width: width - 40,
      backgroundColor: 'white',
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      ...style,
    },
    gradient: {
      padding: 30,
      minHeight: 500,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
      marginBottom: 15,
    },
    title: {
      fontSize: template.titleSize,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Cairo-Bold',
    },
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    recipientPhoto: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 25,
      borderWidth: 4,
      borderColor: 'white',
    },
    recipientLabel: {
      fontSize: 18,
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'Cairo-Regular',
      marginBottom: 15,
    },
    recipientName: {
      fontSize: template.nameSize,
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Cairo-Bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      fontSize: template.descriptionSize,
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'Cairo-Regular',
      textAlign: 'center',
      lineHeight: template.descriptionSize * 1.4,
      marginBottom: 40,
      paddingHorizontal: 20,
    },
    organizationInfo: {
      alignItems: 'center',
      marginBottom: 30,
    },
    organizationName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Cairo-Bold',
      marginBottom: 8,
    },
    date: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: 'Cairo-Regular',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 20,
    },
    signatureSection: {
      alignItems: 'center',
      flex: 1,
    },
    signature: {
      width: 120,
      height: 50,
      resizeMode: 'contain',
      marginBottom: 8,
    },
    signatureName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Cairo-Bold',
      textAlign: 'center',
    },
    signatureTitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: 'Cairo-Regular',
      textAlign: 'center',
    },
    stamp: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
    },
    decorativeElement: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    decorativeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

  return (
    <View ref={ref} style={styles.container}>
      <LinearGradient colors={template.gradient} style={styles.gradient}>
        {/* Decorative Element */}
        <View style={styles.decorativeElement}>
          <Text style={styles.decorativeText}>★</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          {images.logo && (
            <Image source={{ uri: images.logo }} style={styles.logo} />
          )}
          <Text style={styles.title}>{certificateData.title}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {images.recipientPhoto && (
            <Image 
              source={{ uri: images.recipientPhoto }} 
              style={styles.recipientPhoto} 
            />
          )}
          
          <Text style={styles.recipientLabel}>يُمنح هذا التقدير إلى</Text>
          <Text style={styles.recipientName}>
            {certificateData.recipientName || 'اسم المستلم'}
          </Text>
          <Text style={styles.description}>
            {certificateData.description}
          </Text>
          
          <View style={styles.organizationInfo}>
            <Text style={styles.organizationName}>
              {certificateData.organizationName}
            </Text>
            <Text style={styles.date}>
              {certificateData.date}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            {images.signature && (
              <Image source={{ uri: images.signature }} style={styles.signature} />
            )}
            <Text style={styles.signatureName}>
              {certificateData.signatureName}
            </Text>
            <Text style={styles.signatureTitle}>
              {certificateData.signatureTitle}
            </Text>
          </View>
          
          {images.stamp && (
            <Image source={{ uri: images.stamp }} style={styles.stamp} />
          )}
        </View>
      </LinearGradient>
    </View>
  );
});

CertificateRenderer.displayName = 'CertificateRenderer';

export default CertificateRenderer;

