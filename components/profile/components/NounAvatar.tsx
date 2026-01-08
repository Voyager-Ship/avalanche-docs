"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNounData, ImageData } from "@nouns/assets";
import { buildSVG } from "@nouns/sdk";

export interface NounSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

interface NounAvatarProps {
  seed?: NounSeed | null;
  size?: "small" | "large" | "xlarge";
  className?: string;
  name?: string;
  profileProgress?: number;
  showProgress?: boolean;
}

export function NounAvatar({
  seed,
  size = "large",
  className = "",
  name,
  profileProgress = 0,
  showProgress = false,
}: NounAvatarProps) {
  const [svgDataUri, setSvgDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Size configurations
  const sizeConfig = {
    small: {
      container: "h-10 w-10",
      avatar: "h-8 w-8",
      textSize: "text-lg",
      svg: 40,
      center: 20,
      radius: 18,
    },
    large: {
      container: "h-40 w-40",
      avatar: "h-32 w-32",
      textSize: "text-3xl",
      svg: 160,
      center: 80,
      radius: 70,
    },
    xlarge: {
      container: "h-60 w-80",
      avatar: "h-60 w-60",
      textSize: "text-5xl",
      svg: 256,
      center: 128,
      radius: 110,
    },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (profileProgress / 100) * circumference;

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (profileProgress < 40) {
      return {
        gradientStart: "#ef4444",
        gradientEnd: "#dc2626",
        shadowColor: "rgba(239, 68, 68, 0.3)",
      };
    } else if (profileProgress <= 80) {
      return {
        gradientStart: "#FCD34D",
        gradientEnd: "#FBBF24",
        shadowColor: "rgba(252, 211, 77, 0.3)",
      };
    } else {
      return {
        gradientStart: "#4D7C0F",
        gradientEnd: "#65A30D",
        shadowColor: "rgba(77, 124, 15, 0.3)",
      };
    }
  };

  const progressColor = getProgressColor();
  const uniqueId = `noun-progress-${size}-${profileProgress}`;

  useEffect(() => {
    if (!seed) {
      setIsLoading(false);
      return;
    }

    try {
      // Get noun data from seed
      const { parts, background } = getNounData(seed);
      
      // Build SVG from parts
      const svg = buildSVG(parts, ImageData.palette, background);
      
      // Convert to data URI
      const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
      setSvgDataUri(dataUri);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating Noun avatar:", error);
      setIsLoading(false);
    }
  }, [seed]);

  // If no seed or loading, show fallback
  if (!seed || isLoading) {
    return (
      <div className={`relative ${config.container} ${className}`}>
        {showProgress && (
          <svg
            className="absolute inset-0 rotate-180 transform"
            width={config.svg}
            height={config.svg}
          >
            <defs>
              <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={progressColor.gradientStart} stopOpacity="1" />
                <stop offset="100%" stopColor={progressColor.gradientEnd} stopOpacity="1" />
              </linearGradient>
              <filter id={`shadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
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
            <circle
              cx={config.center}
              cy={config.center}
              r={config.radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={size === "small" ? "2" : size === "large" ? "4" : "6"}
              className="text-muted opacity-20"
            />
            <circle
              cx={config.center}
              cy={config.center}
              r={config.radius}
              fill="none"
              stroke={`url(#gradient-${uniqueId})`}
              strokeWidth={size === "small" ? "3" : size === "large" ? "6" : "8"}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#shadow-${uniqueId})`}
              className="transition-all duration-500 ease-out"
              style={{
                filter: `drop-shadow(0 2px 4px ${progressColor.shadowColor})`
              }}
            />
          </svg>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className={`${config.avatar} relative z-10`}>
            <AvatarFallback className={config.textSize}>
              {name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${config.container} ${className}`}>
      {showProgress && (
        <svg
          className="absolute inset-0 rotate-180 transform"
          width={config.svg}
          height={config.svg}
        >
          <defs>
            <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={progressColor.gradientStart} stopOpacity="1" />
              <stop offset="100%" stopColor={progressColor.gradientEnd} stopOpacity="1" />
            </linearGradient>
            <filter id={`shadow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
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
          <circle
            cx={config.center}
            cy={config.center}
            r={config.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={size === "small" ? "2" : "4"}
            className="text-muted opacity-20"
          />
          <circle
            cx={config.center}
            cy={config.center}
            r={config.radius}
            fill="none"
            stroke={`url(#gradient-${uniqueId})`}
            strokeWidth={size === "small" ? "3" : "6"}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#shadow-${uniqueId})`}
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 2px 4px ${progressColor.shadowColor})`
            }}
          />
        </svg>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Avatar className={`${config.avatar} relative z-10`}>
          {svgDataUri ? (
            <AvatarImage src={svgDataUri} alt="Noun Avatar" />
          ) : (
            <AvatarFallback className={config.textSize}>
              {name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  );
}

