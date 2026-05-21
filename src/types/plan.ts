// ── Core identity types ─────────────────────────────────────────────────────

export type FuelType = 'gas' | 'diesel' | 'hybrid' | 'electric'
export type VehicleType = 'car' | 'truck' | 'suv' | 'van' | 'motorcycle' | 'other'
export type HomeType = 'single-family' | 'apartment' | 'mobile' | 'condo' | 'other'
export type AwayCategory = 'local' | 'in-state' | 'out-of-state'
export type SupplyStatus = 'have' | 'need' | 'na'
export type ScenarioId =
  | 'tornado'
  | 'power-outage'
  | 'winter-storm'
  | 'flooding'
  | 'forced-evacuation'
  | 'telecom-failure'
  | 'civil-unrest'
  | 'earthquake'
  | 'house-fire'
  | 'carbon-monoxide'

// ── Vehicle ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string
  type: VehicleType
  fuelType: FuelType
  rangeEstimateMiles: number
  passengerCapacity: number
  description?: string
}

// ── Family member ────────────────────────────────────────────────────────────

export interface FamilyMember {
  id: string
  name: string
  age: number
  phone?: string
  medicalNotes?: string
  // Where they typically are when not home
  awayLocation?: {
    address: string
    description: string // "work", "school", etc.
    typicalHours?: string
    awayCategory: AwayCategory
    frequentTraveler: boolean
  }
}

// ── Pet ─────────────────────────────────────────────────────────────────────

export interface Pet {
  id: string
  name: string
  type: string // "dog", "cat", etc.
  hasCarrier: boolean
  specialNeeds?: string
}

// ── Family unit (a household that evacuates together) ───────────────────────

export interface FamilyUnit {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
  members: FamilyMember[]
  pets: Pet[]
  vehicles: Vehicle[]
  homeType: HomeType
  hasBasement: boolean
  hasSafeRoom: boolean
  safeRoomDescription?: string
  inFloodPlain: boolean
  nearWaterway: boolean
  meetingSpot?: string   // outdoor gathering point after home evacuation
  // Assigned by clustering logic, not entered directly
  clusterId?: string
}

// ── Rally point resources ────────────────────────────────────────────────────

export interface RallyPointResources {
  hasGenerator: boolean
  generatorWatts?: number
  waterGallons: number
  foodDays: number
  shelterCapacity: number
  hasFirstAidKit: boolean
  hasAED: boolean
  hasChainsaw: boolean
  hasHandTools: boolean
  hasNOAARadio: boolean
  hasFRSRadios: boolean
  hasLandline: boolean
  notes?: string
}

// ── Rally point ──────────────────────────────────────────────────────────────

export interface RallyPoint {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
  hostUnitId?: string // which FamilyUnit lives here (null = community location)
  hostContactName?: string
  hostContactPhone?: string
  resources: RallyPointResources
  isCommunityLocation: boolean // church, fire station, school, etc.
}

// ── Cluster: geographic grouping of family units ─────────────────────────────

export interface FamilyCluster {
  id: string
  name: string
  unitIds: string[]
  localHubId: string // RallyPoint id
}

// ── Convergence plan: when all clusters come together ───────────────────────

export interface ConvergencePlan {
  fullConvergenceHubId: string // RallyPoint id
  convergenceDayThreshold: number // default 3
}

// ── EV coordination: auto-generated ─────────────────────────────────────────

export interface EVCoordination {
  evUnitId: string
  pickupByUnitId: string
  coordinationAddress: string
  availableSeats: number
}

// ── Communication plan ───────────────────────────────────────────────────────

export interface FRSChannel {
  unitId: string
  channel: number
  subChannel?: number
}

