"use client";

import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";

export default function Sidebar({ username, email, avatar }: SidebarProps) {
  return (
    <aside className="sidebar">
      <Link href="/" className="flex-center">
        <Image
          src="/assets/images/logo-dark.png"
          alt="logo"
          width={725}
          height={250}
          priority
          className="hidden lg:block h-[52px] w-auto"
        />
        <Image
          src="/assets/images/logo-icon.png"
          alt="logo"
          width={100}
          height={100}
          className="lg:hidden h-[52px] w-auto"
        />
      </Link>
      <nav className="sidebar-nav">
        <NavItems variant="sidebar" showLabels={true} />
      </nav>

      <div className="sidebar-user-info">
        <Image
          src={avatar}
          alt="avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block max-w-[170px] xl:max-w-[190px]">
          <p className="truncate-username">{username}</p>
          <p className="truncate-email">{email}</p>
        </div>
      </div>
    </aside>
  );
}
