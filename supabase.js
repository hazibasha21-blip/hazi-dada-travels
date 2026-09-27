const SUPABASE_URL = "https://wsrnlftrmjqutrrejajj.supabase.co";
const SUPABASE_ANON_KEY = "const SUPABASE_ANON_KEY = "YOUR_FULL_SUPABASE_PUBLISHABLE_KEY
  ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
