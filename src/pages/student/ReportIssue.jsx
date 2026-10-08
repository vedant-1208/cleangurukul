import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import DivisionSelector from '../../components/DivisionSelector.jsx';
import CameraCapture from '../../components/CameraCapture.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { validateLivePhoto } from '../../lib/livePhoto.js';
import { uploadToCloudinary } from '../../lib/uploadToCloudinary.js';
import { createIssue } from '../../lib/api.js';
import { AlertCircle, Send, ArrowLeft } from 'lucide-react';

export default function ReportIssue() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [floorCode, setFloorCode] = useState(profile?.floor || '1');
  const [divisionId, setDivisionId] = useState('');
  const [locationType, setLocationType] = useState('washroom');
  const [room, setRoom] = useState(profile?.room || '');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!floorCode) {
      toast.warning('Please select a floor.');
      return;
    }
    if (!photoFile) {
      toast.warning('A live photo is mandatory to report a cleanliness issue.');
      return;
    }

    setSubmitting(true);
    setStepMessage('Verifying live camera authenticity...');

    try {
      // 1. Verify live photo timestamp (< 2 minutes old)
      const validation = await validateLivePhoto(photoFile);
      if (!validation.ok) {
        toast.error(validation.reason || 'Live photo validation failed.');
        setSubmitting(false);
        return;
      }

      // 2. Upload compressed image to Cloudinary
      setStepMessage('Compressing and uploading photo proof...');
      const photoUrl = await uploadToCloudinary(photoFile);

      // 3. Create issue in database with audit log
      setStepMessage('Submitting issue report...');
      await createIssue(
        {
          reporterId: user.id,
          reporterRole: profile?.role || 'student',
          floorCode,
          divisionId: divisionId || null,
          locationType,
          room: room || null,
          description,
          photoUrl,
          photoTakenAt: new Date(photoFile.lastModified || Date.now()).toISOString(),
        },
        { id: user.id, role: profile?.role || 'student' }
      );

      toast.success('Cleanliness issue reported successfully!');
      navigate('/student/issues');
    } catch (err) {
      console.error('Failed to submit issue:', err);
      toast.error(err.message || 'Failed to submit report. Please try again.');
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
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-text mb-4 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Report Cleanliness Issue
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Submit a live-verified photo report to notify the sanitation team and floor cleaners.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Floor & Division */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Floor / Zone *
                </label>
                <FloorSelector
                  value={floorCode}
                  onChange={(val) => {
                    setFloorCode(val);
                    setDivisionId('');
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Division (Optional)
                </label>
                <DivisionSelector
                  floorCode={floorCode}
                  value={divisionId}
                  onChange={setDivisionId}
                />
              </div>
            </div>

            {/* Location Type & Room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Location Type *
                </label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-text font-medium focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                >
                  <option value="washroom">Washroom</option>
                  <option value="corridor">Corridor / Hallway</option>
                  <option value="room">Hostel Room</option>
                  <option value="staircase">Staircase</option>
                  <option value="common">Common Area / Hall</option>
                  <option value="basement">Basement</option>
                  <option value="other">Other Campus Area</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Specific Room / Landmark
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 304, Near water cooler"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Issue Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs cleaning or attention (e.g., water spillage, uncleaned dustbin)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition"
              />
            </div>

            {/* Camera Capture Section */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Live Photo Proof (Mandatory) *
              </label>
              <CameraCapture onCapture={setPhotoFile} required={true} />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !photoFile}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primaryDark disabled:bg-stone-300 text-white font-medium shadow-md transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" message={stepMessage} />
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Report</span>
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
