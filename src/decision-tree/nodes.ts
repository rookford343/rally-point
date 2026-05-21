import type { DecisionNode } from '../types/plan'

// The decision tree is a static directed graph.
// The engine traverses it by node id.
// Nodes whose terminal fields are populated are leaf nodes.
// Family-specific data (rally address, FRS channel, etc.) is injected
// at render time by DecisionTree.tsx from the plan store.

export const DECISION_NODES: DecisionNode[] = [
  // ── Root ──────────────────────────────────────────────────────────────────
  {
    id: 'root',
    question: 'What is happening right now?',
    options: [
      { label: 'CO detector alarm / gas symptoms', nextId: 'co-out' },
      { label: 'Smoke alarm / fire in my home', nextId: 'fire-out' },
      { label: 'Tornado warning / severe storm', nextId: 'tornado-home-safe' },
      { label: 'Water is rising / flood warning', nextId: 'flood-leave' },
      { label: 'Power is out', nextId: 'power-ev-check' },
      { label: 'Phones and internet are down', nextId: 'telecom-wait' },
      { label: 'Civil unrest nearby', nextId: 'unrest-shelter' },
      { label: 'I am NOT at home right now', nextId: 'away-where' },
      { label: 'I need to check our supplies', nextId: 'resources-root' },
      { label: 'Something feels wrong / uncertain', nextId: 'uncertain' },
    ],
  },

  // ── Carbon monoxide branch ────────────────────────────────────────────────
  {
    id: 'co-out',
    question: 'Is anyone in the household showing symptoms — headache, dizziness, nausea — or is the CO detector alarming?',
    options: [
      { label: 'CO detector is alarming', nextId: 'co-evacuate' },
      { label: 'People have symptoms (flu-like, no fever)', nextId: 'co-evacuate' },
      { label: 'Not sure — checking detector', nextId: 'co-check' },
    ],
  },
  {
    id: 'co-evacuate',
    question: 'co-evacuate',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: '⚠ Get Out Now — Carbon Monoxide',
      urgency: 'critical',
      instructions: [
        'Get everyone out immediately — including pets. Leave the door open behind you.',
        'Do NOT stop to gather belongings.',
        'Call 911 from outside the building.',
        'Do NOT go back inside until fire department clears the home.',
        'If anyone is unresponsive: call 911 and do not move them — wait for paramedics.',
        'Anyone with symptoms should be evaluated at an emergency room.',
        'Common sources: gas furnace, water heater, generator in garage, car warming up in attached garage.',
      ],
    },
  },
  {
    id: 'co-check',
    question: 'co-check',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Check CO Detector — Treat as Real',
      urgency: 'high',
      instructions: [
        'CO is odorless and colorless — you cannot detect it without a detector.',
        'If detector is beeping: get out immediately. Treat every alarm as real.',
        'Check for symptoms: headache/dizziness/nausea that clears when you go outside is a classic CO sign.',
        'Check if pets are acting lethargic or confused — they are often affected first.',
        'If in doubt: get everyone outside, open doors and windows, call 911.',
        'Have your HVAC and gas appliances inspected before returning if source is unknown.',
      ],
    },
  },

  // ── House fire branch ─────────────────────────────────────────────────────
  {
    id: 'fire-out',
    question: 'Are you and everyone in the household out of the building?',
    options: [
      { label: 'Yes — everyone is out', nextId: 'fire-safe-outside' },
      { label: 'No — someone is still inside', nextId: 'fire-get-out' },
      { label: 'I am trapped inside', nextId: 'fire-trapped' },
    ],
  },
  {
    id: 'fire-get-out',
    question: 'fire-get-out',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: '⚠ Get Out Now — Do Not Go Back In',
      urgency: 'critical',
      instructions: [
        'Activate your smoke alarm / shout "FIRE" to alert everyone immediately.',
        'Close doors behind you as you exit — this slows fire spread significantly.',
        'Feel each door before opening: if hot, find another way out.',
        'If smoke is heavy: get low and crawl to the exit.',
        'Do NOT go back inside once you are out — call 911 and wait for firefighters.',
        'Meet at your outdoor meeting spot.',
      ],
    },
  },
  {
    id: 'fire-trapped',
    question: 'fire-trapped',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: '⚠ Trapped — Signal for Help',
      urgency: 'critical',
      instructions: [
        'Close the door to the room you are in — this buys time.',
        'Seal the gap at the bottom of the door with clothing or a towel.',
        'Call 911 immediately and give your exact location.',
        'Signal from a window — wave something bright, shout.',
        'Do NOT open the window unless smoke fills the room.',
        'If smoke enters: stay low to the floor where air is cleaner.',
      ],
    },
  },
  {
    id: 'fire-safe-outside',
    question: 'fire-safe-outside',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: 'Everyone Out — Call 911',
      urgency: 'critical',
      instructions: [
        'Call 911 immediately. Give the address and confirm everyone is out.',
        'Do NOT go back inside for any reason — not for pets, not for documents.',
        'Stay at your outdoor meeting spot so firefighters can confirm everyone is accounted for.',
        'If pets are missing, tell firefighters — do not go back in yourself.',
        'If home is uninhabitable: activate rally protocol and go to your cluster hub.',
        'Contact your insurance company as soon as possible.',
      ],
    },
  },

  // ── Tornado branch ────────────────────────────────────────────────────────
  {
    id: 'tornado-home-safe',
    question: 'Where are you right now?',
    options: [
      { label: 'At home', nextId: 'tornado-basement' },
      { label: 'In a vehicle / outside', nextId: 'tornado-outside' },
      { label: 'At work, school, or another building', nextId: 'tornado-other-building' },
    ],
  },
  {
    id: 'tornado-basement',
    question: 'Does your home have a basement?',
    options: [
      { label: 'Yes — going to basement now', nextId: 'tornado-shelter-basement' },
      { label: 'No basement', nextId: 'tornado-shelter-interior' },
      { label: 'I live in a mobile / manufactured home', nextId: 'tornado-mobile' },
    ],
  },
  {
    id: 'tornado-shelter-basement',
    question: 'Is everyone in the household accounted for?',
    options: [
      { label: 'Yes, everyone is here', nextId: 'tornado-shelter-done' },
      { label: 'Someone is missing', nextId: 'tornado-someone-missing' },
    ],
  },
  {
    id: 'tornado-shelter-done',
    question: 'tornado-shelter-done',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter in Basement',
      urgency: 'critical',
      instructions: [
        'Move to the lowest level, interior wall, away from all windows.',
        'Cover yourself with a mattress or heavy blankets.',
        'Hold infant against chest face-down, cover with your body. Use carrier if available.',
        'Stay until the tornado warning expires or an official all-clear is issued.',
        'After all-clear: check for downed power lines before going outside.',
        'Check in via FRS radio with family.',
      ],
    },
  },
  {
    id: 'tornado-shelter-interior',
    question: 'tornado-shelter-interior',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter in Interior Room',
      urgency: 'critical',
      instructions: [
        'Go to an interior room on the lowest floor — bathroom, closet, or hallway, away from windows.',
        'Get in the bathtub and pull a mattress over yourself.',
        'Hold infant against chest face-down, covered with your body.',
        'Stay until warning expires or official all-clear.',
        'After all-clear: check for downed lines before going outside.',
      ],
    },
  },
  {
    id: 'tornado-mobile',
    question: 'tornado-mobile',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: '⚠ Leave Mobile Home Immediately',
      urgency: 'critical',
      instructions: [
        'Mobile and manufactured homes are NOT safe in tornadoes regardless of tie-downs.',
        'Leave now and go to the nearest sturdy structure.',
        'If no nearby shelter: get to a low ditch and cover your head.',
        'Do not return until the warning has expired.',
      ],
    },
  },
  {
    id: 'tornado-outside',
    question: 'tornado-outside',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter — Vehicle or Outside',
      urgency: 'critical',
      instructions: [
        'If in a vehicle: park away from trees, get below window level, cover head with hands.',
        'Do NOT shelter under a highway overpass — they act as wind funnels.',
        'If in an open field: find the lowest ground (a ditch), lie flat, cover your head.',
        'If a sturdy building is within 30 seconds of running: go there instead.',
      ],
    },
  },
  {
    id: 'tornado-other-building',
    question: 'tornado-other-building',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter in Current Building',
      urgency: 'critical',
      instructions: [
        'Follow the building\'s emergency plan.',
        'Interior room, lowest floor, away from windows.',
        'Stay until the tornado warning expires.',
        'After all-clear: contact out-of-state coordinator to report you are safe.',
        'Go home or to cluster hub once roads are clear — do not rush.',
      ],
    },
  },
  {
    id: 'tornado-someone-missing',
    question: 'tornado-someone-missing',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Shelter Now — Locate Later',
      urgency: 'critical',
      instructions: [
        'Shelter yourself and those with you FIRST. You cannot help anyone if you are injured.',
        'After the storm passes, attempt FRS radio contact.',
        'If no response after 2 hours: contact out-of-state coordinator.',
        'The 4-hour rule applies: no contact after 4 hours → go to cluster hub.',
      ],
    },
  },

  // ── Flood branch ──────────────────────────────────────────────────────────
  {
    id: 'flood-leave',
    question: 'Is water entering your home or approaching your floor?',
    options: [
      { label: 'Not yet — water in streets only', nextId: 'flood-monitor' },
      { label: 'Water is approaching the first floor', nextId: 'flood-evacuate' },
      { label: 'I need to drive through water to evacuate', nextId: 'flood-no-drive' },
    ],
  },
  {
    id: 'flood-monitor',
    question: 'flood-monitor',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Monitor — Stay Off Roads',
      urgency: 'medium',
      instructions: [
        'Move valuable items off the floor to upper levels.',
        'Do NOT drive through any flooded roads — 6 inches of moving water can knock you down.',
        'Monitor NOAA weather radio and official alerts for evacuation orders.',
        'If water begins approaching your floor: activate go-bag and evacuate.',
      ],
    },
  },
  {
    id: 'flood-evacuate',
    question: 'flood-evacuate',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: 'Evacuate Now',
      urgency: 'critical',
      instructions: [
        'Grab go-bag immediately. Load pets. Leave departure signal.',
        'Take high-ground routes only — avoid low-lying roads.',
        'Reference printed Route A in your binder (avoids US-31 and I-69).',
        'Go to your cluster hub.',
        'Call out-of-state coordinator once you are moving.',
      ],
    },
  },
  {
    id: 'flood-no-drive',
    question: 'flood-no-drive',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: '⚠ Do Not Drive Through Flood Water',
      urgency: 'critical',
      instructions: [
        '12 inches of water can float your car. Do not risk it.',
        'Move to the highest floor in your home and wait for rescue if trapped.',
        'Call 911 if you are in immediate danger.',
        'Signal from an upper window or roof if needed.',
        'Do not attempt to walk through fast-moving flood water either.',
      ],
    },
  },

  // ── Power outage branch ───────────────────────────────────────────────────
  {
    id: 'power-ev-check',
    question: 'Does anyone in your family have an electric vehicle?',
    options: [
      { label: 'Yes — at least one EV', nextId: 'power-ev-range' },
      { label: 'No EVs — gas/diesel vehicles only', nextId: 'power-duration' },
    ],
  },
  {
    id: 'power-ev-range',
    question: 'Can your EV reach the cluster hub on current charge?',
    options: [
      { label: 'Yes — enough range', nextId: 'power-duration' },
      { label: 'No — range is too low', nextId: 'power-ev-pickup' },
    ],
  },
  {
    id: 'power-ev-pickup',
    question: 'power-ev-pickup',
    terminal: {
      type: 'EV_PICKUP_NEEDED',
      title: 'EV Pickup Coordination Needed',
      urgency: 'high',
      instructions: [
        'Your EV cannot reach the cluster hub on current charge and charging is unavailable.',
        'Contact your designated gas-vehicle family unit for pickup.',
        'Coordination point: see your printed plan for the agreed pickup address.',
        'Until pickup: shelter in place, monitor situation.',
        'If no pickup is possible: conserve range, stay put, check in via FRS.',
      ],
    },
  },
  {
    id: 'power-duration',
    question: 'How long has the power been out?',
    options: [
      { label: 'Less than 24 hours', nextId: 'power-short' },
      { label: '1–3 days', nextId: 'power-medium' },
      { label: 'More than 3 days', nextId: 'power-long' },
    ],
  },
  {
    id: 'power-short',
    question: 'power-short',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Monitor — Most Outages Resolve Quickly',
      urgency: 'low',
      instructions: [
        'Unplug sensitive electronics (surge risk when power restores).',
        'Keep fridge and freezer closed — fridge safe 4hr, freezer 24–48hr.',
        'Fill bathtubs with water for flushing if outage extends.',
        'Gas vehicles: fill tank now if possible — stations go dark without power.',
        'Check utility company app or website (from phone data) for restoration estimate.',
      ],
    },
  },
  {
    id: 'power-medium',
    question: 'Is your home adequately heated (winter) or cooled (summer)?',
    options: [
      { label: 'Yes — temperature is manageable', nextId: 'power-stay' },
      { label: 'No — too hot or too cold', nextId: 'power-heat-risk' },
    ],
  },
  {
    id: 'power-stay',
    question: 'power-stay',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Continue Sheltering — Monitor Supplies',
      urgency: 'medium',
      instructions: [
        'Food order: Freezer → Fridge → Pantry → Supply cache.',
        'Water: 1 gallon per person per day minimum.',
        'Infant: use ready-to-feed formula — no water mixing needed.',
        'Generator (if available): outdoors only, 20+ feet from windows.',
        'Check in with family via FRS at 8am, 12pm, 6pm.',
        'Reassess at Day 3 — if no restoration ETA, consider rally.',
      ],
    },
  },
  {
    id: 'power-heat-risk',
    question: 'power-heat-risk',
    terminal: {
      type: 'ACTIVATE_RALLY',
      title: 'Activate Rally — Temperature Risk',
      urgency: 'high',
      instructions: [
        'Infants and elderly are at highest risk from heat and cold — do not wait.',
        'Grab go-bag. Load pets. Leave departure signal.',
        'Go to your cluster hub (address in your printed plan).',
        'If cluster hub also has no power: go to nearest warming/cooling center.',
        'Contact out-of-state coordinator with your destination.',
      ],
    },
  },
  {
    id: 'power-long',
    question: 'power-long',
    terminal: {
      type: 'ACTIVATE_RALLY',
      title: 'Activate Rally Protocol',
      urgency: 'high',
      instructions: [
        'Outage beyond 3 days without restoration ETA — activate rally.',
        'Grab go-bag. Load pets. Leave departure signal.',
        'Go to your cluster hub (address in your printed plan).',
        'Contact out-of-state coordinator.',
        'EV owners: confirm you have enough range or coordinate pickup first.',
      ],
    },
  },

  // ── Telecom failure branch ────────────────────────────────────────────────
  {
    id: 'telecom-wait',
    question: 'How long have phones and internet been down?',
    options: [
      { label: 'Less than 2 hours', nextId: 'telecom-early' },
      { label: '2–4 hours', nextId: 'telecom-frs' },
      { label: 'More than 4 hours', nextId: 'telecom-rally' },
    ],
  },
  {
    id: 'telecom-early',
    question: 'telecom-early',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Wait and Monitor',
      urgency: 'low',
      instructions: [
        'Most outages resolve in the first 2 hours — do not panic.',
        'Try: FRS radio to reach nearby family.',
        'Try: any working landline to reach out-of-state coordinator.',
        'Try: neighbor who may have a different carrier.',
        'Stay home. Set a timer for 4 hours from when phones went down.',
        'If no contact after 4 hours total: activate rally protocol.',
      ],
    },
  },
  {
    id: 'telecom-frs',
    question: 'Can you reach any family member via FRS radio?',
    options: [
      { label: 'Yes — in contact via radio', nextId: 'telecom-coordinating' },
      { label: 'No radio contact', nextId: 'telecom-approaching-4hr' },
    ],
  },
  {
    id: 'telecom-coordinating',
    question: 'telecom-coordinating',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Stay Coordinated via FRS',
      urgency: 'medium',
      instructions: [
        'Good — you have radio contact. Continue check-ins at 8am, 12pm, 6pm.',
        'Coordinate cluster status: is everyone home? Does anyone need help?',
        'Try out-of-state coordinator via landline if available.',
        'If situation worsens: agree on rally protocol time via radio.',
        'If any unit loses radio contact for more than 4 hours: they activate rally.',
      ],
    },
  },
  {
    id: 'telecom-approaching-4hr',
    question: 'telecom-approaching-4hr',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Approaching 4-Hour Threshold',
      urgency: 'medium',
      instructions: [
        'Continue trying: FRS radio, any landline, neighbor with different carrier.',
        'Prepare to activate rally when 4 hours is reached.',
        'Pre-load go-bag. Check vehicle fuel.',
        'If EV: confirm range to cluster hub now.',
        'Set departure time: [your home address] → [cluster hub address].',
      ],
    },
  },
  {
    id: 'telecom-rally',
    question: 'telecom-rally',
    terminal: {
      type: 'ACTIVATE_RALLY',
      title: '4-Hour Rule — Activate Rally',
      urgency: 'high',
      instructions: [
        '4 hours with no family contact. Activate rally protocol.',
        'Grab go-bag. Load pets. Leave departure signal at your pre-agreed spot.',
        'Drive to your cluster hub (printed address — no GPS needed). Avoid I-69 and US-31.',
        'EV owners: confirm range covers the trip before leaving.',
        'Check-in times at hub: 8am, 12pm, 6pm on FRS radio.',
        'Out-of-state coordinator will relay your status across clusters when comms restore.',
      ],
    },
  },

  // ── Civil unrest branch ───────────────────────────────────────────────────
  {
    id: 'unrest-shelter',
    question: 'How close is the unrest to your location?',
    options: [
      { label: 'Downtown Indy — 25+ miles away', nextId: 'unrest-distant' },
      { label: 'Within a few miles of my neighborhood', nextId: 'unrest-near' },
      { label: 'On my street or directly approaching', nextId: 'unrest-immediate' },
    ],
  },
  {
    id: 'unrest-distant',
    question: 'unrest-distant',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Monitor — Not Near You',
      urgency: 'low',
      instructions: [
        'Unrest 25+ miles away in downtown Indy does not require action in Westfield.',
        'Monitor official sources: Hamilton County Sheriff, Westfield Police.',
        'Do not drive toward the affected area.',
        'Check in with family so everyone knows the situation.',
        'Reassess if situation moves closer.',
      ],
    },
  },
  {
    id: 'unrest-near',
    question: 'unrest-near',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter in Place — Precautionary',
      urgency: 'medium',
      instructions: [
        'Stay home. Lock doors. Lights low.',
        'Avoid driving in the affected direction.',
        'Monitor Hamilton County Sheriff and Westfield Police official channels.',
        'Coordinate quietly with neighbors via FRS.',
        'Do not post your location or supply status on social media.',
        'Reassess in 2 hours or if situation changes.',
      ],
    },
  },
  {
    id: 'unrest-immediate',
    question: 'Is your home directly and imminently threatened?',
    options: [
      { label: 'Yes — immediate threat to my home', nextId: 'unrest-evacuate' },
      { label: 'Not yet — but very close', nextId: 'unrest-shelter-interior' },
    ],
  },
  {
    id: 'unrest-evacuate',
    question: 'unrest-evacuate',
    terminal: {
      type: 'ACTIVATE_EVACUATION',
      title: 'Evacuate via County Roads',
      urgency: 'critical',
      instructions: [
        'Leave now via county roads — avoid major corridors.',
        'Grab go-bag. Load pets. Leave departure signal.',
        'Go to cluster hub (printed address).',
        'Contact out-of-state coordinator when safe.',
        'Do not display weapons during transit.',
      ],
    },
  },
  {
    id: 'unrest-shelter-interior',
    question: 'unrest-shelter-interior',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Interior Shelter — Ready to Move',
      urgency: 'high',
      instructions: [
        'Move to interior room away from windows and exterior walls.',
        'Lights off. Stay low. Keep noise minimal.',
        'Have go-bags ready to go immediately if needed.',
        'FRS radio quietly with nearest cluster units.',
        'Evacuation trigger: home is directly threatened.',
      ],
    },
  },

  // ── Away from home branch ─────────────────────────────────────────────────
  {
    id: 'away-where',
    question: 'Where are you?',
    options: [
      { label: 'At work or school (local — within 30 miles)', nextId: 'away-local-threat' },
      { label: 'Traveling in-state (more than 30 miles away)', nextId: 'away-instate-range' },
      { label: 'Out of state', nextId: 'away-out-of-state' },
    ],
  },
  {
    id: 'away-local-threat',
    question: 'Is the disaster at or near your current location?',
    options: [
      { label: 'Yes — disaster is near me right now', nextId: 'away-local-shelter' },
      { label: 'No — it\'s at home or en route', nextId: 'away-local-go-hub' },
      { label: 'I need to pick up a child from school', nextId: 'away-school-pickup' },
    ],
  },
  {
    id: 'away-local-shelter',
    question: 'away-local-shelter',
    terminal: {
      type: 'SHELTER_IN_PLACE',
      title: 'Shelter at Current Location',
      urgency: 'high',
      instructions: [
        'Shelter in place at work or school — follow their emergency plan.',
        'Do not drive until the local threat passes.',
        'Contact out-of-state coordinator when able to report your status.',
        'Family will follow the plan and meet at the cluster hub.',
        'Reunite with family at cluster hub once travel is safe.',
      ],
    },
  },
  {
    id: 'away-local-go-hub',
    question: 'away-local-go-hub',
    terminal: {
      type: 'ACTIVATE_RALLY',
      title: 'Go to Cluster Hub — Not Home',
      urgency: 'medium',
      instructions: [
        'Go directly to your cluster hub — do not go home first if hub is closer.',
        'Your printed wallet card has the cluster hub address.',
        'Avoid I-69 and US-31. Use county roads.',
        'Contact out-of-state coordinator to report you are en route.',
        'FRS radio at hub: check-ins at 8am, 12pm, 6pm.',
      ],
    },
  },
  {
    id: 'away-school-pickup',
    question: 'away-school-pickup',
    terminal: {
      type: 'CALL_COORDINATOR',
      title: 'School Pickup Protocol',
      urgency: 'high',
      instructions: [
        'Call the school ahead — confirm they are releasing students.',
        'You must present the family passphrase at pickup.',
        'If someone else is picking up the child: they must also know the passphrase.',
        'After pickup: go to cluster hub, not necessarily home.',
        'Contact out-of-state coordinator with status.',
      ],
    },
  },
  {
    id: 'away-instate-range',
    question: 'Are you within 50 miles of your cluster hub?',
    options: [
      { label: 'Yes — within 50 miles', nextId: 'away-instate-near' },
      { label: 'No — more than 50 miles away', nextId: 'away-instate-far' },
    ],
  },
  {
    id: 'away-instate-near',
    question: 'away-instate-near',
    terminal: {
      type: 'ACTIVATE_RALLY',
      title: 'Make Your Way to Cluster Hub',
      urgency: 'medium',
      instructions: [
        'Head toward your cluster hub when it is safe to travel — do not rush through a disaster.',
        'Avoid major corridors. Use secondary routes.',
        'Check in with out-of-state coordinator to report you are en route.',
        'Your printed wallet card has the cluster hub address.',
        'If travel is unsafe: shelter in place where you are and reassess.',
      ],
    },
  },
  {
    id: 'away-instate-far',
    question: 'away-instate-far',
    terminal: {
      type: 'STAY_PUT_OUT_OF_STATE',
      title: 'Stay Put — Do Not Drive Into Disaster',
      urgency: 'medium',
      instructions: [
        'Do not drive into the disaster zone to reach family.',
        'Contact out-of-state coordinator immediately — they will relay your status.',
        'Family is following the plan and will be at the cluster hub.',
        'You will reunite when it is safe to travel.',
        'Check in with coordinator every 6–12 hours for situation updates.',
      ],
    },
  },
  {
    id: 'away-out-of-state',
    question: 'away-out-of-state',
    terminal: {
      type: 'STAY_PUT_OUT_OF_STATE',
      title: 'Stay Out of State — Do Not Travel Back',
      urgency: 'medium',
      instructions: [
        'Do not travel back into a disaster zone.',
        'Contact out-of-state coordinator NOW — they are the hub for all cluster communication.',
        'Family is following the plan and will be at the cluster hub.',
        'Check in every 6–12 hours for updates.',
        'Coordinator will advise when return travel is safe.',
      ],
    },
  },

  // ── Resources branch ──────────────────────────────────────────────────────
  {
    id: 'resources-root',
    question: 'Which resource are you concerned about?',
    options: [
      { label: 'Water', nextId: 'resources-water' },
      { label: 'Food / groceries', nextId: 'resources-food' },
      { label: 'Fuel (gas)', nextId: 'resources-fuel' },
      { label: 'Medical / medications', nextId: 'resources-medical' },
      { label: 'Cash / financial access', nextId: 'resources-cash' },
    ],
  },
  {
    id: 'resources-water',
    question: 'resources-water',
    terminal: {
      type: 'RESOURCE_ALERT',
      title: 'Water Access Plan',
      urgency: 'medium',
      instructions: [
        'Check your stored water supply — goal: 1 gallon per person per day.',
        'If on a boil advisory: do not drink tap water. Use stored supply or bottled.',
        'Ready-to-feed infant formula requires no water mixing.',
        'Alternatives: bottled water from stores (buy early), Hamilton County distribution sites during emergencies, water filtration (LifeStraw) from natural sources.',
        'Escalation: if <3 days of water remain and no resolution → consider relocating to cluster hub with well or better supply.',
      ],
    },
  },
  {
    id: 'resources-food',
    question: 'resources-food',
    terminal: {
      type: 'RESOURCE_ALERT',
      title: 'Food Access Plan',
      urgency: 'low',
      instructions: [
        'Check your pantry supply — goal: 14-day supply on hand.',
        'Perishables: use freezer first (24–48hr), then fridge (4–8hr), then pantry.',
        'Cash: stores may go cash-only when payment systems are down.',
        'Alternatives: Hamilton County food pantries (Feeding Team), local farms, neighbor sharing.',
        'Escalation: if <3 days of food and no replenishment visible → go to cluster hub with better food stores.',
      ],
    },
  },
  {
    id: 'resources-fuel',
    question: 'resources-fuel',
    terminal: {
      type: 'RESOURCE_ALERT',
      title: 'Fuel Access Plan',
      urgency: 'medium',
      instructions: [
        'Gas vehicles: keep tank above half during any warning period. Fill now if able.',
        'Look for stations with generator backup (Costco, Meijer, Kroger fuel centers often do).',
        'Jerry cans: if you have stored fuel — prioritize for generator, then vehicles.',
        'EVs: grid-up means charging is available even when gas is scarce. EVs are an asset in fuel shortages.',
        'If range is critical and no fuel available: carpool with cluster unit or consolidate location.',
      ],
    },
  },
  {
    id: 'resources-medical',
    question: 'resources-medical',
    terminal: {
      type: 'RESOURCE_ALERT',
      title: 'Medical Access Plan',
      urgency: 'high',
      instructions: [
        'Check 30-day medication buffer — if running low, contact pharmacy immediately.',
        'Indiana allows emergency medication fills during declared emergencies via telehealth.',
        'Hospital pharmacies often remain open when retail pharmacies close.',
        'Escalation: if critical medication runs out within 48 hours and no alternative → treat as a medical emergency. Evacuate to reach care if needed.',
        'Keep a printed medication list in your go-bag and give a copy to your out-of-state coordinator.',
      ],
    },
  },
  {
    id: 'resources-cash',
    question: 'resources-cash',
    terminal: {
      type: 'RESOURCE_ALERT',
      title: 'Financial Access Plan',
      urgency: 'low',
      instructions: [
        'Cash is the most resilient payment form in any outage. Goal: $300–500 in small bills on hand.',
        'ATMs empty fast after major events — withdraw before the rush if storm is forecast.',
        'Venmo, Zelle, and card payments fail without internet.',
        'Know your bank\'s out-of-area branch locations.',
        'Financial disruption alone rarely triggers evacuation — but factor it into combined resource shortages.',
      ],
    },
  },

  // ── Uncertain branch ──────────────────────────────────────────────────────
  {
    id: 'uncertain',
    question: 'uncertain',
    terminal: {
      type: 'MONITOR_AND_WAIT',
      title: 'Pause and Assess',
      urgency: 'low',
      instructions: [
        'Something feels off — trust your instincts, but gather information before acting.',
        'Check NOAA weather radio and official local emergency channels.',
        'Contact a neighbor or family member to compare observations.',
        'If you identify a specific threat, return to the main menu and select it.',
        'If uncertain for more than 30 minutes with escalating signals: default to shelter-in-place.',
      ],
    },
  },
]

export function getNodeById(id: string): DecisionNode | undefined {
  return DECISION_NODES.find(n => n.id === id)
}
