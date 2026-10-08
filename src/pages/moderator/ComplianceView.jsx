import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getDivisions, getComplianceSummary, getAllUsers } from '../../lib/api.js';
import { exportToCsv } from '../../lib/csvExport.js';
import { Calendar, Download, Filter, Layers, CheckCircle2 } from 'lucide-react';

export default function ComplianceView() {
  const [divisions, setDivisions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const [allDivs, compLogs, cleanerUsers] = await Promise.all([
        getDivisions(),
        getComplianceSummary({ from: startDate, to: endDate + 'T23:59:59' }),
        getAllUsers({ role: 'cleaner' }),
      ]);

      setDivisions(allDivs || []);
      setLogs(compLogs || []);
      setCleaners(cleanerUsers || []);
    } catch (err) {
      console.error('Failed to load compliance matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompliance();
  }, [startDate, endDate]);

  // Generate array of date strings between startDate and endDate
  const getDateRange = () => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const datesList = getDateRange();

  // Filter divisions by selectedFloor and selectedCleaner
  const filteredDivisions = divisions.filter((div) => {
    if (selectedFloor && div.floor_code !== selectedFloor) return false;
    if (selectedCleaner) {
      const hasCleaner = div.division_assignments?.some(
        (a) => a.cleaner_id === selectedCleaner && a.is_active
      );
      if (!hasCleaner) return false;
    }
    return true;
  });

  const getCellStatus = (divisionId, dateStr) => {
    const log = logs.find(
      (l) => l.division_id === divisionId && l.created_at?.slice(0, 10) === dateStr
    );
    if (!log) return { status: 'missing', color: 'bg-rose-500', title: 'Not Submitted' };
    if (log.status === 'approved') return { status: 'approved', color: 'bg-emerald-500', title: 'Approved' };
    if (log.status === 'needs_redo') return { status: 'needs_redo', color: 'bg-orange-500', title: 'Needs Redo' };
    return { status: 'pending', color: 'bg-amber-500', title: 'Pending Review' };
  };

  const handleExportCsv = () => {
    const exportData = filteredDivisions.map((div) => {
      const row = {
        'Floor': div.floor_code,
        'Division': div.name,
        'Frequency': div.frequency || 'daily',
      };
      datesList.forEach((d) => {
        const cell = getCellStatus(div.id, d);
        row[d] = cell.title;
      });
      return row;
    });

    exportToCsv(exportData, `Gurukul_Compliance_${startDate}_to_${endDate}.csv`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Division Compliance Matrix
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Multi-day audit of scheduled cleanliness proofs by floor zone and date.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={loading || filteredDivisions.length === 0}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV Matrix
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Floor Filter
            </label>
            <FloorSelector
              value={selectedFloor}
              onChange={setSelectedFloor}
              className="text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Cleaner Filter
            </label>
            <select
              value={selectedCleaner}
              onChange={(e) => setSelectedCleaner(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-primary focus:border-primary"
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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs mb-4 px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Pending Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Needs Redo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Missing / Not Submitted</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Calculating compliance grid..." />
            </div>
          ) : filteredDivisions.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No divisions found matching the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3 font-semibold text-stone-800 sticky left-0 bg-stone-50 z-10">
                      Division & Floor
                    </th>
                    {datesList.map((d) => (
                      <th key={d} className="p-3 font-semibold text-stone-700 text-center whitespace-nowrap min-w-[75px]">
                        {new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDivisions.map((div) => (
                    <tr key={div.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-3 font-medium text-stone-900 sticky left-0 bg-white z-10 border-r border-stone-100 whitespace-nowrap">
                        <div className="font-semibold text-text">{div.name}</div>
                        <div className="text-[10px] text-muted">Floor {div.floor_code}</div>
                      </td>
                      {datesList.map((d) => {
                        const cell = getCellStatus(div.id, d);
                        return (
                          <td key={d} className="p-3 text-center" title={`${d}: ${cell.title}`}>
                            <span
                              className={`inline-block w-4 h-4 rounded-full ${cell.color} shadow-sm transition transform hover:scale-125 cursor-pointer`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
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
