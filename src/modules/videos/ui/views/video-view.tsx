import { VideoSection } from "@/modules/videos/ui/sections/video-section"
import { SuggestionsSection } from "../sections/suggestions-section "
import { CommentsSection } from "../sections/comments-section "

interface VideoViewProps {
    videoId: string
}

export const VideoView = ({ videoId }: VideoViewProps) => {
    return (
        <div className="max-w-[1700px] mx-auto flex pt-2.5 p-4 flex-col mb-2">
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    <VideoSection videoId={videoId} />
                    <div className="mt-4 block xl:hidden">
                        <SuggestionsSection videoId={videoId} isManuallyTriggered />
                    </div>
                    <CommentsSection videoId={videoId} />
                </div>
                <div className="w-full shrink-1 hidden xl:block xl:w-95 2xl:w-115">
                    <SuggestionsSection videoId={videoId} />
                </div>
            </div>
        </div>
    )
}