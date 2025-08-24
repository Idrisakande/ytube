import { DEFAULT_LIMIT } from "@/constant"
import { SearchView } from "@/modules/search/ui/views/search-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface PageProps {
    searchParams: Promise<{
        query: string | undefined
        categoryId: string | undefined
    }>
}

const Page = async ({ searchParams }: PageProps) => {
    const { categoryId, query } = await searchParams

    void trpc.categories.getMany.prefetch()
    void trpc.search.getMany.prefetchInfinite({
        limit: DEFAULT_LIMIT,
        categoryId,
        query
    })

    return (
        <HydrateClient>
            <SearchView query={query} categoryId={categoryId} />
        </HydrateClient>
    )
}
export default Page