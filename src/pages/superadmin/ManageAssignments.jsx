import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import {
  getAllUsers,
  getDivisions,
  assignDivision,
  unassignDivision,
} from '../../lib/api.js';
import { supabase } from '../../config/supabaseClient.js';
import { Layers, Save, Check, RotateCcw } from 'lucide-react';

export default function ManageAssignments() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [selectedFloor, setSelectedFloor] = useState('1');
  const [cleaners, setCleaners] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [assignmentMap, setAssignmentMap] = useState({}); // key: `${cleanerId}_${divisionId}` -> { assigned: boolean, original: boolean, assignmentId?: string }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cleanerList, divisionList] = await Promise.all([
        getAllUsers({ role: 'cleaner' }),
        getDivisions({ floorCode: selectedFloor, activeOnly: true }),
      ]);

      const cList = cleanerList || [];
      const dList = divisionList || [];

      setCleaners(cList);
      setDivisions(dList);

      // Build assignment map from divisions' existing assignments
      const newMap = {};
      dList.forEach((div) => {
        (div.division_assignments || []).forEach((a) => {
          if (a.is_active) {
            newMap[`${a.cleaner_id}_${div.id}`] = {
              assigned: true,
              original: true,
              assignmentId: a.id,
            };
          }
        });
      });

      setAssignmentMap(newMap);
    } catch (err) {
      console.error('Failed to load assignment matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFloor]);

  const handleToggle = (cleanerId, divisionId) => {
    const key = `${cleanerId}_${divisionId}`;
    setAssignmentMap((prev) => {
      const current = prev[key] || { assigned: false, original: false };
      return {
        ...prev,
        [key]: {
          ...current,
          assigned: !current.assigned,
        },
      };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Find all changed assignments
      const changes = Object.entries(assignmentMap).filter(
        ([_, val]) => val.assigned !== val.original
      );

      if (changes.length === 0) {
        toast.info('No assignment changes to save.');
        setSaving(false);
        return;
      }

      for (const [key, val] of changes) {
        const [cleanerId, divisionId] = key.split('_');
        if (val.assigned && !val.original) {
          // Add assignment
          await assignDivision(divisionId, cleanerId, {
            id: user.id,
            role: profile?.role || 'superadmin',
          });
        } else if (!val.assigned && val.original && val.assignmentId) {
          // Remove assignment
          await unassignDivision(val.assignmentId, {
            id: user.id,
            role: profile?.role || 'superadmin',
          });
        }
      }

      toast.success('All cleaner division assignments saved!');
      loadData();
    } catch (err) {
      console.error('Batch save failed:', err);
      toast.error('Failed to save some assignments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Cleaner Division Allocation Matrix
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Assign cleaners to floor zones using an interactive checklist grid with batch saving.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading || saving}
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={handleSaveAll}
              disabled={loading || saving}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white text-xs font-semibold shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving Changes...' : 'Save Assignments'}
            </button>
          </div>
        </div>

        {/* Floor Filter */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Filter by Floor:
            </span>
            <div className="w-56">
              <FloorSelector
                value={selectedFloor}
                onChange={setSelectedFloor}
                className="py-2 text-xs"
              />
            </div>
          </div>
          <span className="text-xs text-muted font-medium">
            {cleaners.length} Active Cleaners &bull; {divisions.length} Divisions
          </span>
        </div>

        {/* Matrix Grid */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Building assignment matrix..." />
            </div>
          ) : cleaners.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No registered cleaners found. Add cleaners from the Users tab first.
            </div>
          ) : divisions.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No active divisions on Floor {selectedFloor}. Create divisions first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 font-semibold text-stone-800 sticky left-0 bg-stone-50 z-10 min-w-[180px]">
                      Cleaner Staff
                    </th>
                    {divisions.map((div) => (
                      <th
                        key={div.id}
                        className="p-3.5 font-semibold text-stone-700 text-center whitespace-nowrap min-w-[120px]"
                      >
                        <div>{div.name}</div>
                        <div className="text-[10px] text-muted font-normal">
                          {div.frequency || 'Daily'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cleaners.map((cleaner) => (
                    <tr key={cleaner.id} className="hover:bg-amber-50/20 transition">
                      <td className="p-3.5 font-medium text-stone-900 sticky left-0 bg-white z-10 border-r border-stone-100">
                        <div className="font-semibold text-text">{cleaner.full_name}</div>
                        <div className="text-[10px] text-muted">{cleaner.email}</div>
                      </td>
                      {divisions.map((div) => {
                        const key = `${cleaner.id}_${div.id}`;
                        const isAssigned = !!assignmentMap[key]?.assigned;
                        const isChanged =
                          assignmentMap[key]?.assigned !== assignmentMap[key]?.original;

                        return (
                          <td
                            key={div.id}
                            onClick={() => handleToggle(cleaner.id, div.id)}
                            className={`p-3.5 text-center cursor-pointer transition ${
                              isChanged ? 'bg-amber-100/50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleToggle(cleaner.id, div.id)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                              />
                            </div>
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
