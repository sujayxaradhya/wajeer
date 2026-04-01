import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@wajeer/ui/components/badge";
import { Button } from "@wajeer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@wajeer/ui/components/card";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { Input } from "@wajeer/ui/components/input";
import { LocationCard } from "@wajeer/ui/components/location-card";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { StatCard } from "@wajeer/ui/components/stat-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@wajeer/ui/components/tabs";
import {
  ArrowLeftIcon,
  Building2Icon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteBusiness, getBusiness } from "@/functions/business";
import { getBusinessLocations } from "@/functions/location";

function BusinessDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: business,
    isLoading: isLoadingBusiness,
    error: businessError,
  } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusiness({ data: { business_id: id } }),
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["business-locations", id],
    queryFn: () => getBusinessLocations({ data: { business_id: id } }),
    enabled: activeTab === "locations",
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBusiness({ data: { business_id: id } }),
    onSuccess: () => {
      toast.success("Business deleted");
      navigate({ to: "/dashboard/businesses" });
    },
    onError: () => {
      toast.error("Failed to delete business");
    },
  });

  if (isLoadingBusiness) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-display text-2xl font-bold">Business Not Found</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            {businessError instanceof Error
              ? businessError.message
              : "Business not found or not authorized"}
          </p>
          <Link to="/dashboard/businesses">
            <Button variant="outline" size="sm" className="mt-3">
              Back to Businesses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/dashboard/businesses" })}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="font-display text-2xl font-bold">{business.name}</h1>
        </div>
        <Badge variant="secondary">Owner</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Shifts"
                value={0}
                description="All time"
                icon={<Building2Icon className="size-5" />}
              />
              <StatCard
                title="Fill Rate"
                value="0%"
                description="Completed / Posted"
                icon={<UsersIcon className="size-5" />}
              />
              <StatCard
                title="Locations"
                value={locations?.length ?? 0}
                description="Active venues"
                icon={<MapPinIcon className="size-5" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No activity yet"
                  description="Activity will appear here as you post shifts and manage staff."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Locations</h2>
              <Button variant="outline" size="sm">
                <PlusIcon className="size-4" />
                Add Location
              </Button>
            </div>

            {isLoadingLocations ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : (!locations?.length ? (
              <EmptyState
                title="No locations yet"
                description="Add your first location to start posting shifts."
                actionLabel="Add Location"
                onAction={() => {}}
                icon={<MapPinIcon className="size-8" />}
              />
            ) : (
              <div className="flex flex-col gap-3">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    id={location.id}
                    name={location.name}
                    address={location.address}
                    shiftCount={0}
                  />
                ))}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Team Members
              </h2>
              <Button variant="outline" size="sm">
                <PlusIcon className="size-4" />
                Invite Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <EmptyState
                  title="No team members yet"
                  description="Invite your team to start managing shifts together."
                  actionLabel="Invite Member"
                  onAction={() => {}}
                  icon={<UsersIcon className="size-8" />}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">
                    Business Name
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={business.name}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          toast.success("Business name updated");
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">
                        {business.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditName(business.name);
                          setIsEditing(true);
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Deleting this business will remove all associated locations,
                  shifts, and staff. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2Icon className="size-4" />
                  Delete Business
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/businesses/$id")({
  ssr: false,
  component: BusinessDetailPage,
});
