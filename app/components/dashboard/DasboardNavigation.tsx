"use client"; // Marks this file to run on the client side

import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import Link from "next/link"; // Next.js Link component for client-side navigation
import { usePathname } from "next/navigation"; // Hook to get the current route pathname

// Array of dashboard navigation links
const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
  },
  {
    name: "Products",
    href: "/dashboard/products",
  },
  {
    name: "Banner Picture",
    href: "/dashboard/banner",
  },
];

// Component for rendering dashboard navigation links
export function DashboardNavigation() {
  const pathname = usePathname(); // Get the current path to highlight active link

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            link.href === pathname
              ? "text-foreground" // Active link style
              : "text-muted-foreground hover:text-foreground" // Inactive link style
          )}
        >
          {link.name}
        </Link>
      ))}
    </>
  );
}
