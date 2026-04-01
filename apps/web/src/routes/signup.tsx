import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { AuthLayout } from "@/components/auth-layout";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: async () => {
    const { session } = await getUser();
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SignUpPage,
});

const signupFeatures = [
  {
    title: "Post shifts instantly",
    description: "Fill vacancies in minutes, not hours",
  },
  {
    title: "Build your team",
    description: "Connect with reliable workers",
  },
  {
    title: "Track everything",
    description: "Real-time updates and trust scores",
  },
];

function SignUpPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  return (
    <AuthLayout
      title="Join Wajeer today"
      description="Create your account and start filling shifts in minutes. No credit card required."
      features={signupFeatures}
    >
      {mode === "signin" ? (
        <SignInForm onSwitchToSignUp={() => setMode("signup")} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
      )}
    </AuthLayout>
  );
}
