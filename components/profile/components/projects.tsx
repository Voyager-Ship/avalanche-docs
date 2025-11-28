"use client";

import { ProjectCard } from "@/components/showcase/ProjectCard";
import { useProject } from "./hooks/use-project";
import { Button } from "@/components/ui/button";

export default function Projects() {
  const { projects } = useProject();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Button>New project</Button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {projects.map((project, index) => (
          <ProjectCard project={project} key={index} />
        ))}
      </div>
    </div>
  );
}

