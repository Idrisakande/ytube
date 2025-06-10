import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "@/modules/studio/ui/components/studio-navbar";
import { StudioSiderbar } from "@/modules/studio/ui/components/studio-sidebar";

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      <div className={"w-full"}>
        <StudioNavbar />
        <div className="flex min-h-screen pt-[4rem]">
          <StudioSiderbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

// "dev:server": "concurrently \"npm run dev\" \"npm run dev:webhook\"",
