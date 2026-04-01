import { useForm } from "@tanstack/react-form";
import { Button } from "@wajeer/ui/components/button";
import { FieldError, FieldLabel } from "@wajeer/ui/components/field";
import { Input } from "@wajeer/ui/components/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

const validateName = ({ value }: { value: string }) => {
  if (!value) {
    return "Name is required";
  }
  if (value.length < 2) {
    return "Name must be at least 2 characters";
  }
  return;
};

const validateEmail = ({ value }: { value: string }) => {
  if (!value) {
    return "Email is required";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Invalid email address";
  }
  return;
};

const validatePassword = ({ value }: { value: string }) => {
  if (!value) {
    return "Password is required";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters";
  }
  return;
};

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [authPending, setAuthPending] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setAuthPending(true);
      try {
        const { data, error } = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
        });

        if (error) {
          toast.error(error.message ?? "Sign up failed");
          return;
        }

        if (data?.user) {
          toast.success("Account created!");
          window.location.href = "/dashboard";
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Sign up failed";
        toast.error(message);
      } finally {
        setAuthPending(false);
      }
    },
  });

  const isSubmitting = form.state.isSubmitting || authPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your details to get started
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
          <form.Field name="name" validators={{ onBlur: validateName }}>
            {(field) => (
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                <Input
                  id="signup-name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  aria-invalid={field.state.meta.errors.length > 0}
                  disabled={isSubmitting}
                />
                {field.state.meta.errors.map((error, i) => (
                  <FieldError key={i}>{String(error)}</FieldError>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="email" validators={{ onBlur: validateEmail }}>
            {(field) => (
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={field.state.meta.errors.length > 0}
                  disabled={isSubmitting}
                />
                {field.state.meta.errors.map((error, i) => (
                  <FieldError key={i}>{String(error)}</FieldError>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="password" validators={{ onBlur: validatePassword }}>
            {(field) => (
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={field.state.meta.errors.length > 0}
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {field.state.meta.errors.map((error, i) => (
                  <FieldError key={i}>{String(error)}</FieldError>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
            })}
          >
            {({ canSubmit }) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
