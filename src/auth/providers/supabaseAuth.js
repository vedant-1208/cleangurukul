import { supabase } from '../../config/supabaseClient.js';

export async function signUp({ email, password, fullName, role, floor, room }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role || 'student',
        floor: floor || null,
        room: room || null,
      },
    },
  });

  if (error) throw error;

  // As a direct fallback to ensure profile exists immediately
  if (data?.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      role: role || 'student',
      floor: floor || null,
      room: room || null,
      is_active: true,
    }, { onConflict: 'id' }).select().single().catch(() => {});
  }

  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
