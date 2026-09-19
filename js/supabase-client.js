window.nluxSupabase = (function () {
  const SUPABASE_URL = 'https://vauutpcszwzsyoyrqzba.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdXV0cGNzend6c3lveXJxemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTcyMjksImV4cCI6MjEwNTM5MzIyOX0.ciO81H_rwsSTtm3pm3v1rwOVs1bHTg0rLDDaFyKfgcw';
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
