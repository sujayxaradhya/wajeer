import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Notification } from "@wajeer/db";
import { Badge } from "@wajeer/ui/components/badge";
import { Button } from "@wajeer/ui/components/button";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { NotificationItem } from "@wajeer/ui/components/notification-item";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@wajeer/ui/components/tabs";
import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from "@/functions/notifications";

export const Route = createFileRoute("/dashboard/notifications")({
  ssr: false,
  pendingComponent: NotificationsSkeleton,
  component: NotificationsPage,
});

function NotificationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useSuspenseQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead({
        data: { notification_id: notificationId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationUnread({
        data: { notification_id: notificationId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filtered = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }
    if (filter === "unread") {
      return notifications.filter((n: Notification) => !n.read);
    }
    return notifications.filter((n: Notification) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map((n: Notification) => n.type));
    return [...types];
  }, [notifications]);

  if (!notifications.length) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <EmptyState
          description="We'll notify you when shifts are posted, claims are approved, or important updates occur."
          icon={<BellIcon className="size-12" />}
          title="No notifications yet"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            size="sm"
            variant="outline"
          >
            <CheckCheckIcon className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs onValueChange={setFilter} value={filter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          {notificationTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type
                .replace("_", " ")
                .replaceAll(/\b\w/g, (c: string) => c.toUpperCase())}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          description="Try changing the filter to see more notifications."
          title="No matching notifications"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((notification: Notification) => (
            <NotificationItem
              body={notification.body}
              createdAt={new Date(notification.created_at)}
              id={notification.id}
              key={notification.id}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onMarkUnread={(id) => markUnreadMutation.mutate(id)}
              read={notification.read}
              title={notification.title}
              type={notification.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-full max-w-md" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-20" key={i} />
        ))}
      </div>
    </div>
  );
}
