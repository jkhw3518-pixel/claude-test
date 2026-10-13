import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
);

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  group_name: string | null;
  memo: string | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
};
