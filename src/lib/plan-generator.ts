import type {
  FamilyPlan,
  FamilyUnit,
  RallyPoint,
  EVCoordination,
  RallyPointResources,
  PrepInventoryItem,
} from '../types/plan'

// ── EV coordination ─────────────────────────────────────────────────────────

export function computeEVCoordinations(
  units: FamilyUnit[],
): EVCoordination[] {
  const evOnlyUnits = units.filter(
    u => u.vehicles.length > 0 && u.vehicles.every(v => v.fuelType === 'electric')
  )
  const gasUnits = units.filter(
    u => u.vehicles.some(v => v.fuelType === 'gas' || v.fuelType === 'diesel' || v.fuelType === 'hybrid')
  )

  const coordinations: EVCoordination[] = []

  for (const evUnit of evOnlyUnits) {
    // Find the gas unit with the most available seats (simple heuristic)
    const bestGasUnit = gasUnits
      .filter(g => g.id !== evUnit.id)
      .sort((a, b) => {
        const seatsA = a.vehicles.reduce((sum, v) => sum + v.passengerCapacity, 0)
        const seatsB = b.vehicles.reduce((sum, v) => sum + v.passengerCapacity, 0)
        return seatsB - seatsA
      })[0]

    if (bestGasUnit) {
      const availableSeats = bestGasUnit.vehicles.reduce(
        (sum, v) => sum + v.passengerCapacity,
        0
      )
      // Use midpoint address as coordination point (simplified to gas unit address)
      coordinations.push({
        evUnitId: evUnit.id,
        pickupByUnitId: bestGasUnit.id,
        coordinationAddress: bestGasUnit.address,
        availableSeats,
      })
    }
  }

  return coordinations
}

// ── Rally point suggestion scoring ──────────────────────────────────────────

export interface RallyPointScore {
  unitId: string
  unitName: string
  score: number
  reasons: string[]
  disqualified: boolean
  disqualifyReason?: string
}

export function scoreUnitsForRallyPoint(
  units: FamilyUnit[],
  clusterUnitIds?: string[],
): RallyPointScore[] {
  const candidates = clusterUnitIds
    ? units.filter(u => clusterUnitIds.includes(u.id))
    : units

  return candidates.map(unit => {
    const reasons: string[] = []
    let score = 0

    // Disqualifications
    if (unit.homeType === 'mobile') {
      return {
        unitId: unit.id,
        unitName: unit.name,
        score: -999,
        reasons: [],
        disqualified: true,
        disqualifyReason: 'Mobile/manufactured homes are not suitable rally points for weather emergencies.',
      }
    }

    if (unit.inFloodPlain) {
      return {
        unitId: unit.id,
        unitName: unit.name,
        score: -999,
        reasons: [],
        disqualified: true,
        disqualifyReason: 'Home is in a flood plain — not suitable as a weather rally point.',
      }
    }

    // Scoring
    if (unit.hasBasement) {
      score += 30
      reasons.push('Has a basement (tornado shelter)')
    }

    if (unit.hasSafeRoom) {
      score += 15
      reasons.push('Has a designated safe room')
    }

    // We don't have shelter capacity here — that's on the RallyPoint.
    // Score by number of members in the household as proxy for space.
    score += unit.members.length * 5
    reasons.push(`${unit.members.length} household members (space proxy)`)

    const hasGasVehicle = unit.vehicles.some(
      v => v.fuelType === 'gas' || v.fuelType === 'diesel'
    )
    if (hasGasVehicle) {
      score += 10
      reasons.push('Has gas vehicle(s)')
    }

    return {
      unitId: unit.id,
      unitName: unit.name,
      score,
      reasons,
      disqualified: false,
    }
  }).sort((a, b) => b.score - a.score)
}

// ── "Bring this" list per unit ───────────────────────────────────────────────

export interface BringItem {
  name: string
  reason: string
  critical: boolean
}

