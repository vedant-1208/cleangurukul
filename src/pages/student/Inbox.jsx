import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getNoticesForUser, markNoticeRead } from '../../lib/api.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { Bell, CheckCheck, Clock, MailOpen, Mail } from 'lucide-react';

export default function Inbox() {
  const { user } = useAuth();
  const toast = useToast();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    if (!user?.id) return;
    try {
      const data = await getNoticesForUser(user.id);
      setNotices(data || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [user]);

  const handleMarkRead = async (notice) => {
    if (notice.read_at) return;
    try {
      await markNoticeRead(notice.id);
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      toast.success('Notice marked as read.');
    } catch (err) {
      console.error('Failed to mark notice as read:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Notices & Announcements
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Official cleanliness updates, inspection reminders, and warden notices.
            </p>
          </div>
          <div className="p-3 bg-amber-100 text-primary rounded-2xl">
            <Bell size={24} />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading notices..." />
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MailOpen size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-text mb-1">
              Inbox is Empty
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              You have no active notices or announcements from administrators.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => {
              const isUnread = !notice.read_at;
              return (
                <div
                  key={notice.id}
                  onClick={() => handleMarkRead(notice)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    isUnread
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm hover:shadow'
                      : 'bg-white border-stone-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        isUnread ? 'bg-amber-200 text-primaryDark' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isUnread ? <Mail size={20} /> : <MailOpen size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-text">
                          {notice.title}
                        </h3>
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold uppercase">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                        {notice.body}
                      </p>
                      <div className="mt-2 text-[11px] text-muted flex items-center gap-2">
                        <span>From: {notice.sender?.full_name || 'Hostel Administration'}</span>
                        <span>&bull;</span>
                        <Clock size={12} />
                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-end sm:self-center">
                    {isUnread ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notice);
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-primary font-semibold hover:bg-amber-100 transition flex items-center gap-1 shadow-sm"
                      >
                        <CheckCheck size={14} />
                        Mark Read
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <CheckCheck size={14} /> Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
