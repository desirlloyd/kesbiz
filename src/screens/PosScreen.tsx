import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
  X,
  Package,
  ArrowRight,
  User,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Product, PaymentMethod, Sale } from '../types';
import { formatGourde } from '../utils/formatters';

interface PosScreenProps {
  onSaleCompleted: (sale: Sale) => void;
}

export const PosScreen: React.FC<PosScreenProps> = ({ onSaleCompleted }) => {
  const {
    t,
    lang,
    products,
    categories,
    customers,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalCost,
    createSale,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkoutVisible, setCheckoutVisible] = useState<boolean>(false);

  // Checkout form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [discountStr, setDiscountStr] = useState<string>('');
  const [amountPaidStr, setAmountPaidStr] = useState<string>('');

  const { width } = useWindowDimensions();
  const numColumns = width >= 960 ? 4 : width >= 600 ? 3 : 2;

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Calculations for checkout
  const discount = parseFloat(discountStr) || 0;
  const netTotal = Math.max(0, cartSubtotal - discount);
  const amountPaid = parseFloat(amountPaidStr) || 0;

  const changeDue = amountPaid > netTotal ? amountPaid - netTotal : 0;
  const debtAmount =
    paymentMethod === 'CREDIT'
      ? Math.max(0, netTotal - amountPaid)
      : amountPaid < netTotal && paymentMethod !== 'CASH'
      ? Math.max(0, netTotal - amountPaid)
      : 0;

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      Alert.alert(t.cart, t.emptyCartSub);
      return;
    }
    setAmountPaidStr(netTotal.toString());
    setDiscountStr('0');
    setPaymentRef('');
    setPaymentMethod('CASH');
    setSelectedCustomerId('');
    setCheckoutVisible(true);
  };

  const handleSelectQuickCash = (extra: number) => {
    const current = parseFloat(amountPaidStr) || 0;
    setAmountPaidStr((current + extra).toString());
  };

  const handleSetExactCash = () => {
    setAmountPaidStr(netTotal.toString());
  };

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      Alert.alert(
        'Kliyan Obligatwa',
        lang === 'ht'
          ? 'Ou dwe chwazi yon kliyan pou yon vant a kredi (swivi dèt).'
          : 'Veuillez sélectionner un client pour enregistrer une créance.'
      );
      return;
    }

    if ((paymentMethod === 'MONCASH' || paymentMethod === 'NATCASH') && !paymentRef.trim()) {
      Alert.alert(
        'Nimewo Tranzaksyon Manke',
        lang === 'ht'
          ? `Tanpri mete nimewo tranzaksyon / referans ${paymentMethod} la.`
          : `Numéro de transaction ${paymentMethod} requis.`
      );
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);

    const tempSaleId = `sale-${Date.now()}`;
    const saleItems = cart.map((c, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      saleId: tempSaleId,
      productId: c.product.id,
      productName: c.product.name,
      quantity: c.quantity,
      unitPrice: c.product.salePrice,
      unitCost: c.product.buyPrice,
      totalPrice: c.quantity * c.product.salePrice,
      totalCost: c.quantity * c.product.buyPrice,
    }));

    const newSale = await createSale({
      items: saleItems,
      subtotal: cartSubtotal,
      discount: discount,
      totalAmount: netTotal,
      totalCost: cartTotalCost,
      amountPaid: paymentMethod === 'CREDIT' ? amountPaid : amountPaid || netTotal,
      debtAmount: debtAmount,
      changeGiven: changeDue,
      paymentMethod: paymentMethod,
      paymentReference: paymentRef.trim() || undefined,
      paymentStatus: debtAmount > 0 ? (amountPaid > 0 ? 'PARTIAL' : 'UNPAID') : 'PAID',
      status: 'COMPLETED',
      customerId: selectedCustomerId || undefined,
      customerName: customer ? customer.name : undefined,
    });

    setCheckoutVisible(false);
    clearCart();
    onSaleCompleted(newSale);
  };

  return (
    <View style={styles.container}>
      {/* 1. Search Bar & Category Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.merchant.warmGray} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              lang === 'ht' ? 'Chèche pa non pwodui oswa kòdbat...' : 'Recherche par nom ou code...'
            }
            placeholderTextColor={Colors.merchant.warmGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.merchant.inkMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Scroll Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'all' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'all' && styles.categoryTextActive,
              ]}
            >
              {t.allCategories}
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 2. Product Grid Catalog */}
      <FlatList
        key={`pos-grid-${numColumns}`}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridWrapper}
        renderItem={({ item }) => {
          const cartItem = cart.find((c) => c.product.id === item.id);
          const isOutOfStock = item.stockQuantity <= 0;
          const isLowStock = item.stockQuantity <= item.minStockAlert;

          return (
            <TouchableOpacity
              style={[
                styles.productCard,
                isOutOfStock && styles.productCardDisabled,
                cartItem && styles.productCardInCart,
              ]}
              onPress={() => !isOutOfStock && addToCart(item, 1)}
              activeOpacity={0.75}
              disabled={isOutOfStock}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${formatGourde(item.salePrice)}, ${
                isOutOfStock
                  ? t.outOfStock
                  : `${item.stockQuantity} ${item.unit} nan stòk`
              }${cartItem ? `, ${cartItem.quantity} nan panyen` : ''}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>{item.unit.toUpperCase()}</Text>
                </View>

                <View
                  style={[
                    styles.stockBadge,
                    isLowStock && styles.stockBadgeLow,
                    isOutOfStock && styles.stockBadgeOut,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockBadgeText,
                      isLowStock && styles.stockBadgeTextLow,
                      isOutOfStock && styles.stockBadgeTextOut,
                    ]}
                  >
                    {isOutOfStock
                      ? t.outOfStock
                      : `${item.stockQuantity} ${item.unit}`}
                  </Text>
                </View>
              </View>

              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>{formatGourde(item.salePrice)}</Text>
                {cartItem && (
                  <View style={styles.cartQtyBadge}>
                    <Text style={styles.cartQtyText}>×{cartItem.quantity}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Package size={28} color={Colors.merchant.warmGray} />
            </View>
            <Text style={styles.emptyText}>
              {lang === 'ht' ? 'Pa gen pwodui ki koresponn' : 'Aucun produit trouvé'}
            </Text>
          </View>
        }
      />

      {/* 3. Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <View style={styles.floatingCartBar}>
          <View style={styles.cartBarInfo}>
            <View style={styles.cartBadgeSmall}>
              <Text style={styles.cartBadgeSmallText}>{cart.length}</Text>
            </View>
            <View>
              <Text style={styles.cartBarLabel}>
                {lang === 'ht' ? 'Panye Kès:' : 'Total Panier:'}
              </Text>
              <Text style={styles.cartBarTotal}>{formatGourde(cartSubtotal)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleOpenCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>
              {lang === 'ht' ? 'Valide Vant' : 'Encaisser'}
            </Text>
            <ArrowRight size={16} color={Colors.merchant.ivory} />
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Checkout Drawer / Modal */}
      <Modal
        visible={checkoutVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderTitleGroup}>
                <ShoppingCart size={18} color={Colors.merchant.forest} strokeWidth={2.4} />
                <Text style={styles.sheetTitle}>
                  {lang === 'ht' ? 'Valide Vant la (Kès)' : 'Validation de la Vente'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCheckoutVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel={lang === 'ht' ? 'Fèmen fich kès la' : 'Fermer la modal'}
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Cart Items Review with quantity controls */}
              <View style={styles.itemsReviewBox}>
                <Text style={styles.formSectionTitle}>
                  {lang === 'ht' ? 'ATIK KI NAN RESI A' : 'ARTICLES DU TICKET'}
                </Text>
                {cart.map((c) => (
                  <View key={c.product.id} style={styles.cartReviewRow}>
                    <View style={styles.reviewItemInfo}>
                      <Text style={styles.reviewItemName} numberOfLines={1}>
                        {c.product.name}
                      </Text>
                      <Text style={styles.reviewItemPrice}>
                        {formatGourde(c.product.salePrice)} × {c.quantity}
                      </Text>
                    </View>

                    <View style={styles.qtyControlRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQty(c.product.id, c.quantity - 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`Diminye kantite ${c.product.name}`}
                        hitSlop={TouchTargets.hitSlopSm}
                      >
                        <Minus size={14} color={Colors.merchant.ink} />
                      </TouchableOpacity>

                      <Text style={styles.qtyValueText}>{c.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateCartQty(c.product.id, c.quantity + 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`Ogmante kantite ${c.product.name}`}
                        hitSlop={TouchTargets.hitSlopSm}
                      >
                        <Plus size={14} color={Colors.merchant.ink} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => removeFromCart(c.product.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Retire ${c.product.name} nan panyen`}
                        hitSlop={TouchTargets.hitSlopSm}
                      >
                        <Trash2 size={14} color={Colors.merchant.terracotta} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total Banner */}
              <View style={styles.totalHeroCard}>
                <Text style={styles.totalHeroLabel}>
                  {lang === 'ht' ? 'TOTAL POU PEYE' : 'TOTAL À PAYER'}
                </Text>
                <Text style={styles.totalHeroAmount}>{formatGourde(netTotal)}</Text>
              </View>

              {/* Payment Method Selector */}
              <Text style={styles.formSectionTitle}>
                {lang === 'ht' ? 'CHWAZI MÒD PEMAN:' : 'MODE DE PAIEMENT:'}
              </Text>
              <View style={styles.paymentMethodsGrid}>
                {/* Cash */}
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'CASH' && styles.methodBtnCash,
                  ]}
                  onPress={() => setPaymentMethod('CASH')}
                >
                  <Banknote
                    size={18}
                    color={paymentMethod === 'CASH' ? Colors.merchant.green : Colors.merchant.inkMuted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === 'CASH' && styles.methodTextActive,
                    ]}
                  >
                    Kach
                  </Text>
                </TouchableOpacity>

                {/* MonCash */}
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'MONCASH' && styles.methodBtnMonCash,
                  ]}
                  onPress={() => setPaymentMethod('MONCASH')}
                >
                  <Smartphone
                    size={18}
                    color={paymentMethod === 'MONCASH' ? Colors.moncash.DEFAULT : Colors.merchant.inkMuted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === 'MONCASH' && styles.methodTextActive,
                    ]}
                  >
                    MonCash
                  </Text>
                </TouchableOpacity>

                {/* NatCash */}
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'NATCASH' && styles.methodBtnNatCash,
                  ]}
                  onPress={() => setPaymentMethod('NATCASH')}
                >
                  <Smartphone
                    size={18}
                    color={paymentMethod === 'NATCASH' ? Colors.natcash.DEFAULT : Colors.merchant.inkMuted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === 'NATCASH' && styles.methodTextActive,
                    ]}
                  >
                    NatCash
                  </Text>
                </TouchableOpacity>

                {/* Credit */}
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'CREDIT' && styles.methodBtnCredit,
                  ]}
                  onPress={() => setPaymentMethod('CREDIT')}
                >
                  <CreditCard
                    size={18}
                    color={paymentMethod === 'CREDIT' ? Colors.merchant.terracotta : Colors.merchant.inkMuted}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      paymentMethod === 'CREDIT' && styles.methodTextActive,
                    ]}
                  >
                    Kredi (Dèt)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Customer Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {t.selectCustomer} {paymentMethod === 'CREDIT' && '*'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
                  <TouchableOpacity
                    style={[
                      styles.customerChip,
                      !selectedCustomerId && styles.customerChipActive,
                    ]}
                    onPress={() => setSelectedCustomerId('')}
                  >
                    <Text
                      style={[
                        styles.customerChipText,
                        !selectedCustomerId && styles.customerChipTextActive,
                      ]}
                    >
                      {t.walkInCustomer}
                    </Text>
                  </TouchableOpacity>

                  {customers.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.customerChip,
                        selectedCustomerId === c.id && styles.customerChipActive,
                      ]}
                      onPress={() => setSelectedCustomerId(c.id)}
                    >
                      <Text
                        style={[
                          styles.customerChipText,
                          selectedCustomerId === c.id && styles.customerChipTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* MonCash / NatCash Reference Input */}
              {(paymentMethod === 'MONCASH' || paymentMethod === 'NATCASH') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {lang === 'ht' ? 'Nimewo Tranzaksyon / Ref *' : 'Référence transaction *'}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Eg: TX-84920394"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={paymentRef}
                    onChangeText={setPaymentRef}
                  />
                </View>
              )}

              {/* Cash Tendered & Quick Calculator (For CASH) */}
              {paymentMethod === 'CASH' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.amountPaid} (HTG)</Text>
                  <TextInput
                    style={styles.textInputMono}
                    keyboardType="numeric"
                    value={amountPaidStr}
                    onChangeText={setAmountPaidStr}
                    placeholder="0"
                  />

                  {/* Quick Cash Suggestions */}
                  <View style={styles.quickCashRow}>
                    <TouchableOpacity
                      style={styles.quickCashBtn}
                      onPress={handleSetExactCash}
                    >
                      <Text style={styles.quickCashBtnText}>Egzak</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickCashBtn}
                      onPress={() => handleSelectQuickCash(100)}
                    >
                      <Text style={styles.quickCashBtnText}>+100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickCashBtn}
                      onPress={() => handleSelectQuickCash(250)}
                    >
                      <Text style={styles.quickCashBtnText}>+250</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickCashBtn}
                      onPress={() => handleSelectQuickCash(500)}
                    >
                      <Text style={styles.quickCashBtnText}>+500</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickCashBtn}
                      onPress={() => handleSelectQuickCash(1000)}
                    >
                      <Text style={styles.quickCashBtnText}>+1 000</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Change Due Box */}
                  <View style={styles.changeDueBox}>
                    <Text style={styles.changeDueLabel}>{t.changeDue}:</Text>
                    <Text style={styles.changeDueAmount}>{formatGourde(changeDue)}</Text>
                  </View>
                </View>
              )}

              {/* Debt Calculation Box for Credit */}
              {paymentMethod === 'CREDIT' && (
                <View style={styles.debtAlertBox}>
                  <Text style={styles.debtAlertLabel}>{t.totalDebt}:</Text>
                  <Text style={styles.debtAlertAmount}>{formatGourde(debtAmount)}</Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Confirm Action */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.confirmSaleBtn}
                onPress={handleConfirmSale}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.confirmSaleBtnText}>
                  {lang === 'ht' ? 'Konfime & Enprime Resi' : 'Valider & Imprimer'}
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
  filterSection: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.merchant.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.sans,
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 8,
  },
  categoryPill: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryPillActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.merchant.ivory,
  },
  gridContent: {
    padding: 12,
    paddingBottom: 90,
  },
  gridWrapper: {
    gap: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.merchant.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 10,
    marginBottom: 10,
    ...Shadows.card,
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  productCardInCart: {
    borderColor: Colors.merchant.green,
    borderWidth: 1.5,
    backgroundColor: Colors.merchant.greenLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  unitBadge: {
    backgroundColor: Colors.merchant.sage,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  unitBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  stockBadge: {
    backgroundColor: Colors.merchant.card,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
  },
  stockBadgeLow: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderColor: 'rgba(198, 106, 69, 0.4)',
  },
  stockBadgeOut: {
    backgroundColor: '#F3F4F6',
  },
  stockBadgeText: {
    fontSize: 9,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  stockBadgeTextLow: {
    color: Colors.merchant.terracotta,
    fontWeight: '700',
  },
  stockBadgeTextOut: {
    color: Colors.merchant.warmGray,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
    minHeight: 32,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  cartQtyBadge: {
    backgroundColor: Colors.merchant.green,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cartQtyText: {
    color: Colors.merchant.ivory,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
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
  emptyText: {
    fontSize: 12,
    color: Colors.merchant.warmGray,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.merchant.forest,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.floating,
  },
  cartBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBadgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.merchant.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeSmallText: {
    color: Colors.merchant.ivory,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  cartBarLabel: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
  },
  cartBarTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.green,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
  },
  checkoutBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
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
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
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
  sheetHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.merchant.ink,
    letterSpacing: -0.3,
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
  itemsReviewBox: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 10,
    marginBottom: 12,
  },
  formSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  cartReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.borderLight,
  },
  reviewItemInfo: {
    flex: 1,
    marginRight: 8,
  },
  reviewItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  reviewItemPrice: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: Colors.merchant.paper,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValueText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: Colors.merchant.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  totalHeroCard: {
    backgroundColor: Colors.merchant.forest,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalHeroLabel: {
    color: '#9AC4AD',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.8,
  },
  totalHeroAmount: {
    color: Colors.merchant.ivory,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
  },
  methodBtnCash: {
    borderColor: Colors.merchant.green,
    borderWidth: 1.5,
    backgroundColor: Colors.merchant.greenLight,
  },
  methodBtnMonCash: {
    borderColor: Colors.moncash.DEFAULT,
    borderWidth: 1.5,
    backgroundColor: Colors.moncash.light,
  },
  methodBtnNatCash: {
    borderColor: Colors.natcash.DEFAULT,
    borderWidth: 1.5,
    backgroundColor: Colors.natcash.light,
  },
  methodBtnCredit: {
    borderColor: Colors.merchant.terracotta,
    borderWidth: 1.5,
    backgroundColor: Colors.merchant.terracottaLight,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  methodTextActive: {
    color: Colors.merchant.ink,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: Colors.merchant.ink,
  },
  textInputMono: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.ink,
  },
  customerScroll: {
    gap: 6,
  },
  customerChip: {
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginRight: 6,
  },
  customerChipActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  customerChipText: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
  },
  customerChipTextActive: {
    color: Colors.merchant.ivory,
    fontWeight: '700',
  },
  quickCashRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  quickCashBtn: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 5,
    paddingVertical: 5,
    alignItems: 'center',
  },
  quickCashBtnText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  changeDueBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.merchant.greenLight,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 106, 0.3)',
    borderRadius: 7,
    padding: 10,
    marginTop: 8,
  },
  changeDueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.greenDark,
  },
  changeDueAmount: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.greenDark,
  },
  debtAlertBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.merchant.terracottaLight,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.3)',
    borderRadius: 7,
    padding: 10,
    marginBottom: 12,
  },
  debtAlertLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.merchant.terracottaDark,
  },
  debtAlertAmount: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracottaDark,
  },
  sheetFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
    backgroundColor: Colors.merchant.paper,
  },
  confirmSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.green,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
    ...Shadows.card,
  },
  confirmSaleBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
});
