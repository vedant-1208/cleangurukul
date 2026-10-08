import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getDivisions, createCleaningLog } from '../../lib/api.js';
import { validateLivePhoto } from '../../lib/livePhoto.js';
import { uploadToCloudinary } from '../../lib/uploadToCloudinary.js';
import { Send, ArrowLeft, Layers, Sparkles } from 'lucide-react';

export default function SubmitCleaning() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState(searchParams.get('divisionId') || '');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [loadingDivs, setLoadingDivs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    getDivisions()
      .then((allDivs) => {
        if (!mounted) return;
        // Prioritize divisions assigned to this cleaner
        const myDivs = (allDivs || []).filter((d) =>
          d.division_assignments?.some((a) => a.cleaner_id === user?.id && a.is_active)
        );
        const listToUse = myDivs.length > 0 ? myDivs : allDivs || [];
        setDivisions(listToUse);

        if (!selectedDivisionId && listToUse.length > 0) {
          setSelectedDivisionId(listToUse[0].id);
        }
      })
      .catch((err) => console.error('Error fetching divisions:', err))
      .finally(() => {
        if (mounted) setLoadingDivs(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDivisionId) {
      toast.warning('Please select an assigned division.');
      return;
    }
    if (!photoFile) {
      toast.warning('A live after-cleaning photo is required.');
      return;
    }

    const currentDiv = divisions.find((d) => d.id === selectedDivisionId);
    const floorCode = currentDiv?.floor_code || '1';

    setSubmitting(true);
    setStepMessage('Verifying live camera timestamp...');

    try {
      // 1. Verify live photo (under 2 minutes old)
      const validation = await validateLivePhoto(photoFile);
      if (!validation.ok) {
        toast.error(validation.reason || 'Live photo check failed.');
        setSubmitting(false);
        return;
      }

      // 2. Upload to Cloudinary
      setStepMessage('Compressing and uploading after-cleaning photo...');
      const photoUrl = await uploadToCloudinary(photoFile);

      // 3. Create cleaning log in database with audit logging
      setStepMessage('Registering proof log with moderation queue...');
      await createCleaningLog(
        {
          cleanerId: user.id,
          divisionId: selectedDivisionId,
          floorCode,
          photoUrl,
          photoTakenAt: new Date(photoFile.lastModified || Date.now()).toISOString(),
          notes,
        },
        { id: user.id, role: 'cleaner' }
      );

      toast.success('Cleaning proof submitted for review!');
      navigate('/cleaner/submissions');
    } catch (err) {
      console.error('Cleaning submission failed:', err);
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      setStepMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/cleaner')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-text mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Scheduled Shift Proof
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Submit Cleaning Proof
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Select the division you just completed and take a live photo of the cleaned premises.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Division Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Assigned Division *
              </label>
              {loadingDivs ? (
                <LoadingSpinner size="sm" />
              ) : (
                <select
                  value={selectedDivisionId}
                  onChange={(e) => setSelectedDivisionId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-text font-medium focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Select Division</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (Floor {d.floor_code}) - {d.frequency || 'Daily'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes Textarea */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Shift Notes & Observations (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mopped floor, emptied dustbins, sanitized washroom fixtures..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
              />
            </div>

            {/* Camera Capture Section */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Live After-Cleaning Photo (Mandatory) *
              </label>
              <CameraCapture onCapture={setPhotoFile} required={true} />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !photoFile || !selectedDivisionId}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primaryDark disabled:bg-stone-300 text-white font-medium shadow-md transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" message={stepMessage} />
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Proof for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
