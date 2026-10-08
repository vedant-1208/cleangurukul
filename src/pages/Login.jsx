import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { useToast } from '../components/ToastProvider.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { LogIn, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn({ email, password });
      toast.success('Signed in successfully.');

      // Fetch user role if present in session or navigate to default
      const userRole = result?.user?.user_metadata?.role || 'student';
      const defaultPaths = {
        student: '/student',
        cleaner: '/cleaner',
        moderator: '/moderator',
        admin: '/admin',
        superadmin: '/super',
      };

      const from = location.state?.from?.pathname;
      navigate(from || defaultPaths[userRole] || '/student', { replace: true });
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <LogIn size={24} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Portal Sign In
            </h1>
            <p className="text-sm text-muted mt-1">
              Shantigram Gurukul Residential Cleanliness Management
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@shantigram.org"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primaryDark text-white font-medium shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
