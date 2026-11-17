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
} from 'react-native';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Boxes,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatGourde } from '../utils/formatters';

export const ProductsScreen: React.FC = () => {
  const {
    t,
    lang,
    products,
    categories,
    saveProduct,
    deleteProduct,
    adjustStock,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);

  // Modals
  const [productModalVisible, setProductModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form state
  const [formName, setFormName] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formBarcode, setFormBarcode] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('pyès');
  const [formBuyPrice, setFormBuyPrice] = useState<string>('');
  const [formSalePrice, setFormSalePrice] = useState<string>('');
  const [formStock, setFormStock] = useState<string>('');
  const [formAlert, setFormAlert] = useState<string>('5');

  // Stock Adjust Modal state
  const [adjustModalVisible, setAdjustModalVisible] = useState<boolean>(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQtyStr, setAdjustQtyStr] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'IN_PURCHASE' | 'OUT_SPOILAGE'>('IN_PURCHASE');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchLowStock = !filterLowStock || p.stockQuantity <= p.minStockAlert;
      const search = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(search) ||
        (p.barcode && p.barcode.toLowerCase().includes(search));
      return matchCat && matchLowStock && matchSearch;
    });
  }, [products, selectedCategory, filterLowStock, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormBarcode('');
    setFormUnit('pyès');
    setFormBuyPrice('');
    setFormSalePrice('');
    setFormStock('0');
    setFormAlert('5');
    setProductModalVisible(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.categoryId || '');
    setFormBarcode(p.barcode || '');
    setFormUnit(p.unit);
    setFormBuyPrice(p.buyPrice.toString());
    setFormSalePrice(p.salePrice.toString());
    setFormStock(p.stockQuantity.toString());
    setFormAlert(p.minStockAlert.toString());
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!formName.trim()) {
      Alert.alert('Erè', lang === 'ht' ? 'Tanpri mete non pwodui a' : 'Veuillez saisir le nom');
      return;
    }

    const buy = parseFloat(formBuyPrice) || 0;
    const sale = parseFloat(formSalePrice) || 0;
    const stock = parseFloat(formStock) || 0;
    const alert = parseFloat(formAlert) || 5;

    const prod: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      categoryId: formCategoryId || (categories[0]?.id || 'cat-1'),
      barcode: formBarcode.trim() || undefined,
      unit: formUnit.trim() || 'pyès',
      buyPrice: buy,
      salePrice: sale,
      stockQuantity: stock,
      minStockAlert: alert,
      isActive: true,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    await saveProduct(prod);
    setProductModalVisible(false);
  };

  const handleOpenAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setAdjustQtyStr('');
    setAdjustType('IN_PURCHASE');
    setAdjustReason('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjust = async () => {
    if (!adjustingProduct) return;
    const qty = parseFloat(adjustQtyStr) || 0;
    if (qty <= 0) {
      Alert.alert('Erè', lang === 'ht' ? 'Kantite a dwe plis pase 0' : 'Quantité invalide');
      return;
    }

    const signedChange = adjustType === 'OUT_SPOILAGE' ? -Math.abs(qty) : Math.abs(qty);

    await adjustStock(
      adjustingProduct.id,
      signedChange,
      adjustType === 'IN_PURCHASE' ? 'IN_PURCHASE' : 'LOSS_DAMAGE',
      adjustReason || undefined
    );

    setAdjustModalVisible(false);
  };

  const handleDelete = (p: Product) => {
    Alert.alert(
      lang === 'ht' ? 'Efase Pwodui ?' : 'Supprimer le produit ?',
      lang === 'ht'
        ? `Èske w sèten ou vle retire "${p.name}" nan lis la nèt ?`
        : `Confirmez-vous la suppression de "${p.name}" ?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(p.id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextGroup}>
          <View style={styles.badgeRow}>
            <View style={styles.stampBadge}>
              <Text style={styles.stampBadgeText}>REJIS ENVANTÈ</Text>
            </View>
            <Text style={styles.totalCountText}>
              {products.length} {lang === 'ht' ? 'atik anrejistre' : 'articles'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{t.products}</Text>
          <Text style={styles.headerSub}>
            {lang === 'ht'
              ? 'Kontwole kantite machandiz, pri acha istorik, pri vant ak alèt'
              : 'Gérez vos articles, prix d\'achat, prix de vente et alertes'}
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Plus size={16} color={Colors.merchant.ivory} strokeWidth={2.4} />
          <Text style={styles.addBtnText}>{t.addProduct}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Filter & Search Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.merchant.warmGray} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                lang === 'ht' ? 'Chèche pa non pwodui oswa kòdbat...' : 'Rechercher par nom ou code...'
              }
              placeholderTextColor={Colors.merchant.warmGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.alertFilterBtn, filterLowStock && styles.alertFilterBtnActive]}
            onPress={() => setFilterLowStock(!filterLowStock)}
          >
            <AlertTriangle
              size={14}
              color={filterLowStock ? Colors.merchant.terracotta : Colors.merchant.warmGray}
            />
            <Text
              style={[styles.alertFilterText, filterLowStock && styles.alertFilterTextActive]}
            >
              {t.lowStockAlerts}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.catPill,
              selectedCategory === 'all' && styles.catPillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.catPillText,
                selectedCategory === 'all' && styles.catPillTextActive,
              ]}
            >
              {t.allCategories}
            </Text>
          </TouchableOpacity>

          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.catPill,
                selectedCategory === c.id && styles.catPillActive,
              ]}
              onPress={() => setSelectedCategory(c.id)}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCategory === c.id && styles.catPillTextActive,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isLowStock = item.stockQuantity <= item.minStockAlert;
          const isOutOfStock = item.stockQuantity <= 0;
          const margin = item.salePrice - item.buyPrice;
          const marginPct = item.buyPrice > 0 ? Math.round((margin / item.buyPrice) * 100) : 0;
          const category = categories.find((c) => c.id === item.categoryId);

          return (
            <View style={styles.productCard}>
              <View style={styles.cardTop}>
                <View style={styles.prodDetails}>
                  <View style={styles.catRow}>
                    <Text style={styles.catName}>{category?.name || 'Jeneral'}</Text>
                    {item.barcode && (
                      <Text style={styles.barcodeText}>#{item.barcode}</Text>
                    )}
                  </View>
                  <Text style={styles.prodName}>{item.name}</Text>
                </View>

                {/* Stock Badge */}
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

              {/* Price & Margin Ledger Row */}
              <View style={styles.ledgerRow}>
                <View style={styles.ledgerBox}>
                  <Text style={styles.ledgerLabel}>{t.buyPrice}:</Text>
                  <Text style={styles.ledgerBuy}>{formatGourde(item.buyPrice)}</Text>
                </View>
                <View style={styles.ledgerBox}>
                  <Text style={styles.ledgerLabel}>{t.salePrice}:</Text>
                  <Text style={styles.ledgerSale}>{formatGourde(item.salePrice)}</Text>
                </View>
                <View style={styles.ledgerBox}>
                  <Text style={styles.ledgerLabel}>{t.margin}:</Text>
                  <Text style={styles.ledgerMargin}>+{marginPct}%</Text>
                </View>
              </View>

              {/* Card Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtnAdjust}
                  onPress={() => handleOpenAdjust(item)}
                  activeOpacity={0.7}
                >
                  <Boxes size={14} color={Colors.merchant.forest} />
                  <Text style={styles.actionBtnTextAdjust}>
                    {lang === 'ht' ? 'Ajiste Stòk' : 'Ajuster'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    onPress={() => handleOpenEdit(item)}
                    activeOpacity={0.7}
                  >
                    <Edit size={14} color={Colors.merchant.inkMuted} />
                    <Text style={styles.actionBtnText}>{t.edit}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    onPress={() => handleDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color={Colors.merchant.terracotta} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Package size={28} color={Colors.merchant.warmGray} />
            </View>
            <Text style={styles.emptyTitle}>
              {lang === 'ht' ? 'Lis pwodui an vid' : 'Aucun produit'}
            </Text>
            <Text style={styles.emptySub}>
              {lang === 'ht' ? 'Ou poko gen okenn pwodui nan rejis envantè a.' : 'Aucun produit dans l\'inventaire.'}
            </Text>
          </View>
        }
      />

      {/* 4. Add/Edit Product Modal */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProductModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingProduct ? t.edit : t.addProduct}
              </Text>
              <TouchableOpacity
                onPress={() => setProductModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich pwodui an"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.productName} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Lwil Manman 1L"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.buyPrice} (HTG) *</Text>
                  <TextInput
                    style={styles.inputMono}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formBuyPrice}
                    onChangeText={setFormBuyPrice}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.salePrice} (HTG) *</Text>
                  <TextInput
                    style={styles.inputMono}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formSalePrice}
                    onChangeText={setFormSalePrice}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.currentStock} *</Text>
                  <TextInput
                    style={styles.inputMono}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formStock}
                    onChangeText={setFormStock}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.minStockAlert}</Text>
                  <TextInput
                    style={styles.inputMono}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formAlert}
                    onChangeText={setFormAlert}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.unit}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="pyès, sachè, bwat, lit"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formUnit}
                    onChangeText={setFormUnit}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>{t.barcode}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Kòdbat opsyonèl"
                    placeholderTextColor={Colors.merchant.warmGray}
                    value={formBarcode}
                    onChangeText={setFormBarcode}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProduct}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Anrejistre pwodui"
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.saveBtnText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 5. Stock Adjust Modal */}
      <Modal
        visible={adjustModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {lang === 'ht' ? 'Ajiste Stòk Machandiz' : 'Ajustement de Stock'}
              </Text>
              <TouchableOpacity
                onPress={() => setAdjustModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Fèmen fich ajisteman stòk la"
                hitSlop={TouchTargets.hitSlop}
              >
                <X size={18} color={Colors.merchant.inkMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <Text style={styles.adjustProductName}>
                {adjustingProduct?.name} ({adjustingProduct?.stockQuantity} {adjustingProduct?.unit})
              </Text>

              {/* Adjust Type Selector */}
              <View style={styles.adjustTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.adjustTypeBtn,
                    adjustType === 'IN_PURCHASE' && styles.adjustTypeBtnActiveIn,
                  ]}
                  onPress={() => setAdjustType('IN_PURCHASE')}
                >
                  <Text
                    style={[
                      styles.adjustTypeBtnText,
                      adjustType === 'IN_PURCHASE' && styles.adjustTypeBtnTextActive,
                    ]}
                  >
                    + Antre Acha (Nouvo stòk)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.adjustTypeBtn,
                    adjustType === 'OUT_SPOILAGE' && styles.adjustTypeBtnActiveOut,
                  ]}
                  onPress={() => setAdjustType('OUT_SPOILAGE')}
                >
                  <Text
                    style={[
                      styles.adjustTypeBtnText,
                      adjustType === 'OUT_SPOILAGE' && styles.adjustTypeBtnTextActive,
                    ]}
                  >
                    - Retire (Gaste / Pèdi)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {lang === 'ht' ? 'Kantite pou ajoute / retire *' : 'Quantité *'}
                </Text>
                <TextInput
                  style={styles.inputMono}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={adjustQtyStr}
                  onChangeText={setAdjustQtyStr}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{lang === 'ht' ? 'Rezon (Odit)' : 'Motif'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Eg: Acha nan mache, atik ki kraze"
                  placeholderTextColor={Colors.merchant.warmGray}
                  value={adjustReason}
                  onChangeText={setAdjustReason}
                />
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveAdjust}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
                <Text style={styles.saveBtnText}>
                  {lang === 'ht' ? 'Valide Ajisteman' : 'Enregistrer'}
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
  filterCard: {
    backgroundColor: Colors.merchant.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchRow: {
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
  alertFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingHorizontal: 9,
    height: 36,
  },
  alertFilterBtnActive: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderColor: Colors.merchant.terracotta,
  },
  alertFilterText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  alertFilterTextActive: {
    color: Colors.merchant.terracotta,
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 6,
  },
  catPill: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  catPillActive: {
    backgroundColor: Colors.merchant.forest,
    borderColor: Colors.merchant.forestDark,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  catPillTextActive: {
    color: Colors.merchant.ivory,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
    gap: 10,
  },
  productCard: {
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
    marginBottom: 8,
  },
  prodDetails: {
    flex: 1,
    marginRight: 8,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  catName: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.warmGray,
  },
  barcodeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.inkMuted,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  stockBadge: {
    backgroundColor: Colors.merchant.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
    fontWeight: '700',
  },
  stockBadgeTextLow: {
    color: Colors.merchant.terracotta,
  },
  stockBadgeTextOut: {
    color: Colors.merchant.warmGray,
  },
  ledgerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.merchant.card,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.borderLight,
    padding: 8,
    marginBottom: 10,
  },
  ledgerBox: {
    flex: 1,
  },
  ledgerLabel: {
    fontSize: 9,
    color: Colors.merchant.warmGray,
  },
  ledgerBuy: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  ledgerSale: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  ledgerMargin: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.merchant.green,
    fontFamily: Typography.fontFamily.mono,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.borderLight,
  },
  actionBtnAdjust: {
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
  actionBtnTextAdjust: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnEdit: {
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
  actionBtnText: {
    fontSize: 10,
    color: Colors.merchant.inkMuted,
    fontWeight: '600',
  },
  actionBtnDelete: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.3)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
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
    maxHeight: '85%',
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
  formRow: {
    flexDirection: 'row',
    gap: 10,
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
  adjustProductName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
    marginBottom: 12,
  },
  adjustTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  adjustTypeBtn: {
    flex: 1,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    borderRadius: 7,
    paddingVertical: 8,
    alignItems: 'center',
  },
  adjustTypeBtnActiveIn: {
    backgroundColor: Colors.merchant.greenLight,
    borderColor: Colors.merchant.green,
  },
  adjustTypeBtnActiveOut: {
    backgroundColor: Colors.merchant.terracottaLight,
    borderColor: Colors.merchant.terracotta,
  },
  adjustTypeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  adjustTypeBtnTextActive: {
    color: Colors.merchant.ink,
    fontWeight: '800',
  },
});
