"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  name?: string;
  username?: string;
  country?: string;
  image?: string;
  profileProgress: number;
  onEditAvatar: () => void;
}

export function ProfileHeader({
  name,
  username,
  country,
  image,
  profileProgress,
  onEditAvatar,
}: ProfileHeaderProps) {
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  
  // Circle calculations for progress
  const radius = 70; // Increased to separate from avatar
  const circumference = 2 * Math.PI * radius;
  // Start from left (180deg rotation) and go clockwise
  const offset = circumference - (profileProgress / 100) * circumference;

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
          <div className="relative h-40 w-40">
            <svg
              className="absolute inset-0 rotate-180 transform"
              width="160"
              height="160"
            >
              <defs>
                {/* Gradient for smoother appearance */}
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                </linearGradient>
                {/* Shadow filter for depth */}
                <filter id="progressShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                  <feOffset dx="0" dy="0" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted opacity-20"
              />
              {/* Progress circle - thicker and smoother */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#progressShadow)"
                className="transition-all duration-500 ease-out"
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="h-32 w-32 relative z-10">
                <AvatarImage src={image || ""} alt="Profile" />
                <AvatarFallback className="text-3xl">
                  {name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
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
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${profileProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
