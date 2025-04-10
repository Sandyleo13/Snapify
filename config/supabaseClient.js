import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and API key
const SUPABASE_URL = 'https://wspqkmzyceejzwcobney.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcHFrbXp5Y2Vlanp3Y29ibmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjAyNDEsImV4cCI6MjA1OTY5NjI0MX0.B-pacmYWJGxORX88at76G_T4icZYjni7P16_tyz8WS4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase; // Use ES module export