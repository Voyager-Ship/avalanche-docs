'use client'

import { Divider } from "@/components/ui/divider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const hackathons = ['Hackathon A', 'Hackathon B', 'Hackathon C', 'Hackathon D', 'Hackathon E', 'Hackathon F', 'Hackathon G', 'Hackathon H'];

export default function SendNotificationsPage() {

  const [audienceTab, setAudienceTab] = useState<string>("all");
  const [selectedHackathons, setSelectedHackathons] = useState<string[]>([]);
  const send = async (): Promise<void> => {
    try {
      const response: Response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: [
            {
              "audience": {
                "all": audienceTab === "all",
                "hackathons": selectedHackathons,
                "users": ''
              },
              "type": "n",
              "title": "",
              "short_description": "",
              "content": "",
              "content_type": ""
            }
          ]
        }),
      });

      if (!response.ok) {
        const text: string = await response.text();
        throw new Error(text || "Failed to create notifications");
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <main className='container py-8 mx-auto min-h-[calc(100vh-92px)] lg:min-h-0 flex items-center justify-center relative px-2 pb-6 lg:px-14 '>
      <div className="w-full flex flex-col gap-4 items-end">
        <div className='w-full border shadow-sm rounded-md flex flex-col gap-8 py-14 px-8'>
          <div>
            <h1 className="text-zinc-50 text-2xl font-medium">
              Send notifications
            </h1>
            <p className="text-zinc-400">Create and send notifications to users. Make sure to complete all required information before sending them.</p>
            <Divider />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-50 text-xl font-medium">
              Title
            </h1>
            <Input placeholder="Type the notification title" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-50 text-xl font-medium">
              Short description
            </h1>
            <Input placeholder="Type a short description" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-50 text-xl font-medium">
              Content
            </h1>
            <Textarea placeholder="Type a content" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-zinc-50 text-xl font-medium">Audience</h2>
            <Dialog>
              <DialogTrigger className="bg-white rounded-md px-2 py-1 w-20">
                <p className="text-zinc-900 text-sm font-medium">
                  Select
                </p>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select your notification audience</DialogTitle>
                  <DialogDescription>
                    <Tabs value={audienceTab} onValueChange={setAudienceTab} className="w-full flex items-center my-2">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all">With this option, the notification will be sent to all users</TabsContent>
                      <TabsContent value="hackathons">
                        <div className="flex flex-col gap-4">
                          <p>
                            With this option, the notification will be sent to all users registered in the selected hackathons.
                          </p>
                          <div className="custom-scroll max-h-[160px] overflow-x-hidden overflow-y-auto flex flex-col gap-2">
                            {
                              hackathons.map((hackathon, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Checkbox onCheckedChange={() => setSelectedHackathons(prev => prev.includes(hackathon) ? prev.filter(h => h !== hackathon) : [...prev, hackathon])} />
                                  <p>{hackathon}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="custom">
                        <div className="flex flex-col gap-2">
                          <p>
                            Enter the email addresses of the users you wish to send notifications to, separated by commas.
                          </p>
                          <Input type="email" placeholder="Type emails" />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Button className="bg-white px-2 py-1 w-16 ">
          <p className="text-zinc-900 text-sm font-medium">
            Send
          </p>
        </Button>
      </div>
    </main>
  )
}
