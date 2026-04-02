import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@wajeer/ui/components/avatar";
import { Badge } from "@wajeer/ui/components/badge";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { Input } from "@wajeer/ui/components/input";
import { Label } from "@wajeer/ui/components/label";
import { Separator } from "@wajeer/ui/components/separator";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { Switch } from "@wajeer/ui/components/switch";
import {
  Building2Icon,
  KeyIcon,
  LogOutIcon,
  MailIcon,
  StarIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { getTrustScore } from "@/functions/trust";
import { updateProfileSchema } from "@/lib/schemas";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <Skeleton className="h-24" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  );
}

export const Route = createFileRoute("/dashboard/profile")({
  ssr: false,
  pendingComponent: ProfileSkeleton,
  component: ProfilePage,
});

function ProfilePage() {
  const context = Route.useRouteContext();
  const { data: trustScores } = useSuspenseQuery({
    queryKey: ["trust-scores"],
    queryFn: () => getTrustScore(),
  });

  const user = context.session?.user;
  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateProfileSchema>) => data,
    onSuccess: () => {
      toast.success("Profile updated");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateProfileSchema.safeParse({ name });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message);
      return;
    }
    updateProfileMutation.mutate(result.data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) {
      return "text-emerald-500";
    }
    if (score >= 3) {
      return "text-amber-500";
    }
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 4) {
      return "bg-emerald-500";
    }
    if (score >= 3) {
      return "bg-amber-500";
    }
    return "bg-red-500";
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl font-medium">
              {user.name?.charAt(0).toUpperCase() ??
                user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl font-semibold">
              {user.name ?? "User"}
            </p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">
                <UserIcon className="size-4" />
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                <MailIcon className="size-4" />
                Email
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted/50"
              />
            </div>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-fit"
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trust Scores</CardTitle>
          <CardDescription>Your reputation across businesses</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!trustScores?.length ? (
            <p className="text-muted-foreground text-sm">
              Complete shifts to build your trust score
            </p>
          ) : (
            trustScores.map((score) => (
              <div key={score.business_id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2Icon className="size-4 text-muted-foreground" />
                    <p className="font-medium text-sm">{score.business_name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarIcon
                      className={`size-4 ${getScoreColor(score.trust_score)}`}
                    />
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getScoreColor(score.trust_score)}`}
                    >
                      {score.trust_score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreBg(score.trust_score)}`}
                    style={{ width: `${(score.trust_score / 5) * 100}%` }}
                  />
                </div>
                <p className="text-muted-foreground/70 text-xs">
                  Role: {score.role} · Reliability:{" "}
                  {(score.reliability * 100).toFixed(0)}%
                </p>
                <Separator />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose what notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Shift Updates</p>
              <p className="text-muted-foreground text-xs">
                Get notified about shift changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Claim Status</p>
              <p className="text-muted-foreground text-xs">
                Updates on your shift claims
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">System Alerts</p>
              <p className="text-muted-foreground text-xs">
                Important system notifications
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button variant="outline" className="w-fit">
            <KeyIcon className="size-4" />
            Change Password
          </Button>
          <Button variant="outline" className="w-fit">
            <LogOutIcon className="size-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Deleting your account will permanently remove all your data,
            including trust scores, connected businesses, and shift history.
          </p>
          <Button variant="destructive" size="sm" className="w-fit">
            <Trash2Icon className="size-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
