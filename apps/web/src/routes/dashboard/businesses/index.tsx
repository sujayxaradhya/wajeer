import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BusinessCard } from "@wajeer/ui/components/business-card";
import { Button } from "@wajeer/ui/components/button";
import { EmptyState } from "@wajeer/ui/components/empty-state";
import { Input } from "@wajeer/ui/components/input";
import { Skeleton } from "@wajeer/ui/components/skeleton";
import { Building2Icon, PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { getMyBusinesses } from "@/functions/business";

function BusinessesSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Businesses</h1>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}

function BusinessesListPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => getMyBusinesses(),
  });

  if (isLoading) {
    return <BusinessesSkeleton />;
  }

  const filtered = !search.trim()
    ? businesses
    : businesses.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
      );

  if (!businesses.length) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="font-display text-2xl font-bold">My Businesses</h1>
        <EmptyState
          title="Create your first business"
          description="Add your restaurant, store, or venue to start managing shifts and staff."
          actionLabel="Create Business"
          onAction={() => navigate({ to: "/dashboard/businesses/new" })}
          icon={<Building2Icon className="size-12" />}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">My Businesses</h1>
        <Link to="/dashboard/businesses/new">
          <Button>
            <PlusIcon className="size-4" />
            Create Business
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((business) => (
            <Link
              key={business.id}
              to="/dashboard/businesses/$id"
              params={{ id: business.id }}
            >
              <BusinessCard
                id={business.id}
                name={business.name}
                ownerName="Owner"
                locationCount={0}
                staffCount={0}
              />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching businesses"
          description="Try a different search term"
          icon={<SearchIcon className="size-8" />}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/dashboard/businesses/")({
  ssr: false,
  component: BusinessesListPage,
});
