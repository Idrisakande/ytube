"use client"

import MuxPlayer from "@mux/mux-player-react";
import { VIDEO_THUMBNAIL_URL_FALLBACK } from "@/modules/videos/constants";
// import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
    playbackId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
    controls?: boolean;
}

export const VideoPlayerSkeleton = () => {
    return <div className="aspect-video bg-black/70 rounded-xl" />
}

export const VideoPlayer = ({ playbackId, thumbnailUrl, autoPlay, onPlay }: VideoPlayerProps) => {
    // if (!playbackId) {
    //     return (
    //         <div className="video-player">
    //             <p>No video available</p>
    //         </div>
    //     );
    // }
    return (
        <>
            {/* Video player implementation goes here */}
            <MuxPlayer
                playbackId={playbackId || ""}
                poster={thumbnailUrl || VIDEO_THUMBNAIL_URL_FALLBACK}
                autoPlay={autoPlay}
                onPlay={onPlay}
                playerInitTime={0}
                thumbnailTime={0}
                accentColor="#FF2056"
                // accentColor="#ff0000"
                className="w-full h-full object-contain"
            />
        </>
    );
}