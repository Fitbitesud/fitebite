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
  icon: 'bowl' | 'leaf' | 'flame' | 'sun' | 'cup' | 'box' | 'sandwich' | 'snack';
  order: number;
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

/**
 * منطقة توصيل: اسم المنطقة + سعر التوصيل الثابت لها.
 * `fee = 0` تعني توصيلاً بدون رسوم (وهو الافتراضي حتى يُكتب السعر من لوحة التحكم).
 */
export interface DeliveryRegion {
  name: string;
  fee: number;
}

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type PaymentMethod = 'cod' | 'bank';

/**
 * طريقة استلام الطلب:
 *  - `delivery` → توصيل للموقع الذي يحدده العميل
 *  - `pickup`   → استلام من المحل (لا يحتاج منطقة ولا عنوان)
 */
export type FulfillmentMethod = 'delivery' | 'pickup';

export interface CustomerInfo {
  /** مطلوب */
  name: string;
  /** مطلوب */
  phone: string;
  /** اختياري — موقع الاستلام (مناطق التوصيل من إعدادات الموقع) */
  region: string;
  /** اختياري — تفاصيل مكان الاستلام (رقم المنزل / أقرب معلم) */
  address: string;
  notes: string;
  payment: PaymentMethod;
  /** طريقة الاستلام — افتراضياً توصيل */
  fulfillment: FulfillmentMethod;
}

/** إجماليات السلة — قيمة الأكل + سعر التوصيل الثابت للمنطقة المختارة */
export interface OrderTotals {
  count: number;
  kcal: number;
  protein: number;
  subtotal: number;
  /** سعر التوصيل الثابت للمنطقة (0 في الاستلام من المحل أو قبل اختيار المنطقة) */
  delivery: number;
  total: number;
}
