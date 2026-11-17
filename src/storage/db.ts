import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Business,
  Category,
  Product,
  Customer,
  Sale,
  Expense,
  DebtPayment,
  StockMovement,
  PaymentMethod,
  User,
} from '../types';
import {
  initialBusiness,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialExpenses,
  initialSales,
  initialAdminUser,
} from './seed';

const STORAGE_KEYS = {
  BUSINESS: '@kesbiz_business',
  CATEGORIES: '@kesbiz_categories',
  PRODUCTS: '@kesbiz_products',
  CUSTOMERS: '@kesbiz_customers',
  SALES: '@kesbiz_sales',
  EXPENSES: '@kesbiz_expenses',
  DEBT_PAYMENTS: '@kesbiz_debt_payments',
  STOCK_MOVEMENTS: '@kesbiz_stock_movements',
  LANGUAGE: '@kesbiz_language',
  USERS: '@kesbiz_users',
  CURRENT_USER: '@kesbiz_current_user',
  INITIALIZED: '@kesbiz_initialized_v2',
};

// Memory fallback cache in case of storage lag
let memoryCache: Record<string, string> = {};

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) return val;
    return memoryCache[key] || null;
  } catch {
    return memoryCache[key] || null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  memoryCache[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.warn('AsyncStorage set error:', err);
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  delete memoryCache[key];
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('AsyncStorage remove error:', err);
  }
};

