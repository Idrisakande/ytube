"use client";

import { DEFAULT_LIMIT } from "@/constant";
import { trpc } from "@/trpc/client";
// import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string;
}
export const VideosSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<VideosSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong...</div>}>
        <VideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSkeleton = () => {
  return <div>Loading..</div>;
};

const VideosSectionSuspense = ({}: CategoriesSectionProps) => {
  // const router = useRouter();
  const [videos] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // const data = categories.map(({ name, id }) => ({
  //   value: id,
  //   label: name,
  // }));

  // const onFilterChange = (filter: string | null) => {
  //   if (filter === categoryId) {
  //     return;
  //   }
  //   // Update the URL with the selected category
  //   // and prevent scrolling to the top
  //   // by using { scroll: false }
  //   const url = new URL(window.location.href);
  //   if (filter) {
  //     url.searchParams.set("categoryId", filter);
  //   } else {
  //     url.searchParams.delete("categoryId");
  //   }
  //   // window.history.pushState({}, "", url.toString());
  //   router.push(url.toString(), { scroll: false });

  // };

  return (
    <>{JSON.stringify(videos)}</>
    // <FilterCarousel
    //   isLoading={false}
    //   filter={categoryId}
    //   filters={data}
    //   onFilterChange={onFilterChange}
    // />
  );
};
