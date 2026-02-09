import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://kndkinhwryujohsrtvaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZGtpbmh3cnl1am9oc3J0dmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTI2MzcsImV4cCI6MjA4NjA4ODYzN30.hLlN4TX360koSwSZqvyUtTLav6klKqeyuv_xP9qo95M'; // 👈 Pega aquí la key que copiaste

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});