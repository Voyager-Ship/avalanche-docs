"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NounAvatar, NounSeed } from "./NounAvatar";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { ImageData } from "@nouns/assets";

interface NounAvatarEditorProps {
  currentSeed?: NounSeed | null;
  nounAvatarEnabled?: boolean;
  onSave: (seed: NounSeed, enabled: boolean) => Promise<void>;
}

export function NounAvatarEditor({
  currentSeed,
  nounAvatarEnabled = false,
  onSave,
}: NounAvatarEditorProps) {
  const [seed, setSeed] = useState<NounSeed | null>(
    currentSeed || {
      background: 0,
      body: 0,
      accessory: 0,
      head: 0,
      glasses: 0,
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Get max values for each trait
  const maxValues = {
    background: ImageData.bgcolors.length,
    body: ImageData.images.bodies.length,
    accessory: ImageData.images.accessories.length,
    head: ImageData.images.heads.length,
    glasses: ImageData.images.glasses.length,
  };

  // Update seed when currentSeed changes
  useEffect(() => {
    if (currentSeed) {
      setSeed(currentSeed);
    }
  }, [currentSeed]);

  // Trait adjustment functions
  const adjustTrait = (trait: keyof NounSeed, direction: 'prev' | 'next') => {
    if (!seed) return;
    
    const currentValue = seed[trait];
    const maxValue = maxValues[trait];
    
    let newValue: number;
    if (direction === 'next') {
      newValue = (currentValue + 1) % maxValue;
    } else {
      newValue = currentValue === 0 ? maxValue - 1 : currentValue - 1;
    }
    
    setSeed({ ...seed, [trait]: newValue });
  };

  const handleSave = async () => {
    if (!seed) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/noun-avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, enabled: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save avatar");
      }

      await onSave(seed, true);
      toast({
        title: "Avatar saved!",
        description: "Your Noun avatar has been updated.",
      });
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Trait labels
  const traitLabels = {
    head: "Head",
    glasses: "Glasses",
    body: "Body",
    accessory: "Accessory",
    background: "Background",
  };

  // Trait order as shown in the image
  const traitOrder: (keyof NounSeed)[] = ['head', 'glasses', 'body', 'accessory', 'background'];

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          My Avatar
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your  Avatar
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 mb-6">
        {/* Left Column - Trait Controls */}
        <div className="flex flex-col gap-3 min-w-[280px]">
          {traitOrder.map((trait) => (
            <div
              key={trait}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-900 dark:border-zinc-700 rounded-lg"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustTrait(trait, 'prev')}
                className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              </Button>
              
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex-1 text-center">
                {traitLabels[trait]}
              </span>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustTrait(trait, 'next')}
                className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"
              >
                <ChevronRight className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              </Button>
            </div>
          ))}
        </div>

        {/* Right Column - Avatar Preview */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md aspect-square bg-[#F3F3F3] dark:bg-zinc-800 rounded-lg flex items-center justify-center p-8">
            <NounAvatar seed={seed} size="large" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <LoadingButton
          type="button"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving..."
          variant="red"
          className="flex items-center gap-2"
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
}

