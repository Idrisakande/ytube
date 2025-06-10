"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { PlusIcon } from "lucide-react";

export const StudioUploadModal = () => {
  const createVideo = trpc.videos.create.useMutation({
    onSuccess: (data) => {
      // Handle successful video creation, e.g., redirect to the video edit page
      console.log("Video created successfully:", data.video);
    },
    onError: (error) => {
      // Handle error in video creation
      console.error("Error creating video:", error);
    },
  });

  return (
    <Button
      variant={`secondary`}
      onClick={() => createVideo.mutate()}
      className="w-fit-content"
    >
      <PlusIcon /> Create
    </Button>
  );
};
