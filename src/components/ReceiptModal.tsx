import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CheckCircle2, X, Printer, Share2 } from 'lucide-react-native';
import { Sale } from '../types';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatGourde, formatDateTime } from '../utils/formatters';

interface ReceiptModalProps {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  sale,
  onClose,
}) => {
  const { business, t, lang } = useApp();

  if (!sale) return null;

  const handlePrint = () => {
    Alert.alert(
      lang === 'ht' ? 'Enpresyon Tèmik' : 'Impression Thermique',
      lang === 'ht'
        ? `Fich resi ${sale.receiptNumber} voye nan enprimant Bluetooth/USB POS la avèk siksè.`
        : `Reçu ${sale.receiptNumber} transmis à l'imprimante thermique Bluetooth/USB.`
    );
  };

  const handleShare = () => {
    Alert.alert(
      lang === 'ht' ? 'Pataje Resi' : 'Partager le reçu',
      lang === 'ht'
        ? `Resi ${sale.receiptNumber} pare pou voye pa WhatsApp oswa SMS.`
        : `Reçu ${sale.receiptNumber} prêt à être envoyé par WhatsApp ou SMS.`
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleGroup}>
              <CheckCircle2 size={18} color={Colors.merchant.green} strokeWidth={2.4} />
              <Text style={styles.modalTitle}>
                {lang === 'ht' ? 'Vant Anrejistre avèk Siksè !' : 'Vente Validée !'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Fèmen resi a"
              hitSlop={TouchTargets.hitSlop}
            >
              <X size={18} color={Colors.merchant.inkMuted} />
            </TouchableOpacity>
          </View>

          {/* Printable Thermal Receipt Container */}
          <ScrollView
            style={styles.receiptScroll}
            contentContainerStyle={styles.receiptBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Store Information Header */}
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle}>
                {business?.name || 'KèsBiz Boutique'}
              </Text>
              {business?.category && (
                <Text style={styles.storeCategory}>{business.category}</Text>
              )}
              {business?.address && (
                <Text style={styles.storeDetail}>{business.address}</Text>
              )}
              {business?.phone && (
                <Text style={styles.storeDetail}>Tel: {business.phone}</Text>
              )}
              {business?.taxId && (
                <Text style={styles.storeTax}>NIF/CIN: {business.taxId}</Text>
              )}
            </View>

            <View style={styles.dashedDivider} />

            {/* Ticket Info */}
            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{lang === 'ht' ? 'Fich #:' : 'Reçu #:'}</Text>
                <Text style={styles.metaValueHighlight}>{sale.receiptNumber}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{lang === 'ht' ? 'Dat:' : 'Date:'}</Text>
                <Text style={styles.metaValue}>{formatDateTime(sale.createdAt, lang)}</Text>
              </View>
              {sale.customerName && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>{lang === 'ht' ? 'Kliyan:' : 'Client:'}</Text>
                  <Text style={styles.metaValue}>{sale.customerName}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{lang === 'ht' ? 'Mòd peman:' : 'Mode:'}</Text>
                <Text style={styles.metaValue}>
                  {sale.paymentMethod} {sale.paymentReference ? `(Ref: ${sale.paymentReference})` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.dashedDivider} />

            {/* Items Table */}
            <View style={styles.itemsSection}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, { flex: 2 }]}>
                  {lang === 'ht' ? 'ATIK' : 'ARTICLE'}
                </Text>
                <Text style={[styles.colHeader, { flex: 0.8, textAlign: 'center' }]}>
                  {lang === 'ht' ? 'KTE' : 'QTÉ'}
                </Text>
                <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>
                  {lang === 'ht' ? 'PRI' : 'PRIX'}
                </Text>
                <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>
                  TOTAL
                </Text>
              </View>

              {sale.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={[styles.itemName, { flex: 2 }]} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemQty, { flex: 0.8, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { flex: 1.2, textAlign: 'right' }]}>
                    {formatGourde(item.unitPrice)}
                  </Text>
                  <Text style={[styles.itemTotal, { flex: 1.2, textAlign: 'right' }]}>
                    {formatGourde(item.totalPrice)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dashedDivider} />

            {/* Calculations Breakdown */}
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{lang === 'ht' ? 'Sou-total:' : 'Sous-total:'}</Text>
                <Text style={styles.totalValue}>{formatGourde(sale.subtotal)}</Text>
              </View>

              {sale.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{t.discount}:</Text>
                  <Text style={styles.totalDiscount}>-{formatGourde(sale.discount)}</Text>
                </View>
              )}

              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>TOTAL:</Text>
                <Text style={styles.finalTotalValue}>{formatGourde(sale.totalAmount)}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t.amountPaid}:</Text>
                <Text style={styles.totalValue}>{formatGourde(sale.amountPaid)}</Text>
              </View>

              {sale.changeGiven !== undefined ? (
                sale.changeGiven > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t.changeDue}:</Text>
                    <Text style={styles.totalChange}>{formatGourde(sale.changeGiven)}</Text>
                  </View>
                )
              ) : (
                sale.amountPaid > sale.totalAmount && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t.changeDue}:</Text>
                    <Text style={styles.totalChange}>
                      {formatGourde(sale.amountPaid - sale.totalAmount)}
                    </Text>
                  </View>
                )
              )}

              {sale.debtAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalDebtLabel}>{t.remainingDebt}:</Text>
                  <Text style={styles.totalDebtValue}>{formatGourde(sale.debtAmount)}</Text>
                </View>
              )}
            </View>

            <View style={styles.dashedDivider} />

            {/* Barcode & Footer Greeting */}
            <View style={styles.receiptFooter}>
              <View style={styles.barcodeBox}>
                <Text style={styles.barcodeText}>||| | ||||| || |||| ||| |||| | |||</Text>
                <Text style={styles.barcodeNumber}>{sale.receiptNumber}</Text>
              </View>

              <Text style={styles.footerGreeting}>
                {business?.receiptFooter || (lang === 'ht' ? 'Mèsi anpil pou vizit ou a !' : 'Merci pour votre confiance !')}
              </Text>
              <Text style={styles.systemTag}>KèsBiz: Zouti Jesyon Ayiti</Text>
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.printBtn}
              onPress={handlePrint}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={lang === 'ht' ? 'Enprime fich resi tèmik la' : 'Imprimer le ticket'}
              hitSlop={TouchTargets.hitSlopSm}
            >
              <Printer size={16} color={Colors.merchant.ivory} />
              <Text style={styles.printBtnText}>{t.print}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={lang === 'ht' ? 'Pataje resi a sou WhatsApp oswa SMS' : 'Partager le reçu'}
              hitSlop={TouchTargets.hitSlopSm}
            >
              <Share2 size={15} color={Colors.merchant.forest} />
              <Text style={styles.shareBtnText}>{lang === 'ht' ? 'Pataje' : 'Partager'}</Text>
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
    backgroundColor: 'rgba(16, 53, 41, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.merchant.forest,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  receiptBody: {
    backgroundColor: Colors.merchant.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 12,
    ...Shadows.card,
  },
  storeHeader: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  storeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.merchant.forest,
    textTransform: 'uppercase',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  storeCategory: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    marginTop: 1,
  },
  storeDetail: {
    fontSize: 10,
    color: Colors.merchant.inkMuted,
    marginTop: 1,
    fontFamily: Typography.fontFamily.mono,
  },
  storeTax: {
    fontSize: 9,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 1,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.border,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  metaSection: {
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  metaValue: {
    fontSize: 10,
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  metaValueHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  itemsSection: {
    gap: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.borderLight,
  },
  colHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  itemName: {
    fontSize: 10,
    color: Colors.merchant.ink,
  },
  itemQty: {
    fontSize: 10,
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  itemPrice: {
    fontSize: 10,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  itemTotal: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  totalsSection: {
    gap: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  totalDiscount: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
  },
  finalTotalRow: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.merchant.borderLight,
    borderBottomColor: Colors.merchant.borderLight,
    marginVertical: 2,
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  finalTotalValue: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.merchant.forest,
    fontFamily: Typography.fontFamily.mono,
  },
  totalChange: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.green,
    fontFamily: Typography.fontFamily.mono,
  },
  totalDebtLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
  },
  totalDebtValue: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.merchant.terracotta,
    fontFamily: Typography.fontFamily.mono,
  },
  receiptFooter: {
    alignItems: 'center',
    paddingTop: 4,
  },
  barcodeBox: {
    alignItems: 'center',
    marginBottom: 6,
  },
  barcodeText: {
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.merchant.ink,
    fontFamily: Typography.fontFamily.mono,
  },
  barcodeNumber: {
    fontSize: 8,
    color: Colors.merchant.warmGray,
    fontFamily: Typography.fontFamily.mono,
  },
  footerGreeting: {
    fontSize: 10,
    color: Colors.merchant.inkMuted,
    textAlign: 'center',
  },
  systemTag: {
    fontSize: 8,
    color: Colors.merchant.warmGray,
    marginTop: 2,
    fontFamily: Typography.fontFamily.mono,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.merchant.border,
    gap: 8,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.green,
    paddingVertical: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.merchant.greenDark,
  },
  printBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.merchant.card,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 7,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
});
