// ecommerce-store/src/lib/supabase.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase keys are missing! Check your .env file.");
}

// ✅ إنشاء الـ client مع خيارات إضافية
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey || '',
      'Authorization': `Bearer ${supabaseAnonKey || ''}`
    }
  }
});

// ✅ تصدير الـ supabase للاستخدام في Console
window.supabase = supabase;

export default supabase;
