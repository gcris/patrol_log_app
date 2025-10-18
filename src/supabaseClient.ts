import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wwvmcdgqapxxqvstxxwp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dm1jZGdxYXB4eHF2c3R4eHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTExNjEsImV4cCI6MjA3NjI4NzE2MX0.IF2bsIhQx0ArNCS7haFEeVZDXInwfezAzeLx-zEigb4"; // 🔁 replace

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
