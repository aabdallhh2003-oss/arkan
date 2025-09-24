import { useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'ar';

const dict: Record<Lang, Record<string,string>> = {
  en: {
    logout: 'Logout', signIn: 'Sign in', signUp: 'Sign up', checkEmail: 'Check your email for verification if required.',
    email: 'Email', password: 'Password', createAccount: 'Create account', needAccount: 'Need an account?', haveAccount: 'Have an account?',
    addProduct: 'Add Product', name: 'Name', description: 'Description', price: 'Price', category: 'Category', image: 'Image', saving: 'Saving...', saveProduct: 'Save product',
    loading: 'Loading...', products: 'Products', status: 'Status', active: 'Active', inactive: 'Inactive', deactivate: 'Deactivate', activate: 'Activate', delete: 'Delete',
    orders: 'Orders', items: 'Items', total: 'Total', pending: 'pending', shipped: 'shipped', completed: 'completed',
    activeOrders: 'Active Orders', activity: 'Activity'
  },
  ar: {
    logout: 'تسجيل الخروج', signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', checkEmail: 'تحقق من بريدك الإلكتروني للتفعيل إذا لزم الأمر.',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', createAccount: 'إنشاء حساب', needAccount: 'لا تملك حسابًا؟', haveAccount: 'لديك حساب؟',
    addProduct: 'إضافة منتج', name: 'الاسم', description: 'الوصف', price: 'السعر', category: 'الفئة', image: 'الصورة', saving: 'جارٍ الحفظ...', saveProduct: 'حفظ المنتج',
    loading: 'جارٍ التحميل...', products: 'المنتجات', status: 'الحالة', active: 'نشط', inactive: 'غير نشط', deactivate: 'إلغاء التنشيط', activate: 'تنشيط', delete: 'حذف',
    orders: 'الطلبات', items: 'العناصر', total: 'الإجمالي', pending: 'قيد الانتظار', shipped: 'تم الشحن', completed: 'مكتمل',
    activeOrders: 'طلبات نشطة', activity: 'النشاط'
  }
};

export function useI18n(){
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');
  useEffect(()=>{ document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('lang', lang); }, [lang]);
  const t = useMemo(() => (key: string) => dict[lang][key] || key, [lang]);
  return { t, lang, toggleLang: () => setLang(l => l === 'en' ? 'ar' : 'en') };
}
