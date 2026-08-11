/**
 * Central brand + product configuration (requirements: "Do not hardcode the
 * name across 100 components").
 */
export const brand = {
  brandName: "Superbowl",
  brandShortName: "SBGG",
  domain: "superbowl.gg",
  tagline: "Predict football. Build your record. Beat the crowd.",
  supportEmail: "support@superbowl.gg",
  legalCompanyName: "Superbowl.gg",
  socialLinks: {
    twitter: "https://twitter.com/superbowlgg",
    discord: "https://discord.gg/superbowlgg",
  },
  colors: {
    primary: "#38BDF8", // electric sky — primary accent
    secondary: "#818CF8", // indigo — secondary accent
    background: "#020617", // deep near-black navy
    surface: "#0B1220", // slightly lighter card
    text: "#F8FAFC",
    mutedText: "#94A3B8",
    border: "#1E293B",
    success: "#22C55E", // green for wins / positive
    danger: "#EF4444", // red only for losses / errors
    warning: "#F59E0B",
  },
};

/** XP defaults (admin-configurable at runtime via GamificationConfig rows). */
export const xpDefaults = {
  accountCreated: 50,
  profileCompleted: 50,
  predictionCreated: 10,
  predictionWon: 25,
  dailyActivity: 5,
  streak7Days: 100,
  referralActivated: 200,
};

export const coinDefaults = {
  signupBonus: 1000,
  predictionCreated: 10,
  predictionWon: 25,
  streakMilestones: { 3: 30, 7: 100, 14: 250, 30: 600, 100: 2500 },
};

export const levels = [
  { level: 1, title: "Rookie", minXp: 0 },
  { level: 2, title: "Prospect", minXp: 150 },
  { level: 3, title: "Starter", minXp: 400 },
  { level: 4, title: "Veteran", minXp: 900 },
  { level: 5, title: "All-Pro", minXp: 1800 },
  { level: 6, title: "Elite", minXp: 3500 },
  { level: 7, title: "Legend", minXp: 6500 },
] as const;

export const leaderboardSampleSizes = {
  weekly: 5,
  monthly: 15,
  season: 30,
  allTime: 30,
};

export const streakMilestones = [1, 3, 7, 14, 30, 100];

export const supportedMarkets = ["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"] as const;

export const leagueSlugs = ["NFL", "NCAAF", "UFL", "CFL"] as const;

export const confidenceOptions = [
  { value: "LOW", label: "Low", stars: 2 },
  { value: "MEDIUM", label: "Medium", stars: 3 },
  { value: "HIGH", label: "High", stars: 5 },
] as const;
