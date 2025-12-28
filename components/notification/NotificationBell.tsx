"use client";

import * as React from "react";
import Image from "next/image";

import { useGetNotifications } from "@/hooks/use-get-notifications";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export type DbNotification = {
  id: number;
  audience: string;
  type: string;
  title: string;
  content: string;
  content_type: string;
  short_description: string;
  template: string;
  status: string;
};

type NotificationsResponse = Record<string, DbNotification[]>;

export default function NotificationBell(): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);
  const users: string[] = ['team@voyagership.co'];
  const className: string | undefined = undefined;

  const { data } = useGetNotifications(users);

  const notifications: DbNotification[] = React.useMemo((): DbNotification[] => {
    const payload: NotificationsResponse | null = (data ?? null) as NotificationsResponse | null;
    if (!payload) return [];
    const merged: DbNotification[] = users.flatMap((u: string): DbNotification[] => payload[u] ?? []);
    const uniqueById: Map<number, DbNotification> = new Map<number, DbNotification>();
    merged.forEach((n: DbNotification) => uniqueById.set(n.id, n));
    return Array.from(uniqueById.values());
  }, [data, users]);

  const hasUnread: boolean = notifications.length > 0;
  const unreadCount: number = notifications.length;


  const handleMarkAllAsRead = (): void => {
    setOpen(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild >
        <button
          type="button"
          className={cn("relative inline-flex h-9 w-9 items-center justify-center", className)}
          aria-label="Open notifications"
        >
          {hasUnread ? (
            <Image
              src="/images/bell-dot.svg"
              alt="notification bell"
              width={24}
              height={24}
            />
          ) : (
            <Image
              src="/images/bell.svg"
              alt="notification bell"
              width={24}
              height={24}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "flex flex-col justify-between",
          "translate-x-[-280px]",
          "w-[378px] h-[591px] px-6 py-0 pb-6",
          "bg-zinc-950 border-red-600! border",
          "border border-border rounded-lg shadow-2xl"
        )}
      >
        <div className="w-full flex flex-col justify-between gap-1 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-50">Notifications</h2>
            <Button className="bg-transparent p-0 hover:bg-transparent border-0" >
              <Image src="/images/close-icon.svg" alt="close-icon" width={24} height={24} />
            </Button>
          </div>
          <p className="text-sm text-zinc-400">You have {notifications.length} unread messages.</p>
        </div>
        <div className="w-full flex-1 flex flex-col items-start p-y-6">
          {
            notifications.length > 0 && (
              notifications.map((notification: DbNotification) => (
                <NotificationAccordionItem notification={notification} />
              ))
            )
          }
        </div>
        <PopoverClose className="w-full! bg-zinc-50 py-2 px-4 h-10 text-sm text-zinc-900 flex items-center justify-center gap-0 rounded-md">
          <Image src="/images/check.svg" alt="check-icon" className="mr-2" width={16} height={16} />
          <p>Mark all as read</p>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PopoverClose } from "@radix-ui/react-popover";

type NotificationAccordionItemProps = {
  notification: DbNotification;
};

export function NotificationAccordionItem(
  props: NotificationAccordionItemProps
): React.JSX.Element {
  const notification: DbNotification = props.notification;

  return (
    <Accordion type="single" className="w-full">
      <AccordionItem value={`notif-${notification.id}`} className="border-0 p-0 min-h-[87px]">
        <AccordionTrigger className="rounded-xl px-4 py-3 hover:no-underline hover:bg-accent p-0">
          <div className="flex w-full items-start gap-3">
            <span className="mt-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />

            <div className="flex-1 text-lef gap-4">
              <div className="font-medium text-sm">{notification.title}</div>
              {notification.short_description ? (
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {notification.short_description.slice(0, 30)}
                </div>
              ) : null}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4 pt-2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et rerum in exercitationem deserunt nulla, provident aspernatur nemo illum reiciendis magni. Beatae enim aut provident accusamus soluta numquam officia harum quibusdam.
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  );
}

