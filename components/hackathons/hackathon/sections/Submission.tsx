"use client";

import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Separator } from "@/components/ui/separator";
import { HackathonHeader } from "@/types/hackathons";
import { Calendar, Trophy, Rocket, Check } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

function Submission({ hackathon }: { hackathon: HackathonHeader }) {
  const { resolvedTheme } = useTheme();
  return (
    <section className="py-16 text-black dark:text-white">
      <h2 className="text-4xl font-bold"  id='submission'>Submit Your Project</h2>
      <Separator className="my-8 bg-zinc-300 dark:bg-zinc-800" />
      <p className="text-lg mb-8">
        Follow the guidelines to submit your hackathon project successfully
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="bg-zinc-200 dark:bg-zinc-900 p-6 shadow-md flex flex-col items-start justify-center rounded-tl-md rounded-bl-md">
          <Calendar
            color={resolvedTheme == "dark" ? "#A7A7B0" : "#6F6F77"}
            className="mb-4"
            size={24}
          />
          <h3 className="text-xl font-semibold mb-2">Deadline</h3>
          <p className="text-sm">
            Submissions close on <b>March 18, 2025</b>, at <b>11:59 PM UTC</b>.
          </p>
        </div>

        <div className="bg-zinc-700 dark:bg-zinc-800 p-6 shadow-md flex flex-col items-start justify-center">
          <Check
            color={resolvedTheme == "dark" ? "#A7A7B0" : "#D1D1D7"}
            size={24}
            className="mb-4"
          />
          <h3 className="text-xl font-semibold mb-2 text-zinc-50">Requirements</h3>
          <p className="text-sm text-zinc-50">
            Your project must include a GitHub repo, a short demo video, and a
            brief pitch.
          </p>
        </div>

        <div className="bg-zinc-200 dark:bg-zinc-900 p-6 shadow-md flex flex-col items-start justify-center">
          <Trophy
            color={resolvedTheme == "dark" ? "#A7A7B0" : "#6F6F77"}
            size={24}
            className="mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Evaluation Criteria</h3>
          <p className="text-sm">
            Projects will be judged on innovation, technical complexity,
            usability, and impact.
          </p>
        </div>

        <div className="bg-zinc-700 dark:bg-zinc-800 p-6 shadow-md flex flex-col items-start justify-center rounded-tr-md rounded-br-md">
          <Rocket
            color={resolvedTheme == "dark" ? "#A7A7B0" : "#D1D1D7"}
            size={24}
            className="mb-4"
          />
          <h3 className="text-xl font-semibold mb-2 text-zinc-50">Submission Process</h3>
          <p className="text-sm text-zinc-50">
            Submit your project through the Avalanche Builders Hub, add your
            team members, and upload your GitHub repo along with a demo video.
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          variant={"secondary"}
          className="w-1/3 bg-red-500 rounded-md text-zinc-100"
        >
          VIEW SUBMISSION GUIDELINES
        </Button>
      </div>
    </section>
  );
}

export default Submission;