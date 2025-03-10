"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Usa la implementación de Shadcn/UI
import { useFormContext } from "react-hook-form";
import { RegisterFormValues } from "./registrationForm"; // Asegúrate de que la ruta sea correcta
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


export function RegisterFormStep2() {
  const form = useFormContext<RegisterFormValues>();

  // Opciones para los Selects
  const web3ProficiencyOptions = [
    { value: "1", label: "Amateur" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "Expert" },
  ];

  const roleOptions = [
    { value: "developer", label: "Developer" },
    { value: "designer", label: "Designer" },
    { value: "productManager", label: "Product Manager" },
    { value: "marketing", label: "Marketing" },
    { value: "other", label: "Other" },
  ];

  const interestOptions = [
    { value: "defi", label: "DeFi" },
    { value: "nfts", label: "NFTs" },
    { value: "dao", label: "DAO" },
    { value: "blockchain", label: "Blockchain" },
    { value: "crypto", label: "Crypto" },
  ];

  const toolOptions = [
    { value: "metamask", label: "Metamask" },
    { value: "hardhat", label: "Hardhat" },
    { value: "truffle", label: "Truffle" },
    { value: "openzeppelin", label: "OpenZeppelin" },
    { value: "ethersjs", label: "Ethers.js" },
  ];

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "solidity", label: "Solidity" },
    { value: "rust", label: "Rust" },
    { value: "go", label: "Go" },
  ];

  const hackathonParticipationOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "firstTime", label: "First Time" },
  ];

  // Función para formatear los valores seleccionados en el SelectTrigger
  const formatSelectedValues = (values: string[], options: { value: string; label: string }[]) => {
    if (!values || values.length === 0) return "Select one or more options";
    if (values.length === 1) {
      const selectedOption = options.find((o) => o.value === values[0]);
      return selectedOption ? selectedOption.label : "";
    }
    return `${values.length} options selected`;
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Step 2: Experience & Skills
        </h3>
        <p className="text-zinc-400">
          Share your skills and expertise to tailor your experience on Builders
          Hub.
        </p>
        <div className="w-full h-px bg-zinc-800 mt-2" />{" "}
        {/* Línea gris debajo */}
      </div>
      {/* Step 2: Conocimientos y Participación en Web3 y Hackatones */}
      <FormField
        control={form.control}
        name="web3Proficiency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              What is your proficiency with Web3? (Amateur, 5 = Expert)
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your Web3 knowledge level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-black dark:text-white rounded-md shadow-md" >
                {web3ProficiencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-zinc-400">
              Rate your experience from beginner to expert.
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="roles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Which of the following best describes you?</FormLabel>
            <Select
              onValueChange={(value:string) => {
                const currentValues = Array.isArray(field.value)
                  ? field.value
                  : [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v) => v !== value)
                  : [...currentValues, value];
                field.onChange(newValues);
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue  
                    placeholder={formatSelectedValues(
                      field.value as string[],
                      roleOptions
                    )}
                  >
                    {formatSelectedValues(field.value as string[], roleOptions)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-black dark:text-white rounded-md shadow-md" >
                {roleOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {Array.isArray(field.value) &&
                        field.value.includes(option.value) && (
                          <Check className="h-4 w-4 " />
                        )}
                    </span>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-zinc-400">
              Choose roles that best represent your expertise.
            </FormMessage>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="interests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What are you most interested in within Web3?</FormLabel>
            <Select
              onValueChange={(value:string) => {
                const currentValues = Array.isArray(field.value)
                  ? field.value
                  : [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v) => v !== value)
                  : [...currentValues, value];
                field.onChange(newValues);
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={formatSelectedValues(
                      field.value as string[],
                      interestOptions
                    )}
                  >
                    {formatSelectedValues(
                      field.value as string[],
                      interestOptions
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-black dark:text-white rounded-md shadow-md" >
                {interestOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {Array.isArray(field.value) &&
                        field.value.includes(option.value) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                    </span>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-zinc-400">
              Choose the topics you want to explore further.
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tools"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Which tools are you familiar with?</FormLabel>
            <Select
              onValueChange={(value:string) => {
                const currentValues = Array.isArray(field.value)
                  ? field.value
                  : [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v) => v !== value)
                  : [...currentValues, value];
                field.onChange(newValues);
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={formatSelectedValues(
                      field.value as string[],
                      toolOptions
                    )}
                  >
                    {formatSelectedValues(field.value as string[], toolOptions)}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-black dark:text-white rounded-md shadow-md" >
                {toolOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {Array.isArray(field.value) &&
                        field.value.includes(option.value) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                    </span>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-zinc-400">
              Select platforms or technologies you have experience with.
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="languages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Which programming languages are you familiar with?
            </FormLabel>
            <Select
              onValueChange={(value:string) => {
                const currentValues = Array.isArray(field.value)
                  ? field.value
                  : [];
                const newValues = currentValues.includes(value)
                  ? currentValues.filter((v) => v !== value)
                  : [...currentValues, value];
                field.onChange(newValues);
              }}
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={formatSelectedValues(
                      field.value as string[],
                      languageOptions
                    )}
                  >
                    {formatSelectedValues(
                      field.value as string[],
                      languageOptions
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {Array.isArray(field.value) &&
                        field.value.includes(option.value) && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                    </span>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-zinc-400">
              Choose all that apply.
            </FormMessage>
          </FormItem>
        )}
      />

      <div className="flex-1 bg-zinc-800 px-4 gap-[10px]">
        <Separator />
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground ">
          Hackathon Participation
        </h3>
        <FormMessage className="text-zinc-400 ">
          Tell us about your hackathon experience to help us customize your
          journey on Builders Hub.
        </FormMessage>
      </div>

      <div className="flex-1 bg-zinc-800 px-4 gap-[10px]">
        <Separator />
      </div>
      <div className="mt-4 pt-8">
        <FormField
          control={form.control}
          name="hackathonParticipation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Have you participated in any other hackathons before?
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hackathonParticipationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-zinc-400">
                Let us know if this is your first hackathon or if you have prior
                experience.
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubPortfolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What’s your GitHub or Portfolio account?</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="Enter your GitHub or Portfolio link"
                    {...field}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                    🔗
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-zinc-400">
                Provide a link to showcase your past work.
              </FormMessage>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}