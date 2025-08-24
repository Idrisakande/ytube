import { DEFAULT_LIMIT } from "@/constant";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;
  {/* Pre-fetching categories to ensure they are available for the HomeView */ }
  void trpc.categories.getMany.prefetch()
  void trpc.videos.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT, categoryId })

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
