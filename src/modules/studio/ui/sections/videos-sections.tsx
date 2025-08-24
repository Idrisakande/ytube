"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
// Make sure you are importing the correct Table component that supports columns and data props
// import { Table } from "@/components/table";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, } from "@/components/ui/table"; // Update the path as needed to the actual location of Table.tsx
import { DEFAULT_LIMIT } from "@/constant";
import { compactNumber, snakeCaseToTitleCase } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { format } from "date-fns";
import { GlobeIcon, LockIcon } from "lucide-react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
  categoryId?: string;
}
export const VideosSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Something went wrong...</div>}>
        <VideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideosSectionSkeleton = () => {
  return <>
    <div className="border-y mx-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[440px]">Video</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right w-32">Comments</TableHead>
            <TableHead className="text-right pr-6">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add skeleton rows here */}
          {Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="pl-2 w-[440px]">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-32 h-18 rounded-xl" />
                  <div className="flex flex-col overflow-hidden gap-y-1">
                    <Skeleton className="h-[0.65rem] w-20 rounded-full" />
                    <Skeleton className="h-2 w-32 rounded-full" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-2 rounded-full w-16" /></TableCell>
              <TableCell><Skeleton className="h-2 rounded-full w-10" /></TableCell>
              <TableCell><Skeleton className="h-2 rounded-full w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-2 rounded-full w-8 ml-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-2 rounded-full w-10 ml-auto" /></TableCell>
              <TableCell className="text-right pr-6"><Skeleton className="h-2 rounded-full w-6 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>
};

const VideosSectionSuspense = ({ }: CategoriesSectionProps) => {
  // const router = useRouter();
  const [videos, { fetchNextPage, hasNextPage, isFetchingNextPage }] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );


  return (
    <div>
      <div className="border-y mx-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-2 w-[440px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right w-32">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.pages.flatMap((page) =>
              page.data).map((video) => (
                <Link prefetch  key={video.id} href={`/studio/videos/${video.id}`} legacyBehavior>
                  <TableRow className="cursor-pointer hover:bg-muted transition-colors">
                    <TableCell className="pl-2 w-[440px]">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-32 shrink-0">
                          <VideoThumbnail
                            thumbnailUrl={video.thumbnailUrl}
                            previewUrl={video.previewUrl}
                            title={video.title}
                            duration={video.duration || 0} // Ensure duration is a number
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1">
                          <span className="text-sm font-medium line-clamp-1 truncate w-54">{video.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1 truncate w-68">{video.description || `No description available`}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-[0.8rem] font-medium">
                        {video.visibility === "private" ? (
                          <LockIcon className="size-4 mr-1.5 " />
                        ) : (
                          <GlobeIcon className="size-4 mr-1.5" />
                        )}
                        {snakeCaseToTitleCase(video.visibility)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-[0.8rem] font-medium">
                        {snakeCaseToTitleCase(video.muxStatus || `error`)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[0.8rem] font-medium truncate">
                      {format(new Date(video.createdAt), "dd MMMM, yyyy")}
                    </TableCell>
                    <TableCell className="text-right text-[0.8rem] font-medium">{compactNumber(video.viewCount)}</TableCell>
                    <TableCell className="text-right p-0">
                      <div className="text-[0.8rem] font-medium line-clamp-1 truncate w-32 mx-auto pl-2">
                        {compactNumber(video.commentCount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 text-[0.8rem] font-medium">{compactNumber(video.likeCount)}</TableCell>
                  </TableRow>
                </Link>
              ))}
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        // isManuallyTriggered
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>

  );
};
