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
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Banknote,
  Edit,
  X,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  CreditCard,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Customer, PaymentMethod } from '../types';
import { formatGourde } from '../utils/formatters';

export const CustomersScreen: React.FC = () => {
  const { t, lang, customers, saveCustomer, recordDebtPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDebtOnly, setFilterDebtOnly] = useState<boolean>(false);

  // Add / Edit Customer Modal
  const [customerModalVisible, setCustomerModalVisible] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [custLimit, setCustLimit] = useState<string>('');
  const [custNotes, setCustNotes] = useState<string>('');

  // Pay Debt Modal
  const [payDebtModalVisible, setPayDebtModalVisible] = useState<boolean>(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [paymentAmountStr, setPaymentAmountStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const totalDebt = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
  }, [customers]);

  const indebtedCount = useMemo(() => {
    return customers.filter((c) => c.currentDebt > 0).length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (filterDebtOnly && c.currentDebt <= 0) return false;
      const search = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(search) ||
        (c.phone && c.phone.includes(search)) ||
        (c.address && c.address.toLowerCase().includes(search))
      );
    });
  }, [customers, filterDebtOnly, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustLimit('');
    setCustNotes('');
    setCustomerModalVisible(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone || '');
    setCustAddress(c.address || '');
    setCustLimit(c.creditLimit ? c.creditLimit.toString() : '');
    setCustNotes(c.notes || '');
    setCustomerModalVisible(true);
  };

  const handleSaveCustomer = async () => {
    if (!custName.trim()) {
      Alert.alert('Erè', lang === 'ht' ? 'Tanpri mete non kliyan an' : 'Veuillez saisir le nom');
      return;
    }

    const limit = parseFloat(custLimit) || undefined;
    const newCust: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: custName.trim(),
      phone: custPhone.trim() || undefined,
      address: custAddress.trim() || undefined,
      notes: custNotes.trim() || undefined,
      creditLimit: limit,
      currentDebt: editingCustomer ? editingCustomer.currentDebt : 0,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    await saveCustomer(newCust);
    setCustomerModalVisible(false);
  };

  const handleOpenPayDebt = (c: Customer) => {
    setPayingCustomer(c);
    setPaymentAmountStr(c.currentDebt.toString());
    setPaymentMethod('CASH');
    setPaymentRef('');
    setPaymentNotes('');
    setPayDebtModalVisible(true);
  };

  const handleConfirmPayDebt = async () => {
    if (!payingCustomer) return;
    const amt = parseFloat(paymentAmountStr) || 0;
    if (amt <= 0) {
      Alert.alert('Erè', lang === 'ht' ? 'Montan an dwe plis pase 0' : 'Montant invalide');
      return;
    }

    await recordDebtPayment(
      payingCustomer.id,
      amt,
      paymentMethod,
      paymentRef.trim() || undefined,
      paymentNotes.trim() || undefined
    );

    setPayDebtModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextGroup}>
          <View style={styles.badgeRow}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampBadgeText}>REJIS KLIYAN & DÈT</Text>
            </View>
            <Text style={styles.totalCountText}>
              {customers.length} {lang === 'ht' ? 'kliyan' : 'clients'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{t.customers}</Text>
          <Text style={styles.headerSub}>
            {lang === 'ht'
              ? 'Kontwole kaye dèt kliyan, anrejistre vèsman ak limit kredi'
              : 'Gestion du carnet de crédit et remboursements'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Plus size={16} color={Colors.merchant.ivory} strokeWidth={2.4} />
          <Text style={styles.addBtnText}>{t.addCustomer}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Total Debt Notice Banner */}
      {totalDebt > 0 && (
        <View style={styles.debtAlertBanner}>
          <View style={styles.debtAlertIconBox}>
            <AlertTriangle size={17} color={Colors.merchant.terracotta} />
          </View>
          <View style={styles.debtAlertTextGroup}>
            <Text style={styles.debtAlertTitle}>
              {lang === 'ht' ? 'Total Dèt Dehò:' : 'Créances Totales:'}{' '}
              <Text style={styles.debtAlertAmount}>{formatGourde(totalDebt)}</Text>
            </Text>
            <Text style={styles.debtAlertSub}>
              {indebtedCount} {lang === 'ht' ? 'kliyan gen dèt ki poko peye nèt' : 'client(s) avec solde débiteur'}
            </Text>
          </View>
        </View>
      )}

      {/* 3. Search & Filter Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.merchant.warmGray} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              lang === 'ht' ? 'Chèche pa non, telefòn, adrès...' : 'Recherche par nom, tél...'
            }
            placeholderTextColor={Colors.merchant.warmGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterToggle, filterDebtOnly && styles.filterToggleActive]}
          onPress={() => setFilterDebtOnly(!filterDebtOnly)}
        >
          <Text
            style={[styles.filterToggleText, filterDebtOnly && styles.filterToggleTextActive]}
          >
            {lang === 'ht' ? 'Kliyan ki dwe sèlman' : 'Débiteurs uniquement'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const hasDebt = item.currentDebt > 0;

          return (
            <View style={[styles.customerCard, hasDebt && styles.customerCardDebt]}>
              <View style={styles.cardTop}>
                <View style={styles.custLeft}>
                  <View style={[styles.avatarCircle, hasDebt && styles.avatarCircleDebt]}>
                    <Text style={[styles.avatarText, hasDebt && styles.avatarTextDebt]}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.custInfo}>
                    <Text style={styles.custName}>{item.name}</Text>
                    {item.phone && (
                      <View style={styles.custMetaRow}>
                        <Phone size={11} color={Colors.merchant.warmGray} />
                        <Text style={styles.custMetaText}>{item.phone}</Text>
                      </View>
                    )}
                    {item.address && (
                      <View style={styles.custMetaRow}>
                        <MapPin size={11} color={Colors.merchant.warmGray} />
                        <Text style={styles.custMetaText}>{item.address}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Debt Status Box */}
                <View style={styles.debtBox}>
                  <Text style={styles.debtLabel}>{t.totalDebt}</Text>
                  <Text
                    style={[
                      styles.debtValue,
                      hasDebt ? styles.debtValueWarn : styles.debtValueZero,
                    ]}
                  >
                    {formatGourde(item.currentDebt)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                {hasDebt ? (
                  <TouchableOpacity
                    style={styles.payDebtBtn}
                    onPress={() => handleOpenPayDebt(item)}
                    activeOpacity={0.7}
                  >
                    <Banknote size={14} color={Colors.merchant.ivory} />
                    <Text style={styles.payDebtBtnText}>{t.recordPayment}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.paidInFullBadge}>
                    <CheckCircle2 size={13} color={Colors.merchant.green} />
                    <Text style={styles.paidInFullText}>
                      {lang === 'ht' ? 'A Jou' : 'À jour'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.7}
                >
                  <Edit size={13} color={Colors.merchant.inkMuted} />
                  <Text style={styles.editBtnText}>{t.edit}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Users size={28} color={Colors.merchant.warmGray} />
            </View>
            <Text style={styles.emptyTitle}>{t.emptyCustomersTitle}</Text>
            <Text style={styles.emptySub}>{t.emptyCustomersDesc}</Text>
          </View>
        }
      />

      {/* 5. Add / Edit Customer Modal */}
      <Modal
        visible={customerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingCustomer ? t.edit : t.addCustomer}
              </Text>
              <TouchableOpacity
                onPress={() => setCustomerModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich kliyan an"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.customerName} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Madan Sara Manman Mari"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={custName}
                  onChangeText={setCustName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.phone}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="Eg: +509 3700-0000"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={custPhone}
                  onChangeText={setCustPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.address}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Ri Channmas #12, Pòtoprens"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={custAddress}
                  onChangeText={setCustAddress}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {lang === 'ht' ? 'Limit Kredi' : 'Limite de crédit'} (HTG)
                </Text>
                <TextInput
                  style={styles.inputMono}
                  keyboardType="numeric"
                  placeholder="0 (San limit)"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={custLimit}
                  onChangeText={setCustLimit}
                />
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCustomer}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Anrejistre kliyan"
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.saveBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 6. Pay Debt Modal */}
      <Modal
        visible={payDebtModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPayDebtModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.payDebtHeaderLeft}>
                <Banknote size={18} color={Colors.merchant.green} />
                <Text style={styles.sheetTitle}>{t.recordPayment}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setPayDebtModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich peman dèt la"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.payDebtBanner}>
                <Text style={styles.payDebtClientName}>{payingCustomer?.name}</Text>
                <Text style={styles.payDebtCurrentTotal}>
                  {lang === 'ht' ? 'Dèt Aktyèl:' : 'Dette:'}{' '}
                  <Text style={styles.payDebtTotalValue}>{formatGourde(payingCustomer?.currentDebt || 0)}</Text>
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{lang === 'ht' ? 'Montan Peye (HTG) *' : 'Montant versé *'}</Text>
                <TextInput
                  style={styles.inputMono}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={paymentAmountStr}
                  onChangeText={setPaymentAmountStr}
                />
              </View>

              {/* Method Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{lang === 'ht' ? 'Mòd Peman:' : 'Mode:'}</Text>
                <View style={styles.methodRow}>
                  <TouchableOpacity
                    style={[
                      styles.methodPill,
                      paymentMethod === 'CASH' && styles.methodPillActive,
                    ]}
                    onPress={() => setPaymentMethod('CASH')}
                  >
                    <Text
                      style={[
                        styles.methodPillText,
                        paymentMethod === 'CASH' && styles.methodPillTextActive,
                      ]}
                    >
                      Kach
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodPill,
                      paymentMethod === 'MONCASH' && styles.methodPillActiveMonCash,
                    ]}
                    onPress={() => setPaymentMethod('MONCASH')}
                  >
                    <Text
                      style={[
                        styles.methodPillText,
                        paymentMethod === 'MONCASH' && styles.methodPillTextActive,
                      ]}
                    >
                      MonCash
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodPill,
                      paymentMethod === 'NATCASH' && styles.methodPillActiveNatCash,
                    ]}
                    onPress={() => setPaymentMethod('NATCASH')}
                  >
                    <Text
                      style={[
                        styles.methodPillText,
                        paymentMethod === 'NATCASH' && styles.methodPillTextActive,
                      ]}
                    >
                      NatCash
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {(paymentMethod === 'MONCASH' || paymentMethod === 'NATCASH') && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{lang === 'ht' ? 'Referans Tranzaksyon' : 'Référence'}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Eg: TX-84920"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={paymentRef}
                    onChangeText={setPaymentRef}
                  />
                </View>
              )}
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPayDebt}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.confirmPayBtnText}>
                  {lang === 'ht' ? 'Valide Peman Dèt la' : 'Valider le paiement'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  headerTextGroup: {
    flex: 1,
    marginRight: 10,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.forest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.forestDark,
    ...Shadows.card,
  },
  addBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  debtAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.terracottaLight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(198, 106, 69, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  debtAlertIconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(198, 106, 69, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtAlertTextGroup: {
    flex: 1,
  },
  debtAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.terracottaDark,
  },
  debtAlertAmount: {
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
  },
  debtAlertSub: {
    fontSize: 10,
    color: Colors.merchant.terracotta,
    marginTop: 1,
  },
  filterCard: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 9,
    height: 36,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.merchant.ink,
  },
  filterToggle: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  filterToggleActive: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderColor: Colors.merchant.terracotta,
  },
  filterToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  filterToggleTextActive: {
    color: Colors.merchant.terracotta,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
    gap: 10,
  },
  customerCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 12,
    ...Shadows.card,
  },
  customerCardDebt: {
    borderLeftWidth: 3.5,
    borderLeftColor: Colors.merchant.terracotta,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  custLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.merchant.sage,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleDebt: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderColor: 'rgba(198, 106, 69, 0.4)',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  avatarTextDebt: {
    color: Colors.merchant.terracotta,
  },
  custInfo: {
    flex: 1,
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.merchant.ink,
    marginBottom: 2,
  },
  custMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  custMetaText: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
  },
  debtBox: {
    alignItems: 'flex-end',
  },
  debtLabel: {
    fontSize: 9,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  debtValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    marginTop: 1,
  },
  debtValueWarn: {
    color: Colors.merchant.terracotta,
  },
  debtValueZero: {
    color: Colors.merchant.green,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.borderLight,
  },
  payDebtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.merchant.green,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
  },
  payDebtBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  paidInFullBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.sageLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  paidInFullText: {
    color: Colors.merchant.forest,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 10,
    color: Colors.merchant.inkMuted,
    fontWeight: '600',
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
  payDebtHeaderLeft: {
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
  payDebtBanner: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 10,
    marginBottom: 12,
  },
  payDebtClientName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  payDebtCurrentTotal: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
    marginTop: 2,
  },
  payDebtTotalValue: {
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
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
  inputMono: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.ink,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodPill: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  methodPillActive: {
    backgroundColor: Colors.merchant.greenLight,
    borderColor: Colors.merchant.green,
  },
  methodPillActiveMonCash: {
    backgroundColor: Colors.moncash.light,
    borderColor: Colors.moncash.DEFAULT,
  },
  methodPillActiveNatCash: {
    backgroundColor: Colors.natcash.light,
    borderColor: Colors.natcash.DEFAULT,
  },
  methodPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  methodPillTextActive: {
    color: Colors.merchant.ink,
    fontWeight: '800',
  },
  sheetFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
    backgroundColor: Colors.merchant.paper,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.forest,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.forestDark,
  },
  saveBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  confirmPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.green,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
  },
  confirmPayBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
});
