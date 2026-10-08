import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { supabase } from '../../config/supabaseClient.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import IssueCard from '../../components/IssueCard.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import DivisionSelector from '../../components/DivisionSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAllIssues, updateIssueStatus } from '../../lib/api.js';
import { useToast } from '../../components/ToastProvider.jsx';
import {
  LayoutDashboard,
  Filter,
  Users,
  CheckSquare,
  BarChart2,
  FileText,
  Shield,
  Layers,
  ClipboardCheck,
} from 'lucide-react';

export default function AdminBoard() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [floorCode, setFloorCode] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchIssues = async () => {
    try {
      const data = await getAllIssues({
        floorCode: floorCode || undefined,
        divisionId: divisionId || undefined,
        priority: priorityFilter || undefined,
      });
      setIssues(data || []);
    } catch (err) {
      console.error('Error fetching admin issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();

    // Realtime listener on issues
    const channel = supabase
      .channel('admin_board_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
        fetchIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [floorCode, divisionId, priorityFilter]);

  const columns = [
    { key: 'pending', label: 'Pending', bg: 'bg-amber-50/50', border: 'border-amber-200', text: 'text-amber-800' },
    { key: 'in_progress', label: 'In Progress', bg: 'bg-blue-50/50', border: 'border-blue-200', text: 'text-blue-800' },
    { key: 'resolved', label: 'Resolved', bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-800' },
    { key: 'rejected', label: 'Rejected', bg: 'bg-rose-50/50', border: 'border-rose-200', text: 'text-rose-800' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Navigation Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Hostel Administration
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Sanitation Kanban Board
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/users"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Users size={14} /> Users
            </Link>
            <Link
              to="/admin/bulk"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckSquare size={14} /> Bulk Actions
            </Link>
            <Link
              to="/admin/notices"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <FileText size={14} /> Notices
            </Link>
            <Link
              to="/admin/analytics"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <BarChart2 size={14} /> Analytics
            </Link>
            <Link
              to="/admin/audit"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Shield size={14} /> Audit Log
            </Link>
            <Link
              to="/admin/proofs"
              className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primaryDark text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
            >
              <ClipboardCheck size={14} /> Cleaning Proofs
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
            <Filter size={14} /> Filters:
          </div>

          <div className="w-44">
            <FloorSelector
              value={floorCode}
              onChange={(v) => {
                setFloorCode(v);
                setDivisionId('');
              }}
              className="text-xs py-2"
            />
          </div>

          <div className="w-48">
            <DivisionSelector
              floorCode={floorCode}
              value={divisionId}
              onChange={setDivisionId}
              className="text-xs py-2"
            />
          </div>

          <div className="w-36">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {(floorCode || divisionId || priorityFilter) && (
            <button
              onClick={() => {
                setFloorCode('');
                setDivisionId('');
                setPriorityFilter('');
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Kanban Board Columns */}
        {loading ? (
          <LoadingSpinner message="Loading live sanitation board..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((col) => {
              const colIssues = issues.filter((i) => i.status === col.key);
              return (
                <div
                  key={col.key}
                  className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[500px]`}
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
                    <span className={`font-serif text-lg font-bold ${col.text}`}>
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-stone-700 shadow-sm border border-stone-200">
                      {colIssues.length}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    {colIssues.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-xs text-stone-400 italic">
                        No issues in this column
                      </div>
                    ) : (
                      colIssues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          onClick={() => navigate(`/admin/issues/${issue.id}`)}
                        />
                      ))
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
