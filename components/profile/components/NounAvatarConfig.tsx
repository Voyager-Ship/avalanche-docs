"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NounAvatar, NounSeed } from "./NounAvatar";
import Modal from "@/components/ui/Modal";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { ImageData } from "@nouns/assets";

interface NounAvatarConfigProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSeed?: NounSeed | null;
  nounAvatarEnabled?: boolean;
  onSave: (seed: NounSeed, enabled: boolean) => Promise<void>;
}

export function NounAvatarConfig({
  isOpen,
  onOpenChange,
  currentSeed,
  nounAvatarEnabled = false,
  onSave,
}: NounAvatarConfigProps) {
  const [seed, setSeed] = useState<NounSeed | null>(currentSeed || null);
  const [enabled, setEnabled] = useState(nounAvatarEnabled);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Initialize seed if not exists
  useEffect(() => {
    if (isOpen && !seed) {
      // Generate a default seed
      const defaultSeed: NounSeed = {
        background: 0,
        body: 0,
        accessory: 0,
        head: 0,
        glasses: 0,
      };
      setSeed(defaultSeed);
    }
  }, [isOpen, seed]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSeed(currentSeed || {
        background: 0,
        body: 0,
        accessory: 0,
        head: 0,
        glasses: 0,
      });
      setEnabled(nounAvatarEnabled);
    }
  }, [isOpen, currentSeed, nounAvatarEnabled]);

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

  // Generate random seed
  const generateRandomSeed = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/user/noun-avatar/generate-seed");
      if (!response.ok) {
        throw new Error("Failed to generate seed");
      }
      const data = await response.json();
      setSeed(data.seed);
      toast({
        title: "New avatar generated!",
        description: "Click 'Save' to apply this avatar.",
      });
    } catch (error) {
      console.error("Error generating seed:", error);
      toast({
        title: "Error",
        description: "Failed to generate new avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate seed from user ID (deterministic)
  const generateDeterministicSeed = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/user/noun-avatar/generate-seed?deterministic=true");
      if (!response.ok) {
        throw new Error("Failed to generate seed");
      }
      const data = await response.json();
      setSeed(data.seed);
      toast({
        title: "Deterministic avatar generated!",
        description: "This avatar will always be the same for your account.",
      });
    } catch (error) {
      console.error("Error generating seed:", error);
      toast({
        title: "Error",
        description: "Failed to generate avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!seed) {
      // Initialize default seed if none exists
      const defaultSeed: NounSeed = {
        background: 0,
        body: 0,
        accessory: 0,
        head: 0,
        glasses: 0,
      };
      setSeed(defaultSeed);
      // Continue with default seed
    }

    // Ensure seed is not null before proceeding
    const seedToSave = seed || {
      background: 0,
      body: 0,
      accessory: 0,
      head: 0,
      glasses: 0,
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/noun-avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: seedToSave, enabled: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save avatar");
      }

      await onSave(seedToSave, true);
      toast({
        title: "Avatar saved!",
        description: "Your Noun avatar has been updated.",
      });
      onOpenChange(false);
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

  const renderContent = () => {
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
      <div className="flex flex-col items-center gap-6">
        {/* Avatar Preview - Centered */}
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-lg flex items-center justify-center p-6">
            <NounAvatar seed={seed} size="xlarge" />
          </div>
        </div>

        {/* Trait Controls - 2 Columns */}
        {seed && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
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
                  className="h-4 w-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-0"
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
        )}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-end w-full">
        <LoadingButton
          type="button"
          onClick={handleSave}
          isLoading={isSaving}
          loadingText="Saving..."
          variant="red"
        >
          Save
        </LoadingButton>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Configure Your Avatar"
      description="Generate and customize your unique avatar."
      content={renderContent()}
      footer={renderFooter()}
      className="bg-white dark:bg-zinc-900 text-black dark:text-white  lg:w-[80%] lg:max-w-[600px]"
    />
  );
}

