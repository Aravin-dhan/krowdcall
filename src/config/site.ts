export const siteConfig = {
  name: "Cruxd",
  shortDescription: "Indian elections & world events",
  heroTitle: "Call it before the crowd.",
  sessionCookie: "cruxd_session",
  themeStorageKey: "cruxd-theme",
  grievanceEmail: "grievance@cruxd.in",
  contactEmail: "hello@cruxd.in",
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