export interface CommunicationPlan {
  frsUnitCount: number
  frsChannels: FRSChannel[]
  checkInTimes: string[] // e.g. ["08:00", "12:00", "18:00"]
  hasMeshtastic: boolean
  meshtasticNodes?: number
  hasHamRadio: boolean
  hamCallsign?: string
  hasNOAARadio: boolean
  noaaModel?: string
  neighborContacts: { name: string; address: string; phone?: string }[]
  outOfStateCoordinatorName?: string
  outOfStateCoordinatorPhone?: string
  outOfStateCoordinatorRelationship?: string
}

// ── Departure signal ─────────────────────────────────────────────────────────

export interface DepartureSignal {
  unitId: string
  signalLocation: string // e.g. "inside mailbox"
  codeA: string // primary rally point code word
  codeB: string // secondary / convergence hub code word
  visualMarker?: string // e.g. "red ribbon on porch railing left side"
}

// ── Passphrase ───────────────────────────────────────────────────────────────

export interface Passphrase {
  challengeWord: string
  responsePhrase: string
  backupPhrase: string
  physicalTokenDescription?: string
  lastUpdated: string // ISO date
}

// ── Away protocol (per member) ────────────────────────────────────────────────

export interface AwayProtocol {
  memberId: string
  localInstruction: string // what to do if at work/school
  inStateInstruction: string
  outOfStateInstruction: string
  schoolPickupPassphraseNote?: string
}

// ── Preparedness inventory ────────────────────────────────────────────────────

export interface FirearmRecord {
  id: string
  type: string // "handgun", "rifle", "shotgun"
  caliber?: string
  storageLocation: string
  safeLocation?: string
  ammoQuantity?: string
  scenarioNotes?: string
}

export interface PrepInventoryItem {
  id: string
  name: string
  category: string
  status: SupplyStatus
  scenarioRelevance: ScenarioId[]
  quantity?: string
  storageLocation?: string
  notes?: string
}

export interface SensitiveInventory {
  firearms: FirearmRecord[]
  nonLethal: PrepInventoryItem[]
}

// ── Route planning ───────────────────────────────────────────────────────────

export interface RouteStep {
  streetName: string
  distanceMiles: number
  durationSeconds: number
  maneuver: string
}

export interface RouteOption {
  label: string
  steps: RouteStep[]
  totalMiles: number
  estimatedMinutes: number
  heavyTrafficMinutes?: number
  avoidRoads: string[]
  useWhen: string
  autoCalculated: boolean
}

export interface UnitRoute {
  unitId: string
  toHubId: string
  routes: RouteOption[]
  lastCalculated?: string
  researchNotes?: string
}

// ── Root family plan ─────────────────────────────────────────────────────────

export interface FamilyPlan {
  // Metadata
  planName: string
  createdAt: string
  updatedAt: string
  version: number

  // Core data
  units: FamilyUnit[]
  clusters: FamilyCluster[]
  rallyPoints: RallyPoint[]
  convergencePlan?: ConvergencePlan

  // Auto-generated
  evCoordinations: EVCoordination[]

  // Communication
  communication: CommunicationPlan | null

  // Security
  departureSignals: DepartureSignal[]
  passphrase: Passphrase | null

  // Away protocols
  awayProtocols: AwayProtocol[]

  // Inventory (general)
  prepInventory: PrepInventoryItem[]

  // Pre-researched routes
  unitRoutes: UnitRoute[]

  // Wizard state
  completedSteps: number[]
  currentStep: number
}

// ── Decision tree types ──────────────────────────────────────────────────────

export interface DecisionOption {
  label: string
  nextId: string
}

export type TerminalActionType =
  | 'SHELTER_IN_PLACE'
  | 'ACTIVATE_RALLY'
  | 'ACTIVATE_EVACUATION'
  | 'MONITOR_AND_WAIT'
  | 'CALL_COORDINATOR'
  | 'EV_PICKUP_NEEDED'
  | 'RESOURCE_ALERT'
  | 'STAY_PUT_OUT_OF_STATE'

export interface TerminalAction {
  type: TerminalActionType
  title: string
  instructions: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface DecisionNode {
  id: string
  question: string
  context?: string
  options?: DecisionOption[]
  terminal?: TerminalAction
}
