import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { AuthLayout } from "@/components/auth-layout";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { session } = await getUser();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

const loginFeatures = [
  {
    title: "One-Tap Claiming",
    description: "Workers claim shifts with a single tap",
  },
  {
    title: "Instant Approvals",
    description: "Approve or reject claims in seconds",
  },
  {
    title: "Trust Scores",
    description: "Build reputation with every completed shift",
  },
];

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <AuthLayout
      title="Fill shifts instantly"
      description="Post the shift. Your team claims it. No more no-shows, no more overtime costs."
      features={loginFeatures}
    >
      {mode === "signin" ? (
        <SignInForm onSwitchToSignUp={() => setMode("signup")} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
      )}
    </AuthLayout>
  );
}
