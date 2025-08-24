"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constant";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "@/modules/subscription/ui/components/subscriptions-item";

export const SubscriptionsSection = () => {
    return (
        <Suspense fallback={<SubscriptionsSkeleton />}>
            <ErrorBoundary fallback={<div>Something went wrong...</div>}>
                <SubscriptionsSectionSuspense />
            </ErrorBoundary>
        </Suspense>
    );
};
const SubscriptionsSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: 10 })
                .map((_, index) => (
                    <SubscriptionItemSkeleton key={index} />
                ))}
        </div>
    )
};
const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils()
    const [subscriptions, { hasNextPage, fetchNextPage, isFetchingNextPage }] = trpc.subscriptions.getManySubscriptions.useSuspenseInfiniteQuery({
        limit: DEFAULT_LIMIT,
    },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor
        })
    const unSubscribe = trpc.subscriptions.unSubscribe.useMutation({
        onSuccess: (data) => {
            toast.success(`Unsubscribe successfully`)
            utils.videos.getManySubscribed.invalidate()
            utils.users.getOneUser.invalidate({ id: data.creatorId })
            utils.subscriptions.getManySubscriptions.invalidate()
        },
        onError: () => {
            toast.error(`Something went wrong`)
        }
    })

    return (
        <div>
            <div className="flex flex-col gap-6">
                {subscriptions.pages
                    .flatMap((page) => page.data
                        .map((subscription) => (
                            <Link prefetch 
                                key={`${subscription.creatorId}`}
                                href={`/users/${subscription.user.id}`}>
                                <SubscriptionItem
                                    name={subscription.user.name}
                                    imageUrl={subscription.user.imageUrl}
                                    subscriberCount={subscription.user.subsriberCount}
                                    onUnsubscribe={() => {
                                        unSubscribe.mutate({ id: subscription.creatorId })
                                    }}
                                    disabled={unSubscribe.isPending}
                                />
                            </Link>
                        )))}
            </div>
            <InfiniteScroll
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </div>
    );
};
