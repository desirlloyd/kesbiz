import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, BackHandler, useColorScheme, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { Colors, Typography } from './src/constants/theme';
import { Header } from './src/components/Header';
import { BottomNav, ScreenTab } from './src/components/BottomNav';
import { MoreDrawer } from './src/components/MoreDrawer';
import { ReceiptModal } from './src/components/ReceiptModal';
import { Sale } from './src/types';

// Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PosScreen } from './src/screens/PosScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { SalesScreen } from './src/screens/SalesScreen';
import { CustomersScreen } from './src/screens/CustomersScreen';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const MainNavigator = () => {
  const { loading, t, lang, currentUser } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentTab, setCurrentTab] = useState<ScreenTab>('dashboard');
  const [moreDrawerVisible, setMoreDrawerVisible] = useState<boolean>(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // System Android hardware back gesture / button handler
  useEffect(() => {
    const onBackPress = () => {
      if (receiptSale !== null) {
        setReceiptSale(null);
        return true;
      }
      if (moreDrawerVisible) {
        setMoreDrawerVisible(false);
        return true;
      }
      if (currentTab !== 'dashboard') {
        setCurrentTab('dashboard');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [currentTab, moreDrawerVisible, receiptSale]);

  // Reset tab to dashboard upon logout
  useEffect(() => {
    if (!currentUser) {
      setCurrentTab('dashboard');
      setMoreDrawerVisible(false);
      setReceiptSale(null);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="small" color={Colors.merchant.green} style={styles.spinner} />
          <Text style={styles.loadingText}>
            {lang === 'ht' ? 'Ouvèti kès ak done lokal yo...' : 'Chargement de la caisse locale...'}
          </Text>
        </View>
      </View>
    );
  }

  // Authentication gate: show Login screen if no active session
  if (!currentUser) {
    return (
      <View style={styles.appContainer}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen />
      </View>
    );
  }

  const getScreenTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return undefined; // Dashboard renders its own merchant editorial hero header
      case 'pos':
        return t.pos;
      case 'products':
        return t.products;
      case 'sales':
        return t.sales;
      case 'customers':
        return t.customers;
      case 'expenses':
        return t.expenses;
      case 'reports':
        return t.reports;
      case 'settings':
        return t.settings;
      case 'profile':
        return t.profile;
      default:
        return '';
    }
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateTab={setCurrentTab}
            onSelectSale={(sale) => setReceiptSale(sale)}
          />
        );
      case 'pos':
        return (
          <PosScreen
            onSaleCompleted={(sale) => setReceiptSale(sale)}
          />
        );
      case 'products':
        return <ProductsScreen />;
      case 'sales':
        return (
          <SalesScreen
            onSelectSale={(sale) => setReceiptSale(sale)}
          />
        );
      case 'customers':
        return <CustomersScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'settings':
        return <SettingsScreen onNavigateTab={setCurrentTab} />;
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentTab('dashboard')}
            onLogout={() => setCurrentTab('dashboard')}
          />
        );
      default:
        return <DashboardScreen onNavigateTab={setCurrentTab} onSelectSale={setReceiptSale} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header
        title={getScreenTitle()}
        onOpenMenu={() => setMoreDrawerVisible(true)}
        onOpenPos={() => setCurrentTab('pos')}
        onOpenProfile={() => setCurrentTab('profile')}
        hideStatusBadge={currentTab === 'profile'}
      />

      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMore={() => setMoreDrawerVisible(true)}
      />

      {/* Slideout Modules Drawer */}
      <MoreDrawer
        visible={moreDrawerVisible}
        onClose={() => setMoreDrawerVisible(false)}
        onSelectTab={setCurrentTab}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        visible={receiptSale !== null}
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.merchant.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    backgroundColor: Colors.merchant.forestDark,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F5E49',
  },
  loadingLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  loadingStamp: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.merchant.forest,
    borderWidth: 1.5,
    borderColor: Colors.merchant.green,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stampTop: {
    color: Colors.merchant.green,
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 1.5,
    lineHeight: 12,
  },
  stampBottom: {
    color: Colors.merchant.ivory,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  stampUnderline: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 2,
    backgroundColor: Colors.merchant.green,
    borderRadius: 1,
  },
  spinner: {
    marginVertical: 14,
  },
  loadingText: {
    color: '#CBD9C9',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.mono,
  },
});
