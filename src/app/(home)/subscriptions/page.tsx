import { DEFAULT_LIMIT } from "@/constant"
import { SubscriptionsView } from "@/modules/subscription/ui/views/subscriptions-view"
import { HydrateClient, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

const Page = async () => {
    void trpc.subscriptions.getManySubscriptions.prefetchInfinite({ limit: DEFAULT_LIMIT })

    return (
        <HydrateClient>
            <SubscriptionsView />
        </HydrateClient>
    )
}
export default Page