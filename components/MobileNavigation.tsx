"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Separator } from "./ui/separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import FileUploader from "./FileUploader";
import LogoutDialog from "./LogoutDialog";
import Search from "./Search";

interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  email: string;
  avatar: string;
}

export default function MobileNavigation({
  $id: ownerId,
  accountId,
  fullName,
  email,
  avatar,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="mobile-header">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={224}
        height={82}
        priority
        className="h-auto w-[124px]"
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="menu"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
            <Search />
            <Separator className="my-4 bg-light-200/20" />
          </SheetTitle>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link href={url} key={name} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active"
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active"
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
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
                  className="mobile-sign-out-button"
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  <Image
                    src="/assets/icons/logout.svg"
                    alt="sign-out"
                    width={24}
                    height={24}
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
