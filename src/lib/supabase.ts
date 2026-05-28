import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 判断 Supabase 是否已配置（URL 和 Key 都存在且非空）
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 仅在已配置时才创建客户端，避免无配置时控制台报错
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
