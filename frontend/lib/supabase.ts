import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://afcfdunxkikbergebhro.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2ZkdW54a2lrYmVyZ2ViaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzY3NjksImV4cCI6MjA3OTUxMjc2OX0.Nm7_Gq2L8PPpBK7ttwrFSZVFCIOC85HHkPzU-txKSLI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
