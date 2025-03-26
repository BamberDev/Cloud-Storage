import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItems({
  className,
  onItemClick,
  variant,
  showLabels = true,
}: NavItemsProps) {
  const pathname = usePathname();

  const getItemClasses = (isActive: boolean) => {
    if (variant === "mobile") {
      return cn("mobile-nav-item", isActive && "nav-item-active");
    }
    return cn("sidebar-nav-item", isActive && "nav-item-active");
  };

  const getIconClasses = (isActive: boolean) => {
    return cn("nav-icon", isActive && "nav-icon-active");
  };

  const getListClasses = () => {
    if (variant === "mobile") {
      return cn("mobile-nav-list", className);
    }
    return cn("sidebar-nav-list", className);
  };

  return (
    <ul className={getListClasses()}>
      {navItems.map(({ url, name, icon }) => (
        <Link href={url} key={name} className="lg:w-full" onClick={onItemClick}>
          <li className={getItemClasses(pathname === url)}>
            <Image
              src={icon}
              alt={name}
              width={24}
              height={24}
              className={getIconClasses(pathname === url)}
            />
            {showLabels && (
              <p className={variant === "sidebar" ? "hidden lg:block" : ""}>
                {name}
              </p>
            )}
          </li>
        </Link>
      ))}
    </ul>
  );
}