export function computeBringList(
  rallyPoint: RallyPoint,
  arrivingUnits: FamilyUnit[],
): BringItem[] {
  const res: RallyPointResources = rallyPoint.resources
  const items: BringItem[] = []

  const totalPeople = arrivingUnits.reduce((sum, u) => sum + u.members.length, 0)
  const hasInfants = arrivingUnits.some(u =>
    u.members.some(m => m.age <= 1)
  )
  const hasPets = arrivingUnits.some(u => u.pets.length > 0)

  if (!res.hasGenerator) {
    items.push({ name: 'Generator + fuel', reason: 'Rally point has no generator', critical: true })
  }

  if (res.waterGallons < totalPeople * 3) {
    const needed = totalPeople * 3 - res.waterGallons
    items.push({
      name: `Water (${needed}+ gallons)`,
      reason: `Rally point has ${res.waterGallons} gal; need ${totalPeople * 3} gal for 3 days`,
      critical: true,
    })
  }

  if (res.foodDays < 3) {
    items.push({ name: '3-day food supply for your unit', reason: 'Rally point food supply is limited', critical: true })
  }

  if (!res.hasFirstAidKit) {
    items.push({ name: 'First aid kit', reason: 'Rally point has no first aid kit', critical: false })
  }

  if (!res.hasNOAARadio) {
    items.push({ name: 'NOAA weather radio', reason: 'Rally point has no NOAA radio', critical: false })
  }

  if (!res.hasFRSRadios) {
    items.push({ name: 'FRS walkie-talkies', reason: 'Rally point has no FRS radios', critical: true })
  }

  if (hasInfants) {
    items.push({ name: 'Ready-to-feed infant formula (72-hour supply)', reason: 'Infant present — sterile formula required', critical: true })
    items.push({ name: 'Diapers, wipes, infant carrier', reason: 'Infant present', critical: true })
  }

  if (hasPets) {
    items.push({ name: 'Pet food + vet records', reason: 'Pets traveling with your unit', critical: false })
  }

  return items
}

// ── Supply duration calculation ──────────────────────────────────────────────

export interface SupplyDuration {
  resource: string
  daysRemaining: number
  status: 'ok' | 'warning' | 'critical'
  note: string
}

export function computeSupplyDurations(
  inventory: PrepInventoryItem[],
  _unitCount: number,
): SupplyDuration[] {
  // Simplified — uses quantity strings from inventory to derive days
  // In future iterations this could be a numeric field
  const durations: SupplyDuration[] = []

  const waterItems = inventory.filter(i => i.category === 'Water' && i.status === 'have')
  if (waterItems.length === 0) {
    durations.push({ resource: 'Water', daysRemaining: 0, status: 'critical', note: 'No stored water on hand' })
  } else {
    durations.push({ resource: 'Water', daysRemaining: 3, status: 'warning', note: 'Estimate — verify stored quantity' })
  }

  const foodItems = inventory.filter(i => i.category === 'Food' && i.status === 'have')
  if (foodItems.length === 0) {
    durations.push({ resource: 'Food', daysRemaining: 0, status: 'critical', note: 'No emergency food on hand' })
  } else {
    durations.push({ resource: 'Food', daysRemaining: 7, status: 'ok', note: 'Estimate — verify pantry supply' })
  }

  return durations
}

// ── Full plan summary for display ────────────────────────────────────────────

export interface PlanSummary {
  isComplete: boolean
  missingSteps: string[]
  unitCount: number
  clusterCount: number
  rallyPointCount: number
  hasPassphrase: boolean
  hasCommunicationPlan: boolean
  hasInventory: boolean
  evCoordinations: EVCoordination[]
}

export function summarizePlan(plan: FamilyPlan): PlanSummary {
  const missingSteps: string[] = []

  if (plan.units.length === 0) missingSteps.push('Add at least one family unit')
  if (plan.rallyPoints.length === 0) missingSteps.push('Set up rally points')
  if (!plan.communication) missingSteps.push('Complete communication plan')
  if (plan.departureSignals.length === 0) missingSteps.push('Set departure signal protocol')
  if (!plan.passphrase) missingSteps.push('Set family passphrase')

  return {
    isComplete: missingSteps.length === 0,
    missingSteps,
    unitCount: plan.units.length,
    clusterCount: plan.clusters.length,
    rallyPointCount: plan.rallyPoints.length,
    hasPassphrase: plan.passphrase !== null,
    hasCommunicationPlan: plan.communication !== null,
    hasInventory: plan.prepInventory.length > 0,
    evCoordinations: plan.evCoordinations,
  }
}
