import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "@/modules/home/ui/components/home-navbar";
import { HomeSiderbar } from "@/modules/home/ui/components/home-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className={"w-full"}>
        <HomeNavbar />
        <div className="flex min-h-screen pt-[4rem]">
          <HomeSiderbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};