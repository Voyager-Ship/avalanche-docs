"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePopularSkills } from "./hooks/usePopularSkills";
import { useDebounce } from "@/components/hackathons/project-submission/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SkillsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (skill: string) => void;
  existingSkills: string[];
  placeholder?: string;
}

export function SkillsAutocomplete({
  value,
  onChange,
  onSelect,
  existingSkills,
  placeholder = "Add skill",
}: SkillsAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { searchSkills, isLoading } = usePopularSkills();

  // Aplicar debounce al valor del input (300ms)
  const debouncedValue = useDebounce(value, 300);

  // Obtener sugerencias: si está vacío pero enfocado, mostrar top skills
  const suggestions = debouncedValue.length > 0 
    ? searchSkills(debouncedValue, existingSkills)
    : isFocused 
      ? searchSkills("", existingSkills)
      : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Actualizar estado open cuando cambian las sugerencias (usando debouncedValue)
  useEffect(() => {
    if (debouncedValue.length > 0) {
      setOpen(suggestions.length > 0);
    } else if (isFocused) {
      // Si está enfocado pero vacío, mostrar top skills
      setOpen(suggestions.length > 0);
    } else {
      setOpen(false);
    }
  }, [debouncedValue, suggestions.length, isFocused]);

  const handleSelectSkill = (skill: string) => {
    onSelect(skill);
    onChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        // Seleccionar la primera sugerencia
        handleSelectSkill(suggestions[0].name);
      } else {
        // Agregar la skill escrita si no hay sugerencias
        handleSelectSkill(value.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Mostrar sugerencias si está abierto y hay sugerencias, o si está vacío pero enfocado
  const showSuggestions = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          setOpen(true);
        }}
        onBlur={() => {
          // Delay para permitir click en sugerencias
          setTimeout(() => {
            setIsFocused(false);
            setOpen(false);
          }, 200);
        }}
        placeholder={placeholder}
        className="w-full"
      />
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md">
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>No skills found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((skill) => (
                    <CommandItem
                      key={skill.name}
                      value={skill.name}
                      onSelect={() => handleSelectSkill(skill.name)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          debouncedValue.toLowerCase() === skill.name.toLowerCase()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span>{skill.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

