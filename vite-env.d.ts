/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_SUPABASE_TABLE: string;
  readonly VITE_GOOGLE_SHEET_ID: string;
  readonly VITE_INTERNAL_CONTACTS_GID: string;
  readonly VITE_CHAT_WEBHOOK_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_APP_ENV: 'development' | 'production';
  readonly VITE_N8N_INVENTORY_FORM_URL: string;
  readonly VITE_N8N_DEAL_FORM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

