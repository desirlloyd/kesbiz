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
  Receipt,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Fuel,
  Home,
  Users,
  Truck,
  Coffee,
  HelpCircle,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { formatGourde, formatDate } from '../utils/formatters';

export const ExpensesScreen: React.FC = () => {
  const { t, lang, expenses, saveExpense, deleteExpense } = useApp();

  const [expenseModalVisible, setExpenseModalVisible] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Form state
  const [title, setTitle] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('UTILITIES');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategoryFilter === 'ALL') return true;
      return e.category === selectedCategoryFilter;
    });
  }, [expenses, selectedCategoryFilter]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleOpenAdd = () => {
    setTitle('');
    setAmountStr('');
    setCategory('UTILITIES');
    setPaymentMethod('CASH');
    setReference('');
    setNotes('');
    setExpenseModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erè', lang === 'ht' ? 'Tanpri mete yon deskripsyon pou depans lan' : 'Titre requis');
      return;
    }
    const amt = parseFloat(amountStr) || 0;
    if (amt <= 0) {
      Alert.alert('Erè', lang === 'ht' ? 'Montan an dwe plis pase 0' : 'Montant invalide');
      return;
    }

    const exp: Expense = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: amt,
      category,
      paymentMethod,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      expenseDate: new Date().toISOString(),
    };

    await saveExpense(exp);
    setExpenseModalVisible(false);
  };

  const handleDelete = (exp: Expense) => {
    Alert.alert(
      lang === 'ht' ? 'Efase Depans ?' : 'Supprimer la dépense ?',
      lang === 'ht'
        ? `Èske w vle retire depans "${exp.title}" (${formatGourde(exp.amount)})?`
        : `Voulez-vous supprimer cette dépense ?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(exp.id);
          },
        },
      ]
    );
  };

  const getCategoryLabel = (cat: ExpenseCategory) => {
    return t.expenseCategories[cat] || cat;
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextGroup}>
          <View style={styles.badgeRow}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampBadgeText}>REJIS DEPANS</Text>
            </View>
            <Text style={styles.totalCountText}>
              {filteredExpenses.length} {lang === 'ht' ? 'depans' : 'dépenses'} • {formatGourde(totalExpenses)}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{t.expenses}</Text>
          <Text style={styles.headerSub}>
            {lang === 'ht'
              ? 'Kontwole gaz Delco, lwaye, transpò, salè ak lòt chaj'
              : 'Gestion des charges opérationnelles de la boutique'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Plus size={16} color={Colors.merchant.ivory} strokeWidth={2.4} />
          <Text style={styles.addBtnText}>{t.addExpense}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Category Filter Pills */}
      <View style={styles.filterCard}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['ALL', 'UTILITIES', 'RENT', 'SALARY', 'TRANSPORT', 'MEALS', 'OTHER']}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isActive = selectedCategoryFilter === item;
            const label =
              item === 'ALL'
                ? t.allCategories
                : item === 'UTILITIES'
                ? 'Gaz Delco'
                : item === 'RENT'
                ? 'Lwaye'
                : item === 'SALARY'
                ? 'Salè'
                : item === 'TRANSPORT'
                ? 'Transpò'
                : item === 'MEALS'
                ? 'Manje'
                : 'Lòt';

            return (
              <TouchableOpacity
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSelectedCategoryFilter(item)}
              >
                <Text
                  style={[styles.filterPillText, isActive && styles.filterPillTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 3. Expenses List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <View style={styles.cardTop}>
              <View style={styles.expenseLeft}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {getCategoryLabel(item.category)}
                  </Text>
                </View>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseDate}>
                  {formatDate(item.expenseDate, lang)} • {item.paymentMethod}
                </Text>
                {item.notes && <Text style={styles.expenseNotes}>{item.notes}</Text>}
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>
                  -{formatGourde(item.amount)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={Colors.merchant.terracotta} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Receipt size={28} color={Colors.merchant.warmGray} />
            </View>
            <Text style={styles.emptyTitle}>{t.emptyExpensesTitle}</Text>
            <Text style={styles.emptySub}>{t.emptyExpensesDesc}</Text>
          </View>
        }
      />

      {/* 4. Add Expense Modal */}
      <Modal
        visible={expenseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t.addExpense}</Text>
              <TouchableOpacity
                onPress={() => setExpenseModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich depans lan"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.expenseTitle} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Gaz dèlko 5 galon, Lwaye lokal"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.expenseAmount} *</Text>
                <TextInput
                  style={styles.inputMono}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={amountStr}
                  onChangeText={setAmountStr}
                />
              </View>

              {/* Category Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.category} *</Text>
                <View style={styles.categoryGrid}>
                  {(
                    [
                      'UTILITIES',
                      'RENT',
                      'SALARY',
                      'TRANSPORT',
                      'MEALS',
                      'OTHER',
                    ] as ExpenseCategory[]
                  ).map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catChoiceBtn,
                          isSelected && styles.catChoiceBtnActive,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.catChoiceText,
                            isSelected && styles.catChoiceTextActive,
                          ]}
                        >
                          {getCategoryLabel(cat)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{lang === 'ht' ? 'Nòt' : 'Remarques'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nòt siplemantè opsyonèl"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Anrejistre depans"
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.saveBtnText}>{t.save}</Text>
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
    backgroundColor: Colors.merchant.terracottaLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.4)',
  },
  stampBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
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
  filterCard: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterScroll: {
    gap: 6,
  },
  filterPill: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterPillActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  filterPillTextActive: {
    color: Colors.merchant.ivory,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
    gap: 10,
  },
  expenseCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 12,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseLeft: {
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  expenseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  expenseDate: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },
  expenseNotes: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
  },
  deleteBtn: {
    backgroundColor: Colors.merchant.terracottaLight,
    padding: 6,
    borderRadius: 5,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChoiceBtn: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  catChoiceBtnActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  catChoiceText: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    fontWeight: '600',
  },
  catChoiceTextActive: {
    color: Colors.merchant.ivory,
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
});
