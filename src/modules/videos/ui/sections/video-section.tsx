"use client"

import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { VideoPlayer, VideoPlayerSkeleton } from "@/modules/videos/ui/components/video-player"
import { VideoBanner } from "@/modules/videos/ui/components/video-banner"
import { VideoTopRow, VideoTopRowSkeleton } from "@/modules/videos/ui/components/video-top-row"
import { useAuth } from "@clerk/nextjs"

interface VideoSectionProps {
    videoId: string
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
    return (
        <Suspense fallback={<VideoSectionSkeleton />}>
            <ErrorBoundary fallback={<p >Error</p>}>
                <VideoSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}
const VideoSectionSkeleton = () => {
    return (
        <>
            <VideoPlayerSkeleton />
            <VideoTopRowSkeleton />
        </>
    )
}
const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
    const { isSignedIn } = useAuth()
    const utils = trpc.useUtils()
    const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId })

    const createView = trpc.videoViews.create.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId })
        },
        onError: (error) => {
            console.log(`error from view:`, error.message)
        }
    })

    const handelPlay = () => {
        if (!isSignedIn) return

        createView.mutate({ videoId: videoId })
    }

    return (
        <>
            <div className={cn(
                `aspect-video relative overflow-hidden bg-black rounded-xl`,
                video.muxStatus !== `ready` && `rounded-b-none`
            )}>
                <VideoPlayer
                    autoPlay
                    onPlay={handelPlay}
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                />
            </div>
            <VideoBanner status={video.muxStatus} />
            <VideoTopRow video={video} />
        </>
    )
}