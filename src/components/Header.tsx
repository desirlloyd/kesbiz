import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart } from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMenu?: () => void;
  onOpenPos?: () => void;
  onOpenProfile?: () => void;
  hideStatusBadge?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenPos,
  onOpenProfile,
  hideStatusBadge,
}) => {
  const insets = useSafeAreaInsets();
  const { lang, setLang, currentUser } = useApp();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 8) + 6 },
      ]}
      accessibilityRole="header"
    >
      {/* Top Merchant Bar: Logo on left, Translation Toggle & POS on right */}
      <View style={styles.topRow}>
        {/* Logo (Merchant Stamp / Modern K Logo) */}
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="KèsBiz Ayiti Logo"
          accessibilityRole="image"
        />

        {/* Right Action: Language Toggle Switch & Quick POS */}
        <View style={styles.rightGroup}>
          {/* Toggle HT / FR */}
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

          {onOpenPos && (
            <TouchableOpacity
              onPress={onOpenPos}
              style={styles.posButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Ouvri Pwen Vant Kès POS"
              hitSlop={TouchTargets.hitSlopSm}
            >
              <ShoppingCart size={15} color={Colors.merchant.ivory} strokeWidth={2.5} />
              <Text style={styles.posButtonText}>POS</Text>
            </TouchableOpacity>
          )}

          {onOpenProfile && currentUser && (
            <TouchableOpacity
              onPress={onOpenProfile}
              style={styles.profileAvatarBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={lang === 'ht' ? 'Gade pwofil kèsye' : 'Voir le profil'}
              hitSlop={TouchTargets.hitSlopSm}
            >
              <Text style={styles.profileAvatarText}>
                {currentUser.fullName
                  ? currentUser.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'AD'}
              </Text>
              <View style={styles.profileOnlineDot} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Optional Page Subheader Bar */}
      {title && (
        <View style={styles.subHeader}>
          <View style={styles.titleWrapper}>
            <Text style={styles.pageTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.pageSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {!hideStatusBadge && (
            <View
              style={styles.registerBadge}
              accessible={true}
              accessibilityLabel={lang === 'ht' ? 'Kès la louvri' : 'Caisse ouverte'}
            >
              <View style={styles.registerDot} />
              <Text style={styles.registerBadgeText}>
                {lang === 'ht' ? 'KÈS LOUVRI' : 'EN LIGNE'}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingHorizontal: 16,
    paddingBottom: 10,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  stamp: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Colors.merchant.forest,
    borderWidth: 1,
    borderColor: Colors.merchant.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.card,
  },
  stampTop: {
    color: Colors.merchant.green,
    fontSize: 9,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    lineHeight: 10,
    letterSpacing: 1,
  },
  stampBottom: {
    color: Colors.merchant.ivory,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  stampAccent: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 2,
    backgroundColor: Colors.merchant.green,
    borderRadius: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingVertical: 7,
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
  posButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.green,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
    ...Shadows.card,
  },
  posButtonText: {
    color: Colors.merchant.ivory,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  profileAvatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.merchant.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.merchant.green,
    position: 'relative',
  },
  profileAvatarText: {
    color: Colors.merchant.ivory,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.merchant.green,
    borderWidth: 1,
    borderColor: Colors.merchant.paper,
  },
  subHeader: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.merchant.ink,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    marginTop: 1,
  },
  registerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
  },
  registerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.merchant.green,
  },
  registerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
});
