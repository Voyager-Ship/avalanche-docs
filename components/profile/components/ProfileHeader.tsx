"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { DiceBearAvatar, AvatarSeed } from "./DiceBearAvatar";

interface ProfileHeaderProps {
  name?: string;
  username?: string;
  country?: string;
  image?: string;
  profileProgress: number;
  onEditAvatar: () => void;
  nounAvatarSeed?: AvatarSeed | null;
  nounAvatarEnabled?: boolean;
}

export function ProfileHeader({
  name,
  username,
  country,
  image,
  profileProgress,
  onEditAvatar,
  nounAvatarSeed,
  nounAvatarEnabled = false,
}: ProfileHeaderProps) {
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  // Get progress color based on percentage for the horizontal progress bar
  const getProgressColor = () => {
    if (profileProgress < 40) {
      return {
        tailwindClass: "bg-red-500"
      };
    } else if (profileProgress <= 80) {
      return {
        tailwindClass: "bg-[#FCD34D]"
      };
    } else {
      return {
        tailwindClass: "bg-[#4D7C0F]"
      };
    }
  };

  const progressColor = getProgressColor();

  return (
    <div className="flex flex-col items-center lg:items-start rounded-lg p-4">
      {/* Title Section */}
      <div className="mb-6">
        <h2>Profile</h2>
        <span className="text-sm text-zinc-400">Complete your profile to unlock badges, grants and tailored opportunities</span>
      </div>

      {/* Avatar and User Info - Horizontal Layout */}
      <div className="flex items-start gap-6 mb-6">
        {/* Profile Picture with Progress Circle */}
        <div
          className="relative cursor-pointer flex-shrink-0"
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
          onClick={onEditAvatar}
        >
          {nounAvatarEnabled && nounAvatarSeed ? (
            <DiceBearAvatar
              seed={nounAvatarSeed}
              name={name}
              profileProgress={profileProgress}
              size="large"
              showProgress={true}
            />
          ) : (
            <DiceBearAvatar
              seed={null}
              name={name}
              profileProgress={profileProgress}
              size="large"
              showProgress={true}
            />
          )}
          {isHoveringAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-opacity z-30">
              <Pencil className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* User Info - Right Side (left-aligned text) */}
        <div className="flex flex-col justify-center pt-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {name || "Your Name"}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            {country || "Add your country"}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            @{username || "username"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="mb-2">
          <span className="text-sm text-zinc-900 dark:text-zinc-100">
            {profileProgress}% complete - Finish your profile to unlock more opportunities.
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColor.tailwindClass} transition-all duration-500`}
            style={{ width: `${profileProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
