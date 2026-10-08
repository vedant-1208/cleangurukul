import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { supabase } from '../../config/supabaseClient.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import IssueCard from '../../components/IssueCard.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { getIssuesForCleaner, updateIssueStatus } from '../../lib/api.js';
import { uploadToCloudinary } from '../../lib/uploadToCloudinary.js';
import { validateLivePhoto } from '../../lib/livePhoto.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { AlertCircle, CheckCircle2, X, Send, Camera } from 'lucide-react';

export default function AssignedIssues() {
  const { user } = useAuth();
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('zone'); // 'zone' | 'all' | 'urgent'
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchIssues = async () => {
    if (!user?.id) return;
    try {
      const data = await getIssuesForCleaner(user.id);
      setIssues(data || []);
    } catch (err) {
      console.error('Failed to load issues for cleaner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    // Realtime subscription on issues table
    const channel = supabase
      .channel('cleaner_issues_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues' },
        () => {
          fetchIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Tab Filtering
  const filteredIssues = issues.filter((issue) => {
    if (activeTab === 'urgent') return issue.priority === 'urgent';
    if (activeTab === 'zone') return issue.status !== 'resolved' && issue.status !== 'rejected';
    return true; // 'all'
  });

  const handleResolveIssue = async (e) => {
    e.preventDefault();
    if (!selectedIssue || !resolutionPhoto) {
      toast.warning('Please capture a live after-cleaning photo to resolve this issue.');
      return;
    }

    setResolving(true);
    try {
      const valid = await validateLivePhoto(resolutionPhoto);
      if (!valid.ok) {
        toast.error(valid.reason || 'Live photo check failed.');
        setResolving(false);
        return;
      }

      const photoUrl = await uploadToCloudinary(resolutionPhoto);

      await updateIssueStatus(
        selectedIssue.id,
        'resolved',
        { resolution_photo_url: photoUrl },
        { id: user.id, role: 'cleaner' }
      );

      toast.success('Issue marked as resolved with photo proof!');
      setSelectedIssue(null);
      setResolutionPhoto(null);
      fetchIssues();
    } catch (err) {
      console.error('Failed to resolve issue:', err);
      toast.error('Failed to update issue status.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Assigned Student Issues
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Active cleaning tickets reported by hostel residents in your assigned floor zones.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-stone-200/60 p-1 border border-stone-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('zone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'zone' ? 'bg-white text-text shadow-sm' : 'text-stone-600 hover:text-text'
              }`}
            >
              Active Zone ({issues.filter((i) => i.status !== 'resolved' && i.status !== 'rejected').length})
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'urgent' ? 'bg-white text-danger shadow-sm' : 'text-stone-600 hover:text-text'
              }`}
            >
              Urgent ({issues.filter((i) => i.priority === 'urgent').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' ? 'bg-white text-text shadow-sm' : 'text-stone-600 hover:text-text'
              }`}
            >
              All Records ({issues.length})
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Checking assigned reports..." />
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <CheckCircle2 size={36} className="text-accent mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-text mb-1">
              All Clear in Your Zone!
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              There are currently no open tickets matching this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => setSelectedIssue(issue)}
              />
            ))}
          </div>
        )}

        {/* Resolve Issue Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusChip status={selectedIssue.status} />
                  <span className="text-sm font-semibold text-stone-800">
                    Floor {selectedIssue.floor_code} {selectedIssue.room ? `• Room ${selectedIssue.room}` : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setResolutionPhoto(null);
                  }}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                    Student Issue Photo
                  </span>
                  <img
                    src={selectedIssue.photo_url}
                    alt="Reported Issue"
                    className="w-full aspect-video object-cover rounded-xl border border-stone-200"
                  />
                  <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 mt-2">
                    {selectedIssue.description || 'No description provided.'}
                  </p>
                </div>

                {selectedIssue.status !== 'resolved' ? (
                  <form onSubmit={handleResolveIssue} className="pt-4 border-t border-stone-100 space-y-4">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-text mb-1">
                        Resolve with After-Cleaning Proof
                      </h4>
                      <p className="text-xs text-muted mb-3">
                        Capture a live photo showing this issue has been thoroughly addressed.
                      </p>
                      <CameraCapture onCapture={setResolutionPhoto} required={true} />
                    </div>

                    <button
                      type="submit"
                      disabled={resolving || !resolutionPhoto}
                      className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-green-800 disabled:bg-stone-300 text-white font-medium shadow transition flex items-center justify-center gap-2"
                    >
                      {resolving ? (
                        <LoadingSpinner size="sm" message="Uploading resolution proof..." />
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Mark as Resolved</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold block mb-1">Status: Resolved</span>
                    This ticket has already been marked as cleaned.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
