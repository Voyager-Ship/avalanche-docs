"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Profile from "./profile";
import Projects from "./projects";
import Settings from "./settings";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

interface ProfileTabProps {
  achievements?: ReactNode;
}

// Map hash values to tab values (case-insensitive)
const hashToTabMap: Record<string, string> = {
  'personal': 'personal',
  'projects': 'projects',
  'achievements': 'achievements',
  'achievement': 'achievements', 
  'settings': 'settings',
};

const validTabs = ['personal', 'projects', 'achievements', 'settings'];

export default function ProfileTab({ achievements }: ProfileTabProps) {
  // Get initial tab from URL hash
  const getInitialTab = (): string => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1).toLowerCase();
      const tabValue = hashToTabMap[hash];
      if (tabValue && validTabs.includes(tabValue)) {
        return tabValue;
      }
    }
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      const hash = value === 'personal' ? '' : `#${value}`;
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
    }
  };

  // Listen for hash changes (back/forward navigation or direct links)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.slice(1).toLowerCase();
        const tabValue = hashToTabMap[hash];
        if (tabValue && validTabs.includes(tabValue)) {
          setActiveTab(tabValue);
        } else if (!hash) {
          // No hash means default to personal
          setActiveTab('personal');
        }
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="container mx-auto   px-4 sm:px-6 lg:px-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} >
        <TabsList className="mb-8 flex dark:bg-zinc-800">
          <TabsTrigger value="personal" className="flex-1  dark:data-[state=active]:bg-zinc-950!">Personal</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1  dark:data-[state=active]:bg-zinc-950!">Projects</TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1  dark:data-[state=active]:bg-zinc-950!">Achievements</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1  dark:data-[state=active]:bg-zinc-950!">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Profile />
        </TabsContent>

        <TabsContent value="projects">
          <Projects />
        </TabsContent>

        <TabsContent value="achievements">
          {achievements}
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

