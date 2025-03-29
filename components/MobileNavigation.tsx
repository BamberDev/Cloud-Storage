"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { useState } from "react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import LogoutDialog from "./LogoutDialog";
import NavItems from "./NavItems";

export default function MobileNavigation({
  $id: ownerId,
  accountId,
  username,
  email,
  avatar,
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <header className="mobile-header">
      <Link href="/" className="flex-center">
        <Image
          src="/assets/images/logo-dark.png"
          alt="logo"
          width={725}
          height={250}
          priority
          className="h-[52px] w-auto my-auto"
        />
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="menu"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="p-0 h-screen px-3 bg-brand-light">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block max-w-[calc(100%-100px)]">
                <p className="truncate-username">{username}</p>
                <p className="truncate-email">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>
          <nav className="mobile-nav">
            <NavItems variant="mobile" onItemClick={() => setOpen(false)} />
          </nav>
          <Separator className="my-4 bg-light-200/20" />
          <div className="flex flex-col justify-between gap-4">
            <FileUploader ownerId={ownerId} accountId={accountId} />
            <LogoutDialog
              isOpen={isLogoutModalOpen}
              onOpenChange={setIsLogoutModalOpen}
              trigger={
                <Button
                  type="submit"
                  className="mobile-sign-out-button !h5"
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  <Image
                    src="/assets/icons/logout.png"
                    alt="sign-out"
                    width={64}
                    height={64}
                    className="w-8"
                  />
                  <p>Sign out</p>
                </Button>
              }
            />
          </div>
          <SheetDescription className="sr-only">
            Mobile Navigation
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </header>
  );
}
