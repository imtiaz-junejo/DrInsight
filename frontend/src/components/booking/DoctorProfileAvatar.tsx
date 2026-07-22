"use client";

import { useEffect, useState } from "react";

function resolveAvatarUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}

type DoctorProfileAvatarProps = {
  avatarUrl?: string | null;
  initials: string;
  alt: string;
  background: string;
  className?: string;
};

export function DoctorProfileAvatar({
  avatarUrl,
  initials,
  alt,
  background,
  className = "doc-av",
}: DoctorProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedUrl = resolveAvatarUrl(avatarUrl);
  const showImage = Boolean(resolvedUrl) && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [resolvedUrl]);

  return (
    <div className={className} style={{ background }}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedUrl!} alt={alt} onError={() => setImgError(true)} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
