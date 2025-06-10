import { VideosSection } from "@/modules/studio/ui/sections/videos-sections";

interface HomeViewProps {
  categoryId?: string;
}

export const StudioView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <VideosSection categoryId={categoryId} />
    </div>
  );
};
