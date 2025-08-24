import { ResponsiveModal } from "@/components/responsive-modal";
import {
    UploadDropzone
} from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
interface BannerUploadModalProps {
    userId: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export const BannerUploadModal = ({ userId, isOpen, onOpenChange }: BannerUploadModalProps) => {
    const utils = trpc.useUtils()
    const onUploadComplete = () => {
        utils.users.getOneUser.invalidate({ id: userId })
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Upload a Banner"
        >
            <UploadDropzone
                endpoint={`bannerUploader`}
                onClientUploadComplete={onUploadComplete}
                onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                }}
                onUploadBegin={(name) => {
                    // Do something once upload begins
                    console.log("Uploading Beging: ", name);
                }}
                onUploadProgress={(callback) => {
                    console.log(callback)
                }}

                className={cn(
                    `bg-slate-200 flex flex-col h-58 mx-4 md:mx-0 mb-8 md:mb-0`,
                    `ut-upload-icon:size-12 ut-upload-icon:text-black/90`,
                    `ut-label:text-sm ut-label:text-blue-600`,
                    `ut-allowed-content:ut-uploading:text-red-300`,
                    `ut-button:w-32 ut-button:z-40 ut-button:cursor-pointer ut-button:ut-uploading:bg-green-500 ut-button:bg-purple-500 ut-button:hover:bg-purple-600 ut-button:transition-colors ut-button:duration-300 ut-button:px-3 ut-button:text-xs`
                )}
                content={{
                    label({ ready, isUploading, }) {
                        if (!ready) return "Loading for some seconds"
                        if (isUploading) return `Uploading...`
                        return `Choose a file or drag and drop`
                    },
                    allowedContent({ ready, fileTypes, isUploading, uploadProgress }) {
                        if (!ready) return "Checking what you can upload";
                        if (isUploading) return `${uploadProgress}% upload`;
                        return `You can only upload ${fileTypes.join(", ")} of 4MB`;
                    },
                    button({ ready, isDragActive, isUploading, files, uploadProgress }) {
                        if (!ready) return "Loading..."
                        if (files.length === 1) return "Upload the image"
                        if (isUploading) return `${uploadProgress}`
                        if (isDragActive) return `Dragging image`
                        return "Choose an image"
                    },
                }}
            />
        </ResponsiveModal>
    );
};


{/* <UploadButton
    input={{ videoId }}
    endpoint="BannerUploader"
    onClientUploadComplete={(res) => {
        // Do something with the response
        console.log("Files: ", res);
        alert("Upload Completed");
    }}
    onUploadError={(error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
    }}
    className="mb-16 ut-button:bg-red-500 ut-button:ut-readying:bg-red-500/50"
/> */}