import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Package, ShoppingCart, Users, Menu } from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';

export type ScreenTab =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'sales'
  | 'customers'
  | 'expenses'
  | 'reports'
  | 'settings'
  | 'profile';

interface BottomNavProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMore,
}) => {
  const insets = useSafeAreaInsets();
  const { cart, lang } = useApp();

  const isMoreActive =
    currentTab === 'sales' ||
    currentTab === 'expenses' ||
    currentTab === 'reports' ||
    currentTab === 'settings' ||
    currentTab === 'profile';

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
      accessibilityRole="tablist"
      accessibilityLabel={lang === 'ht' ? 'Meni navigasyon prensipal' : 'Navigation principale'}
    >
      {/* 1. Dashboard (Tablo Bò) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('dashboard')}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityLabel={lang === 'ht' ? 'Tablo Bò, akèy kès' : 'Tableau de bord'}
        accessibilityState={{ selected: currentTab === 'dashboard' }}
        hitSlop={TouchTargets.hitSlopSm}
      >
        <LayoutDashboard
          size={20}
          color={currentTab === 'dashboard' ? Colors.merchant.forest : Colors.merchant.warmGray}
          strokeWidth={currentTab === 'dashboard' ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'dashboard' && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {lang === 'ht' ? 'Tablo Bò' : 'Tableau'}
        </Text>
      </TouchableOpacity>

      {/* 2. Products / Stock (Stòk) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('products')}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityLabel={lang === 'ht' ? 'Jesyon stòk ak pwodui' : 'Gestion des stocks'}
        accessibilityState={{ selected: currentTab === 'products' }}
        hitSlop={TouchTargets.hitSlopSm}
      >
        <Package
          size={20}
          color={currentTab === 'products' ? Colors.merchant.forest : Colors.merchant.warmGray}
          strokeWidth={currentTab === 'products' ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'products' && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {lang === 'ht' ? 'Stòk' : 'Stock'}
        </Text>
      </TouchableOpacity>

      {/* 3. Center Elevated POS Cashier Trigger */}
      <TouchableOpacity
        style={styles.posCenterButton}
        onPress={() => onSelectTab('pos')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={
          cart.length > 0
            ? `${lang === 'ht' ? 'Pwen vant kès' : 'Caisse enregistreuse'}, ${cart.length} ${
                lang === 'ht' ? 'atik nan panyen' : 'articles dans le panier'
              }`
            : lang === 'ht'
            ? 'Pwen vant kès, panyen vid'
            : 'Caisse enregistreuse, panier vide'
        }
        hitSlop={TouchTargets.hitSlopSm}
      >
        <View style={styles.posCircle}>
          <ShoppingCart size={22} color={Colors.merchant.ivory} strokeWidth={2.4} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.posLabel}>KÈS</Text>
      </TouchableOpacity>

      {/* 4. Customers / Debts (Dèt) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('customers')}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityLabel={lang === 'ht' ? 'Kliyan ak jesyon dèt' : 'Clients et dettes'}
        accessibilityState={{ selected: currentTab === 'customers' }}
        hitSlop={TouchTargets.hitSlopSm}
      >
        <Users
          size={20}
          color={currentTab === 'customers' ? Colors.merchant.forest : Colors.merchant.warmGray}
          strokeWidth={currentTab === 'customers' ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            currentTab === 'customers' && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {lang === 'ht' ? 'Dèt' : 'Crédits'}
        </Text>
      </TouchableOpacity>

      {/* 5. More / Modules Drawer (Meni) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={onOpenMore}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={lang === 'ht' ? 'Ouvri lòt modil ak meni' : 'Ouvrir le menu complet'}
        accessibilityState={{ expanded: isMoreActive }}
        hitSlop={TouchTargets.hitSlopSm}
      >
        <Menu
          size={20}
          color={isMoreActive ? Colors.merchant.forest : Colors.merchant.warmGray}
          strokeWidth={isMoreActive ? 2.4 : 1.8}
        />
        <Text
          style={[
            styles.tabLabel,
            isMoreActive && styles.tabLabelActive,
          ]}
          numberOfLines={1}
        >
          {lang === 'ht' ? 'Meni' : 'Plus'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.merchant.paper,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
    paddingHorizontal: 8,
    paddingTop: 6,
    ...Shadows.card,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTargets.minAndroid,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.merchant.warmGray,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.merchant.forest,
    fontWeight: '800',
  },
  posCenterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    minHeight: TouchTargets.minAndroid,
  },
  posCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.merchant.green,
    borderWidth: 3,
    borderColor: Colors.merchant.paper,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.ledger,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.moncash.DEFAULT,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.merchant.card,
  },
  cartBadgeText: {
    color: Colors.merchant.card,
    fontSize: 9,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
  },
  posLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.forest,
    marginTop: 2,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
});
