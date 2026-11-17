# KèsBiz : Aplikasyon Mobil Pwen Vant & Jesyon Komèsyal (React Native / Expo)

Vèsyon mobil **KèsBiz** pou komèsan, boutik, ak depo an Ayiti. Aplikasyon an fèt pou fonksyone **100% Offline-First** (san entènèt obligatwa), ak yon idantite vizyèl enspire de "Le Comptoir Moderne", palèt koulè `#174B3A` ak `#F7F4EC`, fonksyonalite kès rapid, ak jesyon komèsyal konplè.

---

## 🔐 Idantifyan Koneksyon Demonstrasyon (Demo Credentials)

Lè w ouvri aplikasyon an sou paj koneksyon an :
- **Imèl / Email** : `admin@gmail.com`
- **Modpas / Password** : `admin123`

---

## 🚀 Kòman pou w lanse pwojè a

### Kondisyon davans (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 oswa pi resan)
- [Expo Go](https://expo.dev/go) enstale sou telefòn ou (Android oswa iOS)

### Enstalasyon ak demaraj

1. Klone depo a :
   ```bash
   git clone <repo-url>
   cd Kesbiz_app
   ```

2. Enstale depandans yo :
   ```bash
   npm install
   ```

3. Lanse sèvè devlopman Expo a :
   ```bash
   npx expo start
   ```

4. Opsyon pou teste :
   - **Telefòn Android oswa iPhone :** Eskane kòd QR ki parèt nan tèminal la avèk aplikasyon **Expo Go**.
   - **Navigatè Web :** Peze `w` nan tèminal la oswa lanse `npx expo start --web`.
   - **Emilatè Android :** Peze `a`.

---

## 📱 Karakteristik & Modil Entegre

### 1. 📊 Tablo Bò (Dashboard)
- Filtè peryòd : Jodi a, Semèn sa a, Mwa sa a.
- Kat Rejis Ledger : Vant brit, Benefis estimasyon, Dèt kliyan dwe, Valè stòk total.
- Alèt stòk ba otomatik.
- Dènye vant ki fèt ak pwodui ki pi vann yo.

### 2. 🛒 Kès / Pwen Vant (POS)
- Katalòg rapid ak filtè kategori (Viv & Grenn, Lwil, Bwason, Pwodui Netwayaj, Letye).
- Rechèch pwodui pa non oswa kòd bar.
- Panyen dinamik ak kalkilatris kantite (+ / -).
- Seleksyon kliyan (Kliyan pasajè oswa kliyan nan rejis la).
- Tout mòd peman ayisyen : **Lajan Kach (Espès)**, **MonCash**, **NatCash**, ak **Kredi (Dèt)**.
- Kalkil otomatik monnen pou rann ak rès dèt.
- Bouton lajan kach rapid (+500, +1000, +2000, Kach Egzak).

### 3. 🧾 Resi Tèmik (Thermal Receipt Modal)
- Fòma resi 80mm / 58mm POS.
- Enfòmasyon boutik, NIF/CIN, nimewo tikè `#KB-XXXX`, liy atik detaye, rabè, ak benediksyon nan pye fich la.
- Bouton pou enprime oswa pataje fich la pa WhatsApp/SMS.

### 4. 📦 Pwodui & Stòk (Inventory Management)
- Lis atik ak estati stòk (Disponib, Stòk ba, Stòk fini).
- Pri acha (Kou), pri vant, ak kalkil otomatik maj benefis (%).
- Ajoute ak modifye atik.
- Ajisteman stòk rapid ak rezon odit : Nouvo Acha / Restòk, Koreksyon Envantè (+/-), Pèd / Domaj / Gate.

### 5. 🧾 Istorik Vant (Sales History)
- Lis tout tranzaksyon ak rechèch pa nimewo resi oswa non kliyan.
- Filtre pa mòd peman.
- Wè resi a nenpòt kilè.
- **Anilasyon Vant (Void) :** Anilasyon ak rezon odit komèsyal epi remete stòk pwodui yo otomatikman nan envantè a.

### 6. 👥 Kliyan & Dèt (Customer Credit Ledger)
- Suivi dèt kliyan fidèl yo.
- Filtre pou wè kliyan ki dwe sèlman.
- **Peye Dèt :** Anrejistre peman dèt (Kach, MonCash, NatCash) ak fich regilasyon dèt.
- Ajoute ak modifye dosye kliyan.

### 7. 💸 Depans Operasyon (Expenses)
- Anrejistre depans : Delco / Gazolin, Lwaye lokal, Transpò machandiz, Salè, Founiti & Sachè nwa.
- Suivi total depans pou peryòd la.

### 8. 📈 Rapò Finansye & Benefis (Accounting P&L)
- P&L Kaskad : Vant Brit -> Kou Acha (COGS) -> Benefis Brit -> Depans -> Rezilta Nèt Reyèl.
- Verite Trezoreri : Separasyon lajan kach reyèlman antre ak dèt deyò.
- Repatisyon pa kanal peman (Kach vs MonCash vs NatCash vs Kredi).

### 9. ⚙️ Paramèt & Memwa Lokal
- Pwofil boutik, NIF, adrès, mesaj pye resi.
- Chanje lang imedyatman ant **Kreyòl Ayisyen 🇭🇹** ak **Français 🇫🇷**.
- **Sovgad Lokal (Offline-First) :** Done yo stoke lokalman sou aparèy la via `@react-native-async-storage/async-storage`.
- Ekspòte tout done yo an fòma JSON pou sovgad.
- Bouton pou reyinisyalize tout done yo ak demonstrasyon orijinal la.

---

## 🛠️ Pile Teknoloji (Tech Stack)

- **Framework :** [React Native](https://reactnative.dev/) (0.88) & [Expo](https://expo.dev/) (SDK 58)
- **Langaj :** [TypeScript](https://www.typescriptlang.org/)
- **Ikonografi :** [Lucide React Native](https://lucide.dev/)
- **Stokaj Done :** AsyncStorage (Offline-First)
- **Jesyon Eta :** React Context API (`AppContext`)
- **Konpatibilite :** Android, iOS, ak Web

---

## 🎨 Sistèm Konsepsyon (Design System)

- **merchant.forest (`#174B3A`) :** Koulè prensipal boutik la ak tèt paj la.
- **merchant.forestDark (`#103529`) :** Koulè ba navigasyon anba a.
- **merchant.green (`#16A36A`) :** Koulè aksyon prensipal, vant, ak lajan antre.
- **merchant.ivory (`#F7F4EC`) :** Koulè background aplikasyon an.
- **merchant.paper (`#FAF8F3`) :** Koulè kat ak rejis yo.
- **merchant.terracotta (`#C66A45`) :** Koulè dèt kliyan, depans, ak alèt stòk.
- **moncash (`#E31837`) :** Makè peman MonCash.
- **natcash (`#0085CA`) :** Makè peman NatCash.
- **Chif monospas tabular :** Tout montan HTG, nimewo resi, ak kòd itilize polis monospas pou lizibilite maksimòm.
