import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  FamilyPlan,
  FamilyUnit,
  FamilyCluster,
  RallyPoint,
  ConvergencePlan,
  CommunicationPlan,
  DepartureSignal,
  Passphrase,
  AwayProtocol,
  PrepInventoryItem,
  EVCoordination,
  UnitRoute,
  DocumentsPlan,
} from '../types/plan'

const CURRENT_VERSION = 3

function defaultPlan(): FamilyPlan {
  return {
    planName: 'My Family Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
    units: [],
    clusters: [],
    rallyPoints: [],
    convergencePlan: undefined,
    evCoordinations: [],
    communication: null,
    departureSignals: [],
    passphrase: null,
    awayProtocols: [],
    prepInventory: [],
    unitRoutes: [],
    completedSteps: [],
    currentStep: 0,
  }
}

interface FamilyPlanStore {
  plan: FamilyPlan
  // Wizard navigation
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  // Plan name
  setPlanName: (name: string) => void
  // Family units
  addUnit: (unit: FamilyUnit) => void
  updateUnit: (unit: FamilyUnit) => void
  removeUnit: (id: string) => void
  // Clusters
  setClusters: (clusters: FamilyCluster[]) => void
  // Rally points
  addRallyPoint: (rp: RallyPoint) => void
  updateRallyPoint: (rp: RallyPoint) => void
  removeRallyPoint: (id: string) => void
  // Convergence
  setConvergencePlan: (cp: ConvergencePlan) => void
  // EV coordinations (auto-generated)
  setEVCoordinations: (evcs: EVCoordination[]) => void
  // Communication
  setCommunication: (comm: CommunicationPlan) => void
  // Departure signals
  setDepartureSignals: (sigs: DepartureSignal[]) => void
  // Passphrase
  setPassphrase: (pp: Passphrase) => void
  // Away protocols
  setAwayProtocols: (aps: AwayProtocol[]) => void
  // Inventory
  setPrepInventory: (items: PrepInventoryItem[]) => void
  updateInventoryItem: (item: PrepInventoryItem) => void
  // Routes
  setUnitRoutes: (routes: UnitRoute[]) => void
  setUnitCoords: (unitId: string, lat: number, lng: number) => void
  setRallyPointCoords: (rpId: string, lat: number, lng: number) => void
  // Documents
  setDocumentsPlan: (dp: DocumentsPlan) => void
  // Sensitive inventory is stored in a separate localStorage key (see storage.ts)
  // Load a complete plan (used by demo mode)
  loadPlan: (plan: FamilyPlan) => void
  // Full reset
  resetPlan: () => void
}

function touch(plan: FamilyPlan): FamilyPlan {
  return { ...plan, updatedAt: new Date().toISOString() }
}

