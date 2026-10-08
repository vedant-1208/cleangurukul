import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { supabase } from '../../config/supabaseClient.js';
import { logAudit } from '../../lib/api.js';
import { Settings, Save, Clock, Building, Sparkles } from 'lucide-react';

export default function SystemSettings() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [appName, setAppName] = useState('Shantigram Gurukul Cleanliness');
  const [defaultFrequency, setDefaultFrequency] = useState('daily');
  const [autoApproveHours, setAutoApproveHours] = useState(24);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .eq('key', 'general')
      .single()
      .then(({ data, error }) => {
        if (!error && data?.value) {
          if (data.value.app_name) setAppName(data.value.app_name);
          if (data.value.default_frequency) setDefaultFrequency(data.value.default_frequency);
          if (data.value.auto_approve_hours) setAutoApproveHours(data.value.auto_approve_hours);
        }
      })
      .catch((err) => console.error('Error loading settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const newSettings = {
      app_name: appName,
      default_frequency: defaultFrequency,
      auto_approve_hours: Number(autoApproveHours),
    };

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'general',
          value: newSettings,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await logAudit({
        actorId: user.id,
        actorRole: profile?.role || 'superadmin',
        action: 'UPDATE_SYSTEM_SETTINGS',
        targetTable: 'settings',
        targetId: null,
        payload: newSettings,
      });

      toast.success('System settings saved successfully!');
    } catch (err) {
      console.error('Failed to update settings:', err);
      toast.error('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Settings size={14} /> Global System Configuration
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            System & Cleanliness Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Configure application branding, default cleaning proof cadences, and moderation automation rules.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="py-12 text-center">
              <LoadingSpinner message="Loading configuration..." />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs sm:text-sm">
              {/* App Name */}
              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  App Display Name
                </label>
                <div className="relative">
                  <Building className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Shown across the portal headers, page titles, and notification dispatches.
                </p>
              </div>

              {/* Default Cleaning Frequency */}
              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Default Division Cleaning Frequency
                </label>
                <select
                  value={defaultFrequency}
                  onChange={(e) => setDefaultFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-text text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="daily">Daily (Once per day)</option>
                  <option value="twice_daily">Twice Daily (Morning & Evening)</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom Shift Cadence</option>
                </select>
                <p className="text-[11px] text-muted mt-1">
                  Applied as the default when creating new floor divisions.
                </p>
              </div>

              {/* Auto-Approve Hours */}
              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Auto-Approve Cleaning Logs (After N Hours)
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min={1}
                    max={168}
                    required
                    value={autoApproveHours}
                    onChange={(e) => setAutoApproveHours(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Cleaning proof submissions unreviewed by moderators after this duration will automatically transition to approved.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold shadow transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
