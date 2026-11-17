import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Store,
  Printer,
  Database as DbIcon,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, Typography, Shadows, TouchTargets } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Database } from '../storage/db';

interface SettingsScreenProps {
  onNavigateTab: (tab: any) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigateTab }) => {
  const { t, lang, business, updateBusiness, resetToDemo, currentUser } = useApp();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [taxId, setTaxId] = useState<string>('');
  const [receiptFooter, setReceiptFooter] = useState<string>('');

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setCategory(business.category || '');
      setPhone(business.phone || '');
      setAddress(business.address || '');
      setCity(business.city || '');
      setTaxId(business.taxId || '');
      setReceiptFooter(business.receiptFooter || '');
    }
  }, [business]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erè', lang === 'ht' ? 'Non biznis la pa ka vid' : 'Nom requis');
      return;
    }

    if (business) {
      await updateBusiness({
        ...business,
        name: name.trim(),
        category: category.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        taxId: taxId.trim() || undefined,
        receiptFooter: receiptFooter.trim() || undefined,
      });

      Alert.alert(
        lang === 'ht' ? 'Siksè' : 'Succès',
        lang === 'ht' ? 'Paramèt biznis la anrejistre avèk siksè nan memwa a.' : 'Paramètres enregistrés.'
      );
    }
  };

  const handleBackupExport = async () => {
    const json = await Database.exportAllData();
    Alert.alert(
      lang === 'ht' ? 'Sovgad Done' : 'Sauvegarde locale',
      lang === 'ht'
        ? `Tout done lokal ou yo (pwodui, vant, dèt, depans) sovgade avèk siksè nan memwa aparèy la.\n\nGwosè dosye: ${json.length} karaktè.`
        : `Sauvegarde locale effectuée (${json.length} octets).`
    );
  };

  const handleReset = () => {
    Alert.alert(
      lang === 'ht' ? 'Reyinisyalize tout done a 0 ?' : 'Réinitialiser toutes les données à 0 ?',
      lang === 'ht'
        ? 'Aksyon sa a ap efase tout vant, depans, dèt, kliyan ak pwodui pou remete kès la a 0 nèt.'
        : 'Cette action supprimera toutes les ventes, dépenses, crédits, clients et produits pour repartir à zéro.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: lang === 'ht' ? 'Reyinisyalize a 0' : 'Réinitialiser à 0',
          style: 'destructive',
          onPress: async () => {
            await resetToDemo();
            Alert.alert(
              lang === 'ht' ? 'Siksè' : 'Succès',
              lang === 'ht' ? 'Tout done yo remèt a 0 avèk siksè.' : 'Toutes les données ont été remises à 0.'
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Header Banner */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.stampBadge}>
            <Text style={styles.stampBadgeText}>PARAMÈT REJIS</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <Text style={styles.headerSub}>
          {lang === 'ht'
            ? 'Konfigure enfòmasyon boutik, fich resi tèmik ak sovgad lokal'
            : 'Configuration de la boutique, reçus thermiques et sauvegarde'}
        </Text>
      </View>

      {/* Profile / Account Quick Card */}
      <TouchableOpacity
        style={styles.profileQuickCard}
        onPress={() => onNavigateTab('profile')}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t.profile}
      >
        <View style={styles.profileQuickAvatar}>
          <Text style={styles.profileQuickAvatarText}>
            {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'A'}
          </Text>
        </View>
        <View style={styles.profileQuickInfo}>
          <View style={styles.profileQuickRoleRow}>
            <Text style={styles.profileQuickName}>
              {currentUser?.fullName || 'Administrateur'}
            </Text>
            <View style={styles.roleBadgeSmall}>
              <Text style={styles.roleBadgeSmallText}>
                {currentUser?.role || 'ADMIN'}
              </Text>
            </View>
          </View>
          <Text style={styles.profileQuickEmail}>
            {currentUser?.email || 'admin@gmail.com'}
          </Text>
        </View>
        <ChevronRight size={18} color={Colors.merchant.forest} />
      </TouchableOpacity>

      {/* 2. Boutique Profile Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Store size={16} color={Colors.merchant.forest} />
          <Text style={styles.sectionTitle}>
            {lang === 'ht' ? 'ENFÒMASYON BOUTIK' : 'PROFIL DU COMMERCE'}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{lang === 'ht' ? 'Non Biznis la' : 'Nom du commerce'} *</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: Alimantasyon JB & Frè"
            placeholderTextColor={Colors.merchant.warmGray}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t.category}</Text>
            <TextInput
              style={styles.input}
              placeholder="Alimantasyon, Depo..."
              placeholderTextColor={Colors.merchant.warmGray}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t.phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="+509 3700-0000"
              placeholderTextColor={Colors.merchant.warmGray}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t.address}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ri Dèlma 33"
              placeholderTextColor={Colors.merchant.warmGray}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>{lang === 'ht' ? 'Vil' : 'Ville'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Pòtoprens"
              placeholderTextColor={Colors.merchant.warmGray}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>NIF / CIN</Text>
          <TextInput
            style={styles.inputMono}
            placeholder="000-000-000-0"
            placeholderTextColor={Colors.merchant.warmGray}
            value={taxId}
            onChangeText={setTaxId}
          />
        </View>
      </View>

      {/* 3. Thermal Receipt Customization */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Printer size={16} color={Colors.merchant.forest} />
          <Text style={styles.sectionTitle}>
            {lang === 'ht' ? 'FICH RESI TÈMIK' : 'REÇU THERMIQUE'}
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{lang === 'ht' ? 'Pye Resi (Mesaj)' : 'Pied de ticket'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg: Mèsi anpil pou vizit ou a! Machandiz livre pa ka retounen."
            placeholderTextColor={Colors.merchant.warmGray}
            value={receiptFooter}
            onChangeText={setReceiptFooter}
          />
        </View>
      </View>

      {/* Save Settings Button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={lang === 'ht' ? 'Anrejistre tout paramèt biznis la' : 'Enregistrer les paramètres'}
        hitSlop={TouchTargets.hitSlopSm}
      >
        <CheckCircle2 size={18} color={Colors.merchant.ivory} strokeWidth={2.4} />
        <Text style={styles.saveBtnText}>{t.save}</Text>
      </TouchableOpacity>

      {/* 4. Local Database & Backup Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <DbIcon size={16} color={Colors.merchant.forest} />
          <Text style={styles.sectionTitle}>
            {lang === 'ht' ? 'MEMWA & SOVGAD LOKAL' : 'DONNÉES LOCALES'}
          </Text>
        </View>

        <Text style={styles.dbNotice}>
          {lang === 'ht'
            ? 'KèsBiz fonksyone 100% lokal sou telefòn ou (Offline-First). Pa gen entènèt ki nesesè pou fè vant oswa enprime resi.'
            : 'KèsBiz fonctionne 100% hors-ligne sur votre appareil.'}
        </Text>

        <View style={styles.backupActions}>
          <TouchableOpacity
            style={styles.backupBtn}
            onPress={handleBackupExport}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Fè yon sovgad lokal' : 'Sauvegarder les données'}
            hitSlop={TouchTargets.hitSlopSm}
          >
            <ShieldCheck size={16} color={Colors.merchant.forest} />
            <Text style={styles.backupBtnText}>{t.backup}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={lang === 'ht' ? 'Reyinisyalize tout done kès la a zero' : 'Réinitialiser la base locale'}
            hitSlop={TouchTargets.hitSlopSm}
          >
            <RotateCcw size={15} color={Colors.merchant.terracotta} />
            <Text style={styles.resetBtnText}>{t.resetDemo}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Version Stamp */}
      <View style={styles.versionFooter}>
        <Text style={styles.versionTitle}>KÈSBIZ REJIS AYITI v1.0.0</Text>
        <Text style={styles.versionSub}>Offline-First SQLite Architecture</Text>
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
  profileQuickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.merchant.sageDark,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  profileQuickAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.merchant.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.merchant.sageDark,
  },
  profileQuickAvatarText: {
    color: Colors.merchant.ivory,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  profileQuickInfo: {
    flex: 1,
  },
  profileQuickRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileQuickName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.merchant.ink,
  },
  roleBadgeSmall: {
    backgroundColor: Colors.merchant.forestDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeSmallText: {
    color: '#E5B869',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.5,
  },
  profileQuickEmail: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.merchant.border,
    padding: 14,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
    letterSpacing: 0.8,
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
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.ink,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.merchant.forest,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.merchant.forestDark,
    ...Shadows.card,
  },
  saveBtnText: {
    color: Colors.merchant.ivory,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
  },
  dbNotice: {
    fontSize: 11,
    color: Colors.merchant.inkMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  backupActions: {
    gap: 8,
  },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.sageLight,
    borderWidth: 1,
    borderColor: Colors.merchant.sageDark,
    borderRadius: 7,
    paddingVertical: 9,
  },
  backupBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.forest,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.merchant.terracottaLight,
    borderWidth: 1,
    borderColor: 'rgba(198, 106, 69, 0.3)',
    borderRadius: 7,
    paddingVertical: 9,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.terracotta,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  versionTitle: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.mono,
    color: Colors.merchant.warmGray,
    letterSpacing: 0.8,
  },
  versionSub: {
    fontSize: 9,
    color: Colors.merchant.warmGrayLight,
    marginTop: 2,
  },
});
