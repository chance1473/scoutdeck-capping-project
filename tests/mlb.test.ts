import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { MLB_TIMEOUT_MS, getMlbRoster, getMlbTeams, searchMlbPlayers } from "../src/lib/mlb.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    return handler(url, init);
  }) as typeof fetch;
  return calls;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("teams request hits the MLB Stats API with a timeout and returns teams sorted by name", async () => {
  const calls = stubFetch(async () => json({ teams: [{ id: 2, name: "Yankees" }, { id: 1, name: "Angels" }] }));
  const teams = await getMlbTeams();
  assert.deepEqual(teams.map((team) => team.name), ["Angels", "Yankees"]);
  assert.match(calls[0].url, /^https:\/\/statsapi\.mlb\.com\/api\/v1\/teams\?sportId=1/);
  assert.ok(calls[0].init?.signal instanceof AbortSignal);
  assert.equal(MLB_TIMEOUT_MS, 10_000);
});

test("a non-2xx MLB response surfaces as an error with the status code", async () => {
  stubFetch(async () => json({ message: "unavailable" }, 503));
  await assert.rejects(getMlbRoster(147), /MLB data request failed \(503\)/);
});

test("a payload that breaks the contract is rejected instead of written", async () => {
  stubFetch(async () => json({ roster: [{ person: { id: "not-a-number", fullName: "" } }] }));
  await assert.rejects(getMlbRoster(147), (error: Error) => error.name === "ZodError");
});

test("a timeout and a network failure each raise a clear error", async () => {
  stubFetch(async () => {
    throw new DOMException("The operation timed out.", "TimeoutError");
  });
  await assert.rejects(getMlbTeams(), /timed out after 10s/);

  stubFetch(async () => {
    throw new TypeError("fetch failed");
  });
  await assert.rejects(getMlbTeams(), /could not reach statsapi\.mlb\.com/);
});

test("player search skips the network for queries shorter than two characters", async () => {
  const calls = stubFetch(async () => json({ people: [] }));
  assert.deepEqual(await searchMlbPlayers(" a "), []);
  assert.equal(calls.length, 0);
});
