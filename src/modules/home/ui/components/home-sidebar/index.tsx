"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-section";

export const HomeSiderbar = () => {
  return (
    <Sidebar collapsible="icon" className="pt-16 border-none z-40 ">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />
      </SidebarContent>
    </Sidebar>
  );
};
