import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-stone-200 shadow-lg">
          <div className="w-16 h-16 bg-amber-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Compass size={36} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-text mb-2">Page Not Found</h1>
          <p className="text-sm text-muted mb-6">
            The page or corridor you are looking for does not exist in Shantigram Gurukul.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-medium shadow transition"
          >
            <Home size={18} />
            Return to Campus Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
