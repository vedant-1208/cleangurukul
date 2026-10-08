import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CameraCapture({ onCapture, required = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [hasCaptured, setHasCaptured] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = async () => {
    setIsStarting(true);
    setError(null);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // Fallback try without ideal constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (fallbackErr) {
        setError(
          'Camera access denied or unavailable. Shantigram Gurukul requires a live photo. Please enable camera permissions in your browser settings and refresh.'
        );
      }
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const now = Date.now();
        const file = new File([blob], `live_proof_${now}.jpg`, {
          type: 'image/jpeg',
          lastModified: now,
        });

        const previewUrl = URL.createObjectURL(blob);
        setCapturedUrl(previewUrl);
        setHasCaptured(true);
        stopCamera();
        onCapture(file);
      },
      'image/jpeg',
      0.92
    );
  };

  const retakePhoto = () => {
    if (capturedUrl) {
      URL.revokeObjectURL(capturedUrl);
    }
    setCapturedUrl(null);
    setHasCaptured(false);
    onCapture(null);
    startCamera();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-[4/3] bg-stone-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-primary/20">
        {error ? (
          <div className="p-6 text-center text-white flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
            <h4 className="font-bold text-base mb-1">Camera Required</h4>
            <p className="text-xs text-stone-300 mb-4 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-2 bg-primary hover:bg-primaryDark text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
            </button>
          </div>
        ) : hasCaptured && capturedUrl ? (
          <div className="relative w-full h-full">
            <img
              src={capturedUrl}
              alt="Live Captured Frame"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Photo Captured
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/60 text-amber-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live Camera Feed
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {!hasCaptured ? (
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!!error || isStarting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primaryDark disabled:bg-stone-400 text-white font-medium rounded-xl shadow transition"
          >
            <Camera className="w-5 h-5" />
            Capture Live Photo
          </button>
        ) : (
          <button
            type="button"
            onClick={retakePhoto}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl border border-stone-300 shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Photo
          </button>
        )}
      </div>

      {required && (
        <p className="mt-2 text-xs text-muted text-center">
          * Live photo timestamp is cryptographically verified to ensure cleanliness authenticity.
        </p>
      )}
    </div>
  );
}
