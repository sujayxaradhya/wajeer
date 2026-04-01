import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/logo";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  features: { title: string; description: string }[];
};

export function AuthLayout({
  children,
  title,
  description,
  features,
}: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 sm:p-8">
        <div className="absolute top-6 left-6">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 mx-auto max-w-md px-8 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">{description}</p>
          <div className="mt-10 flex flex-col gap-5 text-left">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="size-3.5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
