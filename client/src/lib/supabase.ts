import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://wkshuxwvuedzvgciniyh.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_McVjXaUQpLZPIXBS-E5KnQ_Rc5i1TR5';

export const supabase = createClient(url, key);
