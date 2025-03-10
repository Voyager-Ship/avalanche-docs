import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { SearchEventInput } from "@/components/ui/search-event-input";
import { TimeZoneSelect } from "@/components/ui/timezone-select";
import { HackathonHeader, ScheduleActivity } from "@/types/hackathons";
import { CalendarPlus2, Hourglass, MapPin } from "lucide-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mockActivities: ScheduleActivity[] = [
  {
    date: "2024-11-01T10:00:00.000Z",
    name: "Opening Ceremony",
    stage: "Main Stage",
    duration: 120,
    description: "Ava Labs Team",
    host_name: "Ava Labs Team",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Main Stage",
    category: "Opening",
    url: "https://hackathon.com/opening",
  },
  {
    date: "2024-11-01T13:00:00.000Z",
    name: "Team Formation",
    stage: "Collaboration Zone",
    duration: 180,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Collaboration Zone",
    category: "Networking",
    url: "https://hackathon.com/team-formation",
  },
  {
    date: "2024-11-01T16:00:00.000Z",
    name: "Ideation Workshop",
    stage: "Workshop Area",
    duration: 120,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Workshop Area",
    category: "Workshop",
    url: "https://hackathon.com/ideation",
  },
  {
    date: "2024-11-02T09:00:00.000Z",
    name: "Technical Workshop",
    stage: "Workshop Area",
    duration: 180,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Workshop Area",
    category: "Workshop",
    url: "https://hackathon.com/technical-workshop",
  },
  {
    date: "2024-11-02T14:00:00.000Z",
    name: "Mentor Office Hours",
    stage: "Meeting Rooms",
    duration: 240,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Meeting Rooms",
    category: "Mentorship",
    url: "https://hackathon.com/mentor-office-hours",
  },
  {
    date: "2024-11-02T19:00:00.000Z",
    name: "Evening Social",
    stage: "Social Area",
    duration: 120,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Social Area",
    category: "Social",
    url: "https://hackathon.com/evening-social",
  },
  {
    date: "2024-11-03T10:00:00.000Z",
    name: "Progress Check-in",
    stage: "Main Stage",
    duration: 60,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Main Stage",
    category: "Progress",
    url: "https://hackathon.com/progress-checkin",
  },
  {
    date: "2024-11-03T14:00:00.000Z",
    name: "Security Workshop",
    stage: "Workshop Area",
    duration: 120,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Workshop Area",
    category: "Workshop",
    url: "https://hackathon.com/security-workshop",
  },
  {
    date: "2024-11-03T17:00:00.000Z",
    name: "Practice Pitches",
    stage: "Presentation Area",
    duration: 180,
    description: "Ava Labs Team",
    host_name: "Ava Labs",
    host_icon: "/temp/hackathon-icon.png",
    host_media: "Avalabs",
    location: "Presentation Area",
    category: "Pitching",
    url: "https://hackathon.com/practice-pitches",
  },
];

