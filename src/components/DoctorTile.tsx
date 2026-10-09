import { useEffect, useRef, useState } from "react";
import type { Doctor } from "@/store/doctors";

type PhotoProps = Pick<Doctor, "photo">;

function imageUnavailable(img: HTMLImageElement | null) {
  return Boolean(img?.complete && img.naturalWidth === 0);
}

/** Rounded teal tile; the cut-out photo overflows the top edge. */
export function DoctorTile({ d, size }: { d: PhotoProps; size: number }) {
  const h = size * 0.9;
  const imgRef = useRef<HTMLImageElement>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(imageUnavailable(imgRef.current));
  }, [d.photo]);

  const showPhoto = Boolean(d.photo) && !photoFailed;
  return (
    <div style={{ position: "relative", width: size, height: h, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: size * 0.14,
          background: "linear-gradient(160deg, var(--brand-teal), var(--brand-deep))",
          boxShadow: "0 12px 28px -14px color-mix(in oklab, var(--brand-deep) 70%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: size * 1.18,
          overflow: "hidden",
          borderBottomLeftRadius: size * 0.14,
          borderBottomRightRadius: size * 0.14,
        }}
      >
        {showPhoto ? (
          <img
            ref={imgRef}
            src={d.photo}
            alt=""
            crossOrigin="anonymous"
            onError={() => setPhotoFailed(true)}
            onLoad={(event) => setPhotoFailed(imageUnavailable(event.currentTarget))}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: "100%",
              width: "100%",
              objectFit: "contain",
              objectPosition: "center bottom",
            }}
          />
        ) : (
          <svg viewBox="0 0 100 118" style={{ position: "absolute", bottom: 0, left: "10%", width: "80%", height: "auto" }}>
            <circle cx="50" cy="38" r="22" fill="var(--brand-mist)" opacity="0.85" />
            <path d="M8 118c0-26 18-44 42-44s42 18 42 44z" fill="var(--brand-mist)" opacity="0.85" />
          </svg>
        )}
      </div>
    </div>
  );
}
