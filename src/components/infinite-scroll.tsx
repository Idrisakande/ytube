import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import React from "react";

interface InfiniteScrollProps {
    isManuallyTriggered?: boolean
    // hasMore: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    // loadMore: () => void;

}

export const InfiniteScroll = ({
    isManuallyTriggered = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: InfiniteScrollProps) => {
    // const targetRef = useRef<HTMLDivElement>(null);
    const stableOptions = React.useMemo(() => ({
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
    }), []);
    const { isIntersecting, targetRef } = useIntersectionObserver(stableOptions);

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManuallyTriggered) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage, isManuallyTriggered]);

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4">
            <div ref={targetRef}
            >
                {/* This div is used as the target for the IntersectionObserver */}
                {hasNextPage ? (
                    <Button
                        size={isFetchingNextPage ? `icon` : `xs`}
                        variant={`ghost`}
                        disabled={!hasNextPage || isFetchingNextPage}
                        onClick={fetchNextPage}
                        className="cursor-pointer"
                    >
                        {isFetchingNextPage ?
                            <Loader2Icon className="animate-spin size-6 text-muted-foreground" /> :
                            <>
                                {/* <RefreshCcwIcon className="md:hidden size-5 text-muted-foreground" /> */}
                                <span className="">Load more</span>
                            </>}
                    </Button>
                ) : <p className="text-xs text-muted-foreground">You have reach the end of the list</p>}
            </div>
        </div>
    )
};