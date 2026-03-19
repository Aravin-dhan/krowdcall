export const siteConfig = {
  name: "KrowdCall",
  shortDescription: "Indian elections & world events",
  heroTitle: "Call it before the crowd.",
  sessionCookie: "krowdcall_session",
  themeStorageKey: "krowdcall-theme",
  grievanceEmail: "grievance@krowdcall.in",
  contactEmail: "hello@krowdcall.in",
  jurisdiction: "New Delhi, India"
} as const;

export const appNavigation = [
  {
    href: "/app",
    label: "Feed"
  },
  {
    href: "/app/leaderboard",
    label: "Leaderboard"
  },
  {
    href: "/app/profile",
    label: "Profile"
  }
] as const;

export const adminNavigation = [
  {
    href: "/app/admin",
    label: "Admin"
  }
] as const;
