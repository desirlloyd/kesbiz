import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  Receipt,
  History,
  TrendingUp,
  Tag,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { formatGourde, formatShortDate } from '../utils/formatters';
import { Sale } from '../types';

interface DashboardScreenProps {
  onNavigateTab: (tab: any) => void;
  onSelectSale: (sale: Sale) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onSelectSale,
}) => {
  const { t, lang, sales, products, customers, expenses, business } = useApp();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Filter sales and expenses by selected period
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter((s) => {
      if (s.status === 'CANCELLED') return false;
      const saleDate = new Date(s.createdAt);
      if (period === 'day') {
        return (
          saleDate.getDate() === now.getDate() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (period === 'week') {
        const diffTime = Math.abs(now.getTime() - saleDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
    });
  }, [sales, period]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      const expDate = new Date(e.expenseDate);
      if (period === 'day') {
        return (
          expDate.getDate() === now.getDate() &&
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      } else if (period === 'week') {
        const diffTime = Math.abs(now.getTime() - expDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else {
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      }
    });
  }, [expenses, period]);

  // Metrics
  const totalSalesAmount = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.totalAmount, 0),
    [filteredSales]
  );

  const totalCashCollected = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.amountPaid, 0),
    [filteredSales]
  );

  const totalDebtIssued = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.debtAmount, 0),
    [filteredSales]
  );

  const totalCOGS = useMemo(
    () => filteredSales.reduce((acc, s) => acc + s.totalCost, 0),
    [filteredSales]
  );

  const totalExpenseAmount = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + e.amount, 0),
    [filteredExpenses]
  );

  const netProfit = useMemo(
    () => totalSalesAmount - totalCOGS - totalExpenseAmount,
    [totalSalesAmount, totalCOGS, totalExpenseAmount]
  );

  const totalCustomerDebt = useMemo(
    () => customers.reduce((acc, c) => acc + (c.currentDebt || 0), 0),
    [customers]
  );

  const totalStockValue = useMemo(
    () => products.reduce((acc, p) => acc + p.stockQuantity * p.buyPrice, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity <= p.minStockAlert),
    [products]
  );

  // Top products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; total: number }> = {};
    for (const sale of sales) {
      if (sale.status === 'CANCELLED') continue;
      for (const it of sale.items) {
        if (!counts[it.productId]) {
          counts[it.productId] = { name: it.productName, qty: 0, total: 0 };
        }
        counts[it.productId].qty += it.quantity;
        counts[it.productId].total += it.totalPrice;
      }
    }
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [sales]);

  const recentSales = useMemo(() => {
    return sales.slice(0, 5);
  }, [sales]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Low Stock Warning Alert Notice */}
      {lowStockProducts.length > 0 && (
        <TouchableOpacity
          style={styles.warningTicket}
          onPress={() => onNavigateTab('products')}
          activeOpacity={0.8}
        >
          <View style={styles.warningLeft}>
            <View style={styles.warningIconBox}>
              <AlertTriangle size={18} color={Colors.merchant.terracotta} strokeWidth={2.2} />
            </View>
            <View style={styles.warningTextGroup}>
              <Text style={styles.warningTitle}>
                {lang === 'ht'
                  ? `Atansyon : Gen ${lowStockProducts.length} pwodui ki prèske fini nan stòk !`
                  : `Attention : ${lowStockProducts.length} produit(s) en stock critique !`}
              </Text>
              <Text style={styles.warningProducts} numberOfLines={1}>
                {lowStockProducts.slice(0, 3).map((p) => `${p.name} (${p.stockQuantity} ${p.unit})`).join(' • ')}
              </Text>
            </View>
          </View>
          <Text style={styles.warningLinkText}>{lang === 'ht' ? 'Wè lis la →' : 'Voir →'}</Text>
        </TouchableOpacity>
      )}

      {/* 3. Period Filter Pills */}
      <View
        style={styles.periodBar}
        accessibilityRole="radiogroup"
        accessibilityLabel={lang === 'ht' ? 'Filtre peryòd' : 'Filtre période'}
      >
        <TouchableOpacity
          style={[styles.periodPill, period === 'day' && styles.periodPillActive]}
          onPress={() => setPeriod('day')}
          accessibilityRole="radio"
          accessibilityState={{ checked: period === 'day', selected: period === 'day' }}
          accessibilityLabel={t.timeFilters.today}
          hitSlop={TouchTargets.hitSlopSm}
        >
          <Text style={[styles.periodText, period === 'day' && styles.periodTextActive]}>
            {t.timeFilters.today}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.periodPill, period === 'week' && styles.periodPillActive]}
          onPress={() => setPeriod('week')}
          accessibilityRole="radio"
          accessibilityState={{ checked: period === 'week', selected: period === 'week' }}
          accessibilityLabel={t.timeFilters.week}
          hitSlop={TouchTargets.hitSlopSm}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
            {t.timeFilters.week}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.periodPill, period === 'month' && styles.periodPillActive]}
          onPress={() => setPeriod('month')}
          accessibilityRole="radio"
          accessibilityState={{ checked: period === 'month', selected: period === 'month' }}
          accessibilityLabel={t.timeFilters.month}
          hitSlop={TouchTargets.hitSlopSm}
        >
          <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
            {t.timeFilters.month}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Financial Overview Hero Card: Chif D'afè */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTitleGroup}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroTitleLabel}>
              {t.todaySales.toUpperCase()}
            </Text>
          </View>
          <View style={styles.heroStamp}>
            <Text style={styles.heroStampText}>CHIF D&apos;AFÈ</Text>
          </View>
        </View>

        <View style={styles.heroAmountBox}>
          <Text style={styles.heroAmount} numberOfLines={1}>
            {formatGourde(totalSalesAmount)}
          </Text>
          <Text style={styles.heroSubtitle}>
            {lang === 'ht'
              ? 'Total tout tranzaksyon ki fèt nan kès la'
              : 'Total brut de toutes les ventes de la période'}
          </Text>
        </View>

        {/* Breakdown: Cash vs Credit */}
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownLabel}>
              {lang === 'ht' ? 'Lajan kach antre:' : 'Encaissé réel:'}
            </Text>
            <Text style={styles.breakdownCash}>
              {formatGourde(totalCashCollected)}
            </Text>
          </View>

          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownLabel}>
              {lang === 'ht' ? 'Kredi bay:' : 'Crédit accordé:'}
            </Text>
            <Text style={styles.breakdownCredit}>
              {formatGourde(totalDebtIssued)}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. Secondary KPI Grid */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCol}>
          <StatCard
            title={t.netProfit}
            amount={formatGourde(netProfit)}
            subtitle={lang === 'ht' ? 'Apre kou & depans' : 'Après charges & COGS'}
            variant={netProfit >= 0 ? 'green' : 'terracotta'}
          />
        </View>
        <View style={styles.kpiCol}>
          <StatCard
            title={t.customerDebts}
            amount={formatGourde(totalCustomerDebt)}
            subtitle={`${customers.filter((c) => c.currentDebt > 0).length} ${
              lang === 'ht' ? 'kliyan dwe' : 'clients endettés'
            }`}
            variant="terracotta"
          />
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCol}>
          <StatCard
            title={t.stockValue}
            amount={formatGourde(totalStockValue)}
            subtitle={`${products.length} ${lang === 'ht' ? 'atik anrejistre' : 'articles'}`}
            variant="forest"
          />
        </View>
        <View style={styles.kpiCol}>
          <StatCard
            title={t.todayExpenses}
            amount={formatGourde(totalExpenseAmount)}
            subtitle={`${filteredExpenses.length} ${lang === 'ht' ? 'depans fèt' : 'frais'}`}
            variant="default"
          />
        </View>
      </View>

      {/* 6. Quick Action Buttons Row */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>
          {lang === 'ht' ? 'AKSYON RAPID KÈS' : 'ACTIONS RAPIDES'}
        </Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateTab('pos')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Fè yon vant nan kès' : 'Nouvelle vente POS'}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: Colors.merchant.greenLight }]}>
              <ShoppingCart size={17} color={Colors.merchant.green} />
            </View>
            <Text style={styles.quickBtnLabel}>{lang === 'ht' ? 'Fè Vant' : 'Vente'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateTab('customers')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Ajoute nouvo kliyan' : 'Nouveau client'}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: Colors.merchant.sageLight }]}>
              <Users size={17} color={Colors.merchant.forest} />
            </View>
            <Text style={styles.quickBtnLabel}>{lang === 'ht' ? 'Nouvo Kliyan' : 'Client'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateTab('products')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Ajoute nouvo pwodui nan stòk' : 'Nouvel article en stock'}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: Colors.merchant.sageLight }]}>
              <Package size={17} color={Colors.merchant.forest} />
            </View>
            <Text style={styles.quickBtnLabel}>{lang === 'ht' ? 'Nouvo Stòk' : 'Article'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => onNavigateTab('expenses')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Anrejistre yon depans' : 'Nouvelle dépense'}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: Colors.merchant.terracottaLight }]}>
              <Receipt size={17} color={Colors.merchant.terracotta} />
            </View>
            <Text style={styles.quickBtnLabel}>{lang === 'ht' ? 'Depans' : 'Dépense'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7. Recent Transactions (Ledger Receipts) */}
      <View style={styles.sectionBox}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <History size={16} color={Colors.merchant.forest} strokeWidth={2.2} />
            <Text style={styles.sectionTitleText}>
              {lang === 'ht' ? 'Dènye Vant Enskri' : 'Dernières Ventes'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab('sales')}>
            <Text style={styles.seeAllLink}>{lang === 'ht' ? 'Wè tout →' : 'Voir tout →'}</Text>
          </TouchableOpacity>
        </View>

        {recentSales.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {lang === 'ht' ? 'Pa gen vant ki fèt nan peryòd sa a' : 'Aucune vente enregistrée'}
            </Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentSales.map((sale) => {
              const isCredit = sale.paymentMethod === 'CREDIT';
              const isMonCash = sale.paymentMethod === 'MONCASH';
              const isNatCash = sale.paymentMethod === 'NATCASH';

              return (
                <TouchableOpacity
                  key={sale.id}
                  style={styles.saleRow}
                  onPress={() => onSelectSale(sale)}
                  activeOpacity={0.7}
                >
                  <View style={styles.saleLeft}>
                    <View style={styles.ticketBadge}>
                      <Text style={styles.ticketBadgeText}>{sale.receiptNumber}</Text>
                    </View>
                    <View>
                      <Text style={styles.saleCustomer} numberOfLines={1}>
                        {sale.customerName || (lang === 'ht' ? 'Kliyan Senp' : 'Client Comptant')}
                      </Text>
                      <Text style={styles.saleDate}>
                        {formatShortDate(sale.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.saleRight}>
                    <Text style={styles.saleAmount}>{formatGourde(sale.totalAmount)}</Text>
                    <View
                      style={[
                        styles.paymentPill,
                        isCredit && styles.paymentPillCredit,
                        isMonCash && styles.paymentPillMonCash,
                        isNatCash && styles.paymentPillNatCash,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentPillText,
                          isCredit && styles.paymentPillTextCredit,
                          isMonCash && styles.paymentPillTextMonCash,
                          isNatCash && styles.paymentPillTextNatCash,
                        ]}
                      >
                        {sale.paymentMethod}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 8. Top Products Ranking */}
      {topProducts.length > 0 && (
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <TrendingUp size={16} color={Colors.merchant.forest} strokeWidth={2.2} />
              <Text style={styles.sectionTitleText}>
                {lang === 'ht' ? 'Pwodui ki Plis Vann' : 'Meilleures Ventes'}
              </Text>
            </View>
          </View>

          <View style={styles.topProductsList}>
            {topProducts.map((p, idx) => (
              <View key={idx} style={styles.topProductRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>0{idx + 1}</Text>
                </View>
                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.topProductQty}>{p.qty} {lang === 'ht' ? 'inite vann' : 'unités'}</Text>
                </View>
                <Text style={styles.topProductTotal}>{formatGourde(p.total)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  content: {
    padding: 14,
    paddingBottom: 28,
  },
  warningTicket: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.merchant.paper,
    borderLeftWidth: 4,
    borderLeftColor: Colors.merchant.terracotta,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    ...Shadows.card,
  },
  warningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  warningIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.merchant.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  warningTextGroup: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  warningProducts: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 1,
  },
  warningLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
  },
  periodBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  periodPill: {
    flex: 1,
    backgroundColor: Colors.merchant.paper,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingVertical: 7,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  periodTextActive: {
    color: Colors.merchant.ivory,
  },
  heroCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.merchant.forest,
    padding: 14,
    marginBottom: 12,
    ...Shadows.ledger,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.merchant.green,
  },
  heroTitleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.6,
  },
  heroStamp: {
    backgroundColor: Colors.merchant.forest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  heroStampText: {
    color: Colors.merchant.ivory,
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  heroAmountBox: {
    marginVertical: 10,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
    marginTop: 2,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
  },
  breakdownBox: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 8,
  },
  breakdownLabel: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
  },
  breakdownCash: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.green,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },
  breakdownCredit: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCol: {
    flex: 1,
  },
  quickActionsContainer: {
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: Colors.merchant.paper,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    ...Shadows.card,
  },
  quickIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.ink,
    textAlign: 'center',
  },
  sectionBox: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 12,
    marginBottom: 12,
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    marginBottom: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.3,
  },
  seeAllLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  emptyCard: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
  },
  recentList: {
    gap: 8,
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.borderLight,
    padding: 9,
    borderRadius: 8,
  },
  saleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ticketBadge: {
    backgroundColor: Colors.merchant.paper,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  saleCustomer: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
    maxWidth: 130,
  },
  saleDate: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  paymentPill: {
    backgroundColor: Colors.merchant.greenLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  paymentPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.merchant.green,
    fontFamily: Typography.fontFamily.mono,
  },
  paymentPillCredit: {
    backgroundColor: Colors.merchant.terracottaLight,
  },
  paymentPillTextCredit: {
    color: Colors.merchant.terracotta,
  },
  paymentPillMonCash: {
    backgroundColor: Colors.moncash.light,
  },
  paymentPillTextMonCash: {
    color: Colors.moncash.DEFAULT,
  },
  paymentPillNatCash: {
    backgroundColor: Colors.natcash.light,
  },
  paymentPillTextNatCash: {
    color: Colors.natcash.DEFAULT,
  },
  topProductsList: {
    gap: 6,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.borderLight,
    padding: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.merchant.sage,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  topProductQty: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
  },
  topProductTotal: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
});
