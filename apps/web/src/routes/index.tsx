import { useGSAP } from "@gsap/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import Logo from "@/assets/logos/mainlogo";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Wajeer: Fill Last-Minute Staffing Gaps Instantly" },
      {
        name: "description",
        content:
          "Post the shift. Your team claims it. Fill last-minute staffing gaps instantly with one-tap shift claiming.",
      },
      { property: "og:title", content: "Shift Marketplace" },
      {
        property: "og:description",
        content:
          "Post the shift. Your team claims it. Fill last-minute staffing gaps instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shift Marketplace" },
      {
        name: "twitter:description",
        content: "Fill last-minute staffing gaps instantly.",
      },
    ],
    links: [{ rel: "canonical", href: "https://wajeer.com" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { session } = Route.useRouteContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", {
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".hero-title", {
        y: 30,
        duration: 0.6,
        delay: 0.1,
        ease: "power2.out",
      });

      gsap.from(".hero-subtitle", {
        y: 20,
        duration: 0.5,
        delay: 0.2,
        ease: "power2.out",
      });

      gsap.from(".hero-cta", {
        y: 20,
        duration: 0.5,
        delay: 0.3,
        ease: "power2.out",
      });

      gsap.fromTo(
        ".feature-card",
        { y: 40 },
        {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
          },
          y: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".step-item",
        { x: -30 },
        {
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: "top 85%",
          },
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        }
      );

      gsap.fromTo(
        ".cta-content",
        { scale: 0.95 },
        {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
          },
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  });

  if (session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ready to manage your shifts?
          </p>
        </div>
        <Link to="/dashboard">
          <Button size="lg" className="px-8">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,200,150,0.08),transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">
              Now filling shifts in real-time
            </span>
          </div>

          <h1 className="hero-title font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Post the shift.
            <br />
            <span className="text-primary">Your team claims it.</span>
          </h1>

          <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Fill last-minute staffing gaps instantly. Workers pick up extra
            shifts on their terms. No more no-shows, no more overtime costs.
          </p>

          <div className="hero-cta mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="btn-press px-8 text-base">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="btn-press px-8 text-base"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div className="hero-cta mt-16 flex flex-wrap items-center justify-center gap-8 text-center sm:gap-12">
            <div>
              <p className="font-display text-3xl font-bold text-primary">
                One-Tap
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Claim shifts instantly
              </p>
            </div>
            <div className="size-1.5 rounded-full bg-border" />
            <div>
              <p className="font-display text-3xl font-bold text-primary">
                Instant
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Approval flow
              </p>
            </div>
            <div className="size-1.5 rounded-full bg-border" />
            <div>
              <p className="font-display text-3xl font-bold text-primary">
                Trust Scores
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Build reputation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="border-t px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the way you work
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Everything you need to manage shifts, reduce no-shows, and keep
              your team happy.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="feature-card rounded-xl border bg-card p-6 transition-all duration-slow hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold">
                Instant Notifications
              </h3>
              <p className="mt-2 text-muted-foreground">
                Workers get notified immediately when shifts are posted. First
                to claim gets priority.
              </p>
            </div>

            <div className="feature-card rounded-xl border bg-card p-6 transition-all duration-slow hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold">
                Trust & Reliability
              </h3>
              <p className="mt-2 text-muted-foreground">
                Build your reputation with every shift. Trust scores help
                businesses find reliable workers.
              </p>
            </div>

            <div className="feature-card rounded-xl border bg-card p-6 transition-all duration-slow hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold">
                Fair Pricing
              </h3>
              <p className="mt-2 text-muted-foreground">
                $49-$199/month per location plus small transaction fees. No
                hidden costs, no long-term contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="border-t px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three simple steps to fill your staffing gaps.
            </p>
          </div>

          <div className="space-y-12">
            <div className="step-item flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="pb-12">
                <h3 className="font-display text-xl font-semibold">
                  Post the Shift
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Can't find coverage? Post the shift in seconds. Set the role,
                  time, location, and rate.
                </p>
              </div>
            </div>

            <div className="step-item flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <div className="mt-2 h-full w-px bg-border" />
              </div>
              <div className="pb-12">
                <h3 className="font-display text-xl font-semibold">
                  Workers Claim It
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Available workers in the same role get notified instantly.
                  They claim with one tap.
                </p>
              </div>
            </div>

            <div className="step-item flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Approve & Go
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Review claims, approve with a glance. Payroll adjusts
                  automatically. Done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="border-t px-6 py-24">
        <div className="cta-content mx-auto max-w-3xl rounded-2xl border bg-gradient-to-b from-primary/5 to-background p-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to fill your shifts faster?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join businesses that never worry about last-minute staffing gaps
            again.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="btn-press px-8 text-base">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="btn-press px-8 text-base"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
