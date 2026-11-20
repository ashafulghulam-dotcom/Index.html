import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { AlertCircle, Camera, ImageUp, QrCode, RefreshCw } from 'lucide-react';
import { extractVerificationCode } from '../utils/qrVerification';
import { ModalDialog } from './UiPrimitives';

export const QRScannerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onDetected: (code: string, rawPayload: string) => void;
  title?: string;
  subtitle?: string;
}> = ({
  open,
  onClose,
  onDetected,
  title = 'Pindai QR Code Dokumen',
  subtitle = 'Arahkan kamera ke QR Code Sertifikat, Piagam Kompak, Daftar Hadir, atau unggah foto/screenshot QR.',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [scanningStatus, setScanningStatus] = useState('Siap memindai QR Code');

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleDecodedPayload = useCallback(
    (rawPayload: string) => {
      const extracted = extractVerificationCode(rawPayload);
      if (!extracted) return;
      stopCamera();
      onDetected(extracted, rawPayload);
      onClose();
    },
    [onClose, onDetected, stopCamera]
  );

  const startCamera = useCallback(async () => {
    setCameraError('');
    setUploadError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Kamera tidak tersedia pada browser ini. Gunakan tombol "Pindai dari Gambar / Screenshot QR" di bawah.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanningStatus('Mencari QR Code di kamera...');

      const scanFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'dontInvert',
            });
            if (decoded?.data) {
              handleDecodedPayload(decoded.data);
              return;
            }
          }
        }
        rafRef.current = requestAnimationFrame(scanFrame);
      };
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError(
        'Izin kamera ditolak atau perangkat tidak memiliki kamera aktif. Anda tetap dapat memindai dari foto/screenshot QR.'
      );
      stopCamera();
    }
  }, [handleDecodedPayload, stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setCameraError('');
      setUploadError('');
      setScanningStatus('Siap memindai QR Code');
    }
    return () => {
      stopCamera();
    };
  }, [open, stopCamera]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        // Scale overly large photos down while preserving QR sharpness
        const maxDim = 1400;
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setUploadError('Gagal memproses gambar QR.');
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (decoded?.data) {
          handleDecodedPayload(decoded.data);
        } else {
          setUploadError(
            'QR Code tidak terdeteksi pada gambar tersebut. Pastikan QR Code terlihat jelas dan tidak terpotong.'
          );
        }
      };
      img.onerror = () => {
        setUploadError('File gambar tidak dapat dibaca.');
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
    // Reset input so re-selecting the same file works
    e.target.value = '';
  };

  return (
    <ModalDialog
      open={open}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title={title}
      subtitle={subtitle}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Live Camera Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-emerald-950 aspect-[4/3] flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {cameraActive ? (
            <>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.45)] relative">
                  <span className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                  <span className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                </div>
              </div>
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/80 text-white text-xs">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {scanningStatus}
                </span>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-semibold transition"
                >
                  Matikan Kamera
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Pemindai QR Code Resmi SAMAWA</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aktifkan kamera untuk scan langsung, atau unggah gambar/screenshot QR Code dari galeri perangkat Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-[#0F684E] hover:bg-[#0B523D] text-white text-xs font-semibold inline-flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                Aktifkan Kamera Scanner
              </button>
            </div>
          )}
        </div>

        {/* Upload QR Image Alternative */}
        <div className="p-4 rounded-xl bg-[#F8FAF9] dark:bg-[#0D1613] border border-slate-200 dark:border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Pindai dari Gambar / Screenshot QR
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mendukung PNG, JPG, atau tangkapan layar Sertifikat / Piagam / Kartu Peserta.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              aria-label="Unggah gambar QR Code"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#111C18] text-[#0F684E] dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <ImageUp className="w-4 h-4" />
              Pilih Gambar QR
            </button>
            {cameraActive && (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  void startCamera();
                }}
                aria-label="Muat ulang kamera"
                className="p-2 rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {(cameraError || uploadError) && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>{uploadError || cameraError}</span>
          </div>
        )}
      </div>
    </ModalDialog>
  );
};
