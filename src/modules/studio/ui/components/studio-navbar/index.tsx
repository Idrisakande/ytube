import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/modules/auth/ui/components/auth-button";
import { StudioUploadModal } from "@/modules/studio/ui/components/studio-upload-modal";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@clerk/nextjs";

export const StudioNavbar = () => {
  // const { isLoaded } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50 border-b shadow-md">
      <div className="flex items-center gap-4 w-full justify-between">

        {/** Menu */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />
          {/** Logo */}
          <Link href={"/studio"}>
            <div className="p-4 flex items-center gap-1">
              <Image src={"/globe.svg"} alt="logo" width={30} height={30} />
              <span className="text-xl font-semibold tracking-tight">
                Studio
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-4">
          {/** Upload Button */}
          <StudioUploadModal />
          {/** Auth Button */}
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};
