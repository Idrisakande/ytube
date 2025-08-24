import { VideoFormSection } from "@/modules/studio/ui/sections/video-form-section";

interface VideoViewProps {
    videoId: string;

}

export const VideoView = ({ videoId }: VideoViewProps) => {
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg mb-8">
            <VideoFormSection videoId={videoId} />
        </div>
    )
}