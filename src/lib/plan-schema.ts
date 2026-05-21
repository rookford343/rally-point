import { z } from 'zod'

const FuelTypeSchema = z.enum(['gas', 'diesel', 'hybrid', 'electric'])
const VehicleTypeSchema = z.enum(['car', 'truck', 'suv', 'van', 'motorcycle', 'other'])
const HomeTypeSchema = z.enum(['single-family', 'apartment', 'mobile', 'condo', 'other'])
const AwayCategorySchema = z.enum(['local', 'in-state', 'out-of-state'])
const SupplyStatusSchema = z.enum(['have', 'need', 'na'])
const ScenarioIdSchema = z.enum([
  'tornado', 'power-outage', 'winter-storm', 'flooding',
  'forced-evacuation', 'telecom-failure', 'civil-unrest', 'earthquake', 'house-fire', 'carbon-monoxide',
])

const VehicleSchema = z.object({
  id: z.string(),
  type: VehicleTypeSchema,
  fuelType: FuelTypeSchema,
  rangeEstimateMiles: z.number(),
  passengerCapacity: z.number(),
  description: z.string().optional(),
})

const AwayLocationSchema = z.object({
  address: z.string(),
  description: z.string(),
  typicalHours: z.string().optional(),
  awayCategory: AwayCategorySchema,
  frequentTraveler: z.boolean(),
})

const FamilyMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  phone: z.string().optional(),
  medicalNotes: z.string().optional(),
  awayLocation: AwayLocationSchema.optional(),
})

const PetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  hasCarrier: z.boolean(),
  specialNeeds: z.string().optional(),
})

const FamilyUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  members: z.array(FamilyMemberSchema),
  pets: z.array(PetSchema),
  vehicles: z.array(VehicleSchema),
  homeType: HomeTypeSchema,
  hasBasement: z.boolean(),
  hasSafeRoom: z.boolean(),
  safeRoomDescription: z.string().optional(),
  inFloodPlain: z.boolean(),
  nearWaterway: z.boolean(),
  meetingSpot: z.string().optional(),
  clusterId: z.string().optional(),
})

const RallyPointResourcesSchema = z.object({
  hasGenerator: z.boolean(),
  generatorWatts: z.number().optional(),
  waterGallons: z.number(),
  foodDays: z.number(),
  shelterCapacity: z.number(),
  hasFirstAidKit: z.boolean(),
  hasAED: z.boolean(),
  hasChainsaw: z.boolean(),
  hasHandTools: z.boolean(),
  hasNOAARadio: z.boolean(),
  hasFRSRadios: z.boolean(),
  hasLandline: z.boolean(),
  notes: z.string().optional(),
})

const RallyPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hostUnitId: z.string().optional(),
  hostContactName: z.string().optional(),
  hostContactPhone: z.string().optional(),
  resources: RallyPointResourcesSchema,
  isCommunityLocation: z.boolean(),
})

const FamilyClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  unitIds: z.array(z.string()),
  localHubId: z.string(),
})

const ConvergencePlanSchema = z.object({
  fullConvergenceHubId: z.string(),
  convergenceDayThreshold: z.number(),
})

const EVCoordinationSchema = z.object({
  evUnitId: z.string(),
  pickupByUnitId: z.string(),
  coordinationAddress: z.string(),
  availableSeats: z.number(),
})

const FRSChannelSchema = z.object({
  unitId: z.string(),
  channel: z.number(),
  subChannel: z.number().optional(),
})

const CommunicationPlanSchema = z.object({
  frsUnitCount: z.number(),
  frsChannels: z.array(FRSChannelSchema),
  checkInTimes: z.array(z.string()),
  hasMeshtastic: z.boolean(),
  meshtasticNodes: z.number().optional(),
  hasHamRadio: z.boolean(),
  hamCallsign: z.string().optional(),
  hasNOAARadio: z.boolean(),
  noaaModel: z.string().optional(),
  neighborContacts: z.array(z.object({ name: z.string(), address: z.string(), phone: z.string().optional() })),
  outOfStateCoordinatorName: z.string().optional(),
  outOfStateCoordinatorPhone: z.string().optional(),
  outOfStateCoordinatorRelationship: z.string().optional(),
})

const DepartureSignalSchema = z.object({
  unitId: z.string(),
  signalLocation: z.string(),
  codeA: z.string(),
  codeB: z.string(),
  visualMarker: z.string().optional(),
})

const PassphraseSchema = z.object({
  challengeWord: z.string(),
  responsePhrase: z.string(),
  backupPhrase: z.string(),
  physicalTokenDescription: z.string().optional(),
  lastUpdated: z.string(),
})

const AwayProtocolSchema = z.object({
  memberId: z.string(),
  localInstruction: z.string(),
  inStateInstruction: z.string(),
  outOfStateInstruction: z.string(),
  schoolPickupPassphraseNote: z.string().optional(),
})

const PrepInventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  status: SupplyStatusSchema,
  scenarioRelevance: z.array(ScenarioIdSchema),
  quantity: z.string().optional(),
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
})

const RouteStepSchema = z.object({
  streetName: z.string(),
  distanceMiles: z.number(),
  durationSeconds: z.number(),
  maneuver: z.string(),
})

const RouteOptionSchema = z.object({
  label: z.string(),
  steps: z.array(RouteStepSchema),
  totalMiles: z.number(),
  estimatedMinutes: z.number(),
  heavyTrafficMinutes: z.number().optional(),
  avoidRoads: z.array(z.string()),
  useWhen: z.string(),
  autoCalculated: z.boolean(),
})

const UnitRouteSchema = z.object({
  unitId: z.string(),
  toHubId: z.string(),
  routes: z.array(RouteOptionSchema),
  lastCalculated: z.string().optional(),
  researchNotes: z.string().optional(),
})

export const FamilyPlanSchema = z.object({
  planName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
  units: z.array(FamilyUnitSchema),
  clusters: z.array(FamilyClusterSchema),
  rallyPoints: z.array(RallyPointSchema),
  convergencePlan: ConvergencePlanSchema.optional(),
  evCoordinations: z.array(EVCoordinationSchema),
  communication: CommunicationPlanSchema.nullable(),
  departureSignals: z.array(DepartureSignalSchema),
  passphrase: PassphraseSchema.nullable(),
  awayProtocols: z.array(AwayProtocolSchema),
  prepInventory: z.array(PrepInventoryItemSchema),
  unitRoutes: z.array(UnitRouteSchema).default([]),
  completedSteps: z.array(z.number()),
  currentStep: z.number(),
})
