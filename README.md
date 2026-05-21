# 🏠 Rally Point

**Your family's plan when everything else fails.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF.svg)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org)

Rally Point is a family disaster response planning app that works **without phones, internet, or GPS**. It guides you through building a complete, customized family emergency plan — then lets you print everything that matters before disaster strikes.

No accounts. No cloud. Your data stays on your device.

---

## Why Rally Point?

Most family emergency plans are either too generic to act on or too complicated to remember under stress. Rally Point solves both problems:

- **Probability-first** — scenarios ordered by actual likelihood, not fear. Severe storms before nation-state attacks.
- **Geographic cluster model** — nearby families rally to their own local hub first, then converge when it's safe. No one drives across Indianapolis in a tornado.
- **EV-aware** — if your household only has electric vehicles and the grid is down, the plan automatically coordinates a gas-vehicle pickup from another family unit.
- **Analog-ready** — the printed binder and wallet cards work with zero power. The decision flowchart is designed to be laminated and stuck to the fridge.
- **Family-complete** — covers infant-specific kits, pet transport, away-from-home protocols, departure signals, and a family passphrase for authorized pickups.

---

## Features

- **11-step guided intake wizard** — walks your whole family through building the plan
- **8 disaster scenario playbooks** — tornado, power outage, flooding, telecom failure, civil unrest, and more — ordered by probability for your region
- **Interactive decision tree** — "What do I do right now?" walks you to the right action in seconds
- **Geographic cluster model** — group families by proximity; each cluster has its own local rally hub
- **EV coordination** — auto-generates pickup instructions for EV-only households during grid failures
- **Departure signal protocol** — hidden note system so arriving family knows you left and where you went
- **Family passphrase** — challenge/response authentication for authorized pickups, especially for children
- **Away-from-home protocols** — what each person does if they're at work, traveling, or out of state
- **Resource access scenarios** — water failure, food disruption, fuel scarcity, pharmacy access
- **Situational awareness guide** — what to look for and avoid in each scenario (civil unrest: avoid large gatherings, downtown corridors, etc.)
- **5 print formats** — wallet cards, full binder, vehicle copy, decision flowchart, sensitive inventory (printed separately)
- **Offline-capable PWA** — works without internet after first load

---

## Quick Start

### Option A: Use the hosted app

Visit the live app at your GitHub Pages URL — no installation required. Your data stays in your browser's local storage.

### Option B: Fork and self-host (recommended for customization)

```bash
# 1. Fork this repo on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/rally-point.git
cd rally-point

# 2. Install dependencies (requires Bun — https://bun.sh)
bun install

# 3. Start the dev server
bun dev

# 4. Build for production
bun run build
```

See [docs/SETUP.md](docs/SETUP.md) for full instructions including GitHub Pages deployment.

### Option C: No tech required

See [docs/CREATE_YOUR_PLAN.md](docs/CREATE_YOUR_PLAN.md) — download the printable blank template and fill it in by hand, or use the AI-assisted interview prompt to generate a completed plan without the app.

---

## Project Structure

```
rally-point/
├── src/
│   ├── components/
│   │   ├── intake/       # 11-step wizard
│   │   ├── plan/         # Plan display + decision tree
│   │   ├── print/        # Print-optimized layouts
│   │   └── ui/           # Shared UI primitives
│   ├── data/
│   │   ├── scenarios/    # 8 disaster scenario playbooks
│   │   └── checklists/   # Go-bag and home supply checklists
│   ├── decision-tree/    # Decision node graph + traversal engine
│   ├── lib/              # Plan generator, print helpers
│   ├── store/            # Zustand store (localStorage persistence)
│   └── types/            # TypeScript types
├── docs/
│   ├── SETUP.md
│   ├── USER_GUIDE.md
│   ├── PRIVACY.md
│   └── CREATE_YOUR_PLAN.md
└── .github/
    └── workflows/deploy.yml  # GitHub Actions → Pages
```

---

## Customizing for Your Region

The default scenarios are populated with Hamilton County, Indiana hazard data. To adapt for your region:

1. Edit `src/data/scenarios/index.ts` — update `probabilityTier`, `summary`, and `sourceNote` for each scenario based on your area's actual risk data
2. Update situational awareness sections with local road names and emergency contacts
3. Replace the HC Mass Evacuation Plan reference with your county's equivalent

---

## Privacy

- All data is stored in your browser's `localStorage` — nothing is transmitted anywhere
- Sensitive inventory (firearms, defensive equipment) is stored in a separate localStorage key and excluded from all standard exports
- Clearing your browser data deletes the plan — print or export before doing so

See [docs/PRIVACY.md](docs/PRIVACY.md) for the full policy.

---

## Contributing

Pull requests welcome.

- Bug reports and feature requests: [GitHub Issues](https://github.com/rookford343/rally-point/issues)
- Scenario data for other regions: update the scenario files and submit a PR

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

*Built in Westfield, IN, for families who want a plan that works when everything else fails.*
