import React, { createContext, useState, useEffect } from 'react';
import * as authProvider from './providers/supabaseAuth.js';
import { supabase } from '../config/supabaseClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      return data || null;
    } catch (err) {
      console.error('Failed to load profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const prof = await fetchProfile(user.id);
    setProfile(prof);
    return prof;
  };

  useEffect(() => {
    let mounted = true;

    // Check active session
    authProvider.getSession().then(async (session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (mounted) setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    }).catch((err) => {
      console.error('Session check error:', err);
      if (mounted) setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authProvider.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (mounted) setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (credentials) => {
    setLoading(true);
    try {
      const result = await authProvider.signIn(credentials);
      if (result?.user) {
        setUser(result.user);
        const prof = await fetchProfile(result.user.id);
        setProfile(prof);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data) => {
    setLoading(true);
    try {
      const result = await authProvider.signUp(data);
      if (result?.user) {
        setUser(result.user);
        const prof = await fetchProfile(result.user.id);
        setProfile(prof);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authProvider.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
