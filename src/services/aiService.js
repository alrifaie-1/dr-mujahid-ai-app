import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// AI Service Configuration
const AI_CONFIG = {
  baseURL: 'https://api.drmojahedai.com', // Replace with actual API
  apiKey: 'your-api-key-here', // Replace with actual API key
  timeout: 30000, // 30 seconds timeout
};

class AIService {
  constructor() {
    this.isProcessing = false;
  }

  // Text to Video Generation
  async generateTextToVideo(text, options = {}) {
    if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      const requestData = {
        text: text.trim(),
        language: options.language || 'ar',
        voice: options.voice || 'male',
        style: options.style || 'professional',
        duration: options.duration || 'auto',
        quality: options.quality || 'hd',
        watermark: options.watermark !== false, // Default true for free users
      };

      // Simulate API call - replace with actual API integration
      const response = await this.simulateAPICall('/generate/text-to-video', requestData);
      
      if (response.success) {
        // Download the generated video
        const videoUri = await this.downloadMedia(response.videoUrl, 'video');
        return {
          success: true,
          videoUri,
          duration: response.duration,
          size: response.size,
        };
      } else {
        throw new Error(response.error || 'فشل في إنشاء الفيديو');
      }
    } catch (error) {
      console.error('Text to Video Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Image to Video Generation
  async generateImageToVideo(imageUri, options = {}) {
    if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      // Upload image first
      const uploadedImageUrl = await this.uploadMedia(imageUri, 'image');

      const requestData = {
        imageUrl: uploadedImageUrl,
        animation: options.animation || 'zoom',
        duration: options.duration || 5,
        quality: options.quality || 'hd',
        watermark: options.watermark !== false,
      };

      const response = await this.simulateAPICall('/generate/image-to-video', requestData);
      
      if (response.success) {
        const videoUri = await this.downloadMedia(response.videoUrl, 'video');
        return {
          success: true,
          videoUri,
          duration: response.duration,
          size: response.size,
        };
      } else {
        throw new Error(response.error || 'فشل في تحويل الصورة إلى فيديو');
      }
    } catch (error) {
      console.error('Image to Video Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Poetry to Video Generation
  async generatePoetryToVideo(poetry, options = {}) {
    if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      const requestData = {
        poetry: poetry.trim(),
        dialect: options.dialect || 'classical', // classical, bedouin
        voice: options.voice || 'male',
        background: options.background || 'desert',
        rhythm: options.rhythm || 'traditional',
        watermark: options.watermark !== false,
      };

      const response = await this.simulateAPICall('/generate/poetry-to-video', requestData);
      
      if (response.success) {
        const videoUri = await this.downloadMedia(response.videoUrl, 'video');
        return {
          success: true,
          videoUri,
          duration: response.duration,
          size: response.size,
        };
      } else {
        throw new Error(response.error || 'فشل في تحويل الشعر إلى فيديو');
      }
    } catch (error) {
      console.error('Poetry to Video Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Script to Video Generation
  async generateScriptToVideo(script, options = {}) {
    if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      const requestData = {
        script: script.trim(),
        genre: options.genre || 'drama',
        characters: options.characters || 'auto',
        scenes: options.scenes || 'auto',
        quality: options.quality || 'hd',
        watermark: options.watermark !== false,
      };

      const response = await this.simulateAPICall('/generate/script-to-video', requestData);
      
      if (response.success) {
        const videoUri = await this.downloadMedia(response.videoUrl, 'video');
        return {
          success: true,
          videoUri,
          duration: response.duration,
          size: response.size,
        };
      } else {
        throw new Error(response.error || 'فشل في تحويل السيناريو إلى فيديو');
      }
    } catch (error) {
      console.error('Script to Video Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }  // Generate CV/Resume
  async generateCV(options) {
    try {
      this.validateCVData(options.data);

      const formData = new FormData();
      
      // Add CV data
      formData.append('template', options.template);
      formData.append('language', options.language || 'ar');
      formData.append('format', options.format || 'pdf');
      formData.append('watermark', options.watermark ? 'true' : 'false');
      formData.append('cvData', JSON.stringify(options.data));
      
      // Add profile image if provided
      if (options.profileImage) {
        formData.append('profileImage', {
          uri: options.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      const response = await fetch(`${this.baseUrl}/cv/generate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء السيرة الذاتية');
      }

      const result = await response.json();
      
      return {
        success: true,
        pdfUrl: result.pdf_url,
        docxUrl: result.docx_url,
        previewUrl: result.preview_url,
        downloadId: result.download_id,
        expiresAt: result.expires_at,
      };
    } catch (error) {
      console.error('CV Generation Error:', error);
      throw new Error(error.message || 'فشل في إنشاء السيرة الذاتية');
    }
  },

  // Validate CV data
  validateCVData(data) {
    if (!data.personalInfo?.fullName) {
      throw new Error('الاسم الكامل مطلوب');
    }
    
    if (!data.personalInfo?.email) {
      throw new Error('البريد الإلكتروني مطلوب');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.personalInfo.email)) {
      throw new Error('البريد الإلكتروني غير صحيح');
    }
    
    return true;
  },   if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      const uploadedImageUrl = await this.uploadMedia(imageUri, 'image');

      const requestData = {
        imageUrl: uploadedImageUrl,
        enhancement: options.enhancement || 'auto',
        quality: options.quality || 'high',
        removeNoise: options.removeNoise !== false,
        sharpen: options.sharpen !== false,
        colorCorrection: options.colorCorrection !== false,
        watermark: options.watermark !== false,
      };

      const response = await this.simulateAPICall('/enhance/image', requestData);
      
      if (response.success) {
        const enhancedImageUri = await this.downloadMedia(response.imageUrl, 'image');
        return {
          success: true,
          imageUri: enhancedImageUri,
          improvements: response.improvements,
        };
      } else {
        throw new Error(response.error || 'فشل في تحسين الصورة');
      }
    } catch (error) {
      console.error('Image Enhancement Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Studio Photo Processing
  async processStudioPhoto(imageUri, backgroundType, options = {}) {
    if (this.isProcessing) {
      throw new Error('عملية أخرى قيد التنفيذ، يرجى الانتظار');
    }

    this.isProcessing = true;

    try {
      const uploadedImageUrl = await this.uploadMedia(imageUri, 'image');

      const requestData = {
        imageUrl: uploadedImageUrl,
        backgroundType,
        customBackground: options.customBackground,
        lighting: options.lighting || 'professional',
        quality: options.quality || 'print', // print, web, social
        removeBackground: true,
        enhanceLighting: true,
        watermark: options.watermark !== false,
      };

      const response = await this.simulateAPICall('/studio/process-photo', requestData);
      
      if (response.success) {
        const processedImageUri = await this.downloadMedia(response.imageUrl, 'image');
        return {
          success: true,
          imageUri: processedImageUri,
          quality: response.quality,
          resolution: response.resolution,
        };
      } else {
        throw new Error(response.error || 'فشل في معالجة صورة الاستديو');
      }
    } catch (error) {
      console.error('Studio Photo Processing Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Upload media to server
  async uploadMedia(mediaUri, type) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: mediaUri,
        type: type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: `${type}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
      });

      // Simulate upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `${AI_CONFIG.baseURL}/uploads/${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error('فشل في رفع الملف');
    }
  }

  // Download media from server
  async downloadMedia(mediaUrl, type) {
    try {
      const fileName = `${type}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
      const localUri = `${FileSystem.documentDirectory}${fileName}`;

      // Simulate download - replace with actual download logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would download the file here
      // For simulation, we'll just return a placeholder URI
      return localUri;
    } catch (error) {
      console.error('Download Error:', error);
      throw new Error('فشل في تحميل الملف');
    }
  }

  // Simulate API call - replace with actual API integration
  async simulateAPICall(endpoint, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful response
        resolve({
          success: true,
          videoUrl: `${AI_CONFIG.baseURL}/generated/video_${Date.now()}.mp4`,
          imageUrl: `${AI_CONFIG.baseURL}/generated/image_${Date.now()}.jpg`,
          duration: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
          size: Math.floor(Math.random() * 50) + 10, // 10-60 MB
          quality: 'HD',
          resolution: '1920x1080',
          improvements: ['تحسين الإضاءة', 'تقليل الضوضاء', 'تحسين الألوان'],
        });
      }, 3000); // Simulate 3 second processing time
    });
  }

  // Get processing status
  getProcessingStatus() {
    return this.isProcessing;
  }

  // Cancel current operation
  cancelOperation() {
    this.isProcessing = false;
  }

  // Validate input text
  validateText(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('يرجى إدخال النص');
    }
    
    if (text.trim().length < 10) {
      throw new Error('النص قصير جداً، يرجى إدخال نص أطول');
    }
    
    if (text.trim().length > 5000) {
      throw new Error('النص طويل جداً، الحد الأقصى 5000 حرف');
    }
    
    return true;
  }

  // Validate image
  async validateImage(imageUri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      
      if (!fileInfo.exists) {
        throw new Error('الصورة غير موجودة');
      }
      
      if (fileInfo.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('حجم الصورة كبير جداً، الحد الأقصى 10 ميجابايت');
      }
      
      return true;
    } catch (error) {
      throw new Error('فشل في التحقق من الصورة');
    }
  }
}

export default new AIService();

