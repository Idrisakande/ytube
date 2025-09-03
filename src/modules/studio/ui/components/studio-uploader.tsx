import { Button } from "@/components/ui/button";
import MuxUploader, {
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";


interface StudioUploaderProps {
    endpoint?: string;
    onUploadComplete: () => void;
}

const UPLOADER_ID = "video-uploader";

export const StudioUploader = ({ endpoint, onUploadComplete }: StudioUploaderProps) => {
    return (
        <div className="mb-6 md:mb-0">
            <MuxUploader
                endpoint={endpoint}
                onSuccess={onUploadComplete}
                onError={(error) => console.error("Upload error:", error)}
                id={UPLOADER_ID}
                className="hidden group/video-uploader"
            />
            <MuxUploaderDrop
                muxUploader={UPLOADER_ID}
                className="group/drop  px-4 md:px-0"
            >
                <div slot="heading" className="flex flex-col items-center gap-6">
                    <div className="flex items-center justify-center gap-2 rounded-full bg-muted size-32">
                        <UploadIcon className="size-10 text-muted-foreground group/drop-[&[active]:animate-bounce transition-all duration-300" />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <p className="text-sm font-semibold">Drag and drop video files to upload here</p>
                        <p className="text-xs text-muted-foreground">Your videos will be private until you publish them</p>
                        <p className="text-xs text-green-500">You can not upload more than 30 seconds of video</p>

                        {/* <p className="text-xs text-muted-foreground">Your videos will be processed and ready for viewing shortly after upload.</p> */}
                    </div>
                    <MuxUploaderFileSelect
                        muxUploader={UPLOADER_ID}
                        className="flex items-center justify-center gap-2 rounded-full border-2 border-dashed border-muted p-4"
                    >
                        <Button type="button" className="text-sm font-medium rounded-full">Select files</Button>
                    </MuxUploaderFileSelect>
                </div>
                <span slot="separator" className="hidden" />
                <MuxUploaderStatus
                    muxUploader={UPLOADER_ID}
                    className="text-sm"
                />
                <MuxUploaderProgress
                    muxUploader={UPLOADER_ID}
                    type="percentage"
                    className="text-sm"
                />
                <MuxUploaderProgress
                    muxUploader={UPLOADER_ID}
                    type="bar"
                    className="mb-8 md:mb-0"
                />
            </MuxUploaderDrop>
        </div>
    );
};
