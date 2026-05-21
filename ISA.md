---
task: Rally Point demo mode with realistic Hamilton County seed data
slug: rally-point-demo-mode
effort: E3
phase: complete
progress: 38/38
mode: algorithm
project: rally-point
started: 2026-05-20T00:00:00Z
updated: 2026-05-20T00:00:00Z
---

## Problem

The Rally Point GitHub Pages deployment shows a blank intake wizard — visitors have no way to see what the finished product looks like without completing all 11 wizard steps. This means the app's most impressive features (decision tree, cluster model dashboard, scenario playbooks, print formats) are invisible to evaluators, potential forkers, and contributors.

## Vision

A first-time GitHub Pages visitor clicks "Try Demo" and immediately sees a fully-populated plan dashboard for a realistic Hamilton County, Indiana family — two geographic clusters (Westfield and Southside), a mix of gas and EV vehicles, FRS channel assignments, the "What do I do right now?" decision tree, all 8 scenario playbooks, and functional print buttons. They experience the app as if they had spent 45 minutes filling out the wizard. A clear yellow DEMO MODE banner invites them to start their own plan.

## Out of Scope

- Building a separate demo deployment or branch — the demo mode lives in the same app
- Modifying or duplicating any wizard steps
- Adding backend or server-side rendering
- Storing demo data anywhere other than the Zustand store's existing localStorage persistence
- Creating a "demo vs live" configuration system — a single URL param is sufficient
- Adding demo data for the sensitive inventory (firearms/defensive) section

## Constraints

- No new npm packages — use only what is already installed (React, Zustand, Tailwind)
- Demo data must exactly conform to the TypeScript types in `src/types/plan.ts` — no runtime errors
- The demo must NOT corrupt an existing user's plan data without warning
- `bun run build` must pass with zero TypeScript errors after all changes
- All existing functionality (wizard, real plan entry, print, decision tree) must be unaffected

## Goal

Add a `?demo=true` URL parameter to Rally Point that loads a complete, realistic Hamilton County family plan into the Zustand store and displays the plan dashboard. A DEMO MODE banner in the header lets visitors start their own fresh plan. The feature ships as a clean commit on `main` that triggers the existing GitHub Actions deploy.

## Criteria

- [ ] ISC-1: `src/demo/seed-data.ts` exists and exports a `DEMO_PLAN` constant typed as `FamilyPlan`
- [ ] ISC-2: `DEMO_PLAN.units` contains exactly 3 FamilyUnit entries (Westfield primary, Westfield secondary, Southside)
- [ ] ISC-3: `DEMO_PLAN.units[0]` has at least one EV vehicle (`fuelType: 'electric'`)
- [ ] ISC-4: `DEMO_PLAN.units[0]` has at least one gas vehicle, producing an EVCoordination entry
- [ ] ISC-5: `DEMO_PLAN.evCoordinations` is non-empty (EV pickup coordination auto-computed in seed)
- [ ] ISC-6: `DEMO_PLAN.clusters` has exactly 2 FamilyCluster entries (Westfield, Southside)
- [ ] ISC-7: `DEMO_PLAN.rallyPoints` has at least 2 RallyPoint entries (one per cluster hub + convergence)
- [ ] ISC-8: `DEMO_PLAN.communication` is non-null with `frsChannels.length >= 3`
- [ ] ISC-9: `DEMO_PLAN.departureSignals.length >= 3` (one per family unit)
- [ ] ISC-10: `DEMO_PLAN.passphrase` is non-null with all required fields populated
- [ ] ISC-11: `DEMO_PLAN.awayProtocols.length >= 2`
- [ ] ISC-12: `DEMO_PLAN.completedSteps` contains all 11 step indices (0–10)
- [ ] ISC-13: `DEMO_PLAN.convergencePlan` is non-null
- [ ] ISC-14: `src/store/family-plan.ts` exports a `loadPlan(plan: FamilyPlan)` action
- [ ] ISC-15: `App.tsx` reads `new URLSearchParams(window.location.search).get('demo')` on mount
- [ ] ISC-16: When `?demo=true`, `loadPlan(DEMO_PLAN)` is called before first render
- [ ] ISC-17: When `?demo=true`, the initial view is `'dashboard'` (not wizard)
- [ ] ISC-18: Header shows a yellow "DEMO MODE" banner when `isDemoMode` state is true
- [ ] ISC-19: Banner contains a "Start My Own Plan" button
- [ ] ISC-20: Clicking "Start My Own Plan" calls `resetPlan()` and sets view to `'wizard'`
- [ ] ISC-21: Clicking "Start My Own Plan" clears `isDemoMode` state (banner disappears)
- [ ] ISC-22: Visiting without `?demo=true` shows no banner (existing behavior unchanged)
- [ ] ISC-23: `bun run build` exits 0 with zero TypeScript errors after all changes
- [ ] ISC-24: `bun run build` output shows the same 50 modules transformed (no regressions)
- [ ] ISC-25: `README.md` contains a "Live Demo" link pointing to the GitHub Pages URL with `?demo=true`
- [ ] ISC-26: All 8 scenarios render in the dashboard without runtime errors (no missing plan fields)
- [ ] ISC-27: Decision tree renders and "Start" button is clickable in demo mode
- [ ] ISC-28: Anti: demo mode does not modify `rally-point-sensitive-v1` localStorage key
- [ ] ISC-29: Anti: existing plan data is not silently overwritten — demo load only fires when `?demo=true` is present
- [ ] ISC-30: Anti: no new `import` from packages not already in `package.json`
- [ ] ISC-31: `DEMO_PLAN.planName` is not the default "My Family Plan" (visually distinct in header)
- [ ] ISC-32: Each `FamilyUnit.members` has at least 1 member with a `phone` field set
- [ ] ISC-33: At least 1 `FamilyMember` has an `awayLocation` set (drives away-from-home protocols)
- [ ] ISC-34: `DEMO_PLAN.prepInventory` has at least 8 items with mixed `have`/`need` statuses
- [ ] ISC-35: `DEMO_PLAN.rallyPoints[0].resources.hasGenerator` is `true` (shows generator in dashboard)
- [ ] ISC-36: The demo cluster hub's `resources.shelterCapacity` is >= 8
- [ ] ISC-37: `DEMO_PLAN` passes TypeScript strict type checking (no `as any` casts)
- [ ] ISC-38: Anti: Clicking "Start My Own Plan" in demo mode removes the `?demo` param from the URL (no lingering demo param)

