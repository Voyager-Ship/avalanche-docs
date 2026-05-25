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
import { isValidHttpUrl, normalizeUrl } from "@/lib/url-validation";

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

const getRepositoryUrlError = (url: string): string | null => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (/\s/.test(trimmedUrl)) {
    return "Please enter a valid URL without spaces.";
  }

  return isValidHttpUrl(normalizeUrl(trimmedUrl))
    ? null
    : "Please enter a valid repository URL (e.g. https://github.com/user/repo).";
};

function scheduleTrigger(trigger: () => Promise<boolean>) {
  queueMicrotask(() => {
    void trigger();
  });
}

export function ProjectRepositoriesInput({
  name,
  label,
  namePlaceholder,
  urlPlaceholder,
  addButtonLabel,
}: ProjectRepositoriesInputProps) {
  const form = useFormContext<FieldValues>();
  const [draftRepository, setDraftRepository] =
    React.useState<ProjectRepositoryInputValue>(emptyRepository);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const repositories: ProjectRepositoryInputValue[] = Array.isArray(field.value)
          ? field.value
          : [];
        const draftUrlError = getRepositoryUrlError(draftRepository.url);
        const hasValidDraftRepository =
          draftRepository.name.trim().length > 0 &&
          draftRepository.url.trim().length > 0 &&
          draftUrlError === null;

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

        const addDraftRepository = (): void => {
          if (!hasValidDraftRepository) {
            return;
          }

          field.onChange([
            ...repositories,
            {
              name: draftRepository.name.trim(),
              url: normalizeUrl(draftRepository.url),
            },
          ]);
          setDraftRepository(emptyRepository());
          scheduleTrigger(() => form.trigger(name));
        };

        return (
          <FormItem>
            <FormLabelWithCheck
              label={label}
              checked={repositories.some(
                (repository) => repository.name.trim() && repository.url.trim()
              )}
            />
            <FormControl>
              <div className="space-y-3">
                {repositories.length > 0 ? (
                  <div className="space-y-3">
                    {repositories.map((repository, index) => {
                      const urlError = getRepositoryUrlError(repository.url);

                      return (
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
                              aria-invalid={Boolean(urlError)}
                              className={[
                                "w-full dark:bg-zinc-950",
                                urlError ? "border-red-500 focus:border-red-500" : "",
                              ].join(" ")}
                            />
                            {urlError ? (
                              <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                                {urlError}
                              </p>
                            ) : null}
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
                            x
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="flex gap-3 items-start">
                  <div className="w-40">
                    <Input
                      placeholder={namePlaceholder}
                      value={draftRepository.name}
                      onChange={(event) =>
                        setDraftRepository((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addDraftRepository();
                        }
                      }}
                      className="w-full dark:bg-zinc-950"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder={urlPlaceholder}
                      value={draftRepository.url}
                      onChange={(event) =>
                        setDraftRepository((current) => ({
                          ...current,
                          url: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addDraftRepository();
                        }
                      }}
                      aria-invalid={Boolean(draftUrlError)}
                      className={[
                        "w-full dark:bg-zinc-950",
                        draftUrlError ? "border-red-500 focus:border-red-500" : "",
                      ].join(" ")}
                    />
                    {draftUrlError ? (
                      <p className="mt-1 text-sm font-medium text-red-600 dark:text-red-400">
                        {draftUrlError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addDraftRepository}
                  disabled={!hasValidDraftRepository}
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
