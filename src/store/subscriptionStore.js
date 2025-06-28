import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_STORAGE_KEY = 'subscription_data';
const USAGE_STORAGE_KEY = 'usage_data';

export const useSubscriptionStore = create((set, get) => ({
  // Subscription state
  isSubscribed: false,
  subscriptionType: null, // 'monthly' | 'yearly' | null
  subscriptionExpiry: null,
  trialUsed: false,
  
  // Usage tracking
  monthlyUsage: {
    textToVideo: 0,
    imageToVideo: 0,
    poetryToVideo: 0,
    scriptToVideo: 0,
    imageEnhancement: 0,
    studioPhotos: 0,
    certificateMaker: 0,
    bulkCertificateMaker: 0,
  },
  
  // Limits for free users
  freeLimits: {
    textToVideo: 5,
    imageToVideo: 3,
    poetryToVideo: 3,
    scriptToVideo: 2,
    imageEnhancement: 10,
    studioPhotos: 3,
    certificateMaker: 5,
    bulkCertificateMaker: 2,
  },

  // Actions
  extendSubscription: async (days) => {
    const state = get();
    const currentExpiry = state.subscriptionExpiry || new Date();
    const newExpiry = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const updatedData = {
      ...state,
      subscriptionExpiry: newExpiry,
      // If user is not subscribed, start trial with extended days
      subscriptionType: state.subscriptionType || 'trial',
      isSubscribed: true,
    };
    
    await get().saveSubscriptionData(updatedData);
  },

  initializeSubscription: async () => {
    try {
      const subscriptionData = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      const usageData = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
      
      if (subscriptionData) {
        const parsed = JSON.parse(subscriptionData);
        set({
          isSubscribed: parsed.isSubscribed,
          subscriptionType: parsed.subscriptionType,
          subscriptionExpiry: parsed.subscriptionExpiry ? new Date(parsed.subscriptionExpiry) : null,
          trialUsed: parsed.trialUsed,
        });
        
        // Check if subscription has expired
        if (parsed.subscriptionExpiry && new Date() > new Date(parsed.subscriptionExpiry)) {
          get().expireSubscription();
        }
      }
      
      if (usageData) {
        const parsed = JSON.parse(usageData);
        set({ monthlyUsage: parsed });
      }
      
      // Reset usage if it's a new month
      get().checkAndResetMonthlyUsage();
    } catch (error) {
      console.error('Error initializing subscription:', error);
    }
  },

  subscribe: async (type) => {
    const expiry = new Date();
    if (type === 'monthly') {
      expiry.setMonth(expiry.getMonth() + 1);
    } else if (type === 'yearly') {
      expiry.setFullYear(expiry.getFullYear() + 1);
    }

    const subscriptionData = {
      isSubscribed: true,
      subscriptionType: type,
      subscriptionExpiry: expiry.toISOString(),
      trialUsed: get().trialUsed,
    };

    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
    
    set({
      isSubscribed: true,
      subscriptionType: type,
      subscriptionExpiry: expiry,
    });
  },

  expireSubscription: async () => {
    const subscriptionData = {
      isSubscribed: false,
      subscriptionType: null,
      subscriptionExpiry: null,
      trialUsed: get().trialUsed,
    };

    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
    
    set({
      isSubscribed: false,
      subscriptionType: null,
      subscriptionExpiry: null,
    });
  },

  startTrial: async () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days trial

    const subscriptionData = {
      isSubscribed: true,
      subscriptionType: 'trial',
      subscriptionExpiry: expiry.toISOString(),
      trialUsed: true,
    };

    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscriptionData));
    
    set({
      isSubscribed: true,
      subscriptionType: 'trial',
      subscriptionExpiry: expiry,
      trialUsed: true,
    });
  },

  canUseFeature: (featureName) => {
    const state = get();
    if (state.isSubscribed) return true;
    
    const usage = state.monthlyUsage[featureName] || 0;
    const limit = state.freeLimits[featureName] || 0;
    
    return usage < limit;
  },

  incrementUsage: async (featureName) => {
    const state = get();
    const newUsage = {
      ...state.monthlyUsage,
      [featureName]: (state.monthlyUsage[featureName] || 0) + 1,
    };

    await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newUsage));
    set({ monthlyUsage: newUsage });
  },

  decrementUsage: async (featureName) => {
    const state = get();
    if (state.isSubscribed) return true;
    
    const usage = state.monthlyUsage[featureName] || 0;
    const limit = state.freeLimits[featureName] || 0;
    
    if (usage >= limit) return false;
    
    const newUsage = {
      ...state.monthlyUsage,
      [featureName]: usage + 1,
    };

    await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newUsage));
    set({ monthlyUsage: newUsage });
    return true;
  },

  getRemainingUsage: (featureName) => {
    const state = get();
    if (state.isSubscribed) return Infinity;
    
    const usage = state.monthlyUsage[featureName] || 0;
    const limit = state.freeLimits[featureName] || 0;
    
    return Math.max(0, limit - usage);
  },

  checkAndResetMonthlyUsage: async () => {
    const lastResetKey = 'last_usage_reset';
    const lastReset = await AsyncStorage.getItem(lastResetKey);
    const now = new Date();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();
    
    if (!lastReset) {
      await AsyncStorage.setItem(lastResetKey, currentMonth.toString());
      return;
    }
    
    const lastResetMonth = parseInt(lastReset);
    if (currentMonth > lastResetMonth) {
      // Reset usage for new month
      const resetUsage = {
        textToVideo: 0,
        imageToVideo: 0,
        poetryToVideo: 0,
        scriptToVideo: 0,
        imageEnhancement: 0,
        studioPhotos: 0,
        certificateMaker: 0,
        bulkCertificateMaker: 0,
      };
      
      await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(resetUsage));
      await AsyncStorage.setItem(lastResetKey, currentMonth.toString());
      
      set({ monthlyUsage: resetUsage });
    }
  },

  getSubscriptionStatus: () => {
    const state = get();
    if (!state.isSubscribed) return 'free';
    if (state.subscriptionType === 'trial') return 'trial';
    if (state.subscriptionType === 'monthly') return 'monthly';
    if (state.subscriptionType === 'yearly') return 'yearly';
    return 'free';
  },

  getDaysUntilExpiry: () => {
    const state = get();
    if (!state.subscriptionExpiry) return 0;
    
    const now = new Date();
    const expiry = new Date(state.subscriptionExpiry);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },
}));

