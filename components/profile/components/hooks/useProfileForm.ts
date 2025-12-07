import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

// Zod validation schema - no required fields, only format validations
export const profileSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().max(250, "Bio must not exceed 250 characters").optional(),
  email: z.email("Invalid email").optional(), // Email from session, optional
  image: z.string().optional(),
  country: z.string().optional(),
  // user_type as JSON object - all optional
  is_student: z.boolean().optional().default(false),
  is_founder: z.boolean().optional().default(false),
  is_employee: z.boolean().optional().default(false),
  is_enthusiast: z.boolean().optional().default(false),
  // Founder fields
  founder_company_name: z.string().optional(),
  // Employee fields
  employee_company_name: z.string().optional(),
  employee_role: z.string().optional(),
  // Student fields
  student_institution: z.string().optional(),
  // Legacy fields (for backward compatibility)
  company_name: z.string().optional(),
  role: z.string().optional(),
  github: z.string().optional(),
  wallet: z.string().optional(),
  socials: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  notifications: z.boolean().default(false),
  profile_privacy: z.string().default("public"),
  telegram_user: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function useProfileForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formData = useRef(new FormData());

  // Initialize form with react-hook-form and Zod
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      bio: "",
      email: session?.user?.email || "",
      image: "",
      country: "",
      is_student: false,
      is_founder: false,
      is_employee: false,
      is_enthusiast: false,
      founder_company_name: "",
      employee_company_name: "",
      employee_role: "",
      student_institution: "",
      company_name: "",
      role: "",
      github: "",
      wallet: "",
      socials: [],
      skills: [],
      notifications: false,
      profile_privacy: "public",
      telegram_user: "",
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  // Load profile data on component mount
  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/profile/extended/${session.user.id}`);
        
        if (response.ok) {
          const profile = await response.json();
          
          // Decompose user_type from JSON to individual form fields
          const formData = {
            name: profile.name || "",
            username: profile.username || "",
            bio: profile.bio || "",
            email: profile.email || session.user.email || "",
            notification_email: profile.notification_email || "",
            image: profile.image || "",
            country: profile.country || "",
            is_student: profile.user_type?.is_student || false,
            is_founder: profile.user_type?.is_founder || false,
            is_employee: profile.user_type?.is_employee || false,
            is_enthusiast: profile.user_type?.is_enthusiast || false,
            founder_company_name: profile.user_type?.founder_company_name || "",
            employee_company_name: profile.user_type?.employee_company_name || "",
            employee_role: profile.user_type?.employee_role || "",
            student_institution: profile.user_type?.student_institution || "",
            company_name: profile.user_type?.company_name || "",
            role: profile.user_type?.role || "",
            github: profile.github || "",
            wallet: profile.wallet || "",
            socials: profile.socials || [],
            skills: profile.skills || [],
            notifications: profile.notifications || false,
            profile_privacy: profile.profile_privacy || "public",
            telegram_user: profile.telegram_user || "",
          };

          form.reset(formData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session?.user?.id, session?.user?.email, form, toast]);

  // Update email when session is available
  useEffect(() => {
    if (session?.user?.email && !isLoading) {
      form.setValue("email", session.user.email);
    }
  }, [session?.user?.email, form, isLoading]);

  // Handle file selection for avatar
  const handleFileSelect = (file: File) => {
    // Save file in formData to upload later
    formData.current.set("file", file);
    
    // Create temporary URL for preview
    const imageUrl = URL.createObjectURL(file);
    form.setValue("image", imageUrl, { shouldDirty: true });
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    // Only format validations - no required fields
    let hasErrors = false;

    // Validate wallet format if provided
    if (data.wallet && data.wallet.trim() !== "" && !/^0x[a-fA-F0-9]{40}$/.test(data.wallet)) {
      form.setError("wallet", {
        type: "manual",
        message: "Invalid Ethereum address format (must be 0x + 40 hex characters)",
      });
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsSaving(true);

    try {
      // Check if there's a new image to upload
      const hasImageChanged = formData.current.has("file");
      let imageUrl = data.image;

      // If there's a new image, upload it first
      if (hasImageChanged) {
        try {
          const imageResponse = await fetch("/api/file", {
            method: "POST",
            body: formData.current,
          });

          if (!imageResponse.ok) {
            throw new Error("Error uploading image");
          }

          const imageData = await imageResponse.json();
          imageUrl = imageData.url;
          
          // Clear formData after upload
          formData.current = new FormData();
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          toast({
            title: "Warning",
            description: "Profile updated but image upload failed. Please try uploading the image again.",
            variant: "destructive",
          });
        }
      }

      // Build user_type object to send as JSON
      const { 
        is_student, 
        is_founder, 
        is_employee, 
        is_enthusiast, 
        founder_company_name,
        employee_company_name,
        employee_role,
        student_institution, 
        company_name, 
        role, 
        ...restData 
      } = data;
      
      const profileData = {
        ...restData,
        image: imageUrl, // Use uploaded image or existing one
        user_type: {
          is_student,
          is_founder,
          is_employee,
          is_enthusiast,
          ...(founder_company_name && { founder_company_name }),
          ...(employee_company_name && { employee_company_name }),
          ...(employee_role && { employee_role }),
          ...(student_institution && { student_institution }),
          // Legacy fields for backward compatibility
          ...(company_name && { company_name }),
          ...(role && { role }),
        }
      };

      console.log("Saving profile data:", profileData);
      
      const response = await fetch(`/api/profile/extended/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Rebuild form data from response
      const newFormData = {
        name: updatedProfile.name || "",
        username: updatedProfile.username || "",
        bio: updatedProfile.bio || "",
        email: updatedProfile.email || session.user.email || "",
        notification_email: updatedProfile.notification_email || "",
        image: updatedProfile.image || "",
        country: updatedProfile.country || "",
        is_student: updatedProfile.user_type?.is_student || false,
        is_founder: updatedProfile.user_type?.is_founder || false,
        is_employee: updatedProfile.user_type?.is_employee || false,
        is_enthusiast: updatedProfile.user_type?.is_enthusiast || false,
        founder_company_name: updatedProfile.user_type?.founder_company_name || "",
        employee_company_name: updatedProfile.user_type?.employee_company_name || "",
        employee_role: updatedProfile.user_type?.employee_role || "",
        student_institution: updatedProfile.user_type?.student_institution || "",
        company_name: updatedProfile.user_type?.company_name || "",
        role: updatedProfile.user_type?.role || "",
        github: updatedProfile.github || "",
        wallet: updatedProfile.wallet || "",
        socials: updatedProfile.socials || [],
        skills: updatedProfile.skills || [],
        notifications: updatedProfile.notifications || false,
        profile_privacy: updatedProfile.profile_privacy || "public",
        telegram_user: updatedProfile.telegram_user || "",
      };

      form.reset(newFormData);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error saving profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Skill handlers
  const handleAddSkill = (newSkill: string, setNewSkill: (skill: string) => void) => {
    const currentSkills = watchedValues.skills || [];
    if (newSkill.trim() && !currentSkills.includes(newSkill.trim())) {
      setValue("skills", [...currentSkills, newSkill.trim()], { shouldDirty: true });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = watchedValues.skills || [];
    setValue("skills", currentSkills.filter((skill) => skill !== skillToRemove), { shouldDirty: true });
  };

  // Social handlers
  const handleAddSocial = () => {
    const currentSocials = watchedValues.socials || [];
    setValue("socials", [...currentSocials, ""], { shouldDirty: true });
  };

  const handleRemoveSocial = (index: number) => {
    const currentSocials = watchedValues.socials || [];
    setValue("socials", currentSocials.filter((_, i) => i !== index), { shouldDirty: true });
  };

  return {
    form,
    watchedValues,
    isLoading,
    isSaving,
    handleFileSelect,
    handleAddSkill,
    handleRemoveSkill,
    handleAddSocial,
    handleRemoveSocial,
    onSubmit: form.handleSubmit(onSubmit),
  };
}

