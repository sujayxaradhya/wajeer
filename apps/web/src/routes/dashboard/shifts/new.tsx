import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { FieldError, FieldLabel } from "@wajeer/ui/components/field";
import { Input } from "@wajeer/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wajeer/ui/components/select";
import { Textarea } from "@wajeer/ui/components/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { getMyBusinesses } from "@/functions/business";
import { getBusinessLocations } from "@/functions/location";
import { postShift } from "@/functions/shifts";
import { postShiftSchema } from "@/lib/schemas";

export const Route = createFileRoute("/dashboard/shifts/new")({
  ssr: false,
  component: PostShiftPage,
});

const roleOptions = [
  { value: "server", label: "Server" },
  { value: "cook", label: "Cook" },
  { value: "host", label: "Host" },
  { value: "bartender", label: "Bartender" },
  { value: "dishwasher", label: "Dishwasher" },
] as const;

function validateField(schema: z.ZodTypeAny) {
  return ({ value }: { value: unknown }) => {
    const result = schema.safeParse(value);
    return result.success ? undefined : String(result.error.issues[0]?.message);
  };
}

function PostShiftPage() {
  const navigate = useNavigate();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );

  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => getMyBusinesses(),
  });

  const { data: locations } = useQuery({
    queryKey: ["locations", selectedBusinessId],
    queryFn: () =>
      getBusinessLocations({ data: { business_id: selectedBusinessId } }),
    enabled: !!selectedBusinessId,
  });

  const postShiftMutation = useMutation({
    mutationFn: (data: z.infer<typeof postShiftSchema>) => postShift({ data }),
    onSuccess: (shift) => {
      toast.success("Shift posted");
      navigate({
        to: "/dashboard/shifts/$id",
        params: { id: shift!.id },
      });
    },
    onError: (error) => {
      toast.error("Failed to post shift", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      business_id: null as string | null,
      date: "",
      end_time: "",
      hourly_rate: undefined as number | undefined,
      location_id: null as string | null,
      notes: "" as string | undefined,
      role: null as string | null,
      start_time: "",
      title: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = postShiftSchema.safeParse({
        date: value.date,
        end_time: value.end_time,
        hourly_rate: value.hourly_rate,
        location_id: value.location_id,
        notes: value.notes,
        role: value.role,
        start_time: value.start_time,
        title: value.title,
      });
      if (!parsed.success) {
        toast.error("Please fix the form errors");
        return;
      }
      postShiftMutation.mutate(parsed.data);
    },
  });

  const isSubmitting = form.state.isSubmitting || postShiftMutation.isPending;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/shifts">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Post a Shift
        </h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Shift Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="flex flex-col gap-5"
            >
              <form.Field name="business_id">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Business</FieldLabel>
                    <Select
                      value={field.state.value ?? undefined}
                      onValueChange={(val) => {
                        field.handleChange(val ?? null);
                        setSelectedBusinessId(val ?? null);
                        form.setFieldValue("location_id", null);
                      }}
                      disabled={isSubmitting || isLoadingBusinesses}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingBusinesses
                              ? "Loading businesses..."
                              : (businesses && businesses.length === 0
                                ? "No businesses available"
                                : "Select business")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses?.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field
                name="location_id"
                validators={{
                  onChange: validateField(postShiftSchema.shape.location_id),
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Location</FieldLabel>
                    <Select
                      value={field.state.value ?? undefined}
                      onValueChange={(val) => field.handleChange(val ?? null)}
                      disabled={isSubmitting || !selectedBusinessId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            selectedBusinessId
                              ? (locations && locations.length === 0
                                ? "No locations available"
                                : "Select location")
                              : "Select a business first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.map((error, i) => (
                      <FieldError key={i}>{String(error)}</FieldError>
                    ))}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="title"
                validators={{
                  onChange: validateField(postShiftSchema.shape.title),
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Shift Title</FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.currentTarget.value)
                      }
                      placeholder="e.g., Saturday Dinner Service"
                      disabled={isSubmitting}
                    />
                    {field.state.meta.errors.map((error, i) => (
                      <FieldError key={i}>{String(error)}</FieldError>
                    ))}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="role"
                validators={{
                  onChange: validateField(postShiftSchema.shape.role),
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FieldLabel>Role</FieldLabel>
                    <Select
                      value={field.state.value ?? undefined}
                      onValueChange={(val) => field.handleChange(val ?? null)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.map((error, i) => (
                      <FieldError key={i}>{String(error)}</FieldError>
                    ))}
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <form.Field
                  name="date"
                  validators={{
                    onChange: validateField(postShiftSchema.shape.date),
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Date</FieldLabel>
                      <Input
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        disabled={isSubmitting}
                      />
                      {field.state.meta.errors.map((error, i) => (
                        <FieldError key={i}>{String(error)}</FieldError>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="start_time"
                  validators={{
                    onChange: validateField(postShiftSchema.shape.start_time),
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Start Time</FieldLabel>
                      <Input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        disabled={isSubmitting}
                      />
                      {field.state.meta.errors.map((error, i) => (
                        <FieldError key={i}>{String(error)}</FieldError>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="end_time"
                  validators={{
                    onChange: validateField(postShiftSchema.shape.end_time),
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldLabel>End Time</FieldLabel>
                      <Input
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        disabled={isSubmitting}
                      />
                      {field.state.meta.errors.map((error, i) => (
                        <FieldError key={i}>{String(error)}</FieldError>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <form.Field
                  name="hourly_rate"
                  validators={{
                    onChange: validateField(postShiftSchema.shape.hourly_rate),
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldLabel>Hourly Rate (optional)</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.state.value?.toString() ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.currentTarget.value
                              ? Number.parseFloat(e.currentTarget.value)
                              : undefined
                          )
                        }
                        placeholder="e.g., 15.00"
                        disabled={isSubmitting}
                      />
                      {field.state.meta.errors.map((error, i) => (
                        <FieldError key={i}>{String(error)}</FieldError>
                      ))}
                    </div>
                  )}
                </form.Field>

                <div className="flex flex-col gap-2">
                  <FieldLabel>Notes (optional)</FieldLabel>
                  <Textarea
                    value={form.getFieldValue("notes") ?? ""}
                    onBlur={form.getFieldMeta("notes")?.blur}
                    onChange={(e) =>
                      form.setFieldValue(
                        "notes",
                        e.currentTarget.value || undefined
                      )
                    }
                    placeholder="Any additional details for the worker..."
                    disabled={isSubmitting}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Posting Shift...
                  </>
                ) : (
                  "Post Shift"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
