import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  getAllUsers,
  assignDivision,
  unassignDivision,
} from '../../lib/api.js';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UserPlus,
  X,
  Layers,
} from 'lucide-react';

export default function ManageDivisions() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [selectedFloor, setSelectedFloor] = useState('1');
  const [divisions, setDivisions] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState(null);
  const [assigningDivision, setAssigningDivision] = useState(null);
  const [deletingDivision, setDeletingDivision] = useState(null);

  // Add Division Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [frequencyNotes, setFrequencyNotes] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Quick Assign cleaner state
  const [cleanerToAssign, setCleanerToAssign] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [divs, cleanerUsers] = await Promise.all([
        getDivisions({ floorCode: selectedFloor }),
        getAllUsers({ role: 'cleaner' }),
      ]);
      setDivisions(divs || []);
      setCleaners(cleanerUsers || []);
    } catch (err) {
      console.error('Failed to load divisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFloor]);

  const handleCreateDivision = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmittingAdd(true);
    try {
      await createDivision(
        {
          floorCode: selectedFloor,
          name: name.trim(),
          description: description.trim(),
          frequency,
          frequencyNotes: frequencyNotes.trim(),
        },
        { id: user.id, role: profile?.role || 'superadmin' }
      );
      toast.success('Division created successfully!');
      setIsAddModalOpen(false);
      setName('');
      setDescription('');
      setFrequencyNotes('');
      loadData();
    } catch (err) {
      console.error('Failed to create division:', err);
      toast.error(err.message || 'Failed to create division.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleUpdateDivision = async (e) => {
    e.preventDefault();
    if (!editingDivision) return;
    try {
      await updateDivision(
        editingDivision.id,
        {
          name: editingDivision.name,
          description: editingDivision.description,
          frequency: editingDivision.frequency,
          frequency_notes: editingDivision.frequency_notes,
          is_active: editingDivision.is_active,
        },
        { id: user.id, role: profile?.role || 'superadmin' }
      );
      toast.success('Division updated successfully.');
      setEditingDivision(null);
      loadData();
    } catch (err) {
      console.error('Failed to update division:', err);
      toast.error('Failed to update division.');
    }
  };

  const handleDeleteDivision = async () => {
    if (!deletingDivision) return;
    try {
      await deleteDivision(deletingDivision.id, {
        id: user.id,
        role: profile?.role || 'superadmin',
      });
      toast.success('Division deleted.');
      setDeletingDivision(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete division:', err);
      toast.error('Failed to delete division.');
    }
  };

  const handleToggleActive = async (div) => {
    try {
      await updateDivision(
        div.id,
        { is_active: !div.is_active },
        { id: user.id, role: profile?.role || 'superadmin' }
      );
      toast.success(`Division ${div.is_active ? 'deactivated' : 'activated'}.`);
      loadData();
    } catch (err) {
      console.error('Failed to toggle active:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningDivision || !cleanerToAssign) return;

    try {
      await assignDivision(assigningDivision.id, cleanerToAssign, {
        id: user.id,
        role: profile?.role || 'superadmin',
      });
      toast.success('Cleaner assigned to division.');
      setAssigningDivision(null);
      setCleanerToAssign('');
      loadData();
    } catch (err) {
      console.error('Failed to assign cleaner:', err);
      toast.error('Assignment failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Building Divisions Management
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Define cleanable zones, inspect frequencies, and assign cleaners for Floor {selectedFloor}.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold text-xs shadow flex items-center gap-1.5 transition"
          >
            <Plus size={16} />
            Add Division to Floor {selectedFloor}
          </button>
        </div>

        {/* Floor Selection Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Select Floor:
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
            {divisions.length} Division{divisions.length !== 1 ? 's' : ''} on this floor
          </span>
        </div>

        {/* Divisions Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading divisions..." />
            </div>
          ) : divisions.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">
              No divisions found for Floor {selectedFloor}. Click "Add Division" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 font-semibold text-stone-700">Division Name</th>
                    <th className="p-3.5 font-semibold text-stone-700">Description</th>
                    <th className="p-3.5 font-semibold text-stone-700">Frequency</th>
                    <th className="p-3.5 font-semibold text-stone-700">Assigned Cleaner(s)</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-center">Active Status</th>
                    <th className="p-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {divisions.map((div) => {
                    const assignedList = (div.division_assignments || [])
                      .filter((a) => a.is_active)
                      .map((a) => a.profiles?.full_name || 'Assigned');

                    return (
                      <tr key={div.id} className="hover:bg-amber-50/20 transition">
                        <td className="p-3.5 font-semibold text-stone-900">{div.name}</td>
                        <td className="p-3.5 text-stone-600 max-w-xs truncate">
                          {div.description || '—'}
                        </td>
                        <td className="p-3.5 capitalize font-medium text-stone-700">
                          {div.frequency.replace('_', ' ')}
                        </td>
                        <td className="p-3.5 text-stone-700">
                          {assignedList.length > 0 ? (
                            <span className="text-sky-800 font-medium">
                              {assignedList.join(', ')}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleActive(div)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                              div.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                            }`}
                          >
                            {div.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                          {/* Assign cleaner button */}
                          <button
                            onClick={() => setAssigningDivision(div)}
                            title="Assign Cleaner"
                            className="p-1 rounded-lg text-sky-700 hover:bg-sky-50 transition inline-flex"
                          >
                            <UserPlus size={14} />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingDivision(div)}
                            title="Edit Division"
                            className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 transition inline-flex"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeletingDivision(div)}
                            title="Delete Division"
                            className="p-1 rounded-lg text-danger hover:bg-rose-50 transition inline-flex"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Division Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-xl font-bold text-text">
                  Add Division (Floor {selectedFloor})
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateDivision} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Division Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Washroom Boys, East Corridor, Staircase A"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Near dorm rooms 201-215"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Cleaning Frequency *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Frequency Notes / Shift Timing
                  </label>
                  <input
                    type="text"
                    value={frequencyNotes}
                    onChange={(e) => setFrequencyNotes(e.target.value)}
                    placeholder="e.g. Morning 7:00 AM & Evening 5:00 PM"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold"
                  >
                    {submittingAdd ? 'Saving...' : 'Save Division'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Division Modal */}
        {editingDivision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-xl font-bold text-text">Edit Division</h3>
                <button onClick={() => setEditingDivision(null)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateDivision} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Division Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDivision.name}
                    onChange={(e) => setEditingDivision({ ...editingDivision, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingDivision.description || ''}
                    onChange={(e) => setEditingDivision({ ...editingDivision, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-text"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={editingDivision.frequency}
                    onChange={(e) => setEditingDivision({ ...editingDivision, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDivision(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
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

        {/* Assign Cleaner Modal */}
        {assigningDivision && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <h3 className="font-serif text-xl font-bold text-text">
                  Assign Cleaner to {assigningDivision.name}
                </h3>
                <button onClick={() => setAssigningDivision(null)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Select Cleaner
                  </label>
                  <select
                    value={cleanerToAssign}
                    onChange={(e) => setCleanerToAssign(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                  >
                    <option value="">Choose a cleaner...</option>
                    {cleaners.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigningDivision(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold"
                  >
                    Assign Cleaner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!deletingDivision}
          title="Delete Division?"
          message={`Are you sure you want to delete "${deletingDivision?.name}" on Floor ${selectedFloor}? All past cleaning proofs and schedules linked to this division will be permanently removed.`}
          confirmText="Delete Division"
          onCancel={() => setDeletingDivision(null)}
          onConfirm={handleDeleteDivision}
        />
      </main>

      <Footer />
    </div>
  );
}
