import { SubscribedVideosSection } from "@/modules/home/ui//sections/subscriptions-videos-section";

export const SubscribedView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-2 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-xl font-bold">Subscribed Videos </h1>
        <p className="text-xs text-muted-foreground">Videos from your favorite creators</p>
      </div>
      <SubscribedVideosSection />
    </div>
  );
};