"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { useState } from "react";
import LogoutDialog from "./LogoutDialog";

export default function Header({
  $id: ownerId,
  accountId,
}: {
  $id: string;
  accountId: string;
}) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={ownerId} accountId={accountId} />
        <LogoutDialog
          isOpen={isLogoutModalOpen}
          onOpenChange={setIsLogoutModalOpen}
          trigger={
            <Button
              type="button"
              className="sign-out-button"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <Image
                src="/assets/icons/logout.png"
                alt="sign-out"
                width={64}
                height={64}
                className="w-8"
              />
            </Button>
          }
        />
      </div>
    </header>
  );
}
