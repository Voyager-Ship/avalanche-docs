"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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

// Schema de validación con Zod
const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  country: z.string().optional(),
  company_name: z.string().optional(),
  role: z.string().optional(),
  github: z.string().optional(),
  wallet: z.string().optional(),
  socials: z.array(z.string()).default([]),
  founder_check: z.boolean().default(false),
  avalanche_ecosystem_member: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Inicializar formulario con react-hook-form y Zod
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "username",
      email: "",
      country: "",
      company_name: "",
      role: "",
      github: "",
      wallet: "",
      socials: [],
      founder_check: false,
      avalanche_ecosystem_member: false,
      skills: ["Foundary", "solidity", "python"],
    },
  });

  const { watch, setValue } = form;
  const watchedValues = watch();

  const handleAddSkill = () => {
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

  const handleAddSocial = () => {
    const currentSocials = watchedValues.socials || [];
    setValue("socials", [...currentSocials, ""], { shouldDirty: true });
  };

  const handleRemoveSocial = (index: number) => {
    const currentSocials = watchedValues.socials || [];
    setValue("socials", currentSocials.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const onSubmit = (data: ProfileFormValues) => {
    // Por ahora solo mostramos los datos en consola (mockeado)
    console.log("Profile data:", data);
    // TODO: Implementar guardado en BD cuando esté listo
  };

  // Calcular porcentaje de completitud del perfil
  const calculateProfileProgress = () => {
    const values = watchedValues;
    const fields = [
      values.username && values.username !== "username", // Username completado
      values.country, // Country seleccionado
      values.company_name, // Company ingresada
      values.role, // Role ingresado
      values.github, // GitHub conectado
      values.wallet, // Wallet address ingresada
      values.socials && values.socials.length > 0 && values.socials.some(s => s.trim() !== ""), // Al menos un social
      values.skills && values.skills.length > 0, // Al menos una skill
    ];
    
    const completedFields = fields.filter(Boolean).length;
    const totalFields = fields.length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const profileProgress = calculateProfileProgress();
  const radius = 50; // Radio del círculo (ajustado para avatar de 96px)
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (profileProgress / 100) * circumference;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Profile Picture */}
      <div className="flex items-start gap-6">
        <div
          className="relative"
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
        >
          {/* Círculo de progreso alrededor del avatar */}
          <div className="relative h-28 w-28">
            <svg
              className="absolute inset-0 -rotate-90 transform"
              width="112"
              height="112"
            >
              {/* Círculo de fondo */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted opacity-20"
              />
              {/* Círculo de progreso */}
              <circle
                cx="56"
                cy="56"
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
              <Avatar className="h-24 w-24 relative z-10">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="text-2xl">U</AvatarFallback>
              </Avatar>
            </div>
            {/* Porcentaje en la parte inferior del círculo */}
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

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
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

        <Separator />

        {/* Demographics Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Demographics</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tell us about yourself to help us personalize your experience.
          </p>
        </div>

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Residence</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company */}
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company/University</FormLabel>
              <FormControl>
                <Input placeholder="Enter company or university name" {...field} />
              </FormControl>
              <FormDescription>
                If you are part of a company or affiliated with a university, mention it here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role at Company</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
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
              <FormDescription>
                Select the option that best matches your role.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
        </div>

        {/* Founder Check */}
        <FormField
          control={form.control}
          name="founder_check"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="cursor-pointer">
                  Are you a founder or co-founder of a blockchain project?
                </FormLabel>
                <FormDescription>
                  Check this if you are a founder or co-founder of a blockchain project.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Avalanche Ecosystem Member */}
        <FormField
          control={form.control}
          name="avalanche_ecosystem_member"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-0.5">
                <FormLabel className="cursor-pointer">
                  Consider yourself an Avalanche ecosystem member?
                </FormLabel>
                <FormDescription>
                  Check this if you consider yourself part of the Avalanche ecosystem.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Separator />

        {/* GitHub */}
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input placeholder="github.com/username" {...field} />
                </FormControl>
                <Button type="button" variant="outline" size="default">
                  <Github className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
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
              <FormLabel>Socials (X, Telegram, etc.)</FormLabel>
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
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                </FormControl>
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="default">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
