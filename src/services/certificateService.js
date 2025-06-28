import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export class CertificateService {
  static templates = {
    appreciation: {
      name: 'شهادة تقدير',
      gradient: ['#667eea', '#764ba2'],
      titleSize: 28,
      nameSize: 32,
      descriptionSize: 18,
    },
    achievement: {
      name: 'شهادة إنجاز',
      gradient: ['#f093fb', '#f5576c'],
      titleSize: 26,
      nameSize: 30,
      descriptionSize: 16,
    },
    excellence: {
      name: 'شهادة تميز',
      gradient: ['#4facfe', '#00f2fe'],
      titleSize: 30,
      nameSize: 34,
      descriptionSize: 20,
    },
    participation: {
      name: 'شهادة مشاركة',
      gradient: ['#43e97b', '#38f9d7'],
      titleSize: 24,
      nameSize: 28,
      descriptionSize: 16,
    },
  };

  static async generateCertificate(certificateRef, certificateData, templateId) {
    try {
      // Capture the certificate as image
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      return uri;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  static async generateMultipleCertificates(recipients, baseData, templateId, images, onProgress) {
    const certificates = [];
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      // Update progress
      if (onProgress) {
        onProgress(i + 1, recipients.length);
      }

      try {
        // Create certificate data for this recipient
        const certificateData = {
          ...baseData,
          recipientName: recipient.name,
          description: this.generateDescription(baseData.description, recipient),
        };

        // Generate certificate (this would be implemented with actual rendering)
        const certificateUri = await this.generateCertificateForRecipient(
          certificateData,
          templateId,
          images,
          recipient
        );

        certificates.push({
          recipient,
          uri: certificateUri,
          filename: `certificate_${recipient.name.replace(/\s+/g, '_')}_${Date.now()}.png`,
        });

        // Add small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error generating certificate for ${recipient.name}:`, error);
        // Continue with other certificates even if one fails
      }
    }

    return certificates;
  }

  static generateDescription(baseDescription, recipient) {
    if (recipient.grade) {
      // Student certificate
      return `${baseDescription} في ${recipient.grade} بتقدير ${recipient.achievement}`;
    } else {
      // Employee certificate
      return `${baseDescription} في منصب ${recipient.achievement} بقسم ${recipient.department}`;
    }
  }

  static async generateCertificateForRecipient(certificateData, templateId, images, recipient) {
    // This is a placeholder implementation
    // In a real app, you would render the certificate programmatically
    // For now, we'll create a simple text file as a placeholder
    
    const template = this.templates[templateId];
    const content = `
شهادة: ${certificateData.title}
المستلم: ${certificateData.recipientName}
الوصف: ${certificateData.description}
المؤسسة: ${certificateData.organizationName}
التاريخ: ${certificateData.date}
الموقع: ${certificateData.signatureName} - ${certificateData.signatureTitle}
القالب: ${template.name}
    `.trim();

    const filename = `certificate_${recipient.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    const filePath = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(filePath, content);
    
    return filePath;
  }

  static async createZipFile(certificates) {
    // This would create a zip file containing all certificates
    // For now, we'll return the first certificate as a placeholder
    if (certificates.length > 0) {
      return certificates[0].uri;
    }
    return null;
  }

  static getTemplateById(templateId) {
    return this.templates[templateId] || this.templates.appreciation;
  }

  static validateCertificateData(data) {
    const required = ['recipientName', 'title', 'organizationName'];
    const missing = required.filter(field => !data[field] || !data[field].trim());
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }

  static formatDate(date) {
    if (typeof date === 'string') {
      return date;
    }
    
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  static sanitizeFilename(filename) {
    return filename
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase();
  }
}

export default CertificateService;

