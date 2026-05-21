import type { ScenarioId } from '../../types/plan'

export type ProbabilityTier = 'very-high' | 'high' | 'moderate' | 'low' | 'very-low'

export interface ScenarioStep {
  text: string
  critical?: boolean
}

export interface ScenarioAwareness {
  earlySignals: string[]
  avoid: string[]
  calibration?: string
}

export interface Scenario {
  id: ScenarioId
  title: string
  probabilityTier: ProbabilityTier
  probabilityLabel: string
  summary: string
  sourceNote: string
  trigger: string[]
  immediateSteps: ScenarioStep[]
  extendedSteps: ScenarioStep[]
  rallyTrigger: string
  commsProtocol: string[]
  awareness: ScenarioAwareness
  // flags that cause personalized instruction substitution in the UI
  personalizedFields: ('basement' | 'mobileHome' | 'ev' | 'infant' | 'pets' | 'rallyAddress' | 'frsChannel')[]
}

export const PROBABILITY_LABELS: Record<ProbabilityTier, string> = {
  'very-high': 'Very High — most years',
  'high': 'High — every few years',
  'moderate': 'Moderate — realistic',
  'low': 'Low — plan worth having',
  'very-low': 'Very Low — educational',
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'tornado',
    title: 'Tornado / Severe Storm',
    probabilityTier: 'very-high',
    probabilityLabel: 'Most likely scenario in your region',
    summary: 'Indiana averages 22 tornadoes/year. Hamilton County had confirmed tornadic activity in June 2023. Peak season: May–June.',
    sourceNote: 'Source: NOAA NWS Indianapolis',
    trigger: [
      'Tornado WARNING issued (not watch)',
      'Sirens activate',
      'Visible rotation or funnel cloud',
      'Sky turns greenish-yellow with sudden stillness',
    ],
    immediateSteps: [
      { text: 'Go to basement immediately — lowest floor, interior wall, away from windows.', critical: true },
      { text: 'If no basement: interior room, lowest floor, bathtub with mattress over you.' },
      { text: 'Mobile/manufactured home: evacuate NOW to nearest sturdy structure. Do not shelter in place.', critical: true },
      { text: 'Hold infant against chest face-down, cover with your body. Use carrier if available.' },
      { text: 'If outside: low ditch, cover head. Never shelter under a highway overpass.' },
    ],
    extendedSteps: [
      { text: 'Stay put until official all-clear from NOAA radio or emergency alert.' },
      { text: 'Assume all downed power lines are live.' },
      { text: 'Document damage with photos before touching anything for insurance.' },
      { text: 'Check in via FRS radio or in-person at cluster hub once roads are passable.' },
    ],
    rallyTrigger: 'Meet at cluster hub once roads are officially cleared and safe to travel.',
    commsProtocol: [
      'FRS Channel [assigned] — check-in at 8am, 12pm, 6pm.',
      'If phones restored: call out-of-state coordinator to confirm all clusters are safe.',
    ],
    awareness: {
      earlySignals: [
        'Sky turns greenish-yellow or dark in mid-afternoon',
        'Sudden stillness (wind drops completely) followed by hail',
        'Distant roar that doesn\'t stop — sounds like a freight train',
        'NOAA weather radio or Wireless Emergency Alert fires',
      ],
      avoid: [
        'Do not wait to visually confirm a tornado — by the time you see it, you have seconds',
        'Highway overpasses act as wind tunnels — never shelter there',
        'Do not try to outrun in a vehicle unless you have a clear perpendicular escape and significant lead time',
      ],
      calibration: 'A watch means conditions are favorable. A WARNING means rotation is confirmed. Act on WARNING, not watch.',
    },
    personalizedFields: ['basement', 'mobileHome', 'infant', 'rallyAddress', 'frsChannel'],
  },
  {
    id: 'power-outage',
    title: 'Extended Power Outage',
    probabilityTier: 'high',
    probabilityLabel: 'Common after severe storms and ice storms',
    summary: 'Indiana sees multi-day outages after major ice storms and tornado clusters. Most resolve in 1–3 days; 10–14 day outages occur after major ice events.',
    sourceNote: 'Source: NOAA / Indiana utility historical data',
    trigger: [
      'Grid down with no restoration ETA from utility',
      'Multiple neighborhoods affected (check Nextdoor/social while you can)',
      'Utility website shows "major event" — not a routine outage',
    ],
    immediateSteps: [
      { text: 'Unplug sensitive electronics to protect from surge when power restores.' },
      { text: 'Check fridge/freezer: minimize opening. Freezer safe 24–48hr, fridge 4hr open / 8hr closed.' },
      { text: 'Electric vehicles: your range is now fixed at current charge. Do not use for non-essential trips.', critical: true },
      { text: 'Gas vehicles: fill tank now if outage is forecast — gas stations go dark without power.', critical: true },
      { text: 'Infant: use ready-to-feed formula — no water mixing needed.' },
    ],
    extendedSteps: [
      { text: 'Food order: Freezer → Fridge → Pantry → Supply cache.' },
      { text: 'Water: 1 gallon/person/day minimum. Infants require sterile water for mixing or ready-to-feed.' },
      { text: 'Generator: outdoors only, 20+ feet from windows, NEVER in garage. Carbon monoxide kills quickly.', critical: true },
      { text: 'Day 3 decision: no heat in winter or no AC in extreme heat → activate rally protocol.' },
      { text: 'Do not announce generator status or supply levels publicly.' },
    ],
    rallyTrigger: 'No heat available in winter or no AC in extreme heat after Day 3. Activate cluster hub rally.',
    commsProtocol: [
      'FRS radios: Channel [assigned]. Check-ins at 8am, 12pm, 6pm.',
      'If any landline works: call out-of-state coordinator.',
    ],
    awareness: {
      earlySignals: [
        'Flickering or voltage irregularities before complete failure',
        'Multiple neighborhoods affected — not just your block',
        'Utility website shows "major event" categorization',
      ],
      avoid: [
        'Running generator indoors or in garage — CO poisoning kills faster than the outage hurts',
        'Announcing your generator or supply status publicly — creates a target',
        'Opening refrigerator/freezer repeatedly — every opening costs 30+ minutes of safe temperature',
      ],
    },
    personalizedFields: ['ev', 'infant', 'rallyAddress', 'frsChannel'],
  },
  {
    id: 'winter-storm',
    title: 'Winter Storm / Ice Storm',
    probabilityTier: 'high',
    probabilityLabel: 'Several significant events per decade',
    summary: 'Ice storms (not snow) are Indiana\'s primary winter hazard. 0.5" of ice makes roads impassable. Do NOT activate rally protocol during active ice — driving is more dangerous than sheltering.',
    sourceNote: 'Source: NOAA',
    trigger: [
      'Ice accumulation forecast >0.25"',
      'Hamilton County roads declared dangerous',
      'Visibility near zero with freezing precipitation',
    ],
    immediateSteps: [
      { text: 'Stay home. Storms are almost always forecast 24–48hr out — stock up before it hits.' },
      { text: 'Do NOT attempt to drive to rally point during active ice accumulation.' },
      { text: 'If power goes out: follow Extended Power Outage scenario.' },
    ],
    extendedSteps: [
      { text: 'Check 511in.org or local AM radio for road condition updates (both work without internet or power).' },
      { text: 'Rally protocol: do not activate until roads are treated and confirmed passable.' },
      { text: 'Propane heater (outdoor-rated) can supplement indoor heat — crack a window for ventilation.' },
    ],
    rallyTrigger: 'Only after roads are confirmed passable and heat/power has not been restored after Day 3.',
    commsProtocol: [
      'NOAA weather radio for updates.',
      'FRS radios for neighbor coordination.',
      'Do not attempt vehicle travel until roads are officially cleared.',
    ],
    awareness: {
      earlySignals: [
        'Freezing rain beginning — surfaces ice over within minutes',
        'County Road Advisory Level rises (Hamilton County Highway Dept)',
        'Utility begins proactive outage alerts',
      ],
      avoid: [
        'Driving in the first 6 hours of ice accumulation — worst window',
        'Assuming salt trucks have treated your specific road — county roads take longer than state highways',
      ],
      calibration: 'A snow event is manageable. An ice event is a different scenario entirely — treat it as a multi-day shelter-in-place by default.',
    },
    personalizedFields: ['rallyAddress', 'frsChannel'],
  },
  {
    id: 'flooding',
    title: 'Flash Flooding',
    probabilityTier: 'moderate',
    probabilityLabel: 'Realistic near waterways',
    summary: 'Hamilton County has experienced significant flooding. Top historical White River crests include 21–23 ft events. Flash flooding is fast — turn around, don\'t drown.',
    sourceNote: 'Source: Hamilton East Public Library / USGS',
    trigger: [
      'Flash flood WARNING issued (not watch)',
      'Water visibly rising in streets or yard',
      'Creek or river visibly out of banks',
    ],
    immediateSteps: [
      { text: 'Move to upper floors immediately.' },
      { text: 'Do NOT drive through flooded roads — 6 inches moves adults, 12 inches floats a car.', critical: true },
      { text: 'Evacuation trigger: water approaching first floor. Activate go-bag and load pets.' },
    ],
    extendedSteps: [
      { text: 'Avoid low-lying roads. Head toward high ground.' },
      { text: 'Reference Hamilton County Mass Evacuation Plan Appendix 4 for official routes — printed in binder.' },
      { text: 'Do not return until official all-clear — flood damage makes structures unsafe.' },
    ],
    rallyTrigger: 'Water approaching first floor OR official evacuation order. Go to cluster hub via high-ground route.',
    commsProtocol: [
      'Call out-of-state coordinator to report status.',
      'FRS radios for neighbor coordination.',
    ],
    awareness: {
      earlySignals: [
        'Heavy rainfall upstream even if not raining at your location',
        'Flash flood watch issued — conditions favorable for rapid rise',
        'Soil is already saturated from recent rain',
      ],
      avoid: [
        'Driving through any water covering the road — depth is impossible to judge visually',
        'Walking through moving flood water — 6 inches of moving water can knock a person down',
        'Re-entering a flooded structure before inspection — electrical, structural, biological hazards',
      ],
    },
    personalizedFields: ['pets', 'rallyAddress'],
  },
  {
    id: 'forced-evacuation',
    title: 'Forced Evacuation',
    probabilityTier: 'moderate',
    probabilityLabel: 'Chemical spill, structure fire, or official order',
    summary: 'Chemical facilities exist throughout central Indiana. Structure fires, gas leaks, and localized disasters trigger mandatory evacuations with little warning.',
    sourceNote: 'Source: FEMA / local emergency management',
    trigger: [
      'Official evacuation order via Wireless Emergency Alert',
      'Door-to-door notification from emergency services',
      'Immediate threat to home: fire, gas leak, structural failure',
      'Chemical or hazmat incident nearby',
    ],
    immediateSteps: [
      { text: 'Go-bag is at [location]. Load in under 15 minutes.', critical: true },
      { text: 'Pet carrier at [location]. Pet bag with food and vet records.' },
      { text: 'Leave departure signal at [signal location] before you go.' },
    ],
    extendedSteps: [
      { text: 'If >15 min available: grab documents cache, medications, additional baby supplies, laptop.' },
      { text: 'Route A: county road path to cluster hub — avoids US-31 and I-69.' },
      { text: 'Route B: alternate if Route A is blocked.' },
      { text: 'Route C: out-of-state route for regional evacuation.' },
      { text: 'Do not take major routes in the first wave — they clog within minutes of an order.' },
    ],
    rallyTrigger: 'Immediate. Load and go to cluster hub. Call out-of-state coordinator en route if phone works.',
    commsProtocol: [
      'Call out-of-state coordinator as soon as you are moving.',
      'FRS radios if phones are down.',
    ],
    awareness: {
      earlySignals: [
        'Nixle alert or Wireless Emergency Alert on your phone (sign up for Hamilton County Nixle in advance)',
        'Unusual smell, smoke, or visible hazmat response nearby',
        '"Advisory" vs "mandatory" — advisory means you should leave, mandatory means you must',
      ],
      avoid: [
        'Waiting for confirmation that roads are clear before loading — load while getting information',
        'US-31 and I-69 in the first hour of any major order',
        'Leaving pets behind expecting to return quickly — mandatory evacuations can last days to weeks',
      ],
    },
    personalizedFields: ['pets', 'rallyAddress', 'frsChannel'],
  },
  {
    id: 'telecom-failure',
    title: 'Telecom / Power Grid Failure',
    probabilityTier: 'low',
    probabilityLabel: 'Low — worth planning for, not a primary fear',
    summary: 'Nation-state attacks on infrastructure are a documented threat, but a large-scale multi-week disruption remains low-probability. The plan value is a pre-agreed rally protocol when phones don\'t work — regardless of cause.',
    sourceNote: 'Source: CISA infrastructure reports 2022–2024',
    trigger: [
      'Phones non-functional AND internet down AND no ETA from any source',
      'Multiple infrastructure types failing simultaneously',
      'Outage is geographically large — regional, not just local',
    ],
    immediateSteps: [
      { text: 'Stay home for the first 2 hours. Assess. Most outages resolve quickly.' },
      { text: 'Switch to FRS radios: Channel [assigned]. Check-in times: 8am, 12pm, 6pm.', critical: true },
      { text: 'EV vehicles: charging is unavailable. Confirm cluster hub is within current range before driving.', critical: true },
    ],
    extendedSteps: [
      { text: '4-hour rule: if no contact with family after 4 hours of trying all methods — activate rally protocol.', critical: true },
      { text: 'Rally: drive/walk to cluster hub (address memorized and printed — no GPS needed). Avoid I-69 and US-31.' },
      { text: 'Try any working landline to reach out-of-state coordinator. If none, send written note via neighbor.' },
      { text: 'If rally point is compromised: go to convergence hub. Out-of-state coordinator determines next steps.' },
      { text: 'Local AM radio is the most resilient broadcast medium — stations run on backup power.' },
    ],
    rallyTrigger: '4-hour rule: no contact with family after 4 hours → go to cluster hub.',
    commsProtocol: [
      'FRS radios: Channel [assigned]. Check-ins at 8am, 12pm, 6pm.',
      'Landline if any available.',
      'Written note via neighbor if nothing else works.',
    ],
    awareness: {
      earlySignals: [
        'Multiple infrastructure types fail simultaneously: cell, internet, and landlines together',
        'Outage is geographically large — regional or statewide',
        'No utility estimated restoration time — utilities go silent, not just delayed',
        'GPS behaves erratically (spoofing is possible in infrastructure attack scenarios)',
      ],
      avoid: [
        'Don\'t assume worst-case immediately — most widespread outages are infrastructure failure, not attacks',
        'Don\'t drain vehicle fuel checking on family in the first few hours — conserve range',
        'Don\'t share your supply status or situation with strangers until situation clarifies',
      ],
    },
    personalizedFields: ['ev', 'rallyAddress', 'frsChannel'],
  },
  {
    id: 'civil-unrest',
    title: 'Civil Unrest',
    probabilityTier: 'low',
    probabilityLabel: 'Very unlikely in Hamilton County',
    summary: 'Westfield/Hamilton County has no significant civil unrest history. This scenario uses the same shelter-in-place/evacuation logic as other scenarios.',
    sourceNote: 'Source: FBI crime data / local emergency management history',
    trigger: [
      'Active unrest within 1 mile of your location',
      'Unrest directly approaching your neighborhood',
      'Official curfew issued for your area',
    ],
    immediateSteps: [
      { text: 'Shelter-in-place. Lock doors. Lights off. Move to interior room away from windows.' },
      { text: 'Do not drive through active unrest areas — even to "see what\'s happening."', critical: true },
      { text: 'Avoid downtown Indianapolis corridors: I-465, I-65, I-70, Meridian/Capitol Ave area.' },
    ],
    extendedSteps: [
      { text: 'Monitor official channels: Hamilton County Sheriff, Westfield Police — not social media rumors.' },
      { text: 'FRS radios for quiet neighbor coordination.' },
      { text: 'Leave when: home is directly threatened. Route to cluster hub via county roads.' },
      { text: 'Do not display or advertise weapons — escalates encounters unnecessarily.' },
    ],
    rallyTrigger: 'Home is directly and imminently threatened. Route to cluster hub via county roads only.',
    commsProtocol: [
      'FRS radios quietly.',
      'Call out-of-state coordinator when safe to do so.',
    ],
    awareness: {
      earlySignals: [
        'Large organized protests turning into property damage in downtown Indy',
        'Law enforcement issuing curfews via official channels',
        'Social media showing crowd movement toward your area — verify with multiple sources',
      ],
      avoid: [
        'Avoid large gatherings entirely — even peaceful ones can escalate unpredictably',
        'Do not post your location or supplies to social media',
        'Unrest 25 miles away in downtown Indy is NOT the same as unrest in your neighborhood — calibrate to what\'s actually near you',
      ],
      calibration: 'React to what\'s actually near you, not what\'s on the news. Distance matters enormously.',
    },
    personalizedFields: ['rallyAddress', 'frsChannel'],
  },
  {
    id: 'house-fire',
    title: 'House Fire',
    probabilityTier: 'very-high',
    probabilityLabel: 'Most common home emergency — U.S. fire departments respond every 88 seconds',
    summary: 'U.S. fire departments respond to a home structure fire every 88 seconds. Cooking is the leading cause; heating equipment is second. A fire can make a home uninhabitable in under 3 minutes.',
    sourceNote: 'Source: National Fire Protection Association (NFPA)',
    trigger: [
      'Smoke alarm activates',
      'Visible smoke or flame anywhere in the home',
      'Smell of burning — especially electrical, plastic, or wood',
      'Circuit breakers tripping repeatedly',
    ],
    immediateSteps: [
      { text: 'Get everyone out immediately — do not stop for belongings.', critical: true },
      { text: 'Close doors behind you as you leave — closed doors dramatically slow fire spread.', critical: true },
      { text: 'Feel every door before opening — if hot, use a different exit.', critical: true },
      { text: 'Do not use elevators in apartment buildings.' },
      { text: 'If smoke is heavy: get low and crawl under the smoke to the exit.' },
      { text: 'If trapped: close the door, seal gaps with clothing, signal from a window.' },
      { text: 'Meet at your outdoor meeting spot — do not go back inside for any reason.', critical: true },
      { text: 'Call 911 from outside the building.' },
    ],
    extendedSteps: [
      { text: 'If home is uninhabitable: activate rally protocol and go to your cluster hub.' },
      { text: 'Contact your homeowners or renters insurance immediately.' },
      { text: 'Red Cross disaster assistance is available for displaced families — call 1-800-RED-CROSS.' },
      { text: 'Do not re-enter until fire officials say it is safe — even to retrieve belongings.' },
    ],
    rallyTrigger: 'Home is uninhabitable after the fire. Activate cluster hub rally.',
    commsProtocol: [
      'Meet at outdoor meeting spot immediately.',
      'Call 911 first, then notify family members and out-of-state coordinator.',
    ],
    awareness: {
      earlySignals: [
        'Smell of burning — especially electrical (sharp/acrid) or wood',
        'Discolored walls or ceiling near outlets or heating elements',
        'Smoke alarm chirps or intermittent alerts — do not ignore, investigate immediately',
        'Circuit breakers tripping repeatedly in the same area',
      ],
      avoid: [
        'Re-entering the building for any reason — fire can reignite or structures can collapse',
        'Using water on electrical fires or grease fires — use a fire extinguisher rated for those types',
        'Opening hot doors — this can trigger a backdraft',
        'Waiting to confirm the alarm is real before exiting',
      ],
      calibration: 'Every smoke alarm should be treated as real. False alarms are an annoyance; ignoring a real one is fatal. Practice the exit so it\'s automatic.',
    },
    personalizedFields: ['rallyAddress', 'pets'],
  },
  {
    id: 'earthquake',
    title: 'Earthquake',
    probabilityTier: 'very-low',
    probabilityLabel: 'Educational — very low probability',
    summary: 'New Madrid Seismic Zone is 300+ miles south. USGS estimates 7–10% chance of 7.6+ magnitude event in 50 years. For daily planning this is background knowledge, not a primary scenario.',
    sourceNote: 'Source: USGS',
    trigger: [
      'Ground shaking',
    ],
    immediateSteps: [
      { text: 'Drop, cover, hold on. Get under a sturdy table or against an interior wall.', critical: true },
      { text: 'Stay away from windows and exterior walls.' },
      { text: 'Do NOT run outside during shaking.' },
    ],
    extendedSteps: [
      { text: 'After shaking stops: check for gas leaks (smell, hissing). If detected, evacuate and call utility.' },
      { text: 'Do not re-enter a structurally damaged building.' },
      { text: 'If significant structural damage: treat as forced evacuation.' },
    ],
    rallyTrigger: 'Significant structural damage to your home. Treat as forced evacuation.',
    commsProtocol: [
      'Call out-of-state coordinator when able.',
      'FRS radios for neighbor coordination.',
    ],
    awareness: {
      earlySignals: [
        'In Indiana, little to no warning — unlike weather events',
        'Animals may behave strangely immediately before',
      ],
      avoid: [
        'Running outside during shaking — most injuries occur from falling objects while moving',
        'Re-entering a building without a structural inspection after a significant quake',
      ],
    },
    personalizedFields: ['rallyAddress'],
  },
]

export function getScenarioById(id: ScenarioId): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id)
}
