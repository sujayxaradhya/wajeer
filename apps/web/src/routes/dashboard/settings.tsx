import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { KeyIcon, MonitorIcon, ShieldIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard/settings")({
  ssr: false,
  pendingComponent: SettingsSkeleton,
  component: SettingsPage,
});

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <Skeleton className="h-32" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}

function SettingsPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const user = session?.user;

  // session table: ip_address, user_agent, expires_at, token
  const { data: sessionsResult } = useSuspenseQuery({
    queryKey: ["active-sessions"],
    queryFn: () => authClient.listSessions(),
  });

  // account table: provider, account_id
  const { data: accountsResult } = useSuspenseQuery({
    queryKey: ["connected-accounts"],
    queryFn: () => authClient.listAccounts(),
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const revokeSessionMutation = useMutation({
    mutationFn: (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast.success("Session revoked");
    },
    onError: () => toast.error("Failed to revoke session"),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authClient.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated successfully");
    },
    onError: () => toast.error("Failed to update password"),
  });

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate();
  };

  const sessions = sessionsResult?.data ?? [];
  const accounts = accountsResult?.data ?? [];

  // user.role (singular) — same pattern as app-sidebar
  const role =
    user && "role" in user ? (user.role as string) : undefined;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      {/* Account Status — user.role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="size-4" />
            Account Status
          </CardTitle>
          <CardDescription>Your account role and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Role</p>
            <Badge variant="outline" className="capitalize text-xs">
              {role ?? "worker"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security — account.password / user.password_hash */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-4" />
            Security
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              disabled={
                changePasswordMutation.isPending ||
                !currentPassword ||
                !newPassword
              }
              className="w-fit"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions — session: ip_address, user_agent, expires_at, token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorIcon className="size-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Devices currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!sessions.length ? (
            <p className="text-muted-foreground text-sm">No active sessions</p>
          ) : (
            sessions.map((s, i) => (
              <div key={s.token}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium">
                      {s.userAgent ?? "Unknown device"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {s.ipAddress ?? "Unknown IP"} · Expires{" "}
                      {new Date(s.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={revokeSessionMutation.isPending}
                    onClick={() => revokeSessionMutation.mutate(s.token)}
                  >
                    Revoke
                  </Button>
                </div>
                {i < sessions.length - 1 && <Separator className="mt-3" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Connected Accounts — account: provider, account_id */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              OAuth providers linked to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {accounts.map((account, i) => (
              <div key={account.accountId}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">
                    {account.providerId}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Connected
                  </Badge>
                </div>
                {i < accounts.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
