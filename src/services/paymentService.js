import * as InAppPurchases from 'expo-in-app-purchases';
import { Alert, Linking } from 'react-native';

// Payment Service Configuration
const PAYMENT_CONFIG = {
  // In-App Purchase Product IDs
  products: {
    monthly: 'dr_mujahid_monthly_pro',
    yearly: 'dr_mujahid_yearly_pro',
  },
  
  // External Payment URLs (for web-based payments)
  paymentGateways: {
    // Credit/Debit Cards
    visa: 'https://payments.drmojahedai.com/visa',
    mastercard: 'https://payments.drmojahedai.com/mastercard',
    
    // Digital Wallets
    applePay: 'https://payments.drmojahedai.com/applepay',
    googlePay: 'https://payments.drmojahedai.com/googlepay',
    samsungPay: 'https://payments.drmojahedai.com/samsungpay',
    
    // Regional Payment Methods - Saudi Arabia
    mada: 'https://payments.drmojahedai.com/mada',
    stcPay: 'https://payments.drmojahedai.com/stcpay',
    
    // Regional Payment Methods - UAE
    uaePass: 'https://payments.drmojahedai.com/uaepass',
    
    // Regional Payment Methods - Kuwait
    knet: 'https://payments.drmojahedai.com/knet',
    
    // Mobile Billing
    mobileBilling: 'https://payments.drmojahedai.com/mobile-billing',
    
    // Bank Transfers
    bankTransfer: 'https://payments.drmojahedai.com/bank-transfer',
    
    // Cryptocurrency (for tech-savvy users)
    crypto: 'https://payments.drmojahedai.com/crypto',
  }
};

class PaymentService {
  constructor() {
    this.isInitialized = false;
    this.availableProducts = [];
  }

  // Initialize payment service
  async initialize() {
    try {
      // Initialize In-App Purchases
      await InAppPurchases.connectAsync();
      
      // Get available products
      const { results } = await InAppPurchases.getProductsAsync([
        PAYMENT_CONFIG.products.monthly,
        PAYMENT_CONFIG.products.yearly,
      ]);
      
      this.availableProducts = results;
      this.isInitialized = true;
      
      console.log('Payment service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize payment service:', error);
      return false;
    }
  }

  // Get available payment methods based on user's region
  getAvailablePaymentMethods(userRegion = 'SA') {
    const commonMethods = [
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: 'apple',
        type: 'digital_wallet',
        available: true,
        description: 'دفع سريع وآمن',
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        icon: 'google',
        type: 'digital_wallet',
        available: true,
        description: 'دفع بلمسة واحدة',
      },
      {
        id: 'visa',
        name: 'Visa',
        icon: 'credit-card',
        type: 'card',
        available: true,
        description: 'بطاقة ائتمان/خصم',
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        icon: 'credit-card',
        type: 'card',
        available: true,
        description: 'بطاقة ائتمان/خصم',
      },
      {
        id: 'mobile_billing',
        name: 'فاتورة الهاتف',
        icon: 'cellphone',
        type: 'mobile',
        available: true,
        description: 'إضافة للفاتورة الشهرية',
      },
      {
        id: 'bank_transfer',
        name: 'تحويل بنكي',
        icon: 'bank',
        type: 'bank',
        available: true,
        description: 'تحويل مباشر من البنك',
      },
    ];

    // Region-specific payment methods
    const regionMethods = {
      SA: [ // Saudi Arabia
        {
          id: 'mada',
          name: 'مدى',
          icon: 'credit-card-outline',
          type: 'card',
          available: true,
          description: 'شبكة المدفوعات السعودية',
        },
        {
          id: 'stc_pay',
          name: 'STC Pay',
          icon: 'wallet',
          type: 'digital_wallet',
          available: true,
          description: 'محفظة STC الرقمية',
        },
      ],
      AE: [ // UAE
        {
          id: 'uae_pass',
          name: 'UAE Pass',
          icon: 'account-card-details',
          type: 'digital_id',
          available: true,
          description: 'الهوية الرقمية الإماراتية',
        },
      ],
      KW: [ // Kuwait
        {
          id: 'knet',
          name: 'K-Net',
          icon: 'credit-card-outline',
          type: 'card',
          available: true,
          description: 'شبكة الدفع الكويتية',
        },
      ],
      BH: [ // Bahrain
        {
          id: 'benefit',
          name: 'Benefit',
          icon: 'credit-card-outline',
          type: 'card',
          available: true,
          description: 'شبكة الدفع البحرينية',
        },
      ],
      OM: [ // Oman
        {
          id: 'omani_net',
          name: 'OmaniNet',
          icon: 'credit-card-outline',
          type: 'card',
          available: true,
          description: 'شبكة الدفع العمانية',
        },
      ],
      QA: [ // Qatar
        {
          id: 'qpay',
          name: 'QPay',
          icon: 'wallet',
          type: 'digital_wallet',
          available: true,
          description: 'محفظة قطر الرقمية',
        },
      ],
    };

