export const siteConfig = {
  name: "Pakka",
  shortDescription: "Indian elections & world events",
  heroTitle: "Call it before the crowd.",
  sessionCookie: "pakka_session",
  themeStorageKey: "pakka-theme",
  grievanceEmail: "grievance@pakka.in",
  contactEmail: "hello@pakka.in",
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
