import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAllUsers, sendNotice } from '../../lib/api.js';
import { supabase } from '../../config/supabaseClient.js';
import { Send, Mail, CheckCheck, Clock, User, Bell } from 'lucide-react';

export default function AdminNotices() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [sentNotices, setSentNotices] = useState([]);
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers || []);

      const { data: notices, error } = await supabase
        .from('student_notices')
        .select('*, recipient:recipient_id(full_name, email, role), sender:sender_id(full_name)')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching sent notices:', error);
      setSentNotices(notices || []);
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !recipientId) {
      toast.warning('Please select a recipient, title, and message body.');
      return;
    }

    setSending(true);
    try {
      if (recipientId === 'ALL_STUDENTS') {
        const studentList = users.filter((u) => u.role === 'student' && u.is_active);
        for (const stu of studentList) {
          await sendNotice(
            {
              recipientId: stu.id,
              senderId: user.id,
              title: title.trim(),
              body: body.trim(),
            },
            { id: user.id, role: profile?.role || 'admin' }
          );
        }
        toast.success(`Broadcast sent to ${studentList.length} students!`);
      } else {
        await sendNotice(
          {
            recipientId,
            senderId: user.id,
            title: title.trim(),
            body: body.trim(),
          },
          { id: user.id, role: profile?.role || 'admin' }
        );
        toast.success('Notice delivered successfully.');
      }

      setTitle('');
      setBody('');
      setRecipientId('');
      loadData();
    } catch (err) {
      console.error('Failed to send notice:', err);
      toast.error('Failed to send notice.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Official Notices & Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Dispatch announcements, sanitation warnings, or warden reminders directly to residents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compose Notice Form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-primary" />
              <h3 className="font-serif text-lg font-bold text-text">Compose Notice</h3>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Recipient *
                </label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-text focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Recipient</option>
                  <option value="ALL_STUDENTS" className="font-bold text-primary">
                    📢 Broadcast to ALL Students
                  </option>
                  <optgroup label="Individual Residents & Staff">
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name || u.email} ({u.role}
                        {u.floor ? ` - Fl ${u.floor}` : ''})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Floor 3 Washroom Inspection"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={5}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="State the guidelines, timing, or required resident action clearly..."
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Announcement</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sent Notices Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-text">
                  Delivered Notices History ({sentNotices.length})
                </h3>
              </div>

              {loading ? (
                <LoadingSpinner message="Loading sent history..." />
              ) : sentNotices.length === 0 ? (
                <div className="p-8 text-center text-muted text-xs">
                  No notices have been sent yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="p-3 font-semibold text-stone-700">Recipient</th>
                        <th className="p-3 font-semibold text-stone-700">Title</th>
                        <th className="p-3 font-semibold text-stone-700">Read Status</th>
                        <th className="p-3 font-semibold text-stone-700">Sent Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {sentNotices.map((n) => (
                        <tr key={n.id} className="hover:bg-stone-50">
                          <td className="p-3 font-medium text-stone-900">
                            {n.recipient?.full_name || 'Resident'}
                          </td>
                          <td className="p-3 text-stone-700 max-w-xs truncate">
                            <span className="font-semibold">{n.title}</span> &bull; {n.body}
                          </td>
                          <td className="p-3">
                            {n.read_at ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <CheckCheck size={13} /> Read
                              </span>
                            ) : (
                              <span className="text-amber-700 text-[11px] font-medium">
                                Unread
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-stone-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
