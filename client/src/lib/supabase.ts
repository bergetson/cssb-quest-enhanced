import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://wkshuxwvuedzvgciniyh.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indrc2h1eHd2dWVkenZnY2luaXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTk3MjUsImV4cCI6MjA5NTA3NTcyNX0._IoQ4i3pXWyAOqH0oHX9Rm-gsg79QlnXtZNMMXsfLpI';

export const supabase = createClient(url, key);