    // Advanced payment methods for tech users
    const advancedMethods = [
      {
        id: 'crypto',
        name: 'العملات الرقمية',
        icon: 'bitcoin',
        type: 'crypto',
        available: true,
        description: 'Bitcoin, Ethereum, USDT',
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'paypal',
        type: 'digital_wallet',
        available: true,
        description: 'محفظة PayPal الرقمية',
      },
    ];

    return [
      ...commonMethods,
      ...(regionMethods[userRegion] || []),
      ...advancedMethods,
    ];
  }

  // Process In-App Purchase
  async processInAppPurchase(productId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const product = this.availableProducts.find(p => p.productId === productId);
      if (!product) {
        throw new Error('المنتج غير متوفر');
      }

      // Request purchase
      const { results } = await InAppPurchases.purchaseItemAsync(productId);
      
      if (results && results.length > 0) {
        const purchase = results[0];
        
        if (purchase.acknowledged) {
          return {
            success: true,
            transactionId: purchase.transactionId,
            productId: purchase.productId,
            purchaseTime: purchase.purchaseTime,
          };
        }
      }
      
      throw new Error('فشل في إتمام عملية الشراء');
    } catch (error) {
      console.error('In-App Purchase Error:', error);
      throw error;
    }
  }

  // Process external payment (web-based)
  async processExternalPayment(paymentMethod, subscriptionType, userInfo) {
    try {
      const paymentData = {
        method: paymentMethod,
        subscription: subscriptionType,
        user: userInfo,
        amount: subscriptionType === 'monthly' ? 29.99 : 299.99,
        currency: 'SAR',
        timestamp: Date.now(),
      };

      let paymentUrl;
      
      switch (paymentMethod) {
        case 'mobile_billing':
          paymentUrl = await this.initiateMobileBilling(paymentData);
          break;
        case 'mada':
        case 'stc_pay':
        case 'uae_pass':
        case 'knet':
          paymentUrl = await this.initiateRegionalPayment(paymentMethod, paymentData);
          break;
        case 'bank_transfer':
          paymentUrl = await this.initiateBankTransfer(paymentData);
          break;
        case 'crypto':
          paymentUrl = await this.initiateCryptoPayment(paymentData);
          break;
        default:
          paymentUrl = await this.initiateStandardPayment(paymentMethod, paymentData);
      }

      // Open payment URL
      const canOpen = await Linking.canOpenURL(paymentUrl);
      if (canOpen) {
        await Linking.openURL(paymentUrl);
        return { success: true, paymentUrl };
      } else {
        throw new Error('لا يمكن فتح صفحة الدفع');
      }
    } catch (error) {
      console.error('External Payment Error:', error);
      throw error;
    }
  }

  // Mobile billing payment
  async initiateMobileBilling(paymentData) {
    const params = new URLSearchParams({
      amount: paymentData.amount,
      currency: paymentData.currency,
      subscription: paymentData.subscription,
      user_id: paymentData.user.id,
      phone: paymentData.user.phone,
      return_url: 'drmojahedai://payment-success',
      cancel_url: 'drmojahedai://payment-cancel',
    });

    return `${PAYMENT_CONFIG.paymentGateways.mobileBilling}?${params.toString()}`;
  }

  // Regional payment methods
  async initiateRegionalPayment(method, paymentData) {
    const params = new URLSearchParams({
      amount: paymentData.amount,
      currency: paymentData.currency,
      subscription: paymentData.subscription,
      user_id: paymentData.user.id,
      return_url: 'drmojahedai://payment-success',
      cancel_url: 'drmojahedai://payment-cancel',
    });

    const gatewayUrl = PAYMENT_CONFIG.paymentGateways[method.replace('_', '')];
    return `${gatewayUrl}?${params.toString()}`;
  }

  // Bank transfer payment
  async initiateBankTransfer(paymentData) {
    const params = new URLSearchParams({
      amount: paymentData.amount,
      currency: paymentData.currency,
      subscription: paymentData.subscription,
      user_id: paymentData.user.id,
      reference: `DRMUJ-${Date.now()}`,
      return_url: 'drmojahedai://payment-success',
    });

    return `${PAYMENT_CONFIG.paymentGateways.bankTransfer}?${params.toString()}`;
  }

  // Cryptocurrency payment
  async initiateCryptoPayment(paymentData) {
    const params = new URLSearchParams({
      amount_usd: (paymentData.amount * 0.27).toFixed(2), // Convert SAR to USD
      subscription: paymentData.subscription,
      user_id: paymentData.user.id,
      currencies: 'BTC,ETH,USDT',
      return_url: 'drmojahedai://payment-success',
      cancel_url: 'drmojahedai://payment-cancel',
    });

    return `${PAYMENT_CONFIG.paymentGateways.crypto}?${params.toString()}`;
  }

  // Standard payment (cards, digital wallets)
  async initiateStandardPayment(method, paymentData) {
    const params = new URLSearchParams({
      amount: paymentData.amount,
      currency: paymentData.currency,
      subscription: paymentData.subscription,
      user_id: paymentData.user.id,
      payment_method: method,
      return_url: 'drmojahedai://payment-success',
      cancel_url: 'drmojahedai://payment-cancel',
    });

    const gatewayUrl = PAYMENT_CONFIG.paymentGateways[method];
    return `${gatewayUrl}?${params.toString()}`;
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      // In a real app, this would verify with your backend
      const response = await fetch(`https://api.drmojahedai.com/payments/verify/${transactionId}`);
      const result = await response.json();
      
      return {
        success: result.status === 'completed',
        transactionId: result.transaction_id,
        amount: result.amount,
        currency: result.currency,
        timestamp: result.timestamp,
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment history
  async getPaymentHistory(userId) {
    try {
      const response = await fetch(`https://api.drmojahedai.com/payments/history/${userId}`);
      const payments = await response.json();
      
      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        date: new Date(payment.created_at),
        subscription: payment.subscription_type,
      }));
    } catch (error) {
      console.error('Payment history error:', error);
      return [];
    }
  }

  // Cancel subscription
  async cancelSubscription(userId, reason = '') {
    try {
      const response = await fetch(`https://api.drmojahedai.com/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          reason: reason,
          timestamp: Date.now(),
        }),
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return false;
    }
  }

  // Get subscription details
  async getSubscriptionDetails(userId) {
    try {
      const response = await fetch(`https://api.drmojahedai.com/subscriptions/${userId}`);
      const subscription = await response.json();
      
      return {
        isActive: subscription.status === 'active',
        type: subscription.type,
        startDate: new Date(subscription.start_date),
        endDate: new Date(subscription.end_date),
        autoRenew: subscription.auto_renew,
        paymentMethod: subscription.payment_method,
        nextBilling: new Date(subscription.next_billing),
      };
    } catch (error) {
      console.error('Subscription details error:', error);
      return null;
    }
  }

  // Restore purchases (for iOS)
  async restorePurchases() {
    try {
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      
      const validPurchases = results.filter(purchase => 
        purchase.acknowledged && 
        Object.values(PAYMENT_CONFIG.products).includes(purchase.productId)
      );
      
      return validPurchases;
    } catch (error) {
      console.error('Restore purchases error:', error);
      return [];
    }
  }

  // Disconnect payment service
  async disconnect() {
    try {
      await InAppPurchases.disconnectAsync();
      this.isInitialized = false;
    } catch (error) {
      console.error('Payment service disconnect error:', error);
    }
  }
}

export default new PaymentService();

