import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://nejmzqabhxugwbxtztym.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lam16cWFiaHh1Z3dieHR6dHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MjYzNTIsImV4cCI6MjA4NzMwMjM1Mn0.umeNCZmhOsbxR0_Lo4V33zNpmtM36ybtU9NDKMgIFCU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
