"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Profile from "./profile";
import Projects from "./projects";
import Settings from "./settings";
import type { ReactNode } from "react";

interface ProfileTabProps {
  achievements?: ReactNode;
}

export default function ProfileTab({ achievements }: ProfileTabProps) {
  return (
    <div className="container mx-auto py-8 my-8 px-4 sm:px-6 lg:px-8">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-8 w-full flex">
          <TabsTrigger value="personal" className="flex-1 data-[state=active]:border-red-500! dark:data-[state=active]:border-red-500!">Personal</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 data-[state=active]:border-red-500! dark:data-[state=active]:border-red-500!">Projects</TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1 data-[state=active]:border-red-500! dark:data-[state=active]:border-red-500!">Achievement</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 data-[state=active]:border-red-500! dark:data-[state=active]:border-red-500!">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 ">
          <Profile />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Projects />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          {achievements}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

