# User Guide

This guide walks through each feature of Rally Point so you know what to expect and how to use it effectively.

---

## The Intake Wizard

The wizard is an 11-step interview that builds your family plan. Your progress is saved automatically after each step — you can close the browser and come back later.

You can jump between steps using the tab bar at the top. Steps you've completed are shown in green.

### Step 1: Welcome
Set your plan name (shown on all printed documents) and read the overview. Your data never leaves your device.

### Step 2: Family Units
A "family unit" is a household that evacuates together. Your immediate family is one unit. Parents or in-laws at a different address are another unit.

For each unit, enter:
- **Name** — e.g., "Dan & Sarah" or "Mom & Dad"
- **Home address** — used for routing and cluster grouping
- **Home type** — mobile home households get a special warning about tornado shelter
- **Basement / safe room** — affects tornado shelter instructions in your printed plan
- **Flood plain / waterway** — affects rally point eligibility scoring
- **Members** — name, age, phone for each person in the household
- **Vehicles** — type (car/truck/SUV), fuel type (gas/electric/hybrid), range, passenger capacity

**EV coordination:** If any unit has only electric vehicles, the app automatically generates a pickup plan with the nearest gas-vehicle unit for power-outage scenarios.

### Step 3: Pets
Add pets for each unit. Pet carrier status affects the go-bag checklist. Vaccination records reminder is shown for units with pets.

### Step 4: Rally Points
This is the most important step. Rally Point uses a **geographic cluster model**:

- Units near each other form a **cluster**
- Each cluster has a **local hub** — the most resource-equipped household nearby
- During a disaster, each cluster stays at their local hub first (roads may be unsafe)
- After Day 3 of an extended emergency, clusters converge at a single **full-family hub**

The app scores each unit's home as a potential hub based on: basement, home type (no mobile homes), flood plain status, and household size. You can override the recommendation.

For each rally point, enter the resource inventory (generator, water, food, shelter capacity, medical supplies). The app uses this to generate a "bring this" list for each arriving unit.

**Out-of-state coordinator:** Enter one person who lives outside your region. They serve as the relay hub when local communications are down — everyone checks in with them, not each other.

### Step 5: Away-from-Home Profiles
For family members who are regularly away (at work, school, or traveling), the plan generates a personal away protocol:
- **Local (within 30 miles):** Go to the cluster hub directly, not necessarily home first
- **In-state travel:** If within 50 miles of the hub, make your way there when safe. If farther, stay put and check in with the out-of-state coordinator.
- **Out of state:** Stay put. Do not drive into a disaster zone. Coordinator relays your status.

Children have a note about the passphrase requirement at school pickup.

### Step 6: Communication Plan
- **FRS radios** — channel assignment per family unit, total count
- **Check-in times** — default 8am, 12pm, 6pm
- **Meshtastic** — optional mesh networking for extended outages
- **Ham radio** — optional, callsign
- **NOAA weather radio** — the most resilient information source (runs on battery)
- **Neighbor contacts** — 2-3 trusted neighbors with addresses

### Step 7: Departure Signal
When a family unit evacuates their home, they leave a signal for arriving family members — without revealing the destination to strangers.

Configure:
- **Signal location** — a hidden spot (inside mailbox, back door frame, under mat)
- **Code** — "A" means primary rally hub, "B" means convergence hub. The note says "Went to A" — only your family knows what A means.
- **Visual marker** — optional object placed visibly (e.g., specific ribbon on the porch) that means "we left, gone to primary"

Each household's departure signal card prints separately and gets laminated for the binder.

### Step 8: Passphrase
A challenge/response system so family members can identify authorized people — especially important for child pickups.

- **Challenge word** — what the person being approached asks
- **Response phrase** — what the authorized person says back
- **Backup phrase** — used if the primary is compromised
- **Physical token** — optional (a specific playing card, for example)

Children's wallet cards show the passphrase in simplified language: "If someone says they're picking you up, ask: [challenge]. The right answer is: [response]."

Change the passphrase annually or after any suspected compromise.

### Step 9: Supplies
Go-bag checklist from FEMA and emergency preparedness standards, adapted for your family composition. Items for families with infants under 1 are highlighted separately.

Mark each item: **Have it / Need it / N/A**. A summary shows how many critical items are missing.

### Step 10: Preparedness Inventory
Home supplies (14-day supply, generator, fuel, tools) and scenario-mapped items showing which disasters each item matters for.

The sensitive section (firearms, defensive equipment) is stored in a separate localStorage key and printed as a separate document, never bundled with the main binder.

### Step 11: Review & Generate
Summary of all completed sections with green/red status indicators. Links to all print formats.

---

## The Plan Dashboard

After completing the wizard, you see the plan dashboard:

### "What do I do right now?" — Decision Tree
The most important feature. A step-by-step guided flow that takes you from "something is happening" to "here is exactly what to do." Inject with your plan's actual rally addresses, FRS channels, and family names.

Works well on mobile. Designed to be usable under stress.

### Scenario Playbooks
Click any scenario card to see the full playbook — trigger conditions, immediate steps, extended steps, rally trigger, communications protocol, and situational awareness guide.

Scenarios are ordered by probability: **Very High** (tornado/severe storm) at the top, **Very Low** (earthquake) at the bottom.

### Print Formats
Five print buttons:
1. **Wallet Cards** — 3.5" x 2", 4 per page, one per family member. Laminate and carry.
2. **Full Binder** — complete plan with all tabs. Print and organize in a 3-ring binder.
3. **Vehicle Copy** — condensed single page for the glove box.
4. **Decision Flowchart** — visual decision tree, sized for 11"x17" or foldable 8.5"x11". Put on the fridge.
5. **Sensitive Inventory** — separate document, clearly marked. Store apart from the main binder.

---

## Offline Use

After your first visit, Rally Point works completely offline. On mobile, tap "Add to Home Screen" to install it as a PWA — it opens like an app, no browser chrome.

The offline capability means the app works even when:
- Internet is down
- Cell service is out
- You're in airplane mode

Your plan data in localStorage persists across offline sessions.

---

## Keeping the Plan Current

- **Review annually** — family composition, vehicle fleet, and rally point resources change
- **Passphrase** — change at least once per year
- **Departure signal** — confirm all family members know the current signal location and codes
- **FRS channels** — if you get new radios, update the channel assignments
- **Supply inventory** — update when you acquire or use supplies (especially formula, medications, fuel)
- **Out-of-state coordinator** — confirm they're still willing and able to serve this role annually
