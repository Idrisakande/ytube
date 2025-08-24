"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainItems } from "./main-items";
import { Separator } from "@/components/ui/separator";
import { PersonalItems } from "@/modules/home/ui/components/home-sidebar/personal-items";
import { SubscriptionsItems } from "./subscriptions-items";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export const HomeSiderbar = () => {
  return (
    <Sidebar collapsible="icon" className="pt-16 border-none z-40 ">
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
        <MainItems />
        <Separator />
        <PersonalItems />
        <SignedIn>
          <>
            <Separator />
            <SubscriptionsItems />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};
