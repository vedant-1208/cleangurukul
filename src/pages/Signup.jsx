import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { useToast } from '../components/ToastProvider.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import FloorSelector from '../components/FloorSelector.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { UserPlus, User, Mail, KeyRound, Building, Home, ShieldAlert } from 'lucide-react';

export default function Signup() {
  const { signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'cleaner'
  const [floor, setFloor] = useState('1');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email,
        password,
        fullName,
        role,
        floor: role === 'student' ? floor : null,
        room: role === 'student' ? room : null,
      });

      toast.success('Registration successful! Welcome to Shantigram Gurukul.');
      if (role === 'cleaner') {
        navigate('/cleaner');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-3">
              <ShieldAlert size={13} />
              TEST MODE
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Create an Account
            </h1>
            <p className="text-xs text-muted mt-1">
              Gurukul student and staff cleanliness management enrollment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
                />
              </div>
            </div>

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
                  placeholder="student@shantigram.org"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
                />
              </div>
            </div>

            {/* Role Selection: Student or Cleaner only */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    role === 'student'
                      ? 'border-primary bg-primary/10 text-primaryDark'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User size={16} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('cleaner')}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                    role === 'cleaner'
                      ? 'border-sky-600 bg-sky-50 text-sky-800'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Building size={16} />
                  Cleaner
                </button>
              </div>
            </div>

            {/* If Student: ask Floor & Room */}
            {role === 'student' ? (
              <div className="p-3 bg-secondary/30 rounded-xl border border-amber-200/50 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Resident Floor
                  </label>
                  <FloorSelector value={floor} onChange={setFloor} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Room / Dorm Number
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. 204-B"
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* If Cleaner: note that divisions will be assigned */
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-800 leading-relaxed">
                <span className="font-semibold block mb-0.5">Staff Notice:</span>
                Cleaning divisions and shifts will be assigned to your account by the hostel Superadmin after account creation.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primaryDark text-white font-medium shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center text-sm text-stone-600">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
