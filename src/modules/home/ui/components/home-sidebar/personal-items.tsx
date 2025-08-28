import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ClapperboardIcon,
  HistoryIcon,
  ListVideoIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { SidebarNavLink } from "@/components/sidebar-nav-link";
import { useAuth } from "@clerk/nextjs";

const items = [
  { title: "History", url: "/playlists/history", icon: HistoryIcon, auth: true },
  { title: "My studio", url: "/studio", icon: ClapperboardIcon, auth: false },
  { title: "Liked videos", url: "/playlists/liked", icon: ThumbsUpIcon, auth: true },
  { title: "All playlists", url: "/playlists", icon: ListVideoIcon, auth: true },
];

export const PersonalItems = () => {
  const { isSignedIn } = useAuth();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>You</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((i) => {
            if (!i.auth && !isSignedIn) return null;
            return (
              <SidebarMenuItem key={i.title}>
                <SidebarNavLink {...i} />
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
