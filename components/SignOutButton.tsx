"use client";

import { useState } from "react";
import LogoutDialog from "./LogoutDialog";
import { Button } from "./ui/button";
import Image from "next/image";

export default function SignOutButton() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <LogoutDialog
      isOpen={isLogoutModalOpen}
      onOpenChange={setIsLogoutModalOpen}
      trigger={
        <Button
          type="button"
          className="sign-out-button"
          onClick={() => setIsLogoutModalOpen(true)}
          aria-label="Sign out"
        >
          <Image
            src="/assets/icons/logout.png"
            alt="Logout icon"
            width={64}
            height={64}
            className="w-8"
          />
        </Button>
      }
    />
  );
}
