// ecommerce-store/src/lib/supabase.js

// هذا ملف وهمي مؤقت عشان التطبيق يشتغل بدون Supabase
// هنربطه بـ Supabase الحقيقي بعدين

export const supabase = {
  auth: {
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    insert: () => ({
      select: async () => ({ data: null, error: null })
    }),
    update: () => ({
      eq: () => async () => ({ error: null })
    }),
    delete: () => ({
      eq: () => async () => ({ error: null })
    })
  })
};

export default supabase;