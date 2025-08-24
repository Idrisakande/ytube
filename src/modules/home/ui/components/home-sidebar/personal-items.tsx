import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ClapperboardIcon, HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "History",
    url: "/playlists/history",
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: "My studio",
    url: "/studio",
    icon: ClapperboardIcon,
    auth: false,
  },
  {
    title: "Liked videos",
    url: "/playlists/liked",
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: "All playlists",
    url: "/playlists",
    icon: ListVideoIcon,
    auth: true,
  },
];

export const PersonalItems = () => {
  const pathname = usePathname()
  const clerk = useClerk();
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
                <SidebarMenuButton
                  tooltip={i.title}
                  asChild
                  isActive={pathname === i.url}
                  onClick={(event) => {
                    if (!isSignedIn && i.auth) {
                      event.preventDefault();
                      return clerk.openSignIn();
                    }
                  }}
                >
                  <Link prefetch href={i.url} className="flex items-center gap-4">
                    <i.icon />
                    <span className="text-sm">{i.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>You</SidebarGroupLabel>
//       <SidebarGroupContent>
//         <SidebarMenu>
//           {items.map((i) => {
//             // Hide "My studio" if not signed in
//             if (i.auth && !isSignedIn) return null;

//             return (
//               <SidebarMenuItem key={i.title}>
//                 <SidebarMenuButton
//                   tooltip={i.title}
//                   asChild
//                   isActive={pathname === i.url}
//                   onClick={(event) => {
//                     // Optional: prevent navigation if user tries to access restricted link
//                     if (i.auth && !isSignedIn) {
//                       event.preventDefault();
//                       return clerk.openSignIn();
//                     }
//                   }}
//                 >
//                   <Link prefetch href={i.url} className="flex items-center gap-4">
//                     <i.icon />
//                     <span className="text-sm">{i.title}</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             );
//           })}
//         </SidebarMenu>
//       </SidebarGroupContent>
//     </SidebarGroup>
//   );
// };
