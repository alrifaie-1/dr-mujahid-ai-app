import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export class ImageProcessingService {
  static async requestPermissions() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('نحتاج إلى إذن للوصول إلى الصور');
    }
    return true;
  }

  static async pickImage(options = {}) {
    await this.requestPermissions();

    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };

    const result = await ImagePicker.launchImageLibraryAsync({
      ...defaultOptions,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }

    return null;
  }

  static async pickSignatureImage() {
    return this.pickImage({
      aspect: [4, 1],
      allowsEditing: true,
    });
  }

  static async pickStampImage() {
    return this.pickImage({
      aspect: [1, 1],
      allowsEditing: true,
    });
  }

  static async pickLogoImage() {
    return this.pickImage({
      aspect: [1, 1],
      allowsEditing: true,
    });
  }

  static async pickRecipientPhoto() {
    return this.pickImage({
      aspect: [1, 1],
      allowsEditing: true,
    });
  }

  static async resizeImage(uri, width, height, quality = 0.8) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width, height } }],
        { compress: quality, format: ImageManipulator.SaveFormat.PNG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error resizing image:', error);
      return uri; // Return original if resize fails
    }
  }

  static async cropImageToSquare(uri, size = 300) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: size, height: size } },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error cropping image:', error);
      return uri;
    }
  }

  static async optimizeForCertificate(uri, imageType) {
    try {
      let manipulations = [];
      let options = { compress: 0.8, format: ImageManipulator.SaveFormat.PNG };

      switch (imageType) {
        case 'recipientPhoto':
          manipulations = [{ resize: { width: 200, height: 200 } }];
          break;
        case 'signature':
          manipulations = [{ resize: { width: 300, height: 75 } }];
          break;
        case 'stamp':
          manipulations = [{ resize: { width: 150, height: 150 } }];
          break;
        case 'logo':
          manipulations = [{ resize: { width: 200, height: 200 } }];
          break;
        default:
          manipulations = [{ resize: { width: 300, height: 300 } }];
      }

      const result = await ImageManipulator.manipulateAsync(
        uri,
        manipulations,
        options
      );

      return result.uri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return uri;
    }
  }

  static async removeBackground(uri) {
    // This would integrate with a background removal service
    // For now, we'll return the original image
    console.log('Background removal not implemented yet');
    return uri;
  }

  static async enhanceImage(uri) {
    // This would integrate with an image enhancement service
    // For now, we'll apply basic optimization
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
      );
      return result.uri;
    } catch (error) {
      console.error('Error enhancing image:', error);
      return uri;
    }
  }

  static async validateImage(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        throw new Error('الملف غير موجود');
      }

      // Check file size (max 10MB)
      if (info.size > 10 * 1024 * 1024) {
        throw new Error('حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)');
      }

      return true;
    } catch (error) {
      console.error('Error validating image:', error);
      throw error;
    }
  }

  static async getImageDimensions(uri) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { format: ImageManipulator.SaveFormat.PNG }
      );
      
      // This is a workaround since expo-image-manipulator doesn't return dimensions
      // In a real app, you might use a different library for this
      return { width: 300, height: 300 }; // Default dimensions
    } catch (error) {
      console.error('Error getting image dimensions:', error);
      return { width: 300, height: 300 };
    }
  }

  static async saveImageToDocuments(uri, filename) {
    try {
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: newPath,
      });
      return newPath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  static generateFilename(prefix, extension = 'png') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }

  static async processImageForCertificate(uri, imageType) {
    try {
      // Validate the image first
      await this.validateImage(uri);

      // Optimize for certificate use
      const optimizedUri = await this.optimizeForCertificate(uri, imageType);

      // Save to documents directory
      const filename = this.generateFilename(imageType);
      const savedPath = await this.saveImageToDocuments(optimizedUri, filename);

      return savedPath;
    } catch (error) {
      console.error('Error processing image for certificate:', error);
      throw error;
    }
  }

  static getSupportedFormats() {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  }

  static isValidImageFormat(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    return this.getSupportedFormats().includes(extension);
  }
}

export default ImageProcessingService;

