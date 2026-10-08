import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {
  Sparkles,
  Camera,
  ClipboardCheck,
  AlertTriangle,
  Building,
  ShieldCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-secondary/50 via-surface to-surface border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-primaryDark text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles size={14} className="text-primary" />
              Residential Cleanliness & Quality Assurance
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-primaryDark tracking-tight leading-tight sm:leading-none mb-6">
              Clean Gurukul, <span className="text-primary italic">Proud Gurukul</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 font-normal leading-relaxed mb-10">
              Shantigram Gurukul's verified cleanliness management system. Enforcing scheduled daily cleaning proofs with live camera verification, student issue tracking, and multi-tier moderation across all 13 building zones.
            </p>

            {/* Role Quick Access Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto mb-12">
              <Link
                to="/login?role=student"
                className="px-5 py-3 rounded-xl bg-white border border-stone-200 hover:border-primary text-text font-medium shadow-sm hover:shadow transition flex items-center gap-2 group"
              >
                <span>Student Login</span>
                <ArrowRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login?role=cleaner"
                className="px-5 py-3 rounded-xl bg-white border border-stone-200 hover:border-sky-500 text-sky-900 font-medium shadow-sm hover:shadow transition flex items-center gap-2 group"
              >
                <span>Cleaner Login</span>
                <ArrowRight size={16} className="text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login?role=moderator"
                className="px-5 py-3 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-emerald-900 font-medium shadow-sm hover:shadow transition flex items-center gap-2 group"
              >
                <span>Moderator Login</span>
                <ArrowRight size={16} className="text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login?role=admin"
                className="px-5 py-3 rounded-xl bg-primary hover:bg-primaryDark text-white font-medium shadow-md hover:shadow-lg transition flex items-center gap-2 group"
              >
                <span>Admin Login</span>
                <ArrowRight size={16} className="text-secondary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quick Stats banner */}
            <div className="inline-grid grid-cols-3 gap-6 sm:gap-12 py-4 px-8 rounded-2xl bg-white/70 border border-primary/20 backdrop-blur-sm shadow-sm text-center">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-primaryDark">13</div>
                <div className="text-[11px] sm:text-xs text-muted font-medium uppercase tracking-wider">Floors & Basements</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-accent">100%</div>
                <div className="text-[11px] sm:text-xs text-muted font-medium uppercase tracking-wider">Live Photo Proof</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-primary">Daily</div>
                <div className="text-[11px] sm:text-xs text-muted font-medium uppercase tracking-wider">Audited Logs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars / Feature Cards */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-3">
              Comprehensive Cleanliness Architecture
            </h2>
            <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
              Engineered specifically for the high discipline and community standards of a traditional residential Gurukul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                <Camera size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-text mb-2">Daily Cleaning Proof</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Cleaners upload after-cleaning photos for each assigned division on their shift. Live camera capture and timestamp verification prevent gallery uploads or stale photos.
              </p>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                Primary Core Pillar
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-warning flex items-center justify-center mb-5">
                <AlertTriangle size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-text mb-2">Issue Reporting</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Students and hostel residents report sanitation concerns instantly by floor and room. Cleaners are notified and resolve tickets with mandatory before-and-after proof.
              </p>
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                Student & Staff Voice
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-accent flex items-center justify-center mb-5">
                <ClipboardCheck size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-text mb-2">Moderator Verification</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Senior students, teachers, and wardens review photo proof with three-way verification: Approve, Request Redo, or Reject with actionable remarks.
              </p>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                Accountability Loop
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
