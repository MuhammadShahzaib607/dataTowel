"use client";

import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-[12px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-16 h-16 text-[20px]",
  xl: "w-24 h-24 text-[32px]",
};

export default function UserAvatar({
  src,
  name,
  username,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const hasValidImage = src && src.trim() !== "" && !imgError;

  const getInitial = (): string => {
    const source = name || username || "";
    const trimmed = source.trim();
    if (trimmed.length === 0) return "U";
    return trimmed[0].toUpperCase();
  };

  const sizeClass = sizeMap[size];

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#171717] text-white flex items-center justify-center font-medium ${sizeClass} ${className}`}
    >
      {hasValidImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name || username || "User"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitial()}</span>
      )}
    </div>
  );
}
