const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabaseAdmin = createClient(url, key);

async function fixRLS() {
  const query = `
    ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Taskers can view their own withdrawals" ON withdrawals;
    CREATE POLICY "Taskers can view their own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = tasker_id);
    
    DROP POLICY IF EXISTS "Taskers can insert their own withdrawals" ON withdrawals;
    CREATE POLICY "Taskers can insert their own withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = tasker_id);
  `;
  const { error } = await supabaseAdmin.rpc('exec_sql', { query }).catch((e) => ({error: e}));
  console.log('RLS setup result:', error || 'Success');
}

fixRLS();
