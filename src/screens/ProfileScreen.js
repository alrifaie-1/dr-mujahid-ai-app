import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: 'المستخدم',
    email: 'user@example.com',
    phone: '',
    organization: '',
    avatar: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى الصور');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfile(prev => ({
          ...prev,
          avatar: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في اختيار الصورة');
    }
  };

  const handleSave = () => {
    if (!profile.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return;
    }

    if (!profile.email.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني');
      return;
    }

    // Here you would save the profile data
    setIsEditing(false);
    Alert.alert('تم', 'تم حفظ البيانات بنجاح');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={isEditing ? handleImagePicker : null}
              disabled={!isEditing}
            >
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="account" size={60} color={theme.colors.onSurfaceVariant} />
                </View>
              )}
              {isEditing && (
                <View style={styles.editAvatarOverlay}>
                  <Icon name="camera" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
            
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Icon name="pencil" size={20} color="white" />
                <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.actionButtonText}>حفظ</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.actionButtonText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Profile Form */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الاسم الكامل</Text>
              <TextInput
                value={profile.name}
                onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                style={styles.textInput}
                mode="outlined"
                disabled={!isEditing}
                right={<TextInput.Icon icon="account" />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <TextInput
                value={profile.email}
                onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                style={styles.textInput}
                mode="outlined"
                keyboardType="email-address"
                disabled={!isEditing}
                right={<TextInput.Icon icon="email" />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <TextInput
                value={profile.phone}
                onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                style={styles.textInput}
                mode="outlined"
                keyboardType="phone-pad"
                disabled={!isEditing}
                right={<TextInput.Icon icon="phone" />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المؤسسة/الشركة</Text>
              <TextInput
                value={profile.organization}
                onChangeText={(text) => setProfile(prev => ({ ...prev, organization: text }))}
                style={styles.textInput}
                mode="outlined"
                disabled={!isEditing}
                right={<TextInput.Icon icon="office-building" />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Statistics Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>إحصائيات الاستخدام</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="video" size={32} color={theme.colors.primary} />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>فيديو</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="certificate" size={32} color={theme.colors.secondary} />
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>شهادة</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="image" size={32} color={theme.colors.tertiary} />
                <Text style={styles.statNumber}>25</Text>
                <Text style={styles.statLabel}>صورة</Text>
              </View>
            </View>
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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.outline,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontFamily: 'Cairo-SemiBold',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.outline,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Cairo-SemiBold',
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontFamily: 'Cairo-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
});

export default ProfileScreen;

