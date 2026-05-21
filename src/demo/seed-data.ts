import type { FamilyPlan } from '../types/plan'

export const DEMO_PLAN: FamilyPlan = {
  planName: 'Hamilton County Demo Plan',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  version: 1,

  units: [
    {
      id: 'unit-1',
      name: 'The Marshalls',
      address: '18432 Carey Road, Westfield, IN 46074',
      homeType: 'single-family',
      hasBasement: true,
      hasSafeRoom: true,
      safeRoomDescription: 'Basement interior wall closet — southwest corner',
      inFloodPlain: false,
      nearWaterway: false,
      meetingSpot: 'End of driveway by the mailbox',
      clusterId: 'westfield-cluster',
      members: [
        {
          id: 'member-1',
          name: 'Evan Marshall',
          age: 38,
          phone: '317-555-0142',
          awayLocation: {
            address: '300 N Meridian St, Indianapolis, IN 46204',
            description: 'work',
            typicalHours: 'M–F 8am–5pm',
            awayCategory: 'local',
            frequentTraveler: false,
          },
        },
        {
          id: 'member-2',
          name: 'Claire Marshall',
          age: 36,
          phone: '317-555-0143',
        },
        {
          id: 'member-3',
          name: 'Sophie Marshall',
          age: 8,
          awayLocation: {
            address: 'Monon Trail Elementary, 17802 Wheeler Rd, Westfield, IN 46074',
            description: 'school',
            typicalHours: 'M–F 8am–3:15pm',
            awayCategory: 'local',
            frequentTraveler: false,
          },
        },
      ],
      pets: [
        { id: 'pet-1', name: 'Ranger', type: 'dog', hasCarrier: true },
      ],
      vehicles: [
        {
          id: 'vehicle-1',
          type: 'suv',
          fuelType: 'gas',
          rangeEstimateMiles: 400,
          passengerCapacity: 6,
          description: '2022 Ford Explorer',
        },
        {
          id: 'vehicle-2',
          type: 'car',
          fuelType: 'electric',
          rangeEstimateMiles: 260,
          passengerCapacity: 5,
          description: '2023 Hyundai Ioniq 5',
        },
      ],
    },
    {
      id: 'unit-2',
      name: 'Grandma & Grandpa Marshall',
      address: '19801 Springmill Road, Westfield, IN 46074',
      homeType: 'single-family',
      hasBasement: true,
      hasSafeRoom: false,
      inFloodPlain: false,
      nearWaterway: false,
      clusterId: 'westfield-cluster',
      members: [
        { id: 'member-4', name: 'Robert Marshall', age: 68, phone: '317-555-0187' },
        { id: 'member-5', name: 'Donna Marshall', age: 65, phone: '317-555-0188' },
      ],
      pets: [],
      vehicles: [
        {
          id: 'vehicle-3',
          type: 'car',
          fuelType: 'gas',
          rangeEstimateMiles: 450,
          passengerCapacity: 5,
          description: '2019 Toyota Camry',
        },
      ],
    },
    {
      id: 'unit-3',
      name: 'The Garcias',
      address: '4821 S Meridian St, Indianapolis, IN 46217',
      homeType: 'single-family',
      hasBasement: false,
      hasSafeRoom: false,
      inFloodPlain: false,
      nearWaterway: false,
      clusterId: 'southside-cluster',
      members: [
        { id: 'member-6', name: 'Miguel Garcia', age: 62, phone: '317-555-0201' },
        { id: 'member-7', name: 'Rosa Garcia', age: 60, phone: '317-555-0202' },
      ],
      pets: [],
      vehicles: [
        {
          id: 'vehicle-4',
          type: 'suv',
          fuelType: 'gas',
          rangeEstimateMiles: 380,
          passengerCapacity: 5,
          description: '2020 Honda CR-V',
        },
      ],
    },
  ],

  rallyPoints: [
    {
      id: 'rp-1',
      name: 'Marshall Hub',
      address: '19801 Springmill Road, Westfield, IN 46074',
      hostUnitId: 'unit-2',
      hostContactName: 'Robert & Donna Marshall',
      hostContactPhone: '317-555-0187',
      isCommunityLocation: false,
      resources: {
        hasGenerator: true,
        generatorWatts: 7500,
        waterGallons: 40,
        foodDays: 14,
        shelterCapacity: 10,
        hasFirstAidKit: true,
        hasAED: false,
        hasChainsaw: true,
        hasHandTools: true,
        hasNOAARadio: true,
        hasFRSRadios: true,
        hasLandline: true,
        notes: 'Back-up propane heater in garage. Extra fuel (10 gal) in shed.',
      },
    },
    {
      id: 'rp-2',
      name: 'Garcia Hub',
      address: '4821 S Meridian St, Indianapolis, IN 46217',
      hostUnitId: 'unit-3',
      hostContactName: 'Miguel & Rosa Garcia',
      hostContactPhone: '317-555-0201',
      isCommunityLocation: false,
      resources: {
        hasGenerator: false,
        waterGallons: 20,
        foodDays: 7,
        shelterCapacity: 6,
        hasFirstAidKit: true,
        hasAED: false,
        hasChainsaw: false,
        hasHandTools: true,
        hasNOAARadio: true,
        hasFRSRadios: true,
        hasLandline: false,
        notes: 'No basement — shelter in interior hallway for tornado events.',
      },
    },
  ],

  clusters: [
    {
      id: 'westfield-cluster',
      name: 'Westfield Cluster',
      unitIds: ['unit-1', 'unit-2'],
      localHubId: 'rp-1',
    },
    {
      id: 'southside-cluster',
      name: 'Southside Cluster',
      unitIds: ['unit-3'],
      localHubId: 'rp-2',
    },
  ],

  convergencePlan: {
    fullConvergenceHubId: 'rp-1',
    convergenceDayThreshold: 3,
  },

  evCoordinations: [
    {
      evUnitId: 'unit-1',
      pickupByUnitId: 'unit-2',
      coordinationAddress: '19801 Springmill Road, Westfield, IN 46074',
      availableSeats: 3,
    },
  ],

  communication: {
    frsUnitCount: 6,
    frsChannels: [
      { unitId: 'unit-1', channel: 1 },
      { unitId: 'unit-2', channel: 1 },
      { unitId: 'unit-3', channel: 3 },
    ],
    checkInTimes: ['08:00', '12:00', '18:00'],
    hasMeshtastic: false,
    hasHamRadio: false,
    hasNOAARadio: true,
    noaaModel: 'Midland WR120',
    neighborContacts: [
      { name: 'Dave & Kathy Prater', address: '18416 Carey Road, Westfield, IN 46074', phone: '317-555-0155' },
      { name: 'Jim Holcomb', address: '18448 Carey Road, Westfield, IN 46074', phone: '317-555-0162' },
    ],
    outOfStateCoordinatorName: 'Thomas Holt',
    outOfStateCoordinatorPhone: '614-555-0311',
    outOfStateCoordinatorRelationship: 'Uncle (Columbus, OH)',
  },

  departureSignals: [
    {
      unitId: 'unit-1',
      signalLocation: 'Inside mailbox, taped to back panel',
      codeA: 'Go north',
      codeB: 'Go south',
      visualMarker: 'Orange ribbon tied to left porch post',
    },
    {
      unitId: 'unit-2',
      signalLocation: 'Taped to back door frame (inside)',
      codeA: 'Go north',
      codeB: 'Go south',
      visualMarker: 'Potted plant moved to left side of front door',
    },
    {
      unitId: 'unit-3',
      signalLocation: 'Under welcome mat — sealed plastic bag',
      codeA: 'Go north',
      codeB: 'Family hub',
      visualMarker: 'Blue flag in front flower pot',
    },
  ],

  passphrase: {
    challengeWord: 'Sunrise',
    responsePhrase: 'River runs east on Sundays',
    backupPhrase: 'Eagles fly at midnight',
    physicalTokenDescription: 'King of spades playing card kept in wallet',
    lastUpdated: '2026-01-15',
  },

  awayProtocols: [
    {
      memberId: 'member-1',
      localInstruction:
        'If disaster hits during work hours, go directly to Marshall Hub (19801 Springmill Rd) — do not drive home first. Route: surface streets north on Meridian to 146th, west to Spring Mill Rd. Avoid I-465 and US-31.',
      inStateInstruction:
        'If traveling in-state and within 50 miles of hub: make your way to Marshall Hub when safe. If farther than 50 miles: stay put. Contact Thomas Holt (614-555-0311) to relay your status.',
      outOfStateInstruction:
        'Do not drive back into a disaster zone. Stay where you are. Contact Thomas Holt immediately. He will relay your status to the family.',
    },
    {
      memberId: 'member-3',
      localInstruction:
        'Sophie stays at school until an authorized adult picks her up. Passphrase required at pickup. If no pickup within 2 hours of normal dismissal, school follows their shelter-in-place protocol.',
      inStateInstruction: 'Sophie does not travel independently.',
      outOfStateInstruction: 'Sophie does not travel independently.',
      schoolPickupPassphraseNote:
        'Adult picking up Sophie must say the response phrase when Sophie asks the challenge word: "Sunrise" → "River runs east on Sundays." If the adult cannot produce this phrase, Sophie should NOT go with them.',
    },
  ],

  prepInventory: [
    { id: 'inv-1', name: 'NOAA Weather Radio (Midland WR120)', category: 'comm', status: 'have', scenarioRelevance: ['tornado', 'winter-storm', 'power-outage'], quantity: '1', storageLocation: 'Kitchen counter' },
    { id: 'inv-2', name: 'FRS Walkie-Talkies', category: 'comm', status: 'have', scenarioRelevance: ['tornado', 'power-outage', 'telecom-failure', 'civil-unrest', 'forced-evacuation'], quantity: '6 radios', storageLocation: 'Garage shelf' },
    { id: 'inv-3', name: 'First Aid Kit (comprehensive)', category: 'medical', status: 'have', scenarioRelevance: ['tornado', 'power-outage', 'flooding', 'forced-evacuation', 'civil-unrest'], storageLocation: 'Basement utility room' },
    { id: 'inv-4', name: '72-Hour Emergency Food Bars', category: 'food', status: 'have', scenarioRelevance: ['tornado', 'power-outage', 'winter-storm', 'forced-evacuation'], quantity: '12 bars (4 persons × 3 days)', storageLocation: 'Basement storage shelf' },
    { id: 'inv-5', name: 'Water Storage (55-gallon drum)', category: 'water', status: 'have', scenarioRelevance: ['power-outage', 'flooding', 'telecom-failure'], quantity: '55 gallons', storageLocation: 'Basement — northeast corner' },
    { id: 'inv-6', name: 'Water Filter (LifeStraw or Sawyer)', category: 'water', status: 'need', scenarioRelevance: ['flooding', 'power-outage', 'telecom-failure'], notes: 'Priority purchase — no backup filtration currently' },
    { id: 'inv-7', name: 'Generator Fuel (10-gallon reserve)', category: 'power', status: 'need', scenarioRelevance: ['power-outage', 'winter-storm', 'telecom-failure'], notes: 'Generator is at grandparents — fuel reserve needed there' },
    { id: 'inv-8', name: 'Cash Reserve ($500 small bills)', category: 'financial', status: 'have', scenarioRelevance: ['power-outage', 'telecom-failure', 'civil-unrest', 'forced-evacuation'], quantity: '$500 in $20s and under', storageLocation: 'Go-bag, inner zipper pocket' },
    { id: 'inv-9', name: 'Paper Maps (Hamilton County + Indiana state)', category: 'navigation', status: 'have', scenarioRelevance: ['telecom-failure', 'forced-evacuation', 'civil-unrest'], storageLocation: 'Glove box + go-bag' },
    { id: 'inv-10', name: 'Solar Charger / Power Bank (20,000mAh)', category: 'power', status: 'need', scenarioRelevance: ['power-outage', 'telecom-failure', 'civil-unrest', 'forced-evacuation'], notes: 'Priority — phones critical in first 24 hours' },
    { id: 'inv-11', name: 'Flashlights + Batteries (4-pack LED)', category: 'tools', status: 'have', scenarioRelevance: ['tornado', 'power-outage', 'winter-storm'], quantity: '4 flashlights', storageLocation: 'Kitchen drawer + go-bag' },
    { id: 'inv-12', name: 'Chainsaw (gas-powered)', category: 'tools', status: 'have', scenarioRelevance: ['tornado', 'winter-storm'], quantity: '1', storageLocation: 'Grandparents\' garage', notes: 'At Marshall Hub — available for debris clearing after tornado' },
  ],

  unitRoutes: [
    {
      unitId: 'unit-1',
      toHubId: 'rp-westfield',
      routes: [
        {
          label: 'Primary',
          steps: [
            { streetName: 'Carey Road', distanceMiles: 1.2, durationSeconds: 120, maneuver: 'depart' },
            { streetName: 'Spring Mill Road', distanceMiles: 2.8, durationSeconds: 280, maneuver: 'turn right' },
            { streetName: '196th Street', distanceMiles: 0.5, durationSeconds: 60, maneuver: 'turn left' },
          ],
          totalMiles: 4.5,
          estimatedMinutes: 8,
          avoidRoads: ['US-31', 'I-69 (first hour of any major evacuation)'],
          useWhen: 'Default route',
          autoCalculated: false,
        },
      ],
      researchNotes: 'Spring Mill Rd is less congested than US-31 during rush hour and major events.',
    },
  ],
  completedSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  currentStep: 10,
}
