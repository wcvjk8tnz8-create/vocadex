"use client";

import { useEffect, useState } from "react";
import { CARD_H, drawStudentCard, downloadDataUrl } from "@/lib/qrCard";

/**
 * A pupil's QR card: the code with the Vocadex logo, and the pupil's name
 * printed underneath so nobody picks up the wrong card.
 */
export default function StudentQrCard({
  name,
  email,
  qrSrc,
}: {
  name: string;
  email: string;
  qrSrc: string;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setUrl("");
    setError("");
    void (async () => {
      try {
        const data = await drawStudentCard({ name, email, qrSrc });
        if (alive) setUrl(data);
      } catch {
        if (alive) setError("Could not build this card.");
      }
    })();
    return () => {
      alive = false;
    };
  }, [name, email, qrSrc]);

  if (error) return <p className="text-sm font-bold text-red-600">{error}</p>;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-3xl overflow-hidden bg-white shadow-lg animate-pop"
        style={{ width: 300, minHeight: Math.round((CARD_H / 720) * 300) }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Sign-in QR for ${name}`}
            className="w-full h-auto block"
          />
        ) : (
          <div className="w-full h-[300px] grid place-items-center text-sm opacity-70">
            Building card…
          </div>
        )}
      </div>
      <button
        disabled={!url}
        onClick={() =>
          downloadDataUrl(url, `vocadex-${email.split("@")[0]}.png`)
        }
        className="btn-duo px-5 py-2.5 text-sm"
      >
        Download PNG
      </button>
    </div>
  );
}
