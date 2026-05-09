export const REFERRAL_TEAM_LABELS: Record<string, string> = {
  devrel: "DevRel",
  marketing: "Marketing",
  bd: "Business Development",
  foundation: "Foundation",
  "team1-india": "Team1 India",
  "team1-latam": "Team1 LatAm",
  "team1-brazil": "Team1 Brazil",
  "team1-vietnam": "Team1 Vietnam",
  "team1-korea": "Team1 Korea",
  "team1-china": "Team1 China",
  "team1-france": "Team1 France",
  "team1-turkey": "Team1 Turkey",
  "team1-africa": "Team1 Africa",
  "team1-philippines": "Team1 Philippines",
  "team1-japan": "Team1 Japan",
};

export function formatTeamLabel(teamId: string | null | undefined): string | null {
  if (!teamId) return null;
  return REFERRAL_TEAM_LABELS[teamId] ?? teamId;
}
