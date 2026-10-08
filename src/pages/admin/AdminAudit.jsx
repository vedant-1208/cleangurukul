import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAuditLog, getAllUsers } from '../../lib/api.js';
import { Shield, Search, Calendar, User, Eye, X, Code } from 'lucide-react';

export default function AdminAudit() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actorId, setActorId] = useState('');
  const [actionQuery, setActionQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected row for JSON inspection modal
  const [selectedAudit, setSelectedAudit] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logs, allUsers] = await Promise.all([
        getAuditLog({
          actorId: actorId || undefined,
          action: actionQuery || undefined,
          from: fromDate ? fromDate + 'T00:00:00' : undefined,
          to: toDate ? toDate + 'T23:59:59' : undefined,
        }),
        getAllUsers(),
      ]);

      setAuditLogs(logs || []);
      setUsers(allUsers || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actorId, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield size={14} /> Cryptographic Security & Traceability
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Immutable log of all user actions, ticket modifications, cleaning reviews, and system events.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Actor / User
            </label>
            <select
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
            >
              <option value="">All Actors</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Action Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={actionQuery}
                onChange={(e) => setActionQuery(e.target.value)}
                placeholder="e.g. ISSUE, REVIEW, PROMOTE..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 pr-8"
              />
              <button type="submit" className="absolute right-2 top-2 text-stone-400 hover:text-primary">
                <Search size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>
        </form>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Fetching audit logs..." />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No audit log entries found matching this criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 font-semibold text-stone-700">Timestamp</th>
                    <th className="p-3.5 font-semibold text-stone-700">Action</th>
                    <th className="p-3.5 font-semibold text-stone-700">Actor</th>
                    <th className="p-3.5 font-semibold text-stone-700">Role</th>
                    <th className="p-3.5 font-semibold text-stone-700">Target Table</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedAudit(log)}
                      className="hover:bg-amber-50/20 transition cursor-pointer"
                    >
                      <td className="p-3.5 text-stone-500 whitespace-nowrap font-sans">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-semibold text-primaryDark">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-sans text-stone-800">
                        {log.actor?.full_name || log.actor?.email || 'System'}
                      </td>
                      <td className="p-3.5 uppercase text-[10px] text-stone-600">
                        {log.actor_role}
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {log.target_table || '—'}
                      </td>
                      <td className="p-3.5 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAudit(log);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Full JSON Payload */}
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <Code size={18} className="text-primary" />
                  <h3 className="font-serif text-xl font-bold text-text">
                    Audit Entry: {selectedAudit.action}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div>
                    <span className="font-semibold text-stone-700 block">Actor:</span>
                    <span>{selectedAudit.actor?.full_name || selectedAudit.actor_id || 'System'} ({selectedAudit.actor_role})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700 block">Timestamp:</span>
                    <span>{new Date(selectedAudit.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700 block">Target Table:</span>
                    <span>{selectedAudit.target_table}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700 block">Target Record ID:</span>
                    <span className="font-mono text-[11px]">{selectedAudit.target_id || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-stone-700 uppercase tracking-wider block mb-1">
                    JSON Payload Snapshot
                  </span>
                  <pre className="bg-stone-900 text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                    {JSON.stringify(selectedAudit.payload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