## Test Strategy

| isc | type | check | threshold | tool |
|-----|------|-------|-----------|------|
| ISC-1 | file-existence | `ls src/demo/seed-data.ts` | exits 0 | Bash |
| ISC-2 | content | `grep -c 'id:' DEMO_PLAN.units count` | count = 3 | Read + inspect |
| ISC-3,4 | content | read seed-data.ts, verify fuelType values | 'electric' + 'gas' both present | Read |
| ISC-5 | content | `DEMO_PLAN.evCoordinations.length > 0` | true | Read |
| ISC-6,7 | content | count clusters / rallyPoints arrays | 2 / ≥2 | Read |
| ISC-8 | content | read communication field | frsChannels.length ≥ 3 | Read |
| ISC-9,10,11 | content | read departureSignals / passphrase / awayProtocols | counts match | Read |
| ISC-12 | content | completedSteps includes 0..10 | all 11 present | Read |
| ISC-13 | content | convergencePlan non-null | present | Read |
| ISC-14 | grep | `grep 'loadPlan' src/store/family-plan.ts` | match found | Bash |
| ISC-15,16,17 | grep | `grep 'demo' src/App.tsx` | URL param read + loadPlan call | Bash |
| ISC-18,19 | grep | `grep 'DEMO MODE' src/App.tsx` | banner text present | Bash |
| ISC-20,21 | grep | `grep 'resetPlan' src/App.tsx` | reset call present | Bash |
| ISC-22 | content | `!isDemoMode` branch confirmed in code | Read | Read |
| ISC-23 | build | `bun run build` exit code | 0 | Bash |
| ISC-24 | build | build output line count | "50 modules" in output | Bash |
| ISC-25 | grep | `grep 'demo=true' README.md` | match found | Bash |
| ISC-26,27 | build | `bun run build` with type check | no errors | Bash |
| ISC-28 | code-review | sensitive key not referenced in seed-data.ts | absent | Grep |
| ISC-29 | code-review | loadPlan conditional on demo param | confirmed | Read |
| ISC-30 | grep | `grep 'from .' src/demo/seed-data.ts` | only types import | Bash |
| ISC-31 | content | planName field value | not "My Family Plan" | Read |
| ISC-32,33 | content | member phone + awayLocation fields | populated | Read |
| ISC-34 | content | prepInventory length + statuses | ≥8 items, mixed | Read |
| ISC-35,36 | content | resources.hasGenerator + shelterCapacity | true + ≥8 | Read |
| ISC-37 | build | TypeScript strict compile | 0 errors | Bash |
| ISC-38 | code-review | URL param cleared on reset | history.replaceState call | Read |

## Features

| name | description | satisfies | depends_on | parallelizable |
|------|-------------|-----------|------------|----------------|
| seed-data | Create `src/demo/seed-data.ts` with complete DEMO_PLAN object | ISC-1..13,31..36 | none | true |
| store-load-action | Add `loadPlan` action to Zustand store | ISC-14 | none | true |
| app-demo-mode | Wire `?demo=true` detection, demo banner, reset in App.tsx | ISC-15..22,38 | seed-data, store-load-action | false |
| readme-demo-link | Add Live Demo link to README.md | ISC-25 | none | true |
| build-verify | Run `bun run build` and confirm clean | ISC-23,24,37 | all above | false |

## Decisions

- 2026-05-20: URL param (`?demo=true`) chosen over a landing-page button because it enables a direct shareable link in README and social sharing. The button on the welcome screen approach would require navigating to the app first.
- 2026-05-20: Demo data writes to localStorage via `loadPlan` so all existing features (decision tree, print, scenarios) work without refactoring — they all read from the Zustand store. The alternative (prop drilling a demo plan object) would require touching every component.
- 2026-05-20: Delegation floor relaxed (E3 soft floor = 2): seed-data.ts will be written by Forge (delegation count = 1). The remaining files (App.tsx, store, README) are small targeted edits written inline. The primary complexity is in the data shape, which Forge handles via full type context. Show-your-math: the app-demo-mode and store-load-action features are ~30 lines total — no delegation value.
