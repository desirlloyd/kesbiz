import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  History,
  Search,
  Receipt,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Sale, PaymentMethod } from '../types';
import { formatGourde, formatDateTime } from '../utils/formatters';

interface SalesScreenProps {
  onSelectSale: (sale: Sale) => void;
}

export const SalesScreen: React.FC<SalesScreenProps> = ({ onSelectSale }) => {
  const { t, lang, sales, cancelSale } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  // Cancel Sale Modal state
  const [cancelModalVisible, setCancelModalVisible] = useState<boolean>(false);
  const [cancellingSale, setCancellingSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchMethod = filterMethod === 'ALL' || s.paymentMethod === filterMethod;
      const search = searchQuery.toLowerCase();
      const matchSearch =
        s.receiptNumber.toLowerCase().includes(search) ||
        (s.customerName && s.customerName.toLowerCase().includes(search)) ||
        (s.paymentReference && s.paymentReference.toLowerCase().includes(search));
      return matchMethod && matchSearch;
    });
  }, [sales, filterMethod, searchQuery]);

  const totalVolume = useMemo(() => {
    return filteredSales
      .filter((s) => s.status !== 'CANCELLED')
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }, [filteredSales]);

  const handleOpenCancel = (sale: Sale) => {
    if (sale.status === 'CANCELLED') {
      Alert.alert(
        lang === 'ht' ? 'Vant deja anile' : 'Vente déjà annulée',
        lang === 'ht'
          ? `Vant sa a te anile pou rezon: "${sale.cancelReason || 'San rezon'}"`
          : `Cette vente a été annulée: "${sale.cancelReason || 'Sans motif'}"`
      );
      return;
    }
    setCancellingSale(sale);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingSale) return;
    if (!cancelReason.trim()) {
      Alert.alert(
        'Rezon Manke',
        lang === 'ht'
          ? 'Tanpri mete yon rezon pou anile vant sa a (odit komèsyal).'
          : 'Veuillez saisir un motif pour l’audit d’annulation.'
      );
      return;
    }

    await cancelSale(cancellingSale.id, cancelReason.trim());
    setCancelModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextGroup}>
          <View style={styles.badgeRow}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampBadgeText}>REJIS VANT</Text>
            </View>
            <Text style={styles.totalCountText}>
              {filteredSales.length} {lang === 'ht' ? 'tranzaksyon' : 'ventes'} • {formatGourde(totalVolume)}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{t.sales}</Text>
          <Text style={styles.headerSub}>
            {lang === 'ht'
              ? 'Tout fich resi tèmik ak tranzaksyon kès ki anrejistre'
              : 'Historique des reçus émis et gestion des annulations'}
          </Text>
        </View>
      </View>

      {/* 2. Filter Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.merchant.warmGray} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              lang === 'ht'
                ? 'Chèche pa # resi, kliyan, referans...'
                : 'Recherche par # reçu, client, référence...'
            }
            placeholderTextColor={Colors.merchant.warmGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Payment Method Filter Pills */}
        <View style={styles.methodPillRow}>
          {['ALL', 'CASH', 'MONCASH', 'NATCASH', 'CREDIT'].map((method) => {
            const isActive = filterMethod === method;
            const label =
              method === 'ALL'
                ? t.allCategories
                : method === 'CASH'
                ? 'Kach'
                : method === 'CREDIT'
                ? 'Kredi'
                : method;

            return (
              <TouchableOpacity
                key={method}
                style={[styles.methodPill, isActive && styles.methodPillActive]}
                onPress={() => setFilterMethod(method)}
              >
                <Text
                  style={[styles.methodPillText, isActive && styles.methodPillTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Sales List */}
      <FlatList
        data={filteredSales}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isCancelled = item.status === 'CANCELLED';
          const isCredit = item.paymentMethod === 'CREDIT';
          const isMonCash = item.paymentMethod === 'MONCASH';
          const isNatCash = item.paymentMethod === 'NATCASH';

          return (
            <View style={[styles.saleCard, isCancelled && styles.saleCardCancelled]}>
              {/* Top Row: Ticket ID, Date, Amount */}
              <View style={styles.saleTopRow}>
                <View style={styles.ticketIdGroup}>
                  <View style={styles.ticketBadge}>
                    <Text style={styles.ticketBadgeText}>{item.receiptNumber}</Text>
                  </View>
                  <Text style={styles.saleDateText}>
                    {formatDateTime(item.createdAt, lang)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.saleAmount,
                    isCancelled && styles.saleAmountCancelled,
                  ]}
                >
                  {formatGourde(item.totalAmount)}
                </Text>
              </View>

              {/* Middle Row: Customer & Payment Badge */}
              <View style={styles.middleRow}>
                <View style={styles.customerRow}>
                  <User size={13} color={Colors.merchant.warmGray} />
                  <Text style={styles.customerText} numberOfLines={1}>
                    {item.customerName || (lang === 'ht' ? 'Kliyan Senp' : 'Client Comptant')}
                  </Text>
                </View>

                <View style={styles.badgesGroup}>
                  <View
                    style={[
                      styles.methodBadge,
                      isCredit && styles.methodBadgeCredit,
                      isMonCash && styles.methodBadgeMonCash,
                      isNatCash && styles.methodBadgeNatCash,
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodBadgeText,
                        isCredit && styles.methodBadgeTextCredit,
                        isMonCash && styles.methodBadgeTextMonCash,
                        isNatCash && styles.methodBadgeTextNatCash,
                      ]}
                    >
                      {item.paymentMethod}
                    </Text>
                  </View>

                  {isCancelled && (
                    <View style={styles.cancelledBadge}>
                      <Text style={styles.cancelledBadgeText}>
                        {lang === 'ht' ? 'ANILE' : 'ANNULÉE'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Items Line Summary */}
              <View style={styles.itemsSummaryBox}>
                <Text style={styles.itemsSummaryText} numberOfLines={2}>
                  {item.items
                    .map((it) => `${it.quantity}x ${it.productName}`)
                    .join(' • ')}
                </Text>
              </View>

              {/* Bottom Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.receiptActionBtn}
                  onPress={() => onSelectSale(item)}
                  activeOpacity={0.7}
                >
                  <Receipt size={14} color={Colors.merchant.forest} />
                  <Text style={styles.receiptActionBtnText}>
                    {lang === 'ht' ? 'Wè Resi Tèmik' : 'Reçu Thermique'}
                  </Text>
                </TouchableOpacity>

                {!isCancelled && (
                  <TouchableOpacity
                    style={styles.cancelActionBtn}
                    onPress={() => handleOpenCancel(item)}
                    activeOpacity={0.7}
                  >
                    <AlertTriangle size={13} color={Colors.merchant.terracotta} />
                    <Text style={styles.cancelActionBtnText}>
                      {lang === 'ht' ? 'Anile Vant' : 'Annuler'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <History size={28} color={Colors.merchant.warmGray} />
            </View>
            <Text style={styles.emptyTitle}>{t.emptySalesTitle}</Text>
            <Text style={styles.emptySub}>{t.emptySalesDesc}</Text>
          </View>
        }
      />

      {/* 4. Cancel Sale Modal */}
      <Modal
        visible={cancelModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <AlertTriangle size={18} color={Colors.merchant.terracotta} />
                <Text style={styles.sheetTitle}>
                  {lang === 'ht' ? 'Anile Vant la' : 'Annuler la Vente'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCancelModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich anilasyon an"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <Text style={styles.cancelNotice}>
                {lang === 'ht'
                  ? `Èske w sèten ou vle anile vant #${cancellingSale?.receiptNumber} (${formatGourde(
                      cancellingSale?.totalAmount || 0
                    )})? Machandiz yo ap retounen nan stòk la otomatikman.`
                  : `Voulez-vous annuler la vente #${cancellingSale?.receiptNumber} ? Les stocks seront réintégrés.`}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {lang === 'ht' ? 'Rezon anilasyon an (Obligatwa) *' : 'Motif d\'annulation *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Kliyan an pa vle pwodui a ankò, erè kèsye"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                />
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={handleConfirmCancel}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Konfime anilasyon vant lan"
              >
                <Text style={styles.confirmCancelBtnText}>
                  {lang === 'ht' ? 'Konfime Anilasyon an' : 'Confirmer l\'annulation'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.merchant.ivory,
  },
  headerCard: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    padding: 14,
    ...Shadows.card,
  },
  headerTextGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  stampBadge: {
    backgroundColor: Colors.merchant.sage,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
  },
  stampBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  totalCountText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.warmGray,
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
  filterCard: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 9,
    height: 36,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.merchant.ink,
  },
  methodPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodPill: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingVertical: 5,
    alignItems: 'center',
  },
  methodPillActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  methodPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  methodPillTextActive: {
    color: Colors.merchant.ivory,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
    gap: 10,
  },
  saleCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 12,
    ...Shadows.card,
  },
  saleCardCancelled: {
    opacity: 0.65,
    backgroundColor: '#F7F6F3',
  },
  saleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketBadge: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ticketBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  saleDateText: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  saleAmount: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  saleAmountCancelled: {
    textDecorationLine: 'line-through',
    color: Colors.merchant.warmGray,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  customerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  methodBadge: {
    backgroundColor: Colors.merchant.greenLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.green,
  },
  methodBadgeCredit: {
    backgroundColor: Colors.merchant.terracottaLight,
  },
  methodBadgeTextCredit: {
    color: Colors.merchant.terracotta,
  },
  methodBadgeMonCash: {
    backgroundColor: Colors.moncash.light,
  },
  methodBadgeTextMonCash: {
    color: Colors.moncash.DEFAULT,
  },
  methodBadgeNatCash: {
    backgroundColor: Colors.natcash.light,
  },
  methodBadgeTextNatCash: {
    color: Colors.natcash.DEFAULT,
  },
  cancelledBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  cancelledBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.warmGray,
  },
  itemsSummaryBox: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.merchant.borderLight,
    padding: 7,
    marginBottom: 8,
  },
  itemsSummaryText: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.borderLight,
  },
  receiptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.sageLight,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  receiptActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.terracottaLight,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.3)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.merchant.paper,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  emptySub: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 53, 41, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.merchant.paper,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.merchant.ink,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    padding: 14,
  },
  cancelNotice: {
    fontSize: 12,
    color: Colors.merchant.inkMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: Colors.merchant.ink,
  },
  sheetFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
    backgroundColor: Colors.merchant.paper,
  },
  confirmCancelBtn: {
    backgroundColor: Colors.merchant.terracotta,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
});