export const useFamilyPlan = create<FamilyPlanStore>()(
  persist(
    (set) => ({
      plan: defaultPlan(),

      setCurrentStep: (step) =>
        set(s => ({ plan: touch({ ...s.plan, currentStep: step }) })),

      markStepComplete: (step) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            completedSteps: s.plan.completedSteps.includes(step)
              ? s.plan.completedSteps
              : [...s.plan.completedSteps, step],
          }),
        })),

      setPlanName: (name) =>
        set(s => ({ plan: touch({ ...s.plan, planName: name }) })),

      addUnit: (unit) =>
        set(s => ({ plan: touch({ ...s.plan, units: [...s.plan.units, unit] }) })),

      updateUnit: (unit) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            units: s.plan.units.map(u => u.id === unit.id ? unit : u),
          }),
        })),

      removeUnit: (id) =>
        set(s => ({
          plan: touch({ ...s.plan, units: s.plan.units.filter(u => u.id !== id) }),
        })),

      setClusters: (clusters) =>
        set(s => ({ plan: touch({ ...s.plan, clusters }) })),

      addRallyPoint: (rp) =>
        set(s => ({ plan: touch({ ...s.plan, rallyPoints: [...s.plan.rallyPoints, rp] }) })),

      updateRallyPoint: (rp) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            rallyPoints: s.plan.rallyPoints.map(r => r.id === rp.id ? rp : r),
          }),
        })),

      removeRallyPoint: (id) =>
        set(s => ({
          plan: touch({ ...s.plan, rallyPoints: s.plan.rallyPoints.filter(r => r.id !== id) }),
        })),

      setConvergencePlan: (cp) =>
        set(s => ({ plan: touch({ ...s.plan, convergencePlan: cp }) })),

      setEVCoordinations: (evcs) =>
        set(s => ({ plan: touch({ ...s.plan, evCoordinations: evcs }) })),

      setCommunication: (comm) =>
        set(s => ({ plan: touch({ ...s.plan, communication: comm }) })),

      setDepartureSignals: (sigs) =>
        set(s => ({ plan: touch({ ...s.plan, departureSignals: sigs }) })),

      setPassphrase: (pp) =>
        set(s => ({ plan: touch({ ...s.plan, passphrase: pp }) })),

      setAwayProtocols: (aps) =>
        set(s => ({ plan: touch({ ...s.plan, awayProtocols: aps }) })),

      setPrepInventory: (items) =>
        set(s => ({ plan: touch({ ...s.plan, prepInventory: items }) })),

      updateInventoryItem: (item) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            prepInventory: s.plan.prepInventory.map(i => i.id === item.id ? item : i),
          }),
        })),

      setUnitRoutes: (routes) =>
        set(s => ({ plan: touch({ ...s.plan, unitRoutes: routes }) })),

      setUnitCoords: (unitId, lat, lng) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            units: s.plan.units.map(u => u.id === unitId ? { ...u, lat, lng } : u),
          }),
        })),

      setRallyPointCoords: (rpId, lat, lng) =>
        set(s => ({
          plan: touch({
            ...s.plan,
            rallyPoints: s.plan.rallyPoints.map(r => r.id === rpId ? { ...r, lat, lng } : r),
          }),
        })),

      setDocumentsPlan: (dp) =>
        set(s => ({ plan: touch({ ...s.plan, documentsPlan: dp }) })),

      loadPlan: (plan) => set({ plan }),

      resetPlan: () => set({ plan: defaultPlan() }),
    }),
    {
      name: 'rally-point-plan-v1',
      storage: createJSONStorage(() => localStorage),
      version: CURRENT_VERSION,
      migrate: (persistedState, version) => {
        const state = persistedState as { plan: FamilyPlan }
        if (version === 0) {
          return { plan: defaultPlan() }
        }
        if (version === 1) {
          // unitRoutes was added in v2 — backfill for existing stored plans
          return {
            plan: {
              ...state.plan,
              unitRoutes: state.plan.unitRoutes ?? [],
            },
          }
        }
        if (version === 2) {
          // documentsPlan added in v3 — backfill; preserve "complete" status for existing 12-step plans
          const completedSteps = state.plan.completedSteps ?? []
          const wasComplete = completedSteps.length >= 12
          return {
            plan: {
              ...state.plan,
              unitRoutes: state.plan.unitRoutes ?? [],
              documentsPlan: undefined,
              // Add step 12 (new Review index) to keep dashboard access for users who had finished
              completedSteps: wasComplete && !completedSteps.includes(12)
                ? [...completedSteps, 12]
                : completedSteps,
            },
          }
        }
        return state
      },
    }
  )
)

// Sensitive inventory is stored in a separate key to make it easy
// to exclude from any future export features.
const SENSITIVE_KEY = 'rally-point-sensitive-v1'

export function getSensitiveInventory() {
  try {
    const raw = localStorage.getItem(SENSITIVE_KEY)
    return raw ? JSON.parse(raw) : { firearms: [], nonLethal: [] }
  } catch {
    return { firearms: [], nonLethal: [] }
  }
}

export function setSensitiveInventory(data: unknown) {
  localStorage.setItem(SENSITIVE_KEY, JSON.stringify(data))
}
