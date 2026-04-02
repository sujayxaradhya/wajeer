"use client";

import { isRedirect, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { cn } from "@wajeer/ui/lib/utils";
import { useCallback, Component, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

type RouteErrorProps = {
  error?: Error | null | any;
  title?: string;
  message?: string;
  className?: string;
};

export function RouteError({
  error,
  title = "Something went wrong",
  message,
  className,
}: RouteErrorProps) {
  const router = useRouter();

  // Handle redirects that bubble up to the Error Boundary (e.g. from useSuspenseQuery)
  useEffect(() => {
    if (isRedirect(error)) {
      // isRedirect checks for the redirect symbol or boolean
      // The options object is available on the error
      router.navigate(error.options ?? { to: "/login" });
    }
  }, [error, router]);

  console.error("RouteError caught:", error);
  const displayError =
    typeof error === "object" && error !== null
      ? error.message || JSON.stringify(error)
      : String(error);

  const handleReset = useCallback(() => {
    queryClient.clear();
    router.navigate({ to: "/", reloadDocument: true });
  }, [router]);

  if (isRedirect(error)) {
    return null;
  }

  return (
    <div className="flex min-h-[60svh] items-center justify-center p-4">
      <Card className={cn("max-w-md w-full", className)}>
        <CardHeader>
          <CardTitle className="font-display text-destructive">
            {title}
          </CardTitle>
          <CardDescription>
            {message ?? displayError ?? "An unexpected error occurred."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or return to the home page.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Try Again
          </Button>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export class GlobalErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <RouteError error={this.state.error} />;
    }

    return this.props.children;
  }
}

type NotFoundErrorProps = {
  className?: string;
};

export function NotFoundError({ className }: NotFoundErrorProps) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center p-4">
      <Card className={cn("max-w-md w-full text-center", className)}>
        <CardHeader>
          <CardTitle className="font-display text-4xl">404</CardTitle>
          <CardDescription className="text-base">
            Page not found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

type AuthErrorProps = {
  message?: string;
  className?: string;
};

export function AuthError({ message, className }: AuthErrorProps) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center p-4">
      <Card className={cn("max-w-md w-full text-center", className)}>
        <CardHeader>
          <CardTitle className="font-display">
            Authentication Required
          </CardTitle>
          <CardDescription>
            {message ?? "Please sign in to access this page."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button
            onClick={() => authClient.signIn.social({ provider: "google" })}
          >
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function handleServerRetry() {
  window.location.reload();
}

type ServerErrorProps = {
  error?: Error | null;
  className?: string;
};

export function ServerError({ error, className }: ServerErrorProps) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center p-4">
      <Card className={cn("max-w-md w-full text-center", className)}>
        <CardHeader>
          <CardTitle className="font-display text-destructive">
            Server Error
          </CardTitle>
          <CardDescription>
            {error?.message ?? "Something went wrong on our end."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We&apos;re experiencing issues. Please try again shortly.
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          <Button variant="outline" onClick={handleServerRetry}>
            Retry
          </Button>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

type QueryErrorProps = {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function QueryError({
  error,
  title = "Failed to load data",
  message,
  onRetry,
  className,
}: QueryErrorProps) {
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      queryClient.invalidateQueries();
    }
  }, [onRetry]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="font-display text-destructive">{title}</CardTitle>
        <CardDescription>
          {message ?? error?.message ?? "Unable to fetch the requested data."}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="outline" onClick={handleRetry}>
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
}
