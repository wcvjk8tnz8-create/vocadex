/**
 * Display-name helper shared by the client app and the server routes.
 *
 * saratan@school.edu.hk -> "Sara Tan"
 * 211B0000@school.edu.hk -> "211B0000"
 */

const FIRST_NAMES = [
  "sara", "sarah", "sam", "samuel", "simon", "sophia", "sharon", "stephen", "steven",
  "jack", "jackie", "james", "jane", "jason", "jenny", "joey", "john", "jordan", "joyce",
  "mary", "mark", "matthew", "may", "michael", "michelle", "mandy", "ming",
  "peter", "paul", "patrick", "phoebe", "david", "danny", "kelly", "kevin", "karen",
  "kate", "ken", "kitty", "amy", "alice", "anna", "ben", "billy", "candy", "chloe",
  "cindy", "emily", "eric", "eva", "fiona", "gary", "grace", "hannah", "helen", "ivan",
  "linda", "laura", "leo", "lucas", "nancy", "nathan", "nicole", "oscar", "raymond",
  "rebecca", "ryan", "sandy", "sue", "tammy", "tiffany", "tim", "toby", "tony", "tracy",
  "victor", "vivian", "wendy", "william", "wilson", "yan", "yuki", "wing", "wai", "chi",
  "ho", "ka", "chun", "kit", "lam", "lee", "chan", "cheung", "wong", "hoi", "hei", "yiu",
];

/** saratan@<domain> -> "Sara Tan" | 211B0000@<domain> -> "211B0000" */
export function nameFromEmail(email: string): string {
  const prefix = (email.split("@")[0] || "").trim();
  if (!prefix) return "Student";
  if (/[._\-+]/.test(prefix)) {
    return prefix
      .split(/[._\-+]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }
  if (/\d/.test(prefix)) return prefix.toUpperCase();
  const lower = prefix.toLowerCase();
  const match = FIRST_NAMES.filter((n) => lower.startsWith(n) && lower.length > n.length).sort(
    (a, b) => b.length - a.length
  )[0];
  if (match) {
    const first = match.charAt(0).toUpperCase() + match.slice(1);
    const rest = lower.slice(match.length);
    return `${first} ${rest.charAt(0).toUpperCase() + rest.slice(1)}`;
  }
  const cut = Math.ceil(lower.length / 2);
  const a = lower.slice(0, cut);
  const b = lower.slice(cut);
  return b
    ? `${a.charAt(0).toUpperCase() + a.slice(1)} ${b.charAt(0).toUpperCase() + b.slice(1)}`
    : a.charAt(0).toUpperCase() + a.slice(1);
}
