import { z } from "zod";

const MLB_BASE_URL = "https://statsapi.mlb.com/api/v1";

const TeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  abbreviation: z.string().optional(),
  teamName: z.string().optional(),
  division: z.object({ name: z.string() }).optional(),
  league: z.object({ name: z.string() }).optional(),
});

const PersonSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(1),
  primaryNumber: z.string().optional(),
  birthDate: z.string().optional(),
  currentAge: z.number().int().optional(),
  height: z.string().optional(),
  weight: z.number().int().optional(),
  active: z.boolean().optional(),
  mlbDebutDate: z.string().optional(),
  batSide: z.object({ code: z.string() }).optional(),
  pitchHand: z.object({ code: z.string() }).optional(),
  primaryPosition: z.object({ abbreviation: z.string(), name: z.string().optional() }).optional(),
  currentTeam: z.object({ id: z.number(), name: z.string() }).optional(),
  stats: z.array(z.object({
    group: z.object({ displayName: z.string() }),
    splits: z.array(z.object({ stat: z.record(z.unknown()) })),
  })).optional(),
});

const RosterEntrySchema = z.object({
  person: PersonSchema,
  jerseyNumber: z.string().optional(),
  position: z.object({ abbreviation: z.string(), name: z.string().optional() }),
  status: z.object({ description: z.string(), code: z.string().optional() }),
});

export type MlbTeam = z.infer<typeof TeamSchema>;
export type MlbPerson = z.infer<typeof PersonSchema>;
export type MlbRosterEntry = z.infer<typeof RosterEntrySchema>;

async function mlbFetch(path: string, revalidate = 900): Promise<unknown> {
  const response = await fetch(`${MLB_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`MLB data request failed (${response.status})`);
  return response.json();
}

export async function getMlbTeams(): Promise<MlbTeam[]> {
  const payload = z.object({ teams: z.array(TeamSchema) }).parse(
    await mlbFetch("/teams?sportId=1&hydrate=division,league", 86400),
  );
  return payload.teams.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMlbRoster(teamId: number): Promise<MlbRosterEntry[]> {
  const payload = z.object({ roster: z.array(RosterEntrySchema) }).parse(
    await mlbFetch(`/teams/${teamId}/roster?rosterType=40Man&hydrate=person`, 900),
  );
  return payload.roster;
}

export async function getMlbPlayer(mlbId: number, season = new Date().getFullYear()): Promise<MlbPerson> {
  const hydrate = encodeURIComponent(`currentTeam,stats(group=[hitting,pitching],type=season,season=${season})`);
  const payload = z.object({ people: z.array(PersonSchema).min(1) }).parse(
    await mlbFetch(`/people/${mlbId}?hydrate=${hydrate}`, 900),
  );
  return payload.people[0];
}

export async function searchMlbPlayers(name: string): Promise<MlbPerson[]> {
  const query = name.trim();
  if (query.length < 2) return [];
  const params = new URLSearchParams({
    names: query,
    sportIds: "1",
    active: "true",
    hydrate: "currentTeam",
  });
  const payload = z.object({ people: z.array(PersonSchema) }).parse(
    await mlbFetch(`/people/search?${params.toString()}`, 300),
  );
  return payload.people.slice(0, 20);
}
