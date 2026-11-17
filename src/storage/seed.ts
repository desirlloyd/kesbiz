import { Business, Category, Product, Customer, Sale, Expense, User } from '../types';

export const initialAdminUser: User = {
  id: 'user-admin',
  email: 'admin@gmail.com',
  fullName: 'Administrateur KèsBiz',
  phone: '+509 3700-0000',
  role: 'ADMIN',
  password: 'admin123',
  avatar: 'AK',
  createdAt: '2026-11-15T00:00:00.000Z',
  lastLoginAt: '2026-11-15T00:00:00.000Z',
};

export const initialBusiness: Business = {
  id: 'biz-1',
  name: 'Boutik Mwen',
  category: 'Alimantasyon Jeneral',
  phone: '+509 ',
  address: '',
  city: 'Pòtoprens, Ayiti',
  currency: 'HTG',
  taxId: '',
  receiptFooter: 'Mèsi anpil pou konfyans ou!',
  subscriptionPlan: 'PRO',
  subscriptionStatus: 'ACTIVE',
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Viv & Grenn', color: '#0C87EB', icon: 'Wheat' },
  { id: 'cat-2', name: 'Lwil & Kondiman', color: '#F59E0B', icon: 'Flame' },
  { id: 'cat-3', name: 'Bwason & Rafrechisman', color: '#10B981', icon: 'GlassWater' },
  { id: 'cat-4', name: 'Pwodui Netwayaj', color: '#8B5CF6', icon: 'Droplets' },
  { id: 'cat-5', name: 'Letye & Konsèv', color: '#EC4899', icon: 'Package' },
];

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [];

export const initialExpenses: Expense[] = [];

export const initialSales: Sale[] = [];
