"use client";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ username, email, avatar }: SidebarProps) {
  const pathname = usePathname();

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
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => (
            <Link href={url} key={name} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "nav-item-active"
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
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
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
