import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import DivisionSelector from '../../components/DivisionSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getAnalyticsFiltered, getAllUsers, getDivisions } from '../../lib/api.js';
import { exportToCsv } from '../../lib/csvExport.js';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Filter, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState({ issues: [], cleaningLogs: [] });
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsResult, cleanerUsers] = await Promise.all([
        getAnalyticsFiltered({
          from: startDate,
          to: endDate + 'T23:59:59',
          cleanerId: selectedCleaner || undefined,
          floorCode: selectedFloor || undefined,
          status: selectedStatus || undefined,
          divisionId: selectedDivision || undefined,
        }),
        getAllUsers({ role: 'cleaner' }),
      ]);

      setData(analyticsResult);
      setCleaners(cleanerUsers || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, selectedCleaner, selectedFloor, selectedStatus, selectedDivision]);

  // Aggregate 1: Issues per floor
  const floorCounts = (data.issues || []).reduce((acc, issue) => {
    const f = issue.floor_code || 'Other';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const issuesByFloorData = Object.keys(floorCounts).map((floor) => ({
    name: `Floor ${floor}`,
    issues: floorCounts[floor],
  }));

  // Aggregate 2: Issues by status
  const statusCounts = (data.issues || []).reduce((acc, issue) => {
    const s = issue.status || 'unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const STATUS_COLORS = {
    pending: '#CA8A04',
    in_progress: '#2563EB',
    resolved: '#166534',
    rejected: '#B91C1C',
  };

  const issuesByStatusData = Object.keys(statusCounts).map((status) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: statusCounts[status],
    color: STATUS_COLORS[status] || '#78716C',
  }));

  // Aggregate 3: Compliance % per floor (Approved cleaning logs vs total required)
  const floorLogs = (data.cleaningLogs || []).reduce((acc, log) => {
    const f = log.floor_code || 'Other';
    if (!acc[f]) acc[f] = { total: 0, approved: 0 };
    acc[f].total += 1;
    if (log.status === 'approved') acc[f].approved += 1;
    return acc;
  }, {});

  const complianceByFloorData = Object.keys(floorLogs).map((floor) => ({
    name: `Fl ${floor}`,
    complianceRate: Math.round((floorLogs[floor].approved / floorLogs[floor].total) * 100) || 0,
    totalLogs: floorLogs[floor].total,
  }));

  // Export CSV Handler
  const handleExportCsv = () => {
    const exportIssues = (data.issues || []).map((i) => ({
      Type: 'ISSUE',
      ID: i.id,
      Floor: i.floor_code,
      Room: i.room || '',
      Status: i.status,
      Priority: i.priority,
      Description: i.description || '',
      Created_At: i.created_at,
      Resolved_At: i.resolved_at || '',
    }));

    exportToCsv(exportIssues, `Shantigram_Analytics_${startDate}_to_${endDate}.csv`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Cleanliness Metrics & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Visual performance tracking across floors, cleaning frequencies, and resolution velocity.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={loading || data.issues.length === 0}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            <Download size={16} />
            Export Analytics CSV
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Floor
            </label>
            <FloorSelector
              value={selectedFloor}
              onChange={(v) => {
                setSelectedFloor(v);
                setSelectedDivision('');
              }}
              className="py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Division
            </label>
            <DivisionSelector
              floorCode={selectedFloor}
              value={selectedDivision}
              onChange={setSelectedDivision}
              className="py-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Cleaner
            </label>
            <select
              value={selectedCleaner}
              onChange={(e) => setSelectedCleaner(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
            >
              <option value="">All Cleaners</option>
              {cleaners.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <LoadingSpinner size="lg" message="Compiling analytics..." />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-2xl font-serif font-bold text-text">
                  {data.issues.length}
                </div>
                <div className="text-xs text-muted uppercase tracking-wider mt-1 font-semibold">
                  Reported Issues In Period
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-2xl font-serif font-bold text-accent">
                  {data.cleaningLogs.filter((l) => l.status === 'approved').length}
                </div>
                <div className="text-xs text-muted uppercase tracking-wider mt-1 font-semibold">
                  Approved Scheduled Cleaning Proofs
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-2xl font-serif font-bold text-primary">
                  {data.issues.length > 0
                    ? Math.round(
                        (data.issues.filter((i) => i.status === 'resolved').length /
                          data.issues.length) *
                          100
                      )
                    : 100}
                  %
                </div>
                <div className="text-xs text-muted uppercase tracking-wider mt-1 font-semibold">
                  Issue Resolution Rate
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Issues by Floor */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-text mb-4">
                  Issues Reported by Floor
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={issuesByFloorData}>
                      <XAxis dataKey="name" fontSize={11} stroke="#78716C" />
                      <YAxis allowDecimals={false} fontSize={11} stroke="#78716C" />
                      <Tooltip />
                      <Bar dataKey="issues" fill="#C2410C" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Issues by Status */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-text mb-4">
                  Issues Breakdown by Status
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={issuesByStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {issuesByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Cleaning Compliance Rate % by Floor */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm lg:col-span-2">
                <h3 className="font-serif text-lg font-bold text-text mb-4">
                  Cleaning Proof Approval Compliance % per Floor
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceByFloorData}>
                      <XAxis dataKey="name" fontSize={11} stroke="#78716C" />
                      <YAxis domain={[0, 100]} fontSize={11} stroke="#78716C" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="complianceRate" fill="#166534" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
