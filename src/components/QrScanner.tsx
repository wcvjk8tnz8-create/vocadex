"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tiny camera QR scanner built on jsQR.
 * Decodes the plain text inside the QR code (a Vocadex sign-in code) and
 * hands it back — the code is never treated as a URL.
 */
export default function QrScanner({
  onResult,
  onClose,
}: {
  onResult: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const doneRef = useRef(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("This device cannot open the camera. Type the code instead.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        setError("Camera permission denied. Type the code instead.");
      }
    }
    void start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!ready || doneRef.current) return;
    let last = 0;

    const tick = async () => {
      if (doneRef.current) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const now = performance.now();
        if (now - last > 120) {
          last = now;
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (w > 0 && h > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);
              const data = ctx.getImageData(0, 0, w, h);
              try {
                const jsQR = (await import("jsqr")).default;
                const res = jsQR(data.data, w, h, {
                  inversionAttempts: "dontInvert",
                });
                if (res?.data) {
                  doneRef.current = true;
                  stop();
                  onResult(res.data.trim().toUpperCase());
                  return;
                }
              } catch {
                /* ignore a failed frame */
              }
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, onResult, stop]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 grid place-items-center p-4 animate-fade">
      <div className="w-full max-w-md glass-strong rounded-[28px] p-5 text-center">
        <div className="font-black text-lg mb-3">Scan the class QR code</div>
        <div className="relative rounded-3xl overflow-hidden bg-black aspect-square">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="w-2/3 aspect-square rounded-3xl border-4 border-white/80 animate-pulse-soft" />
          </div>
        </div>
        {error ? (
          <p className="mt-3 text-sm font-bold text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm opacity-80">
            Point the camera at the code on the teacher&apos;s screen.
          </p>
        )}
        <button
          onClick={() => {
            stop();
            onClose();
          }}
          className="btn-ghost mt-4 w-full py-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
