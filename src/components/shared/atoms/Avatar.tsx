import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = "avatar", size = 48, className }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-neutral-200 dark:border-zinc-700 ${className}`}
      >
        <FaUser size={size * 0.5} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover border-2 border-neutral-200 dark:border-zinc-700 ${className}`}
      onError={() => setError(true)}
    />
  );
};