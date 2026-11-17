import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  LogOut,
  ArrowLeft,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';

interface ProfileScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout }) => {
  const { t, lang, currentUser, updateProfile, changePassword, logout } = useApp();

  // Profile Edit State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        lang === 'ht' ? 'Non an pa ka vid.' : 'Le nom ne peut pas être vide.'
      );
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      Alert.alert(
        lang === 'ht' ? 'Siksè' : 'Succès',
        t.profileUpdatedSuccess
      );
    } catch {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        lang === 'ht' ? 'Echèk nan anrejistreman pwofil la.' : 'Impossible de mettre à jour le profil.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        lang === 'ht' ? 'Tanpri ranpli tout chan modpas yo.' : 'Veuillez remplir tous les champs de mot de passe.'
      );
      return;
    }

    if (newPassword.length < 4) {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        lang === 'ht' ? 'Nouvo modpas la dwe gen omwen 4 karaktè.' : 'Le nouveau mot de passe doit comporter au moins 4 caractères.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        t.passwordMismatch
      );
      return;
    }

    try {
      setSavingPassword(true);
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        Alert.alert(
          lang === 'ht' ? 'Siksè' : 'Succès',
          t.passwordChangedSuccess
        );
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert(
          lang === 'ht' ? 'Erè' : 'Erreur',
          res.message || 'Echèk nan modifikasyon modpas la.'
        );
      }
    } catch {
      Alert.alert(
        lang === 'ht' ? 'Erè' : 'Erreur',
        'Erè pandan chanjman modpas la.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      if (onLogout) onLogout();
      if (onBack) onBack();
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const avatarLetters = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Back navigation if available */}
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Retounen"
            hitSlop={TouchTargets.hitSlop}
          >
            <ArrowLeft size={16} color={Colors.merchant.forest} />
            <Text style={styles.backButtonText}>{lang === 'ht' ? 'Retounen' : 'Retour'}</Text>
          </TouchableOpacity>
        )}

        {/* 1. Header Profile Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetters}</Text>
            </View>

            <View style={styles.heroInfo}>
              <View style={styles.roleBadge}>
                <ShieldCheck size={12} color={Colors.merchant.forest} />
                <Text style={styles.roleBadgeText}>
                  {currentUser?.role === 'ADMIN' ? (lang === 'ht' ? 'ADMINISTRATÈ' : 'ADMINISTRATEUR') : currentUser?.role}
                </Text>
              </View>

              <Text style={styles.userName} numberOfLines={1}>
                {currentUser?.fullName || 'Administrateur'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {currentUser?.email || 'admin@gmail.com'}
              </Text>
            </View>
          </View>

          {/* Session details */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{t.lastLogin}</Text>
              <Text style={styles.metaValue}>
                {currentUser?.lastLoginAt
                  ? formatDateTime(currentUser.lastLoginAt, lang)
                  : lang === 'ht'
                  ? 'Kounye a'
                  : 'Maintenant'}
              </Text>
            </View>

            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{lang === 'ht' ? 'Wòl Sistèm' : 'Statut'}</Text>
              <Text style={styles.metaValueHighlight}>
                {lang === 'ht' ? 'Aksè Konplè (Mèt Kès)' : 'Superviseur Général'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserIcon size={16} color={Colors.merchant.forest} />
            <Text style={styles.cardTitle}>
              {lang === 'ht' ? 'ENFÒMASYON PWOZONÈL' : 'INFORMATIONS PERSONNELLES'}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.fullName} *</Text>
            <View style={styles.inputContainer}>
              <UserIcon size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Administrateur KèsBiz"
                placeholderTextColor={Colors.merchant.warmGray}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.phone}</Text>
            <View style={styles.inputContainer}>
              <Phone size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+509 3700-0000"
                placeholderTextColor={Colors.merchant.warmGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.emailLabel}</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Mail size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={[styles.textInput, { color: Colors.merchant.warmGray }]}
                value={currentUser?.email || 'admin@gmail.com'}
                editable={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveProfile}
            disabled={savingProfile}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t.save}
            hitSlop={TouchTargets.hitSlopSm}
          >
            <CheckCircle2 size={16} color={Colors.merchant.ivory} />
            <Text style={styles.saveBtnText}>{t.save}</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Change Password Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <KeyRound size={16} color={Colors.merchant.forest} />
            <Text style={styles.cardTitle}>{t.changePasswordTitle}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.currentPassword} *</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••"
                placeholderTextColor={Colors.merchant.warmGray}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.newPassword} *</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••"
                placeholderTextColor={Colors.merchant.warmGray}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>{t.confirmPassword} *</Text>
            <View style={styles.inputContainer}>
              <Lock size={16} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••"
                placeholderTextColor={Colors.merchant.warmGray}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.passwordBtn}
            onPress={handleChangePassword}
            disabled={savingPassword}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t.changePasswordTitle}
            hitSlop={TouchTargets.hitSlopSm}
          >
            <KeyRound size={16} color={Colors.merchant.forest} />
            <Text style={styles.passwordBtnText}>{t.changePasswordTitle}</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t.logoutBtn}
          hitSlop={TouchTargets.hitSlopSm}
        >
          <LogOut size={16} color={Colors.merchant.terracotta} />
          <Text style={styles.logoutBtnText}>{t.logoutBtn}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.merchant.forest,
  },
  heroCard: {
    backgroundColor: Colors.merchant.forest,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    ...Shadows.ledger,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.merchant.forestDark,
    borderWidth: 2,
    borderColor: Colors.merchant.green,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: Colors.merchant.ivory,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
  },
  heroInfo: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.merchant.ivory,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12,
    color: '#A8CAB8',
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F5E49',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: '#8BAF9C',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    color: Colors.merchant.ivory,
    fontWeight: '600',
  },
  metaValueHighlight: {
    fontSize: 11,
    color: Colors.merchant.green,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 14,
    marginBottom: 14,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.borderLight,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.ink,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 42,
  },
  inputDisabled: {
    backgroundColor: Colors.merchant.sageLight,
    opacity: 0.85,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.merchant.ink,
    paddingVertical: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.green,
    borderRadius: 8,
    paddingVertical: 10,
    minHeight: 44,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
  },
  saveBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  passwordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.sageLight,
    borderRadius: 8,
    paddingVertical: 10,
    minHeight: 44,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
  },
  passwordBtnText: {
    color: Colors.merchant.forest,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.terracottaLight,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.4)',
    borderRadius: 10,
    paddingVertical: 12,
    minHeight: 48,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.terracottaDark,
    fontFamily: Typography.fontFamily.mono,
  },
});
