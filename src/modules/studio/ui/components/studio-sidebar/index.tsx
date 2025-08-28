"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LogOutIcon, VideoIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { StudioSidebarHeader } from "@/modules/studio/ui/components/studio-sidebar/studio-sidebar-header";
import Image from "next/image";

export const StudioSiderbar = () => {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="pt-16 z-40 ">
      <SidebarContent className="bg-background">
        <div className="md:hidden">
          <Link prefetch href={"/"}>
            <div className="p-4 flex items-center gap-1">
              {/* <Image src={"/logo.svg"} alt="logo" width={30} height={30} /> */}
              <div className="relative overflow-hidden flex h-5 w-7.5">
                <Image src={"/logo.svg"} alt="logo" fill />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                YTube
              </span>
            </div>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarMenu>
            <StudioSidebarHeader />
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Content"}
                asChild
                isActive={pathname === `/studio`}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <Link prefetch href={"/studio"}>
                  <VideoIcon className="size-5" />
                  <span className="text-sm">Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Separator />
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Exit studio"}
                asChild
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <Link prefetch href={"/"}>
                  <LogOutIcon className="size-5" />
                  <span className="text-sm">Exit studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
