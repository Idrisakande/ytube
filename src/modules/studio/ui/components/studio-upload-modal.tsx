"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader, Loader2Icon, PlusIcon } from "lucide-react"; // Adjust the import path if necessary
import { toast } from "sonner";
import { StudioUploader } from "@/modules/studio/ui/components/studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const createVideo = trpc.videos.create.useMutation({
    onSuccess: () => {
      // Handle successful video creation, e.g., redirect to the video edit page
      utils.studio.getMany.invalidate(); // Invalidate video queries to refresh the list
      toast.success("Video created successfully!"); // Show success message
    },
    onError: (error) => {
      // Handle error in video creation
      toast.error(`${error.message}`); // Show error message
    },
  });
  const onUploadComplete = () => {
    // Handle upload completion, e.g., redirect to the video edit page
    if (!createVideo.data?.video.id) return

    createVideo.reset(); // Reset the mutation state
    router.push(`/studio/videos/${createVideo.data.video.id}`); // Redirect to the video edit page
    toast.success("Video upload completed successfully!"); // Show success message
  }


  return (
    <>
      <Button
        variant={`secondary`}
        onClick={() => createVideo.mutate()}
        disabled={createVideo.isPending}
        className="w-fit-content cursor-pointer"
      >
        {createVideo.isPending ?
          <><Loader className="animate-spin" /> <span>Creating video</span></> :
          <><PlusIcon /> Create Video</>
        }
        <span className="sr-only">Create Video</span>
      </Button>
      <ResponsiveModal
        isOpen={!!createVideo.data?.url}
        onOpenChange={() => createVideo.reset()}
        title="Upload a video"
      >
        {createVideo.data?.url ?
          <StudioUploader
            endpoint={createVideo.data.url}
            onUploadComplete={onUploadComplete}
          /> :
          <Loader2Icon />}
      </ResponsiveModal>
    </>
  );
};
