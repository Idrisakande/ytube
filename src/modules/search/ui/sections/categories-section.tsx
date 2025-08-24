"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string;
}
export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong...</div>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading filters={[]} onFilterChange={() => { }} />;
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  // console.log(categoryId);

  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map(({ name, id }) => ({
    value: id,
    label: name,
  }));

  const onFilterChange = (filter: string | null) => {
    // If the selected filter is the same as the current categoryId,
    if (filter === categoryId) {
      return;
    }
    const url = new URL(window.location.href);
    if (filter) {
      url.searchParams.set("categoryId", filter);
    } else {
      url.searchParams.delete("categoryId");
    }
    // window.history.pushState({}, "", url.toString());
    router.push(url.toString(), { scroll: false });
  };
  return (
    <FilterCarousel
      filter={categoryId}
      filters={data}
      onFilterChange={onFilterChange}
    />
  );
};
