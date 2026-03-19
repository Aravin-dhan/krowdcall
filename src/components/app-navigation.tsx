"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation, appNavigation } from "@/config/site";
import { cn } from "@/lib/utils";

type AppNavigationProps = {
  isAdmin: boolean;
};

const navIcons: Record<string, React.ReactNode> = {
  "/app": (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="8" y="0.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="0.5" y="8" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="8" y="8" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
    </svg>
  ),
  "/app/leaderboard": (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="0.5" y="7" width="3.5" height="6.5" rx="1" fill="currentColor" />
      <rect x="5.25" y="3.5" width="3.5" height="10" rx="1" fill="currentColor" />
      <rect x="10" y="0.5" width="3.5" height="13" rx="1" fill="currentColor" />
    </svg>
  ),
  "/app/profile": (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4.5" r="2.8" fill="currentColor" />
      <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "/app/admin": (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.64 2.64l1.06 1.06M10.3 10.3l1.06 1.06M2.64 11.36l1.06-1.06M10.3 3.7l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
};

export function AppNavigation({ isAdmin }: AppNavigationProps) {
  const pathname = usePathname();
  const items = isAdmin ? [...appNavigation, ...adminNavigation] : appNavigation;

  return (
    <>
      <nav className="nav-list desktop-nav" aria-label="Primary">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn("nav-link", isActive && "nav-link-active")}
              href={item.href}
              key={item.href}
            >
              {navIcons[item.href]}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="mobile-nav panel" aria-label="Bottom navigation">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));

          return (
            <Link
              className={cn("mobile-nav-link", isActive && "mobile-nav-link-active")}
              href={item.href}
              key={item.href}
            >
              {navIcons[item.href]}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
