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

export default function SendNotificationsPage() {

  const [audienceTab, setAudienceTab] = useState<string>("all");

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
              Description
            </h1>
            <Input placeholder="Type a description" />
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
                    <Tabs defaultValue="all" className="w-full flex items-center my-2">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all">With this option, the notification will be sent to all users</TabsContent>
                      <TabsContent value="hackathons">With this option, the notification will be sent to all users registered in the selected hackathons.</TabsContent>
                      <TabsContent value="custom">With this option, the notification will be sent to the users corresponding to the emails you add.</TabsContent>
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
