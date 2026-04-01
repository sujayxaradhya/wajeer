import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { Input } from "@wajeer/ui/components/input";
import { Label } from "@wajeer/ui/components/label";
import { toast } from "sonner";

import { createBusiness } from "@/functions/business";
import { createLocation } from "@/functions/location";

export const Route = createFileRoute("/dashboard/businesses/new")({
  ssr: false,
  component: CreateBusinessPage,
});

function CreateBusinessPage() {
  const navigate = useNavigate();

  const createBusinessMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      locationName: string;
      locationAddress: string;
    }) => {
      const business = await createBusiness({ data: { name: data.name } });
      if (business && data.locationName) {
        await createLocation({
          data: {
            business_id: business.id,
            name: data.locationName,
            address: data.locationAddress || "",
          },
        });
      }
      return business;
    },
    onSuccess: (business) => {
      toast.success("Business created");
      navigate({
        to: "/dashboard/businesses/$id",
        params: { id: business!.id },
      });
    },
    onError: (error) => {
      toast.error("Failed to create business", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const locationName = formData.get("locationName") as string;
    const locationAddress = formData.get("locationAddress") as string;

    if (!name.trim()) {
      toast.error("Business name is required");
      return;
    }

    createBusinessMutation.mutate({ name, locationName, locationAddress });
  };

  return (
    <div className="space-y-6 p-6 max-w-xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <a href="/dashboard/businesses">← Back</a>
        </Button>
        <h1 className="text-xl font-bold">Create Your Business</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., The Coffee House"
                disabled={createBusinessMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName">Primary Location (Optional)</Label>
              <Input
                id="locationName"
                name="locationName"
                placeholder="e.g., Downtown Branch"
                disabled={createBusinessMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationAddress">
                Location Address (Optional)
              </Label>
              <Input
                id="locationAddress"
                name="locationAddress"
                placeholder="e.g., 123 Main St, City"
                disabled={createBusinessMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createBusinessMutation.isPending}
            >
              {createBusinessMutation.isPending
                ? "Creating..."
                : "Create Business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
