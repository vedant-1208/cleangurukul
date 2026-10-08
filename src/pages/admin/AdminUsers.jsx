import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import RoleBadge from '../../components/RoleBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import {
  getAllUsers,
  updateUser,
  deactivateUser,
  reactivateUser,
  promoteUser,
} from '../../lib/api.js';
import * as authProvider from '../../auth/providers/supabaseAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import {
  Users,
  UserPlus,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Edit2,
  Award,
  Search,
  X,
} from 'lucide-react';

export default function AdminUsers() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('cleaners'); // 'cleaners' | 'students' | 'moderators' | 'admins'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals & Dialogs
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Add User Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newFloor, setNewFloor] = useState('1');
  const [newRoom, setNewRoom] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const tabRoleMap = {
    cleaners: ['cleaner'],
    students: ['student'],
    moderators: ['moderator'],
    admins: ['admin', 'superadmin'],
  };

  const filteredUsers = users
    .filter((u) => tabRoleMap[activeTab].includes(u.role))
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });

  const handleDeactivate = async () => {
    if (!deactivatingUser) return;
    try {
      await deactivateUser(deactivatingUser.id, user.id, {
        id: user.id,
        role: profile?.role || 'admin',
      });
      toast.success(`User ${deactivatingUser.full_name} deactivated.`);
      setDeactivatingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to deactivate user:', err);
      toast.error('Failed to deactivate user.');
    }
  };

  const handleReactivate = async (u) => {
    try {
      await reactivateUser(u.id, { id: user.id, role: profile?.role || 'admin' });
      toast.success(`User ${u.full_name} reactivated.`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to reactivate user:', err);
      toast.error('Failed to reactivate user.');
    }
  };

  const handlePromoteToModerator = async (u) => {
    try {
      await promoteUser(u.id, 'moderator', user.id, {
        id: user.id,
        role: profile?.role || 'admin',
      });
      toast.success(`${u.full_name} promoted to Moderator!`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to promote user:', err);
      toast.error('Failed to promote user.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(
        editingUser.id,
        {
          full_name: editingUser.full_name,
          floor: editingUser.floor,
          room: editingUser.room,
        },
        { id: user.id, role: profile?.role || 'admin' }
      );
      toast.success('User updated successfully.');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error('Failed to update user.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword) {
      toast.warning('Please enter all required fields.');
      return;
    }

    setSubmittingAdd(true);
    try {
      await authProvider.signUp({
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
        role: newRole,
        floor: newRole === 'student' ? newFloor : null,
        room: newRole === 'student' ? newRoom : null,
      });

      toast.success(`New ${newRole} account created successfully!`);
      setIsAddUserOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      toast.error(err.message || 'Failed to create user.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              User Directory & Roles
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Manage student residents, cleaning staff, campus moderators, and permissions.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-medium text-xs shadow transition flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>

        {/* Tabs & Search Filter */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 overflow-x-auto">
            {['cleaners', 'students', 'moderators', 'admins'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  activeTab === t
                    ? 'bg-white text-text shadow-sm'
                    : 'text-stone-600 hover:text-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading user directory..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No users found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 font-semibold text-stone-700">Full Name</th>
                    <th className="p-3.5 font-semibold text-stone-700">Email</th>
                    <th className="p-3.5 font-semibold text-stone-700">Role</th>
                    <th className="p-3.5 font-semibold text-stone-700">Floor / Room</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-center">Active Status</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/20 transition">
                      <td className="p-3.5 font-medium text-stone-900">{u.full_name}</td>
                      <td className="p-3.5 text-stone-600">{u.email}</td>
                      <td className="p-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {u.floor ? `Floor ${u.floor}` : '—'} {u.room ? `(${u.room})` : ''}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {/* Quick Promote to Moderator for Students */}
                        {u.role === 'student' && u.is_active && (
                          <button
                            onClick={() => handlePromoteToModerator(u)}
                            title="Promote to Moderator"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition"
                          >
                            Promote to Moderator
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingUser(u)}
                          title="Edit User Info"
                          className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition inline-flex"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Deactivate / Reactivate */}
                        {u.is_active ? (
                          <button
                            onClick={() => setDeactivatingUser(u)}
                            title="Deactivate Account"
                            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition inline-flex"
                          >
                            <XCircle size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(u)}
                            title="Reactivate Account"
                            className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition inline-flex"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add User Modal (Student or Cleaner only) */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-xl font-bold text-text">Create User Account</h3>
                <button onClick={() => setIsAddUserOpen(false)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium text-text"
                  >
                    <option value="student">Student</option>
                    <option value="cleaner">Cleaner</option>
                  </select>
                </div>

                {newRole === 'student' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Floor</label>
                      <FloorSelector value={newFloor} onChange={setNewFloor} className="text-xs py-1.5" />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Room</label>
                      <input
                        type="text"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="e.g. 102"
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-text"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold"
                  >
                    {submittingAdd ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-xl font-bold text-text">Edit User Profile</h3>
                <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Floor</label>
                  <FloorSelector
                    value={editingUser.floor || ''}
                    onChange={(val) => setEditingUser({ ...editingUser, floor: val })}
                    className="text-xs py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Room</label>
                  <input
                    type="text"
                    value={editingUser.room || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deactivate Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!deactivatingUser}
          title="Deactivate User Account?"
          message={`Are you sure you want to deactivate ${deactivatingUser?.full_name}? They will not be able to log in to Shantigram Gurukul portal until reactivated.`}
          confirmText="Deactivate"
          onCancel={() => setDeactivatingUser(null)}
          onConfirm={handleDeactivate}
        />
      </main>

      <Footer />
    </div>
  );
}
