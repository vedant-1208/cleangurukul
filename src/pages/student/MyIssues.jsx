import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import IssueCard from '../../components/IssueCard.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getMyIssues, getIssueComments, addIssueComment } from '../../lib/api.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function MyIssues() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const loadIssues = async () => {
    if (!user?.id) return;
    try {
      const data = await getMyIssues(user.id);
      setIssues(data || []);
    } catch (err) {
      console.error('Error fetching my issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  const openIssueModal = async (issue) => {
    setSelectedIssue(issue);
    try {
      const comms = await getIssueComments(issue.id);
      setComments(comms || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssue) return;

    setSendingComment(true);
    try {
      const newComment = await addIssueComment(
        {
          issueId: selectedIssue.id,
          message: commentText.trim(),
          visibleToReporter: true,
        },
        { id: user.id, role: profile?.role || 'student' }
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      toast.success('Comment added.');
    } catch (err) {
      console.error('Failed to post comment:', err);
      toast.error('Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              My Reported Issues
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Track resolution progress, cleaner actions, and warden remarks on your reports.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-sm w-fit">
            Total Reports: {issues.length}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your submitted reports..." />
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-text mb-1">
              No Issues Reported
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              You haven't submitted any cleanliness tickets yet. All areas around your floor appear in good standing!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => openIssueModal(issue)}
              />
            ))}
          </div>
        )}

        {/* Modal for Issue Details & Comments */}
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StatusChip status={selectedIssue.status} />
                  <span className="text-sm font-semibold text-stone-700">
                    Floor {selectedIssue.floor_code} {selectedIssue.room ? `• Room ${selectedIssue.room}` : ''}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* Before & After Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                      Report Photo
                    </span>
                    <img
                      src={selectedIssue.photo_url}
                      alt="Reported Issue"
                      className="w-full aspect-video object-cover rounded-xl border border-stone-200"
                    />
                  </div>
                  {selectedIssue.resolution_photo_url && (
                    <div>
                      <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1.5">
                        Cleaned / After Photo
                      </span>
                      <img
                        src={selectedIssue.resolution_photo_url}
                        alt="Resolution Proof"
                        className="w-full aspect-video object-cover rounded-xl border border-emerald-200"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-text bg-stone-50 p-3 rounded-xl border border-stone-200">
                    {selectedIssue.description || 'No description provided.'}
                  </p>
                </div>

                {/* Highlighted Admin Feedback Box */}
                {selectedIssue.admin_feedback && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 shadow-sm">
                    <div className="flex items-center gap-2 text-primaryDark font-semibold text-xs uppercase tracking-wider mb-1">
                      <Sparkles size={14} className="text-primary" />
                      Administrative / Warden Feedback
                    </div>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">
                      {selectedIssue.admin_feedback}
                    </p>
                  </div>
                )}

                {/* Comments Thread */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={16} className="text-primary" />
                    <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Conversation Thread ({comments.length})
                    </h4>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
                    {comments.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No comments yet.</p>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3 rounded-xl text-xs ${
                            c.author_id === user.id
                              ? 'bg-amber-50/70 ml-6 border border-amber-200/50'
                              : 'bg-stone-100 mr-6 border border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 font-semibold text-stone-800">
                            <span>{c.author?.full_name || 'Staff Member'}</span>
                            <span className="text-[10px] text-stone-400 uppercase">
                              {c.author_role}
                            </span>
                          </div>
                          <p className="text-stone-700 text-xs">{c.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Type a message or note..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text"
                    />
                    <button
                      type="submit"
                      disabled={sendingComment || !commentText.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                    >
                      <Send size={12} />
                      Post
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
