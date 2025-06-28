import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

const REFERRAL_STORAGE_KEY = 'referral_data';

export const useReferralStore = create((set, get) => ({
  // Referral state
  referralCode: null,
  referralsCount: 0,
  totalBonusDays: 0,
  referredBy: null,
  hasUsedReferral: false,
  
  // Actions
  initializeReferral: async () => {
    try {
      const referralData = await AsyncStorage.getItem(REFERRAL_STORAGE_KEY);
      
      if (referralData) {
        const parsed = JSON.parse(referralData);
        set({
          referralCode: parsed.referralCode,
          referralsCount: parsed.referralsCount || 0,
          totalBonusDays: parsed.totalBonusDays || 0,
          referredBy: parsed.referredBy,
          hasUsedReferral: parsed.hasUsedReferral || false,
        });
      } else {
        // Generate new referral code for new users
        const newReferralCode = get().generateReferralCode();
        await get().saveReferralData({
          referralCode: newReferralCode,
          referralsCount: 0,
          totalBonusDays: 0,
          referredBy: null,
          hasUsedReferral: false,
        });
      }
    } catch (error) {
      console.error('Error initializing referral:', error);
    }
  },

  generateReferralCode: () => {
    // Generate a unique referral code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'DR';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  saveReferralData: async (data) => {
    try {
      await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
      set(data);
    } catch (error) {
      console.error('Error saving referral data:', error);
    }
  },

  shareReferralCode: async () => {
    const state = get();
    const referralLink = `https://drmojahedai.com/ref/${state.referralCode}`;
    const message = `🎉 انضم إلي في تطبيق د. مجاهد للذكاء الاصطناعي!

✨ احصل على 7 أيام تجربة مجانية إضافية عند استخدام كود الدعوة: ${state.referralCode}

📱 حمل التطبيق الآن: ${referralLink}

🎬 إنشاء فيديوهات احترافية
📸 استديو تصوير متطور  
🤖 تقنية ذكاء اصطناعي متقدمة

#ذكاء_اصطناعي #فيديوهات #تطبيق`;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(referralLink, {
          mimeType: 'text/plain',
          dialogTitle: 'شارك كود الدعوة',
        });
      } else {
        // Fallback to system share
        await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
      throw error;
    }
  },

  useReferralCode: async (code, subscriptionStore) => {
    const state = get();
    
    if (state.hasUsedReferral) {
      throw new Error('لقد استخدمت كود دعوة من قبل');
    }

    if (code === state.referralCode) {
      throw new Error('لا يمكنك استخدام كود الدعوة الخاص بك');
    }

    try {
      // In a real app, this would validate the code with the server
      const isValidCode = await get().validateReferralCode(code);
      
      if (!isValidCode) {
        throw new Error('كود الدعوة غير صحيح');
      }

      // Add 7 days to trial or current subscription
      await subscriptionStore.extendSubscription(7);
      
      // Mark as used
      await get().saveReferralData({
        ...state,
        referredBy: code,
        hasUsedReferral: true,
      });

      // In a real app, notify the referrer about successful referral
      await get().notifyReferrer(code);

      return true;
    } catch (error) {
      console.error('Error using referral code:', error);
      throw error;
    }
  },

  validateReferralCode: async (code) => {
    // Simulate server validation
    // In a real app, this would check against your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple validation - code should start with 'DR' and be 8 characters
        const isValid = code.startsWith('DR') && code.length === 8;
        resolve(isValid);
      }, 1000);
    });
  },

  notifyReferrer: async (referrerCode) => {
    // In a real app, this would notify the referrer through your backend
    // For now, we'll just simulate it
    console.log(`Notifying referrer ${referrerCode} about successful referral`);
  },

  addSuccessfulReferral: async () => {
    const state = get();
    const newData = {
      ...state,
      referralsCount: state.referralsCount + 1,
      totalBonusDays: state.totalBonusDays + 7,
    };
    
    await get().saveReferralData(newData);
    return newData;
  },

  getReferralStats: () => {
    const state = get();
    return {
      referralCode: state.referralCode,
      referralsCount: state.referralsCount,
      totalBonusDays: state.totalBonusDays,
      hasUsedReferral: state.hasUsedReferral,
      referredBy: state.referredBy,
    };
  },

  getReferralRewards: () => {
    const state = get();
    const rewards = [];
    
    // Base reward for each referral
    for (let i = 0; i < state.referralsCount; i++) {
      rewards.push({
        type: 'referral',
        description: `دعوة صديق #${i + 1}`,
        bonusDays: 7,
        date: new Date(), // In real app, store actual dates
      });
    }

    // Milestone rewards
    if (state.referralsCount >= 5) {
      rewards.push({
        type: 'milestone',
        description: 'إنجاز: 5 دعوات',
        bonusDays: 14,
        date: new Date(),
      });
    }

    if (state.referralsCount >= 10) {
      rewards.push({
        type: 'milestone',
        description: 'إنجاز: 10 دعوات',
        bonusDays: 30,
        date: new Date(),
      });
    }

    return rewards;
  },
}));

