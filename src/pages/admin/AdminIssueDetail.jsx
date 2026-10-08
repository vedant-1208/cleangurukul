import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import DivisionSelector from '../../components/DivisionSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import {
  getAllIssues,
  adminUpdateIssue,
  assignIssue,
  adminResolveOnBehalf,
  adminReopenIssue,
  adminDeleteIssue,
  getIssueComments,
  addIssueComment,
  getAllUsers,
  getAuditLog,
} from '../../lib/api.js';
import { uploadToCloudinary } from '../../lib/uploadToCloudinary.js';
import {
  ArrowLeft,
  User,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function AdminIssueDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [cleaners, setCleaners] = useState([]);
  const [comments, setComments] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [description, setDescription] = useState('');
  const [floorCode, setFloorCode] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [room, setRoom] = useState('');
  const [priority, setPriority] = useState('normal');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [visibleToReporter, setVisibleToReporter] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  // Modals & Dialogs
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvePhotoFile, setResolvePhotoFile] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const [allIssues, allCleaners, comms, audit] = await Promise.all([
        getAllIssues(),
        getAllUsers({ role: 'cleaner' }),
        getIssueComments(id),
        getAuditLog(),
      ]);

      const found = (allIssues || []).find((i) => i.id === id);
      if (found) {
        setIssue(found);
        setDescription(found.description || '');
        setFloorCode(found.floor_code || '');
        setDivisionId(found.division_id || '');
        setRoom(found.room || '');
        setPriority(found.priority || 'normal');
        setAssignedTo(found.assigned_to || '');
        setAdminFeedback(found.admin_feedback || '');
      }
      setCleaners(allCleaners || []);
      setComments(comms || []);

      const issueAudit = (audit || []).filter(
        (a) => a.target_id === id || a.payload?.deletedIssueId === id
      );
      setAuditEvents(issueAudit);
    } catch (err) {
      console.error('Error fetching issue detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      await adminUpdateIssue(
        id,
        {
          description,
          floor_code: floorCode,
          division_id: divisionId || null,
          room,
          priority,
          assigned_to: assignedTo || null,
          admin_feedback: adminFeedback,
        },
        user.id,
        { id: user.id, role: profile?.role || 'admin' }
      );
      toast.success('Issue details updated.');
      loadData();
    } catch (err) {
      console.error('Failed to update issue:', err);
      toast.error('Failed to update issue.');
    }
  };

  const handleAssignCleaner = async (cleanerId) => {
    try {
      await assignIssue(id, cleanerId, { id: user.id, role: profile?.role || 'admin' });
      toast.success('Assigned to cleaner.');
      loadData();
    } catch (err) {
      console.error('Failed to assign cleaner:', err);
      toast.error('Failed to assign cleaner.');
    }
  };

  const handleResolveOnBehalf = async (e) => {
    e.preventDefault();
    setResolving(true);
    try {
      let photoUrl = issue.photo_url;
      if (resolvePhotoFile) {
        photoUrl = await uploadToCloudinary(resolvePhotoFile);
      }
      await adminResolveOnBehalf(id, photoUrl, user.id, {
        id: user.id,
        role: profile?.role || 'admin',
      });
      toast.success('Marked as resolved on behalf.');
      setIsResolveModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to resolve on behalf:', err);
      toast.error('Failed to resolve on behalf.');
    } finally {
      setResolving(false);
    }
  };

  const handleReopen = async () => {
    try {
      await adminReopenIssue(id, user.id, { id: user.id, role: profile?.role || 'admin' });
      toast.success('Issue reopened.');
      loadData();
    } catch (err) {
      console.error('Failed to reopen issue:', err);
      toast.error('Failed to reopen issue.');
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteIssue(id, user.id, { id: user.id, role: profile?.role || 'admin' });
      toast.success('Issue deleted.');
      navigate('/admin');
    } catch (err) {
      console.error('Failed to delete issue:', err);
      toast.error('Failed to delete issue.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      const newComm = await addIssueComment(
        {
          issueId: id,
          message: commentText.trim(),
          visibleToReporter,
        },
        { id: user.id, role: profile?.role || 'admin' }
      );
      setComments((prev) => [...prev, newComm]);
      setCommentText('');
      toast.success('Comment added.');
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error('Failed to add comment.');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading issue details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1 max-w-md mx-auto p-8 text-center flex flex-col justify-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Issue Not Found</h2>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs"
          >
            Return to Kanban
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-text mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Kanban Board
        </button>

        {/* Action Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusChip status={issue.status} />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                ID: {issue.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Floor {issue.floor_code} Cleanliness Ticket
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {issue.status !== 'resolved' ? (
              <button
                onClick={() => setIsResolveModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-green-800 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} /> Resolve on Behalf
              </button>
            ) : (
              <button
                onClick={handleReopen}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition flex items-center gap-1.5"
              >
                <RotateCcw size={15} /> Reopen Ticket
              </button>
            )}

            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-danger border border-rose-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 size={15} /> Delete Issue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Photos, Editor, and Comments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-text mb-4">Photo Evidence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Report Photo
                  </span>
                  <img
                    src={issue.photo_url}
                    alt="Report photo"
                    className="w-full aspect-video object-cover rounded-xl border border-stone-200"
                  />
                  <div className="text-[11px] text-muted mt-1">
                    Captured: {new Date(issue.photo_taken_at).toLocaleString()}
                  </div>
                </div>

                {issue.resolution_photo_url && (
                  <div>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1.5">
                      Resolution / Cleaned Proof
                    </span>
                    <img
                      src={issue.resolution_photo_url}
                      alt="Resolution photo"
                      className="w-full aspect-video object-cover rounded-xl border border-emerald-200"
                    />
                    <div className="text-[11px] text-muted mt-1">
                      Resolved: {issue.resolved_at ? new Date(issue.resolved_at).toLocaleString() : 'Yes'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editable Fields Form */}
            <form onSubmit={handleSaveChanges} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
              <h3 className="font-serif text-lg font-bold text-text mb-2">Edit Ticket Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Floor Zone</label>
                  <FloorSelector value={floorCode} onChange={setFloorCode} className="text-xs py-2" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Division</label>
                  <DivisionSelector floorCode={floorCode} value={divisionId} onChange={setDivisionId} className="text-xs py-2" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room / Landmark</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-text"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assign Cleaner</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-text"
                  >
                    <option value="">Unassigned</option>
                    {cleaners.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Warden / Admin Feedback (Visible to Student)
                </label>
                <textarea
                  rows={2}
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  placeholder="Provide guidance or feedback for the student reporter..."
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-text"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold shadow transition"
                >
                  Save Ticket Updates
                </button>
              </div>
            </form>

            {/* Comments Thread */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-primary" />
                <h3 className="font-serif text-lg font-bold text-text">
                  Conversation & Internal Notes ({comments.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No notes or comments logged yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900">{c.author?.full_name || 'Staff'}</span>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400">
                          <span className="uppercase">{c.author_role}</span>
                          {!c.visible_to_reporter && (
                            <span className="bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded">Internal</span>
                          )}
                        </div>
                      </div>
                      <p className="text-stone-700">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add comment or staff dispatch note..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text"
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !commentText.trim()}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send size={13} /> Send
                  </button>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleToReporter}
                    onChange={(e) => setVisibleToReporter(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Visible to reporting resident
                </label>
              </form>
            </div>
          </div>

          {/* Column 3: Reporter Info & Audit Timeline */}
          <div className="space-y-6">
            {/* Reporter Profile Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm text-xs">
              <h4 className="font-serif text-base font-bold text-text mb-3">Reporter Details</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Name</span>
                  <span className="font-semibold text-stone-800">{issue.reporter?.full_name || 'Anonymous Resident'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Role</span>
                  <span className="capitalize">{issue.reporter_role}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Hostel Dorm</span>
                  <span>Room {issue.reporter?.room || issue.room || '—'}</span>
                </div>
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm text-xs">
              <h4 className="font-serif text-base font-bold text-text mb-3">Audit Trail</h4>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {auditEvents.length === 0 ? (
                  <p className="text-stone-400 italic">No specific audit entries logged yet.</p>
                ) : (
                  auditEvents.map((a) => (
                    <div key={a.id} className="border-l-2 border-primary/40 pl-3 py-1 space-y-0.5">
                      <div className="font-semibold text-stone-800">{a.action}</div>
                      <div className="text-[10px] text-muted flex items-center gap-1">
                        <span>By {a.actor?.full_name || a.actor_role}</span>
                        <span>&bull;</span>
                        <span>{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resolve on Behalf Modal */}
        {isResolveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
              <h3 className="font-serif text-xl font-bold text-text mb-2">Mark Resolved on Behalf</h3>
              <p className="text-muted mb-4">
                Confirm resolution of this ticket on behalf of cleaning staff. You can optionally attach a verified proof photo.
              </p>

              <form onSubmit={handleResolveOnBehalf} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Proof Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolvePhotoFile(e.target.files[0])}
                    className="w-full text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResolveModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-green-800 text-white font-semibold"
                  >
                    {resolving ? 'Resolving...' : 'Confirm Resolved'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Issue Ticket?"
          message="Are you sure you want to delete this issue? This will permanently remove the ticket and associated photo links."
          confirmText="Delete"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </main>

      <Footer />
    </div>
  );
}
