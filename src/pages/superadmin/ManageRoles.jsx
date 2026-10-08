import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import RoleBadge from '../../components/RoleBadge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAllUsers, promoteUser, demoteUser } from '../../lib/api.js';
import { Shield, UserCheck, AlertTriangle, Search, CheckCircle } from 'lucide-react';

export default function ManageRoles() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const superadminCount = users.filter((u) => u.role === 'superadmin' && u.is_active).length;

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;

    // Rule 1: Cannot demote yourself
    if (targetUser.id === user.id) {
      toast.warning('Security rule: You cannot modify your own administrative role.');
      return;
    }

    // Rule 2: Cannot remove the last superadmin
    if (targetUser.role === 'superadmin' && newRole !== 'superadmin' && superadminCount <= 1) {
      toast.error('Security rule: Cannot remove the last remaining Superadmin from the Gurukul system.');
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      const roleRanks = {
        student: 1,
        cleaner: 2,
        moderator: 3,
        admin: 4,
        superadmin: 5,
      };

      const isPromotion = (roleRanks[newRole] || 1) >= (roleRanks[targetUser.role] || 1);

      if (isPromotion) {
        await promoteUser(targetUser.id, newRole, user.id, {
          id: user.id,
          role: profile?.role || 'superadmin',
        });
      } else {
        await demoteUser(targetUser.id, newRole, user.id, {
          id: user.id,
          role: profile?.role || 'superadmin',
        });
      }

      toast.success(`Role for ${targetUser.full_name} updated to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user role:', err);
      toast.error('Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryDark/10 text-primaryDark text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield size={14} /> Role Governance & Access Control
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Manage User Roles & Hierarchy
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Elevate students to moderators, promote staff to administrators, and enforce campus governance.
          </p>
        </div>

        {/* Security Rules Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-sm">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Enforced Security Rules:</span>
            1. You cannot modify your own role. &bull; 2. The last Superadmin account cannot be demoted. &bull; 3. Role changes are audited with cryptographic actor stamps.
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary text-text"
            />
          </div>
          <span className="text-xs text-muted font-medium">
            {filteredUsers.length} Users Listed
          </span>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading user role directory..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">No users matched your query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 font-semibold text-stone-700">Full Name</th>
                    <th className="p-3.5 font-semibold text-stone-700">Email Address</th>
                    <th className="p-3.5 font-semibold text-stone-700">Current Role</th>
                    <th className="p-3.5 font-semibold text-stone-700">Assigned Floor</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === user.id;

                    return (
                      <tr key={u.id} className="hover:bg-amber-50/20 transition">
                        <td className="p-3.5 font-semibold text-stone-900">
                          {u.full_name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-primary font-bold">
                              You
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-stone-600">{u.email}</td>
                        <td className="p-3.5">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="p-3.5 text-stone-600">
                          {u.floor ? `Floor ${u.floor}` : 'Campus'}
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            disabled={isSelf || updatingId === u.id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-medium text-xs text-text focus:ring-2 focus:ring-primary disabled:bg-stone-100 disabled:cursor-not-allowed"
                          >
                            <option value="student">Student</option>
                            <option value="cleaner">Cleaner</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
