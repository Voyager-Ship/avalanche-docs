"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { countries } from "@/constants/countries";
import { hsEmploymentRoles } from "@/constants/hs_employment_role";
import { Github, X, Link2, Wallet, User, FileText, Zap } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";
import { useProfileProgress } from "@/components/profile/components/hooks/useProfileProgress";
import { SkillsAutocomplete } from "./SkillsAutocomplete";
import { useProfileForm } from "./hooks/useProfileForm";
import { LoadingButton } from "@/components/ui/loading-button";
import { Toaster } from "@/components/ui/toaster";
import { signIn } from "next-auth/react";
import { ProfileChecklist } from "./ProfileChecklist";
import { ProfileHeader } from "./ProfileHeader";
import { NounAvatarConfig } from "./NounAvatarConfig";
import { AvatarSeed } from "./DiceBearAvatar";

export default function Profile() {
  const [newSkill, setNewSkill] = useState("");
  const [isNounAvatarConfigOpen, setIsNounAvatarConfigOpen] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [nounAvatarSeed, setNounAvatarSeed] = useState<AvatarSeed | null>(null);
  const [nounAvatarEnabled, setNounAvatarEnabled] = useState(false);

  // Use custom hook for all profile logic
  const {
    form,
    watchedValues,
    isLoading,
    isSaving,
    handleFileSelect,
    handleAddSkill,
    handleRemoveSkill,
    handleAddSocial,
    handleRemoveSocial,
    onSubmit,
  } = useProfileForm();

  // Calculate profile completion percentage with debounce (optimized)
  const profileProgress = useProfileProgress(watchedValues, 800);

  // Load Noun avatar data
  useEffect(() => {
    async function loadNounAvatar() {
      try {
        const response = await fetch("/api/user/noun-avatar");
        if (response.ok) {
          const data = await response.json();
          setNounAvatarSeed(data.seed);
          setNounAvatarEnabled(data.enabled ?? false);
        }
      } catch (error) {
        console.error("Error loading Noun avatar:", error);
      }
    }
    loadNounAvatar();
  }, []);

  // Handle avatar save
  const handleNounAvatarSave = async (seed: AvatarSeed, enabled: boolean) => {
    setNounAvatarSeed(seed);
    setNounAvatarEnabled(enabled);
    // Optionally refresh the page or update state
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calcular el estado del checklist
  const checklistState = {
    email: !!watchedValues.email,
    profilePicture: !!watchedValues.image,
    country: !!watchedValues.country,
    company: !!(watchedValues.founder_company_name || watchedValues.employee_company_name),
    wallet: !!watchedValues.wallet,
    teamName: false, // TODO: Agregar campo team_name cuando esté disponible
  };

  return (
    <>
      {/* Header con Avatar, Info y Checklist */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-white  p-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
          {/* Left side - Avatar and Progress */}
          <ProfileHeader
            name={watchedValues.name}
            username={watchedValues.username}
            country={watchedValues.country}
            image={form.watch("image")}
            profileProgress={profileProgress}
            onEditAvatar={() => setIsNounAvatarConfigOpen(true)}
            nounAvatarSeed={nounAvatarSeed}
            nounAvatarEnabled={nounAvatarEnabled}
          />

          {/* Right side - Profile Checklist */}
          <div className="lg:min-w-[280px]">
            <ProfileChecklist {...checklistState} />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-[760px] mx-auto">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">

              {/* Basic Info Section */}
              <div className="mt-6" >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <User className="w-5 h-5" /> Basic Info
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Tell us who you are so we can match you with relevant events and opportunities.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name or Nickname */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name or Nickname</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name or preferred display name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be used for your profile and submissions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Address */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" disabled {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll use this for login and important updates. It won't be shown publicly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City of Residence */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>City of Residence</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 rounded-md shadow-md max-h-60 overflow-y-auto">
                            {countries.map((countryOption) => (
                              <SelectItem key={countryOption.value} value={countryOption.label}>
                                {countryOption.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Helps us surface in-person events and opportunities near you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* I'm currently... */}
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-semibold">I'm currently...</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={[
                          { label: "Student", value: "student" },
                          { label: "Founder", value: "founder" },
                          { label: "Employee", value: "employee" },
                          { label: "Enthusiast", value: "enthusiast" },
                        ]}
                        selected={(() => {
                          const selected: string[] = [];
                          if (watchedValues.is_student) selected.push("student");
                          if (watchedValues.is_founder) selected.push("founder");
                          if (watchedValues.is_employee) selected.push("employee");
                          if (watchedValues.is_enthusiast) selected.push("enthusiast");
                          // Note: freelancer and researcher would need to be added to the schema if needed
                          return selected;
                        })()}
                        onChange={(values) => {
                          form.setValue("is_student", values.includes("student"), { shouldDirty: true });
                          form.setValue("is_founder", values.includes("founder"), { shouldDirty: true });
                          form.setValue("is_employee", values.includes("employee"), { shouldDirty: true });
                          form.setValue("is_enthusiast", values.includes("enthusiast"), { shouldDirty: true });
                          // Note: freelancer and researcher would need to be added to the schema if needed
                        }}
                        placeholder="Select all options that describe you."
                        searchPlaceholder="Search roles..."
                      />
                    </FormControl>
                    <FormDescription>
                      Choose all roles that apply. This helps us tailor content and opportunities.
                    </FormDescription>
                  </FormItem>

                  {/* Conditional fields based on selection */}
                  {watchedValues.is_student && (
                    <FormField
                      control={form.control}
                      name="student_institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University or Institution (Student)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your university or institution name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.is_founder && (
                    <FormField
                      control={form.control}
                      name="founder_company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name (Founder)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your company name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.is_employee && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="employee_company_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name (Employee)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your company name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="employee_role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role (Employee)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hsEmploymentRoles.map((roleOption) => (
                                  <SelectItem key={roleOption.value} value={roleOption.label}>
                                    {roleOption.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* About you Section */}
              <div >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> About you
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Share a short intro so other builders and partners know who you are.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Short bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell others about yourself in a few words"
                            className="resize-none h-32"
                            maxLength={250}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          250 characters. Highlight your background, interests and what you're building.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Accounts & contact Section */}
              <div >
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Link2 className="w-5 h-5" /> Accounts & contact
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Connect your accounts so we can link your work, rewards and communication
                  </p>
                </div>
                <div className="space-y-4">
                  {/* GitHub */}
                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => {
                      const hasGithubConnected = !!field.value;
                      return (
                        <FormItem>
                          <FormLabel>Github</FormLabel>
                          <div className="flex flex-col gap-2">
                            <FormControl>
                              <Input 
                                placeholder="Your github username" 
                                {...field} 
                                readOnly={hasGithubConnected}
                                className={hasGithubConnected ? "bg-muted" : ""}
                              />
                            </FormControl>
                            <LoadingButton
                              disabled={hasGithubConnected}
                              type="button"
                              variant='default'
                              isLoading={isConnectingGithub}
                              className="w-fit"
                              loadingText="Connecting..."
                              onClick={async () => {
                                setIsConnectingGithub(true);
                                try {
                                  const callbackUrl = window.location.pathname;
                                  await signIn("github", { callbackUrl });
                                } catch (error) {
                                  console.error("Error connecting GitHub:", error);
                                } finally {
                                  setIsConnectingGithub(false);
                                }
                              }}
                            >
                              <Github className="w-4 h-4" />
                              {hasGithubConnected ? "Connected" : "Connect GitHub"}
                            </LoadingButton>
                          </div>
                          {hasGithubConnected && (
                            <FormDescription className="text-xs text-muted-foreground">
                              Connected via GitHub OAuth
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* X (Twitter) - Placeholder */}

                </div>
              </div>

              {/* Wallet Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Wallet
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Used for prizes, grants and on-chain credentials. You can add or change it later.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="wallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Input
                            placeholder="0x..."
                            {...field}
                            className="font-mono text-sm"
                            readOnly={true}
                          />
                          {field.value ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="default"
                              className="w-fit"
                              onClick={() => {
                                field.onChange("");
                              }}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <div className="w-fit">
                              <WalletConnectButton
                                onWalletConnected={(address) => {
                                  field.onChange(address);
                                }}
                                currentAddress={field.value}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Other accounts Section */}
              <div >
                <div >
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Other accounts
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Add your social or professional links.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="socials"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value?.map((social, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  value={social}
                                  onChange={(e) => {
                                    const newSocials = [...(field.value || [])];
                                    newSocials[index] = e.target.value;
                                    field.onChange(newSocials);
                                  }}
                                  placeholder="Add your social or professional links."
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSocial(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSocial}
                            className="w-fit"
                          >
                            <span className="mr-2">+</span> Add social link
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Connect your GitHub so we can link your repos to projects and grants.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Telegram Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Telegram
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    We may contact you through Telegram for fast coordination.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="telegram_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter your Telegram username (without @)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Skills
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Add your main skills so teams, grants and partners can find you.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {field.value?.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <FormControl>
                        <SkillsAutocomplete
                          value={newSkill}
                          onChange={setNewSkill}
                          onSelect={(skill) => {
                            const currentSkills = watchedValues.skills || [];
                            if (!currentSkills.includes(skill)) {
                              form.setValue("skills", [...currentSkills, skill], { shouldDirty: true });
                              setNewSkill("");
                            }
                          }}
                          existingSkills={watchedValues.skills || []}
                          placeholder="Start typing to search skills..."
                        />
                      </FormControl>
                      <FormDescription>
                        Add at least 3 skills to improve your matches and profile score.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            {/* Submit Button */}
            <div className="flex justify-start ">
              <LoadingButton 
                type="submit" 
                variant="red" 
                isLoading={isSaving} 
                loadingText="Saving..."
                className="min-w-[80px]"
              >
                Save
              </LoadingButton>
            </div>
          </form>
        </Form>
      </div>

      <NounAvatarConfig
        isOpen={isNounAvatarConfigOpen}
        onOpenChange={setIsNounAvatarConfigOpen}
        currentSeed={nounAvatarSeed}
        nounAvatarEnabled={nounAvatarEnabled}
        onSave={handleNounAvatarSave}
      />
      <Toaster />
    </>
  );
}
