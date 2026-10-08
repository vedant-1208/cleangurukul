import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAllUsers, getDivisions, getComplianceSummary } from '../../lib/api.js';
import {
  Crown,
  Users,
  Building,
  CheckCircle2,
  Settings,
  Layers,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function SuperDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    cleaners: 0,
    moderators: 0,
    divisions: 0,
    complianceToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      getAllUsers(),
      getDivisions(),
      getComplianceSummary({ from: today }),
    ])
      .then(([users, divs, logsToday]) => {
        const uList = users || [];
        const dList = divs || [];
        const lList = logsToday || [];

        const approvedLogs = lList.filter((l) => l.status === 'approved').length;
        const compliance = dList.length > 0 ? Math.round((approvedLogs / dList.length) * 100) : 0;

        setStats({
          totalUsers: uList.length,
          cleaners: uList.filter((u) => u.role === 'cleaner').length,
          moderators: uList.filter((u) => u.role === 'moderator').length,
          divisions: dList.length,
          complianceToday: Math.min(compliance, 100),
        });
      })
      .catch((err) => console.error('Super dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Superadmin Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-primaryDark to-primary text-amber-100 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Crown size={14} /> Full Administrative Authority
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white mb-2">
              Superadmin Control Center
            </h1>
            <p className="text-amber-200/90 text-sm max-w-2xl leading-relaxed">
              Define Gurukul divisions per floor, manage cleaner zone assignments, promote moderators and administrators, and configure global cleanliness parameters.
            </p>
          </div>
          <Sparkles className="absolute right-4 bottom-4 w-40 h-40 text-white/5 pointer-events-none" />
        </div>

        {/* 5 Stats Cards */}
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="lg" message="Loading campus metrics..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Total Users
              </div>
              <div className="text-2xl font-serif font-bold text-text">
                {stats.totalUsers}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
                Cleaners
              </div>
              <div className="text-2xl font-serif font-bold text-sky-900">
                {stats.cleaners}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
                Moderators
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-900">
                {stats.moderators}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
                Total Divisions
              </div>
              <div className="text-2xl font-serif font-bold text-text">
                {stats.divisions}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
              <div className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                Compliance Today
              </div>
              <div className="text-2xl font-serif font-bold text-primaryDark">
                {stats.complianceToday}%
              </div>
            </div>
          </div>
        )}

        {/* Quick Links to Superadmin Pages */}
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold text-text mb-4">
            Administrative Management Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/super/divisions"
              className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-primary/50 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-text mb-1">
                  Manage Divisions
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Define cleanliness zones across all 13 building floors (corridors, washrooms, staircases).
                </p>
              </div>
              <div className="text-xs font-semibold text-primary flex items-center gap-1">
                Configure Divisions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/super/assignments"
              className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-sky-500/50 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-text mb-1">
                  Cleaner Assignments
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Matrix grid allocating cleaning staff to specific floor divisions with batch saving.
                </p>
              </div>
              <div className="text-xs font-semibold text-sky-800 flex items-center gap-1">
                Assign Zones <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/super/roles"
              className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-amber-500/50 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-warning flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-text mb-1">
                  Manage Roles
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Promote or demote users between Student, Moderator, Admin, and Superadmin tiers.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                Modify Roles <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/super/settings"
              className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-stone-400 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-text mb-1">
                  System Settings
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Configure app display branding, cleaning cycle frequencies, and auto-approval rules.
                </p>
              </div>
              <div className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                Edit Settings <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/proofs"
              className="bg-white p-6 rounded-2xl border border-stone-200 hover:border-primary/50 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-text mb-1">
                  Cleaning Proofs
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Review, approve, or reject after-cleaning photo proofs submitted by cleaners.
                </p>
              </div>
              <div className="text-xs font-semibold text-primary flex items-center gap-1">
                Review Proofs <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