export class Database {
  static async initDatabase(forceReset = false): Promise<void> {
    const isInit = await safeGetItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit || forceReset) {
      await safeSetItem(STORAGE_KEYS.BUSINESS, JSON.stringify(initialBusiness));
      await safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
      await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
      await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
      await safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
      await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
      await safeSetItem(STORAGE_KEYS.DEBT_PAYMENTS, JSON.stringify([]));
      await safeSetItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify([]));
      await safeSetItem(STORAGE_KEYS.USERS, JSON.stringify([initialAdminUser]));
      await safeSetItem(STORAGE_KEYS.INITIALIZED, 'true');
    }

    const existingUsers = await safeGetItem(STORAGE_KEYS.USERS);
    if (!existingUsers) {
      await safeSetItem(STORAGE_KEYS.USERS, JSON.stringify([initialAdminUser]));
    }
  }

  static async resetToZero(): Promise<void> {
    memoryCache = {};
    await safeSetItem(STORAGE_KEYS.BUSINESS, JSON.stringify(initialBusiness));
    await safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.DEBT_PAYMENTS, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify([]));
    await safeSetItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- BUSINESS & SETTINGS ---
  static async getBusiness(): Promise<Business> {
    const data = await safeGetItem(STORAGE_KEYS.BUSINESS);
    return data ? JSON.parse(data) : initialBusiness;
  }

  static async updateBusiness(business: Business): Promise<void> {
    await safeSetItem(STORAGE_KEYS.BUSINESS, JSON.stringify(business));
  }

  static async getLanguage(): Promise<'ht' | 'fr'> {
    const lang = await safeGetItem(STORAGE_KEYS.LANGUAGE);
    return (lang as 'ht' | 'fr') || 'ht';
  }

  static async setLanguage(lang: 'ht' | 'fr'): Promise<void> {
    await safeSetItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  // --- USERS & AUTH ---
  static async getUsers(): Promise<User[]> {
    const data = await safeGetItem(STORAGE_KEYS.USERS);
    if (!data) {
      await safeSetItem(STORAGE_KEYS.USERS, JSON.stringify([initialAdminUser]));
      return [initialAdminUser];
    }
    return JSON.parse(data);
  }

  static async getCurrentUser(): Promise<User | null> {
    const data = await safeGetItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static async setCurrentUser(user: User | null): Promise<void> {
    if (user === null) {
      await safeRemoveItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      await safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  }

  static async saveUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    let updatedUsers: User[];
    if (idx >= 0) {
      updatedUsers = [...users];
      updatedUsers[idx] = user;
    } else {
      updatedUsers = [user, ...users];
    }
    await safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    const current = await this.getCurrentUser();
    if (current && current.id === user.id) {
      await this.setCurrentUser(user);
    }
    return user;
  }

  static async verifyLogin(email: string, pass: string): Promise<User | null> {
    const users = await this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail && u.password === pass
    );
    if (found) {
      const updatedUser: User = {
        ...found,
        lastLoginAt: new Date().toISOString(),
      };
      await this.saveUser(updatedUser);
      await this.setCurrentUser(updatedUser);
      return updatedUser;
    }
    return null;
  }

  static async logout(): Promise<void> {
    await this.setCurrentUser(null);
  }

  // --- CATEGORIES ---
  static async getCategories(): Promise<Category[]> {
    const data = await safeGetItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : initialCategories;
  }

  static async saveCategory(category: Category): Promise<Category> {
    const list = await this.getCategories();
    const idx = list.findIndex((c) => c.id === category.id);
    let updated: Category[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = category;
    } else {
      updated = [...list, category];
    }
    await safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return category;
  }

  // --- PRODUCTS & INVENTORY ---
  static async getProducts(): Promise<Product[]> {
    const data = await safeGetItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : initialProducts;
  }

  static async saveProduct(product: Product): Promise<Product> {
    const list = await this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = product;
    } else {
      updated = [product, ...list];
    }
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return product;
  }

  static async deleteProduct(productId: string): Promise<void> {
    const list = await this.getProducts();
    const updated = list.filter((p) => p.id !== productId);
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  }

  static async adjustStock(
    productId: string,
    quantityChange: number,
    type: StockMovement['type'],
    reason?: string
  ): Promise<Product | null> {
    const list = await this.getProducts();
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const current = list[idx];
    const newQty = Math.max(0, current.stockQuantity + quantityChange);
    const updatedProd = { ...current, stockQuantity: newQty };
    list[idx] = updatedProd;

    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));

    // Log stock movement
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: current.id,
      productName: current.name,
      type,
      quantity: quantityChange,
      unitCost: current.buyPrice,
      reason: reason || type,
      createdAt: new Date().toISOString(),
    };
    await this.logStockMovement(movement);

    return updatedProd;
  }

  static async logStockMovement(movement: StockMovement): Promise<void> {
    const raw = await safeGetItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    const list: StockMovement[] = raw ? JSON.parse(raw) : [];
    list.unshift(movement);
    await safeSetItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(list));
  }

  // --- CUSTOMERS & DEBTS ---
  static async getCustomers(): Promise<Customer[]> {
    const data = await safeGetItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : initialCustomers;
  }

  static async saveCustomer(customer: Customer): Promise<Customer> {
    const list = await this.getCustomers();
    const idx = list.findIndex((c) => c.id === customer.id);
    let updated: Customer[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = customer;
    } else {
      updated = [customer, ...list];
    }
    await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    return customer;
  }

  static async recordDebtPayment(
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    reference?: string,
    notes?: string
  ): Promise<DebtPayment> {
    const customers = await this.getCustomers();
    const custIndex = customers.findIndex((c) => c.id === customerId);
    if (custIndex === -1) throw new Error('Client non trouvé');

    const customer = customers[custIndex];
    const newDebt = Math.max(0, customer.currentDebt - amount);
    customers[custIndex] = { ...customer, currentDebt: newDebt };
    await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

    const receiptNumber = `#REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment: DebtPayment = {
      id: `dp-${Date.now()}`,
      customerId,
      customerName: customer.name,
      receiptNumber,
      amount,
      paymentMethod,
      paymentReference: reference,
      notes,
      createdAt: new Date().toISOString(),
    };

    const raw = await safeGetItem(STORAGE_KEYS.DEBT_PAYMENTS);
    const payments: DebtPayment[] = raw ? JSON.parse(raw) : [];
    payments.unshift(payment);
    await safeSetItem(STORAGE_KEYS.DEBT_PAYMENTS, JSON.stringify(payments));

    return payment;
  }

  // --- SALES & POS ---
  static async getSales(): Promise<Sale[]> {
    const data = await safeGetItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : initialSales;
  }

  static async createSale(saleData: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>): Promise<Sale> {
    const sales = await this.getSales();
    const receiptNumber = `#KB-${1040 + sales.length + 1}`;
    const sale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      receiptNumber,
      createdAt: new Date().toISOString(),
    };

    // Deduct stock for each sold item
    const products = await this.getProducts();
    for (const item of sale.items) {
      const prodIdx = products.findIndex((p) => p.id === item.productId);
      if (prodIdx >= 0) {
        products[prodIdx].stockQuantity = Math.max(0, products[prodIdx].stockQuantity - item.quantity);
      }
    }
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // If sale generated debt, increase customer's currentDebt
    if (sale.debtAmount > 0 && sale.customerId) {
      const customers = await this.getCustomers();
      const cIdx = customers.findIndex((c) => c.id === sale.customerId);
      if (cIdx >= 0) {
        customers[cIdx].currentDebt += sale.debtAmount;
        await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    }

    sales.unshift(sale);
    await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    return sale;
  }

  static async cancelSale(saleId: string, cancelReason: string): Promise<Sale | null> {
    const sales = await this.getSales();
    const sIdx = sales.findIndex((s) => s.id === saleId);
    if (sIdx === -1) return null;

    const sale = sales[sIdx];
    if (sale.status === 'CANCELLED') return sale;

    // Rollback stock
    const products = await this.getProducts();
    for (const item of sale.items) {
      const prodIdx = products.findIndex((p) => p.id === item.productId);
      if (prodIdx >= 0) {
        products[prodIdx].stockQuantity += item.quantity;
      }
    }
    await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Rollback customer debt if applicable
    if (sale.debtAmount > 0 && sale.customerId) {
      const customers = await this.getCustomers();
      const cIdx = customers.findIndex((c) => c.id === sale.customerId);
      if (cIdx >= 0) {
        customers[cIdx].currentDebt = Math.max(0, customers[cIdx].currentDebt - sale.debtAmount);
        await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    }

    sales[sIdx] = {
      ...sale,
      status: 'CANCELLED',
      cancelReason,
    };
    await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    return sales[sIdx];
  }

  // --- EXPENSES ---
  static async getExpenses(): Promise<Expense[]> {
    const data = await safeGetItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : initialExpenses;
  }

  static async saveExpense(expense: Expense): Promise<Expense> {
    const list = await this.getExpenses();
    const idx = list.findIndex((e) => e.id === expense.id);
    let updated: Expense[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = expense;
    } else {
      updated = [expense, ...list];
    }
    await safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return expense;
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    const list = await this.getExpenses();
    const updated = list.filter((e) => e.id !== expenseId);
    await safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
  }

  // --- EXPORT & IMPORT BACKUP ---
  static async exportAllData(): Promise<string> {
    const data = {
      business: await this.getBusiness(),
      categories: await this.getCategories(),
      products: await this.getProducts(),
      customers: await this.getCustomers(),
      sales: await this.getSales(),
      expenses: await this.getExpenses(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static async importAllData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.business) await safeSetItem(STORAGE_KEYS.BUSINESS, JSON.stringify(parsed.business));
      if (parsed.categories) await safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      if (parsed.products) await safeSetItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed.products));
      if (parsed.customers) await safeSetItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(parsed.customers));
      if (parsed.sales) await safeSetItem(STORAGE_KEYS.SALES, JSON.stringify(parsed.sales));
      if (parsed.expenses) await safeSetItem(STORAGE_KEYS.EXPENSES, JSON.stringify(parsed.expenses));
      return true;
    } catch {
      return false;
    }
  }
}
