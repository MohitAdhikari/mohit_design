import fs from 'node:fs';

import { createClient } from '@supabase/supabase-js';

const envPath = new URL('../.env.local', import.meta.url);
const raw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let value = trimmed.slice(idx + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node setAdminPassword.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
  console.error('Failed to list users:', listErr.message);
  process.exit(1);
}

const existing = list.users.find(u => u.email === email);
let userId;
if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true
  });
  if (error) {
    console.error('Failed to update password:', error.message);
    process.exit(1);
  }
  userId = existing.id;
  console.log('Password updated for', email);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });
  if (error) {
    console.error('Failed to create user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Created user', email);
}

const { error: profileErr } = await supabase.from('profiles').upsert(
  { id: userId, email, role: 'admin', active: true },
  { onConflict: 'id' }
);
if (profileErr) {
  console.error('Failed to set admin role:', profileErr.message);
  process.exit(1);
}

console.log('Done. You can now sign in at http://localhost:3000/dashboard/login');
