import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  BarChart3,
  Coins,
  TrendingUp,
  Banknote,
  Smartphone,
  CreditCard,
  Receipt,
  Package,
} from 'lucide-react-native';
import { Colors, Typography, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatGourde } from '../utils/formatters';

export const ReportsScreen: React.FC = () => {
  const { t, lang, sales, expenses } = useApp();

  const completedSales = useMemo(() => {
    return sales.filter((s) => s.status !== 'CANCELLED');
  }, [sales]);

  const grossRevenue = useMemo(() => {
    return completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [completedSales]);

  const totalCOGS = useMemo(() => {
    return completedSales.reduce((sum, s) => sum + s.totalCost, 0);
  }, [completedSales]);

  const grossProfit = useMemo(() => {
    return grossRevenue - totalCOGS;
  }, [grossRevenue, totalCOGS]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netProfit = useMemo(() => {
    return grossProfit - totalExpenses;
  }, [grossProfit, totalExpenses]);

  // Cash Flow Breakdown
  const totalCashCollected = useMemo(() => {
    return completedSales.reduce((sum, s) => sum + s.amountPaid, 0);
  }, [completedSales]);

  const totalDebtIssued = useMemo(() => {
    return completedSales.reduce((sum, s) => sum + s.debtAmount, 0);
  }, [completedSales]);

  // Payment method breakdown
  const paymentMethodTotals = useMemo(() => {
    const map: Record<string, number> = {
      CASH: 0,
      MONCASH: 0,
      NATCASH: 0,
      CREDIT: 0,
    };
    for (const s of completedSales) {
      if (map[s.paymentMethod] !== undefined) {
        map[s.paymentMethod] += s.totalAmount;
      } else {
        map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.totalAmount;
      }
    }
    return map;
  }, [completedSales]);

  const grossMarginPct = grossRevenue > 0 ? Math.round((grossProfit / grossRevenue) * 100) : 0;
  const netMarginPct = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.stampBadge}>
            <Text style={styles.stampBadgeText}>RAPÒ & P&L</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>{t.reports}</Text>
        <Text style={styles.headerSub}>
          {lang === 'ht'
            ? 'Kalkil egzak benefis ak kou acha machandiz (COGS)'
            : 'Calcul comptable des profits, charges et marge brute'}
        </Text>
      </View>

      {/* 2. P&L Accounting Waterfall Card (Merchant's Ledger) */}
      <View style={styles.ledgerCard}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardBadge}>P&L KOMÈSYAL</Text>
          <Text style={styles.cardCurrency}>HTG (GOUD)</Text>
        </View>

        {/* 1. Gross Revenue */}
        <View style={styles.waterfallRow}>
          <View style={styles.labelGroup}>
            <Text style={styles.lineTag}>[+]</Text>
            <Text style={styles.lineTitle}>{t.grossRevenue}</Text>
          </View>
          <Text style={styles.valueGross}>{formatGourde(grossRevenue)}</Text>
        </View>

        {/* 2. COGS (Kou Acha) */}
        <View style={styles.waterfallRow}>
          <View style={styles.labelGroup}>
            <Text style={[styles.lineTag, { color: Colors.merchant.terracotta }]}>[-]</Text>
            <Text style={styles.lineTitle}>{t.cogs}</Text>
          </View>
          <Text style={styles.valueCogs}>-{formatGourde(totalCOGS)}</Text>
        </View>

        {/* 3. Gross Margin */}
        <View style={[styles.waterfallRow, styles.subtotalRow]}>
          <View style={styles.labelGroup}>
            <Text style={styles.lineTag}>[=]</Text>
            <Text style={styles.lineTitleBold}>{t.grossProfit}</Text>
            <View style={styles.marginPill}>
              <Text style={styles.marginPillText}>{grossMarginPct}%</Text>
            </View>
          </View>
          <Text style={styles.valueMargin}>{formatGourde(grossProfit)}</Text>
        </View>

        {/* 4. Operating Expenses */}
        <View style={styles.waterfallRow}>
          <View style={styles.labelGroup}>
            <Text style={[styles.lineTag, { color: Colors.merchant.terracotta }]}>[-]</Text>
            <Text style={styles.lineTitle}>{t.totalExpenses}</Text>
          </View>
          <Text style={styles.valueExpenses}>-{formatGourde(totalExpenses)}</Text>
        </View>

        {/* 5. Net Profit Hero Box */}
        <View
          style={[
            styles.netProfitBox,
            netProfit >= 0 ? styles.netProfitBoxPos : styles.netProfitBoxNeg,
          ]}
        >
          <View style={styles.netProfitLeft}>
            <Text style={styles.netProfitLabel}>{t.netProfit.toUpperCase()}</Text>
            <Text style={styles.netProfitSub}>
              {lang === 'ht' ? `Marge Nèt: ${netMarginPct}%` : `Marge nette: ${netMarginPct}%`}
            </Text>
          </View>
          <Text
            style={[
              styles.netProfitValue,
              netProfit >= 0 ? styles.netProfitValuePos : styles.netProfitValueNeg,
            ]}
          >
            {formatGourde(netProfit)}
          </Text>
        </View>
      </View>

      {/* 3. Cash Flow Summary (Lajan Kach vs Dèt) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Banknote size={16} color={Colors.merchant.forest} />
          <Text style={styles.sectionTitle}>
            {lang === 'ht' ? 'TREZORERI (KACH VS KREDI)' : 'FLUX DE TRÉSORERIE'}
          </Text>
        </View>

        <View style={styles.cashFlowGrid}>
          <View style={styles.cashFlowBox}>
            <Text style={styles.cashFlowLabel}>
              {lang === 'ht' ? 'Lajan Kach Resevwa:' : 'Encaissé Réel:'}
            </Text>
            <Text style={styles.cashFlowAmountGreen}>
              {formatGourde(totalCashCollected)}
            </Text>
          </View>

          <View style={styles.cashFlowBox}>
            <Text style={styles.cashFlowLabel}>
              {lang === 'ht' ? 'Kredi / Dèt Bay:' : 'Crédit Accordé:'}
            </Text>
            <Text style={styles.cashFlowAmountRed}>
              {formatGourde(totalDebtIssued)}
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Payment Methods Distribution */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <CreditCard size={16} color={Colors.merchant.forest} />
          <Text style={styles.sectionTitle}>
            {lang === 'ht' ? 'REPATISYON PA MÒD PEMAN' : 'MODES DE PAIEMENT'}
          </Text>
        </View>

        <View style={styles.methodDistributionList}>
          {/* Kach */}
          <View style={styles.methodDistRow}>
            <View style={styles.distLabelRow}>
              <Text style={styles.distName}>Kach (Espès)</Text>
              <Text style={styles.distAmount}>{formatGourde(paymentMethodTotals.CASH)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${grossRevenue > 0 ? (paymentMethodTotals.CASH / grossRevenue) * 100 : 0}%`,
                    backgroundColor: Colors.merchant.green,
                  },
                ]}
              />
            </View>
          </View>

          {/* MonCash */}
          <View style={styles.methodDistRow}>
            <View style={styles.distLabelRow}>
              <Text style={styles.distName}>MonCash</Text>
              <Text style={styles.distAmount}>{formatGourde(paymentMethodTotals.MONCASH)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${grossRevenue > 0 ? (paymentMethodTotals.MONCASH / grossRevenue) * 100 : 0}%`,
                    backgroundColor: Colors.moncash.DEFAULT,
                  },
                ]}
              />
            </View>
          </View>

          {/* NatCash */}
          <View style={styles.methodDistRow}>
            <View style={styles.distLabelRow}>
              <Text style={styles.distName}>NatCash</Text>
              <Text style={styles.distAmount}>{formatGourde(paymentMethodTotals.NATCASH)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${grossRevenue > 0 ? (paymentMethodTotals.NATCASH / grossRevenue) * 100 : 0}%`,
                    backgroundColor: Colors.natcash.DEFAULT,
                  },
                ]}
              />
            </View>
          </View>

          {/* Kredi */}
          <View style={styles.methodDistRow}>
            <View style={styles.distLabelRow}>
              <Text style={styles.distName}>Kredi (Dèt)</Text>
              <Text style={styles.distAmount}>{formatGourde(paymentMethodTotals.CREDIT)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${grossRevenue > 0 ? (paymentMethodTotals.CREDIT / grossRevenue) * 100 : 0}%`,
                    backgroundColor: Colors.merchant.terracotta,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
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
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 14,
    marginBottom: 12,
    ...Shadows.card,
  },
  badgeRow: {
    marginBottom: 4,
  },
  stampBadge: {
    backgroundColor: Colors.merchant.sage,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
    alignSelf: 'flex-start',
  },
  stampBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.merchant.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    marginTop: 2,
  },
  ledgerCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.merchant.forest,
    padding: 14,
    marginBottom: 12,
    ...Shadows.ledger,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    marginBottom: 10,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
    letterSpacing: 0.8,
  },
  cardCurrency: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.warmGray,
  },
  waterfallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lineTag: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.green,
  },
  lineTitle: {
    fontSize: 12,
    color: Colors.merchant.ink,
  },
  lineTitleBold: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  valueGross: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  valueCogs: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.merchant.border,
    borderBottomColor: Colors.merchant.border,
    backgroundColor: Colors.merchant.card,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  marginPill: {
    backgroundColor: Colors.merchant.greenLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  marginPillText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.green,
  },
  valueMargin: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.green,
  },
  valueExpenses: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
  },
  netProfitBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  netProfitBoxPos: {
    backgroundColor: Colors.merchant.forest,
  },
  netProfitBoxNeg: {
    backgroundColor: Colors.merchant.terracottaDark,
  },
  netProfitLeft: {
    flex: 1,
  },
  netProfitLabel: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.ivory,
    letterSpacing: 0.6,
  },
  netProfitSub: {
    fontSize: 10,
    color: '#CBD9C9',
    marginTop: 2,
    fontFamily: Typography.fontFamily.mono,
  },
  netProfitValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
  },
  netProfitValuePos: {
    color: '#34D399',
  },
  netProfitValueNeg: {
    color: '#FCA5A5',
  },
  sectionCard: {
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
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
    letterSpacing: 0.8,
  },
  cashFlowGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  cashFlowBox: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 10,
  },
  cashFlowLabel: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
  },
  cashFlowAmountGreen: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.green,
    marginTop: 2,
  },
  cashFlowAmountRed: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
    marginTop: 2,
  },
  methodDistributionList: {
    gap: 10,
  },
  methodDistRow: {
    gap: 4,
  },
  distLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.merchant.ink,
  },
  distAmount: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.inkMuted,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.merchant.card,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.merchant.borderLight,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
