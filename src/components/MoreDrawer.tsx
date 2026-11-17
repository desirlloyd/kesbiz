import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  Users,
  Receipt,
  BarChart3,
  Settings,
  User as UserIcon,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ScreenTab } from './BottomNav';

interface MoreDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTab: (tab: ScreenTab) => void;
}

export const MoreDrawer: React.FC<MoreDrawerProps> = ({
  visible,
  onClose,
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang, business, customers, expenses, currentUser } = useApp();

  const indebtedCount = customers.filter((c) => c.currentDebt > 0).length;

  const navItems: {
    tab: ScreenTab;
    title: string;
    subtitle: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[] = [
    {
      tab: 'dashboard',
      title: t.dashboard,
      subtitle: lang === 'ht' ? 'Estatistik, vant jodi a ak kès' : 'Aperçu général et ventes du jour',
      icon: LayoutDashboard,
    },
    {
      tab: 'pos',
      title: t.pos,
      subtitle: lang === 'ht' ? 'Fè vant vit, kalkil monnen ak resi' : 'Caisse rapide et tickets',
      icon: ShoppingCart,
      badge: 'POS',
      badgeColor: Colors.merchant.green,
      highlight: true,
    },
    {
      tab: 'products',
      title: t.products,
      subtitle: lang === 'ht' ? 'Envantè, pri acha, pri vant ak alèt' : 'Gestion articles et alertes stock',
      icon: Package,
    },
    {
      tab: 'sales',
      title: t.sales,
      subtitle: lang === 'ht' ? 'Tout fich resi ak tranzaksyon kès' : 'Historique des reçus et annulations',
      icon: History,
    },
    {
      tab: 'customers',
      title: t.customers,
      subtitle: lang === 'ht' ? 'Kliyan regilye ak swivi dèt' : 'Gestion des créances clients',
      icon: Users,
      badge: indebtedCount > 0 ? `${indebtedCount} ${lang === 'ht' ? 'dwe' : 'dus'}` : undefined,
      badgeColor: Colors.merchant.terracotta,
    },
    {
      tab: 'expenses',
      title: t.expenses,
      subtitle: lang === 'ht' ? 'Gaz Delco, lwaye, transpò, salè' : 'Charges, carburant et dépenses',
      icon: Receipt,
      badge: `${expenses.length}`,
      badgeColor: Colors.merchant.forestLight,
    },
    {
      tab: 'reports',
      title: t.reports,
      subtitle: lang === 'ht' ? 'P&L, benefis reyèl, COGS ak lajan kach' : 'P&L comptable et flux de trésorerie',
      icon: BarChart3,
    },
    {
      tab: 'settings',
      title: t.settings,
      subtitle: lang === 'ht' ? 'Boutik, resi tèmik, sovgad lokal' : 'Profil boutique, reçus, sauvegarde',
      icon: Settings,
    },
    {
      tab: 'profile',
      title: t.profile,
      subtitle: lang === 'ht' ? 'Enfòmasyon kèsye, modpas ak dwa' : 'Informations, mot de passe et droits',
      icon: UserIcon,
      badge: currentUser?.role || 'ADMIN',
      badgeColor: Colors.merchant.forestDark,
    },
  ];

  const handleSelect = (tab: ScreenTab) => {
    onClose();
    onSelectTab(tab);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.drawerSheet,
            { paddingTop: Math.max(insets.top, 8), paddingBottom: Math.max(insets.bottom, 8) },
          ]}
        >
          {/* Header (Deep Forest Green) */}
          <View style={styles.sheetHeader}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandTitle}>KèsBiz</Text>
                  <View style={styles.rejisBadge}>
                    <Text style={styles.rejisBadgeText}>REJIS</Text>
                  </View>
                </View>
                <Text style={styles.storeName} numberOfLines={1}>
                  {business?.name || 'Komès Ayiti'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Fèmen meni an"
              hitSlop={TouchTargets.hitSlop}
            >
              <X size={18} color={Colors.merchant.sageDark} />
            </TouchableOpacity>
          </View>

          {/* Section Tag */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>
              {lang === 'ht' ? 'REJIS & OPERASYON' : 'REGISTRE & CAISSE'}
            </Text>
          </View>

          {/* Navigation Items List */}
          <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.tab}
                  style={[styles.itemRow, item.highlight && styles.itemRowHighlight]}
                  onPress={() => handleSelect(item.tab)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      item.highlight && styles.iconCircleHighlight,
                    ]}
                  >
                    <IconComponent
                      size={18}
                      color={item.highlight ? Colors.merchant.green : '#9AC4AD'}
                      strokeWidth={2}
                    />
                  </View>

                  <View style={styles.itemTextContainer}>
                    <View style={styles.titleWithBadge}>
                      <Text
                        style={[
                          styles.itemTitle,
                          item.highlight && styles.itemTitleHighlight,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.badge && (
                        <View
                          style={[
                            styles.itemBadge,
                            { backgroundColor: item.badgeColor || Colors.merchant.forestDark },
                          ]}
                        >
                          <Text style={styles.itemBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemSub} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <ChevronRight size={16} color="#446D5E" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Merchant Status Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.cashierBox}
              activeOpacity={0.8}
              onPress={() => handleSelect('profile')}
              accessibilityRole="button"
              accessibilityLabel={t.profile}
            >
              <View style={styles.cashierAvatar}>
                <Text style={styles.cashierAvatarText}>
                  {currentUser?.fullName
                    ? currentUser.fullName.charAt(0).toUpperCase()
                    : business?.name
                    ? business.name.charAt(0).toUpperCase()
                    : 'A'}
                </Text>
              </View>
              <View style={styles.cashierInfo}>
                <Text style={styles.cashierName} numberOfLines={1}>
                  {currentUser?.fullName || business?.name || 'Administrateur'}
                </Text>
                <View style={styles.statusDotRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {currentUser?.role === 'ADMIN'
                      ? lang === 'ht'
                        ? 'Administratè'
                        : 'Administrateur'
                      : lang === 'ht'
                      ? 'Kèsye Pwopriyetè'
                      : 'Gérant Boutique'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setLang(lang === 'ht' ? 'fr' : 'ht')}
                style={styles.langPill}
                hitSlop={TouchTargets.hitSlop}
              >
                <Text style={styles.langPillText}>
                  {lang === 'ht' ? '🇫🇷 FR' : '🇭🇹 HT'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 53, 41, 0.6)',
  },
  backdrop: {
    flex: 1,
  },
  drawerSheet: {
    width: '84%',
    maxWidth: 340,
    backgroundColor: Colors.merchant.forest,
    borderLeftWidth: 1,
    borderLeftColor: Colors.merchant.forestDark,
    display: 'flex',
    flexDirection: 'column',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F5E49',
    backgroundColor: '#143F31',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  stamp: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.merchant.forestDark,
    borderWidth: 1,
    borderColor: '#2A6E55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampTop: {
    color: Colors.merchant.green,
    fontSize: 9,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 1,
    lineHeight: 10,
  },
  stampBottom: {
    color: Colors.merchant.ivory,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.merchant.ivory,
    letterSpacing: -0.3,
  },
  rejisBadge: {
    backgroundColor: 'rgba(22, 163, 106, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 106, 0.4)',
  },
  rejisBadgeText: {
    color: Colors.merchant.green,
    fontSize: 8,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
  },
  storeName: {
    fontSize: 11,
    color: '#A2A49B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.merchant.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: '700',
    color: '#9AC4AD',
    letterSpacing: 0.8,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 1.5,
  },
  itemRowHighlight: {
    backgroundColor: 'rgba(22, 163, 106, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 106, 0.25)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: Colors.merchant.forestDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconCircleHighlight: {
    backgroundColor: 'rgba(22, 163, 106, 0.2)',
  },
  itemTextContainer: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.merchant.ivory,
  },
  itemTitleHighlight: {
    color: Colors.merchant.ivory,
    fontWeight: '700',
  },
  itemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  itemBadgeText: {
    color: Colors.merchant.ivory,
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  itemSub: {
    fontSize: 10,
    color: '#A2A49B',
    marginTop: 2,
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F5E49',
    backgroundColor: Colors.merchant.forestDark,
  },
  cashierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.forest,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F5E49',
  },
  cashierAvatar: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#1F5E49',
    borderWidth: 1,
    borderColor: '#2A6E55',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cashierAvatarText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  cashierInfo: {
    flex: 1,
  },
  cashierName: {
    color: Colors.merchant.ivory,
    fontSize: 12,
    fontWeight: '700',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.merchant.green,
  },
  statusText: {
    color: '#A2A49B',
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
  },
  langPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  langPillText: {
    color: Colors.merchant.ivory,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
  },
});
