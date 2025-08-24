import { VideosSection } from "@/modules/studio/ui/sections/videos-sections";

interface HomeViewProps {
  categoryId?: string;
}

export const StudioView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-2 pt-2.5 flex flex-col gap-y-6">
      {/* videos */}
      <div className="flex flex-col gap-y-1 px-4">
        <h2 className="text-xl font-bold">Channel content</h2>
        <p className="text-xs text-muted-foreground">
          Manage your videos, edit details, and more.
        </p>
        {/* <p className="text-xs text-muted-foreground">
          This is a work in progress, expect more features to be added soon.
        </p> */}
        {/* <p className="text-xs text-muted-foreground">
          If you have any suggestions, feel free to reach out.
        </p> */}
      </div>
      {/* <VideosSection /> */}
      <VideosSection categoryId={categoryId} />
    </div>  
  );
};
