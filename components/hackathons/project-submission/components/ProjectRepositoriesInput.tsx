"use client";

import React from "react";
import { useFormContext, type FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormLabelWithCheck } from "./FormLabelWithCheck";

type ProjectRepositoryInputValue = {
  name: string;
  url: string;
};

type ProjectRepositoriesInputProps = {
  name: string;
  label: string;
  namePlaceholder: string;
  urlPlaceholder: string;
  addButtonLabel: string;
};

const emptyRepository = (): ProjectRepositoryInputValue => ({
  name: "",
  url: "",
});

export function ProjectRepositoriesInput({
  name,
  label,
  namePlaceholder,
  urlPlaceholder,
  addButtonLabel,
}: ProjectRepositoriesInputProps) {
  const form = useFormContext<FieldValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const repositories: ProjectRepositoryInputValue[] = Array.isArray(field.value)
          ? field.value
          : [];

        const updateRepository = (
          index: number,
          key: keyof ProjectRepositoryInputValue,
          value: string
        ): void => {
          const nextRepositories = [...repositories];
          nextRepositories[index] = {
            ...nextRepositories[index],
            [key]: value,
          };

          field.onChange(nextRepositories);
        };

        return (
          <FormItem>
            <FormLabelWithCheck
              label={label}
              checked={repositories.some((repository) =>
                repository.name.trim() && repository.url.trim()
              )}
            />
            <FormControl>
              <div className="space-y-3">
                {repositories.length > 0 ? (
                  <div className="space-y-3">
                    {repositories.map((repository, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-40">
                          <Input
                            placeholder={namePlaceholder}
                            value={repository.name}
                            onChange={(event) =>
                              updateRepository(index, "name", event.target.value)
                            }
                            onBlur={() => {
                              field.onBlur();
                              void form.trigger(name);
                            }}
                            className="w-full dark:bg-zinc-950"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder={urlPlaceholder}
                            value={repository.url}
                            onChange={(event) =>
                              updateRepository(index, "url", event.target.value)
                            }
                            onBlur={() => {
                              field.onBlur();
                              void form.trigger(name);
                            }}
                            className="w-full dark:bg-zinc-950"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            field.onChange(
                              repositories.filter((_, itemIndex) => itemIndex !== index)
                            );
                            scheduleTrigger(() => form.trigger(name));
                          }}
                          className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <Button
                  type="button"
                  onClick={() => {
                    field.onChange([...repositories, emptyRepository()]);
                    scheduleTrigger(() => form.trigger(name));
                  }}
                  className="bg-white text-black border border-gray-300 hover:text-black hover:bg-gray-100 cursor-pointer"
                >
                  {addButtonLabel}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

function scheduleTrigger(trigger: () => Promise<boolean>) {
  queueMicrotask(() => {
    void trigger();
  });
}
