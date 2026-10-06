/**
 * أنواع البيانات — مصممة لتطابق مخطط Sanity المستقبلي حرفياً،
 * بحيث يكون الانتقال من البيانات المحلية إلى Sanity بدون تغيير أي مكوّن.
 *
 * مخطط Sanity المقابل:
 *   menuItem: { _id, slug, name, description, price, category->category, image, macros{...}, tags[], popular, available }
 *   category: { _id, slug, name, icon, order }
 */

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MenuItem {
  _id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  image: string;
  macros: Macros;
  tags: string[];
  popular?: boolean;
  available: boolean;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  icon: 'bowl' | 'leaf' | 'flame' | 'sun' | 'cup' | 'box';
  order: number;
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type PaymentMethod = 'cod' | 'bank';

export interface CustomerInfo {
  name: string;
  phone: string;
  region: string;
  address: string;
  notes: string;
  payment: PaymentMethod;
}

export interface OrderTotals {
  count: number;
  kcal: number;
  protein: number;
  subtotal: number;
  delivery: number;
  total: number;
}
