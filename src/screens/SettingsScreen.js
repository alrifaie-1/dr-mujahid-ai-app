import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, Switch, List, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [highQuality, setHighQuality] = React.useState(false);

  const handleAbout = () => {
    Alert.alert(
      'حول التطبيق',
      'تطبيق د. مجاهد للذكاء الاصطناعي\nالإصدار 2.1.0\n\nتطبيق شامل لإنتاج المحتوى الرقمي وتصميم الشهادات باستخدام الذكاء الاصطناعي.',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'الدعم الفني',
      'للحصول على المساعدة:\nالبريد الإلكتروني: support@dr-mujahid-ai.com\nالموقع: www.dr-mujahid-ai.com',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'سياسة الخصوصية',
      'نحن نحترم خصوصيتك ونحمي بياناتك الشخصية وفقاً لأعلى معايير الأمان.',
      [{ text: 'موافق', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>إعدادات التطبيق</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="bell" size={24} color={theme.colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>الإشعارات</Text>
                  <Text style={styles.settingDescription}>تلقي إشعارات التطبيق</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="content-save-auto" size={24} color={theme.colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>الحفظ التلقائي</Text>
                  <Text style={styles.settingDescription}>حفظ المشاريع تلقائياً</Text>
                </View>
              </View>
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                color={theme.colors.primary}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="high-definition" size={24} color={theme.colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>جودة عالية</Text>
                  <Text style={styles.settingDescription}>إنتاج بجودة عالية (يستهلك بيانات أكثر)</Text>
                </View>
              </View>
              <Switch
                value={highQuality}
                onValueChange={setHighQuality}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>الحساب</Text>
            
            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => navigation.navigate('Subscription')}
            >
              <Icon name="crown" size={24} color={theme.colors.primary} />
              <Text style={styles.listItemText}>إدارة الاشتراك</Text>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity 
              style={styles.listItem}
              onPress={() => navigation.navigate('Referral')}
            >
              <Icon name="account-group" size={24} color={theme.colors.primary} />
              <Text style={styles.listItemText}>دعوة الأصدقاء</Text>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Support & Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>الدعم والمعلومات</Text>
            
            <TouchableOpacity style={styles.listItem} onPress={handleSupport}>
              <Icon name="help-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.listItemText}>الدعم الفني</Text>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={handlePrivacy}>
              <Icon name="shield-account" size={24} color={theme.colors.primary} />
              <Text style={styles.listItemText}>سياسة الخصوصية</Text>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={handleAbout}>
              <Icon name="information" size={24} color={theme.colors.primary} />
              <Text style={styles.listItemText}>حول التطبيق</Text>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Regular',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    marginVertical: 8,
  },
});

export default SettingsScreen;

