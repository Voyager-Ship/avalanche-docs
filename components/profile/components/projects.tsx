"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, EyeOff, Edit, Send } from "lucide-react";

interface Project {
  id: string;
  name: string;
  coverUrl?: string;
  lastEditTime?: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Project Name 1",
      coverUrl: "",
      lastEditTime: "2 days ago",
    },
    {
      id: "2",
      name: "Project Name 2",
      coverUrl: "",
      lastEditTime: "1 week ago",
    },
  ]);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleHideProject = (projectId: string) => {
    // Implement hide logic
    console.log("Hide project:", projectId);
  };

  const handleSubmitForGrant = (projectId: string) => {
    // Implement submit for grant logic
    console.log("Submit for grant:", projectId);
  };

  const handleEditProject = (projectId: string) => {
    // Implement edit logic
    console.log("Edit project:", projectId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button>New project</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Show all</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="relative h-48 w-full bg-muted">
              {project.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.coverUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏔️</div>
                    <div className="text-sm">Default image</div>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  {project.lastEditTime && (
                    <p className="text-sm text-muted-foreground">
                      Last edit: {project.lastEditTime}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleHideProject(project.id)}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSubmitForGrant(project.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for grant
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditProject(project.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button>Create your first project</Button>
        </div>
      )}
    </div>
  );
}