function Schedule({ hackathon }: { hackathon: HackathonHeader }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-5xl font-bold mb-2 md:text-4xl sm:text-3xl" id="schedule">
        Schedule
      </h2>
      <Separator className="my-8 bg-zinc-300 dark:bg-zinc-800" />
      <span className="text-zinc-50 text-lg font-medium sm:text-base">
        {getDateRange(mockActivities)}
      </span>
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-10 mt-4 min-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 md:gap-10 w-full md:w-auto">
          <SearchEventInput />
          <TimeZoneSelect />
        </div>
        <div className="inline-flex items-center gap-3 rounded-md border-2 border-red-500 bg-black px-3 py-2 text-zinc-50 h-10 justify-center w-fit md:justify-start whitespace-nowrap">
          <Hourglass className="h-5 w-5" color="#F5F5F9" />
          <div className="flex flex-col">
            <span className="whitespace-nowrap">
              {(() => {
                const deadline = new Date(
                  hackathon.content.registration_deadline
                );
                const now = new Date();
                const diffMs = deadline.getTime() - now.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(
                  (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const diffMinutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );

                if (diffDays > 0) {
                  return `${diffDays} days to deadline`;
                } else {
                  return `${diffHours}h ${diffMinutes}m to deadline`;
                }
              })()}
            </span>
          </div>
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">  
        {Object.entries(groupActivitiesByDay(mockActivities))
          .slice(0, 2)
          .map(([date, activities], index) => (
            <div key={index} className="flex flex-col gap-4">
              <h3 className="text-2xl text-center p-4 rounded-md text-zinc-900 font-black mb-4 bg-red-500 sm:text-xl">
                {new Date(date).getDate()}TH{" "}
                {new Date(date)
                  .toLocaleString("en-US", { weekday: "long" })
                  .toUpperCase()}
              </h3>

              {activities.map((activity, index) => (
                <div key={index} className="flex flex-row gap-3">
                  <Card className="bg-zinc-900 border-red-500 px-2 sm:px-4">
                    <CardHeader className="px-2 sm:px-6">
                      <div className="border border-red-500 rounded-full text-sm font-medium text-center">
                        Live now
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 justify-center px-2 sm:px-6">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-base sm:text-lg font-medium">
                          {new Date(date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        <span className="text-base sm:text-lg font-medium">
                          {new Date(
                            new Date(date).getTime() +
                              activities[0].duration * 60000
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-red-500 flex-1">
                    <CardHeader className="px-3 sm:px-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                          <CardTitle className="text-red-500 text-base sm:text-lg">
                            {activity.name}
                          </CardTitle>
                          <span className="text-zinc-400 text-xs sm:text-sm font-normal">
                            {activity.description}
                          </span>
                        </div>
                        <Badge className="bg-zinc-50 text-zinc-900 py-0.5 px-2.5 text-xs w-fit h-fit">
                          {activity.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                        <div className="flex flex-row gap-4">
                          <Image
                            src={activity.host_icon}
                            alt={activity.host_name}
                            width={40}
                            height={40}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm sm:text-base">{activity.host_name}</span>
                            <Link
                              className="text-zinc-400 text-xs sm:text-sm font-normal"
                              href={`https://x.com${activity.host_media}`}
                            >
                              @{activity.host_media}
                            </Link>
                          </div>
                        </div>
                        <div className="flex flex-row gap-4 flex-1 justify-between mt-3 sm:mt-0">
                          <div className="flex flex-row items-center gap-2">
                            <MapPin color="#8F8F99" className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-zinc-50 text-xs sm:text-sm font-medium">
                              {activity.location}
                            </span>
                          </div>
                          <Button variant="secondary" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                            <CalendarPlus2
                              color="#F5F5F9"
                              className="w-3 h-3 sm:w-4 sm:h-4"
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}

export default Schedule;

type GroupedActivities = {
  [key: string]: ScheduleActivity[];
};

function getDateRange(activities: ScheduleActivity[]): string {
  if (!activities.length) return "No dates available";

  const dates = activities.map((activity) => new Date(activity.date));

  const earliestDate = new Date(
    Math.min(...dates.map((date) => date.getTime()))
  );
  const latestDate = new Date(Math.max(...dates.map((date) => date.getTime())));

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (earliestDate.getTime() === latestDate.getTime()) {
    return formatter.format(earliestDate);
  }

  return `${formatter.format(earliestDate)} - ${formatter.format(latestDate)}`;
}

function groupActivitiesByDay(
  activities: ScheduleActivity[]
): GroupedActivities {
  return activities.reduce((groups: GroupedActivities, activity) => {
    // Format the date to YYYY-MM-DD to use as key
    const date = new Date(activity.date);
    const dateKey = date.toISOString().split("T")[0];

    // If this date doesn't exist in groups, create an empty array
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    // Add the activity to the corresponding date group
    groups[dateKey].push(activity);

    // Sort activities within the day by time
    groups[dateKey].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return groups;
  }, {});
}