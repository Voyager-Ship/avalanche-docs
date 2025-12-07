"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { countries } from "@/constants/countries";
import { hsEmploymentRoles } from "@/constants/hs_employment_role";
import { Pencil, Github, X, Link2, Wallet } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";
import { UploadModal } from "@/components/ui/upload-modal";
import { useProfileProgress } from "@/components/profile/components/hooks/useProfileProgress";
import { SkillsAutocomplete } from "./SkillsAutocomplete";
import { useProfileForm } from "./hooks/useProfileForm";
import { LoadingButton } from "@/components/ui/loading-button";
import { Toaster } from "@/components/ui/toaster";
import { signIn } from "next-auth/react";

export default function Profile() {
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
  const radius = 52; // Circle radius (adjusted for 104px avatar)
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (profileProgress / 100) * circumference;

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

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
        {/* Profile Picture */}
        <div className="flex items-center justify-center">
          <div
            className="relative"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            onClick={() => setIsUploadModalOpen(true)}
          >
            {/* Progress circle around avatar */}
            <div className="relative h-32 w-32">
              <svg
                className="absolute inset-0 -rotate-90 transform"
                width="128"
                height="128"
              >
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted opacity-20"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="text-red-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="h-26 w-26 relative z-10">
                  <AvatarImage src={form.watch("image") || ""} alt="Profile" />
                  <AvatarFallback className="text-2xl">U</AvatarFallback>
                </Avatar>
              </div>
              {/* Percentage at bottom of circle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 z-20 pointer-events-none">
                <span className="text-xs font-semibold text-red-500 bg-background border border-red-500/30 rounded-full px-2 py-0.5 shadow-sm">
                  {profileProgress}%
                </span>
              </div>
            </div>
            {isHoveringAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-opacity z-30">
                <span className="text-white text-sm font-medium">Edit</span>
              </div>
            )}
          </div>
        </div>

        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormDescription>
                This name will be displayed on your profile and submissions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell others about yourself in a few words"
                  className="resize-none h-24"
                  maxLength={250}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                250 characters. Highlight your background, interests, and experience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@" disabled {...field} />
              </FormControl>
            </FormItem>
          )}
        />


        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Username</FormLabel>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </div>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Country of Residence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-zinc-600">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-zinc-600 rounded-md shadow-md max-h-60 overflow-y-auto">
                    {countries.map((countryOption) => (
                      <SelectItem key={countryOption.value} value={countryOption.label}>
                        {countryOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This will help us bring in-person events closer to you.
                </FormDescription>
                <FormMessage className="text-zinc-600" />
              </FormItem>
            )}
          />

        </div>

        <Separator />

        {/* User Type Checkboxes */}
        <div className="space-y-4">
          <div>
            <FormLabel className="text-base">I am a...</FormLabel>
            <FormDescription className="mt-1">
              Select the option(s) that best describe you.
            </FormDescription>
          </div>

          <div >
            {/* Student */}
            <FormField
              control={form.control}
              name="is_student"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-3 shrink-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Student
                      </FormLabel>
                    </div>
                    {field.value && (
                      <FormField
                        control={form.control}
                        name="student_institution"
                        render={({ field: inputField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Enter your university or institution name"
                                {...inputField}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Founder */}
            <FormField
              control={form.control}
              name="is_founder"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-3 shrink-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Founder
                      </FormLabel>
                    </div>
                    {field.value && (
                      <div className="flex-1 flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name="founder_company_name"
                          render={({ field: inputField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Company name"
                                  {...inputField}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Employee */}
            <FormField
              control={form.control}
              name="is_employee"
              render={({ field }) => (
                <FormItem className="px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-3 shrink-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer font-normal">
                        Employee
                      </FormLabel>
                    </div>
                    {field.value && (
                      <div className="flex-1 flex items-center gap-4">
                        <FormField
                          control={form.control}
                          name="employee_company_name"
                          render={({ field: inputField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Company name"
                                  {...inputField}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="employee_role"
                          render={({ field: selectField }) => (
                            <FormItem className="flex-1">
                              <Select onValueChange={selectField.onChange} value={selectField.value}>
                                <FormControl>
                                  <SelectTrigger className="text-zinc-600 w-full">
                                    <SelectValue placeholder="Role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-zinc-600 rounded-md shadow-md max-h-60 overflow-y-auto">
                                  {hsEmploymentRoles.map((roleOption) => (
                                    <SelectItem key={roleOption.value} value={roleOption.label}>
                                      {roleOption.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-zinc-600" />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </FormItem>
              )}
            />

            {/* Enthusiast */}
            <FormField
              control={form.control}
              name="is_enthusiast"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 px-4 py-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    Enthusiast
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Separator />
        {/* GitHub */}
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => {
            const hasGithubConnected = !!field.value;
            return (
              <FormItem>
                <FormLabel>GitHub</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input 
                      placeholder="github.com/username" 
                      {...field} 
                      readOnly={hasGithubConnected}
                      className={hasGithubConnected ? "bg-muted" : ""}
                    />
                  </FormControl>
                  <Button disabled={hasGithubConnected}
                    type="button"
                    variant={hasGithubConnected ? "default" : "outline"}
                    size="icon"
                    onClick={async () => {
                      const callbackUrl = window.location.pathname;
                      await signIn("github", { callbackUrl });
                    }}
                    title={hasGithubConnected ? "Reconnect with GitHub" : "Connect with GitHub"}
                  >
                    <Github className="h-4 w-4" />
                  </Button>
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

        {/* Wallet */}
        <FormField
          control={form.control}
          name="wallet"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Wallet</FormLabel>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="0x..."
                    {...field}
                    className="flex-1 font-mono"
                    readOnly={true}
                  />
                  {field.value ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <WalletConnectButton
                      onWalletConnected={(address) => {
                        field.onChange(address);
                      }}
                      currentAddress={field.value}
                    />
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Connect your wallet to automatically fill in your address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Socials */}
        <FormField
          control={form.control}
          name="socials"
          render={({ field }) => (
            <FormItem>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Connect Your Accounts
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your social media or professional links
                </p>
              </div>
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
                          placeholder="https://"
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
                    <Link2 className="h-4 w-4 mr-2" />
                    Add social link
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telegram User */}
        <FormField
          control={form.control}
          name="telegram_user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram user</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your telegram user without the @"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We can be in touch through telegram.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
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
                  placeholder="Select skills..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <Separator /> */}

        {/* Profile Privacy */}
        {/* <FormField
          control={form.control}
          name="profile_privacy"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Profile Privacy (Coming soon)</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="text-zinc-600">
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-zinc-600 rounded-md shadow-md max-h-60 overflow-y-auto">
                    <SelectItem value="public">
                      Public (Visible to everyone)
                    </SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="community">Community-only</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Choose who can see your profile
              </FormDescription>
              <FormMessage className="text-zinc-600" />
            </FormItem>
          )}
        />

        <Separator /> */}

        {/* Notifications */}
        {/* <div>
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage the basic settings and primary details of your profile.
          </p>
        </div>

        <FormField
          control={form.control}
          name="notifications"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded">
                <div className="space-y-1">
                  <FormLabel>Email Notifications</FormLabel>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-line italic">
                    I wish to stay informed about Avalanche news and events and
                    agree to receive newsletters and other promotional materials
                    at the email address I provided. {"\n"}I know that I
                    may opt-out at any time. I have read and agree to the{" "}
                    <a
                      href="https://www.avax.network/privacy-policy"
                      className="text-primary hover:text-primary/80 dark:text-primary/90 dark:hover:text-primary/70"
                    >
                      Avalanche Privacy Policy
                    </a>
                    .
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        /> */}

     
     
        {/* Submit Button */}
        <div className="flex justify-end">
          <LoadingButton type="submit" variant="default" isLoading={isSaving} loadingText="Saving...">
          Save Changes
          </LoadingButton>
        </div>
        </form>
        <UploadModal
          isOpen={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onFileSelect={(file) => file && handleFileSelect(file)}
        />
      </Form>
      <Toaster />
    </>
  );
}
