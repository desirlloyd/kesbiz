export type Language = 'ht' | 'fr';

export type PaymentMethod =
  | 'CASH'
  | 'MONCASH'
  | 'NATCASH'
  | 'CREDIT'
  | 'CARD'
  | 'TRANSFER'
  | 'MIXED';

export type ExpenseCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'TRANSPORT'
  | 'SALARY'
  | 'SUPPLIES'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Business {
  id: string;
  name: string;
  category: string;
  phone?: string;
  address?: string;
  city?: string;
  taxId?: string;
  currency: string;
  receiptFooter?: string;
  subscriptionPlan: 'FREE' | 'BASIC' | 'PRO' | 'MULTI';
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'PENDING' | 'PAST_DUE';
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'OWNER' | 'MANAGER' | 'CASHIER';
  password?: string;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Product {
  id: string;
  categoryId?: string;
  name: string;
  barcode?: string;
  sku?: string;
  unit: string; // pyès, sak, bwat, galon, boutèy, liv
  buyPrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  totalCost: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  customerId?: string;
  customerName?: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  totalCost: number;
  amountPaid: number;
  debtAmount: number;
  changeGiven?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'CANCELLED';
  status: 'COMPLETED' | 'CANCELLED';
  cancelReason?: string;
  createdAt: string;
  items: SaleItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  creditLimit?: number;
  currentDebt: number;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  customerId: string;
  customerName: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  expenseDate: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN_PURCHASE' | 'OUT_SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'LOSS_DAMAGE' | 'SALE_CANCEL';
  quantity: number;
  unitCost: number;
  reason?: string;
  createdAt: string;
}
