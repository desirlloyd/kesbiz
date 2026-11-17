import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Business,
  Category,
  Product,
  Customer,
  Sale,
  Expense,
  CartItem,
  Language,
  PaymentMethod,
  StockMovement,
  User,
} from '../types';
import { Database } from '../storage/db';
import { translations } from '../constants/translations';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => Promise<void>;
  t: typeof translations.ht;
  business: Business | null;
  updateBusiness: (business: Business) => Promise<void>;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCost: number;
  loading: boolean;
  reloadAll: () => Promise<void>;
  createSale: (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>) => Promise<Sale>;
  cancelSale: (saleId: string, reason: string) => Promise<Sale | null>;
  saveProduct: (product: Product) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (
    productId: string,
    change: number,
    type: StockMovement['type'],
    reason?: string
  ) => Promise<Product | null>;
  saveCustomer: (customer: Customer) => Promise<Customer>;
  recordDebtPayment: (
    customerId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string,
    notes?: string
  ) => Promise<void>;
  saveExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  resetToDemo: () => Promise<void>;
  resetToZero: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('ht');
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const t = useMemo(() => translations[lang], [lang]);

  const reloadAll = async () => {
    try {
      setLoading(true);
      await Database.initDatabase();
      const savedLang = await Database.getLanguage();
      setLangState(savedLang);
      const [biz, cats, prods, custs, sls, exps, user] = await Promise.all([
        Database.getBusiness(),
        Database.getCategories(),
        Database.getProducts(),
        Database.getCustomers(),
        Database.getSales(),
        Database.getExpenses(),
        Database.getCurrentUser(),
      ]);
      setBusiness(biz);
      setCategories(cats);
      setProducts(prods);
      setCustomers(custs);
      setSales(sls);
      setExpenses(exps);
      setCurrentUser(user);
    } catch (err) {
      console.error('Error loading app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const setLang = async (newLang: Language) => {
    setLangState(newLang);
    await Database.setLanguage(newLang);
  };

  const updateBusiness = async (newBiz: Business) => {
    await Database.updateBusiness(newBiz);
    setBusiness(newBiz);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, unitPrice: product.salePrice }];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartTotalCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.buyPrice * item.quantity, 0);
  }, [cart]);

  // POS / Sale
  const createSale = async (
    saleData: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>
  ): Promise<Sale> => {
    const sale = await Database.createSale(saleData);
    clearCart();
    await reloadAll();
    return sale;
  };

  const cancelSale = async (saleId: string, reason: string) => {
    const res = await Database.cancelSale(saleId, reason);
    await reloadAll();
    return res;
  };

  // Product CRUD
  const saveProduct = async (product: Product) => {
    const res = await Database.saveProduct(product);
    await reloadAll();
    return res;
  };

  const deleteProduct = async (productId: string) => {
    await Database.deleteProduct(productId);
    await reloadAll();
  };

  const adjustStock = async (
    productId: string,
    change: number,
    type: StockMovement['type'],
    reason?: string
  ) => {
    const res = await Database.adjustStock(productId, change, type, reason);
    await reloadAll();
    return res;
  };

  // Customer CRUD
  const saveCustomer = async (customer: Customer) => {
    const res = await Database.saveCustomer(customer);
    await reloadAll();
    return res;
  };

  const recordDebtPayment = async (
    customerId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string,
    notes?: string
  ) => {
    await Database.recordDebtPayment(customerId, amount, method, reference, notes);
    await reloadAll();
  };

  // Expense CRUD
  const saveExpense = async (expense: Expense) => {
    const res = await Database.saveExpense(expense);
    await reloadAll();
    return res;
  };

  const deleteExpense = async (expenseId: string) => {
    await Database.deleteExpense(expenseId);
    await reloadAll();
  };

  // Reset all data to 0
  const resetToZero = async () => {
    await Database.resetToZero();
    await reloadAll();
  };

  const resetToDemo = resetToZero;

  // Authentication & Profile
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const verified = await Database.verifyLogin(email, pass);
      if (verified) {
        setCurrentUser(verified);
        return { success: true };
      }
      return { success: false, message: t.invalidCredentials };
    } catch {
      return { success: false, message: t.invalidCredentials };
    }
  };

  const logout = async () => {
    await Database.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    const updated: User = {
      ...currentUser,
      ...updatedData,
    };
    await Database.saveUser(updated);
    setCurrentUser(updated);
    return true;
  };

  const changePassword = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Non connecté' };
    }
    if (currentUser.password !== currentPass) {
      return {
        success: false,
        message: lang === 'ht' ? 'Modpas aktyèl la pa kòrèk' : 'Mot de passe actuel incorrect',
      };
    }
    const updated: User = {
      ...currentUser,
      password: newPass,
    };
    await Database.saveUser(updated);
    setCurrentUser(updated);
    return { success: true };
  };

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      t,
      business,
      updateBusiness,
      currentUser,
      login,
      logout,
      updateProfile,
      changePassword,
      products,
      categories,
      customers,
      sales,
      expenses,
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartSubtotal,
      cartTotalCost,
      loading,
      reloadAll,
      createSale,
      cancelSale,
      saveProduct,
      deleteProduct,
      adjustStock,
      saveCustomer,
      recordDebtPayment,
      saveExpense,
      deleteExpense,
      resetToDemo,
      resetToZero,
    }),
    [
      lang,
      t,
      business,
      currentUser,
      products,
      categories,
      customers,
      sales,
      expenses,
      cart,
      cartSubtotal,
      cartTotalCost,
      loading,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
