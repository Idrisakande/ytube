"use client";

import { Button } from "@/components/ui/button";
import {
  // useAuth,
  // useSignIn,
  // SignOutButton,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  // const { isSignedIn, signIn } = useAuth();
  // const { signIn } = useSignIn();

  return (
    <>
      <SignedIn>
        <UserButton  />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant={"outline"}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-500 font-medium rounded-full shadow-none border-blue-500"
          >
            <UserCircleIcon />
            {/* <User/> */}
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};
