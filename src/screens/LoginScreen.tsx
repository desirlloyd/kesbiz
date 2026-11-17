import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang, login } = useApp();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage(
        lang === 'ht'
          ? 'Tanpri antre imèl ak modpas ou.'
          : 'Veuillez saisir votre e-mail et mot de passe.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message || t.invalidCredentials);
      }
    } catch {
      setErrorMessage(t.invalidCredentials);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      {/* Top Language Toggle */}
      <View
        style={[
          styles.topBar,
          { paddingTop: Math.max(insets.top, 16) + 8 },
        ]}
      >
        <View
          style={styles.langToggleContainer}
          accessibilityRole="radiogroup"
          accessibilityLabel={lang === 'ht' ? 'Chanje lang' : 'Changer de langue'}
        >
          <TouchableOpacity
            style={[
              styles.langToggleBtn,
              lang === 'ht' && styles.langToggleBtnActive,
            ]}
            onPress={() => setLang('ht')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: lang === 'ht', selected: lang === 'ht' }}
            accessibilityLabel="Kreyòl Ayisyen"
            hitSlop={TouchTargets.hitSlopSm}
          >
            <Text
              style={[
                styles.langToggleText,
                lang === 'ht' && styles.langToggleTextActive,
              ]}
            >
              HT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langToggleBtn,
              lang === 'fr' && styles.langToggleBtnActive,
            ]}
            onPress={() => setLang('fr')}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: lang === 'fr', selected: lang === 'fr' }}
            accessibilityLabel="Français"
            hitSlop={TouchTargets.hitSlopSm}
          >
            <Text
              style={[
                styles.langToggleText,
                lang === 'fr' && styles.langToggleTextActive,
              ]}
            >
              FR
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Stamp & Hero */}
        <View style={styles.brandHero}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Logo KèsBiz Ayiti"
          />

          <Text style={styles.appTitle}>KèsBiz</Text>
          <Text style={styles.appSubtitle}>{t.loginSubtitle}</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.loginTitle}</Text>

          {/* Error Notice */}
          {errorMessage ? (
            <View
              style={styles.errorBox}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel={errorMessage}
            >
              <AlertCircle size={16} color={Colors.moncash.DEFAULT} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.emailLabel}</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                placeholder="admin@gmail.com"
                placeholderTextColor={Colors.merchant.warmGray}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                accessibilityRole="none"
                accessibilityLabel={t.emailLabel}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.passwordLabel}</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.merchant.warmGray} />
              <TextInput
                style={styles.textInput}
                placeholder="admin123"
                placeholderTextColor={Colors.merchant.warmGray}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t.passwordLabel}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={TouchTargets.hitSlopSm}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword
                    ? lang === 'ht'
                      ? 'Kache modpas'
                      : 'Masquer le mot de passe'
                    : lang === 'ht'
                    ? 'Montre modpas'
                    : 'Afficher le mot de passe'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.merchant.inkMuted} />
                ) : (
                  <Eye size={18} color={Colors.merchant.inkMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.loginBtn, submitting && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t.loginBtn}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.merchant.ivory} />
            ) : (
              <>
                <Text style={styles.loginBtnText}>{t.loginBtn}</Text>
                <ArrowRight size={18} color={Colors.merchant.ivory} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    justifyContent: 'center',
  },
  langToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.sageLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 2,
  },
  langToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggleBtnActive: {
    backgroundColor: Colors.merchant.forest,
  },
  langToggleText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.inkMuted,
  },
  langToggleTextActive: {
    color: Colors.merchant.ivory,
    fontWeight: '800',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: 12,
    borderRadius: 16,
  },
  stamp: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.merchant.forest,
    borderWidth: 1.5,
    borderColor: Colors.merchant.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
    ...Shadows.ledger,
  },
  stampTop: {
    color: Colors.merchant.green,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    lineHeight: 14,
    letterSpacing: 1.5,
  },
  stampBottom: {
    color: Colors.merchant.ivory,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  stampAccent: {
    position: 'absolute',
    bottom: 3,
    width: 22,
    height: 2.5,
    backgroundColor: Colors.merchant.green,
    borderRadius: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.merchant.ink,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: Colors.merchant.inkMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 20,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.merchant.ink,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.moncash.light,
    borderWidth: 1,
    borderColor: 'rgba(227, 24, 55, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: Colors.moncash.dark,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    minHeight: 46,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.merchant.ink,
    paddingVertical: 10,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.forest,
    borderRadius: 10,
    paddingVertical: 13,
    minHeight: 48,
    marginTop: 6,
    ...Shadows.ledger,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.merchant.ivory,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
});
