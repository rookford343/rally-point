import { useRef, useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SCENARIOS, PROBABILITY_LABELS } from '../../data/scenarios/index'
import type { ProbabilityTier } from '../../data/scenarios/index'
import { computeSupplyDurations } from '../../lib/plan-generator'
import { printLayout } from '../../lib/print'
import { exportPlan, importPlanFromFile } from '../../lib/export-import'
import { DecisionTree } from './DecisionTree'
import { ScenarioPlaybook } from './ScenarioPlaybook'
import { RallyPointCard } from './RallyPointCard'
import { RoutesPanel } from './RoutesPanel'
import { WalletCard } from '../print/WalletCard'
import { FullBinder } from '../print/FullBinder'
import { VehicleCopy } from '../print/VehicleCopy'
import { FlowChart } from '../print/FlowChart'
import { SensitiveInventory as SensitiveInventoryPrint } from '../print/SensitiveInventory'
import type { ScenarioId } from '../../types/plan'

interface Props {
  onBackToWizard: () => void
}

const TIER_STYLES: Record<ProbabilityTier, string> = {
  'very-high': 'bg-red-600 text-white',
  'high': 'bg-orange-500 text-white',
  'moderate': 'bg-amber-500 text-white',
  'low': 'bg-blue-500 text-white',
  'very-low': 'bg-gray-500 text-white',
}

export function PlanDashboard({ onBackToWizard }: Props) {
  const { plan, loadPlan } = useFamilyPlan()
  const [showTree, setShowTree] = useState(false)
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const imported = await importPlanFromFile(file)
      if (window.confirm(`Replace your current plan with "${imported.planName}"?`)) {
        loadPlan(imported)
        setImportError(null)
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  if (showTree) {
    return <DecisionTree onClose={() => setShowTree(false)} />
  }

  if (activeScenario) {
    return (
      <ScenarioPlaybook
        scenarioId={activeScenario}
        onBack={() => setActiveScenario(null)}
      />
    )
  }

  const supplyDurations = computeSupplyDurations(plan.prepInventory, plan.units.length)

  function clusterUnits(clusterId: string) {
    const cluster = plan.clusters.find(c => c.id === clusterId)
    if (!cluster) return []
    return plan.units.filter(u => cluster.unitIds.includes(u.id))
  }

  function clusterHub(clusterId: string) {
    const cluster = plan.clusters.find(c => c.id === clusterId)
    if (!cluster) return undefined
    return plan.rallyPoints.find(r => r.id === cluster.localHubId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{plan.planName}</h1>
            <p className="text-xs text-gray-500">
              {plan.units.length} unit(s) · {plan.clusters.length} cluster(s) · last updated {new Date(plan.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onBackToWizard}>← Edit Plan</Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 no-print">
        {/* Hero: launch decision tree */}
        <Card className="bg-gradient-to-br from-blue-900 to-blue-700 text-white border-0">
          <div className="text-center py-3">
            <h2 className="text-2xl font-bold mb-1">Something is happening.</h2>
            <p className="text-blue-100 mb-4">Don't think — just answer questions.</p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowTree(true)}
              className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8"
            >
              What Do I Do Right Now? →
            </Button>
          </div>
        </Card>

        {/* Quick print actions */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            Print formats
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => printLayout('wallet-cards')}>
              Wallet Cards
            </Button>
            <Button variant="secondary" size="sm" onClick={() => printLayout('binder')}>
              Full Binder
            </Button>
            <Button variant="secondary" size="sm" onClick={() => printLayout('vehicle-copy')}>
              Vehicle Copy
            </Button>
            <Button variant="secondary" size="sm" onClick={() => printLayout('flowchart')}>
              Decision Flowchart
            </Button>
            <Button variant="secondary" size="sm" onClick={() => printLayout('sensitive')}>
              Sensitive Inventory
            </Button>
          </div>
        </div>

        {/* Export / Import */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            Backup & Restore
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="secondary" size="sm" onClick={() => exportPlan(plan)}>
              Export Plan
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Import Plan
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          {importError && (
            <p className="mt-2 text-sm text-red-600">{importError}</p>
          )}
        </div>

        {/* Scenarios grid */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
            Scenarios — ordered by likelihood
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className="text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-colors active:bg-gray-100"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">{s.title}</h4>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${TIER_STYLES[s.probabilityTier]}`}>
                    {s.probabilityTier}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{PROBABILITY_LABELS[s.probabilityTier]}</p>
                <p className="text-sm text-gray-700 line-clamp-2">{s.probabilityLabel}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cluster overview */}
        {plan.clusters.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Rally Point Clusters
            </h3>
            <div className="space-y-4">
              {plan.clusters.map(c => {
                const units = clusterUnits(c.id)
                const hub = clusterHub(c.id)
                return (
                  <div key={c.id}>
                    <div className="mb-2">
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <p className="text-xs text-gray-500">
                        Units: {units.map(u => u.name).join(', ') || '(none)'}
                      </p>
                    </div>
                    {hub ? (
                      <RallyPointCard rallyPoint={hub} arrivingUnits={units} />
                    ) : (
                      <Card variant="warning">
                        <p className="text-sm text-amber-800">No hub assigned to this cluster.</p>
                      </Card>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Routes */}
        <RoutesPanel />

        {/* Documents plan */}
        {plan.documentsPlan && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Important Documents
            </h3>
            <Card>
              {plan.documentsPlan.storageLocation && (
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Location: {plan.documentsPlan.storageLocation}
                </p>
              )}
              {plan.documentsPlan.protectionMethods.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Protection: {plan.documentsPlan.protectionMethods.join(', ')}
                </p>
              )}
              <div className="flex gap-4 text-sm">
                <span className="text-green-700 font-medium">
                  {plan.documentsPlan.items.filter(i => i.status === 'have').length} ready
                </span>
                <span className="text-amber-700 font-medium">
                  {plan.documentsPlan.items.filter(i => i.status === 'need').length} still needed
                </span>
                <span className="text-blue-700 font-medium">
                  {plan.documentsPlan.items.filter(i => i.digitalCopy).length} with digital copy
                </span>
              </div>
              {plan.documentsPlan.items.filter(i => i.status === 'need').length > 0 && (
                <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                  Still needed: {plan.documentsPlan.items.filter(i => i.status === 'need').map(i => i.name).join(', ')}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Supply durations */}
        {supplyDurations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Supplies on Hand
            </h3>
            <Card>
              <ul className="text-sm space-y-1">
                {supplyDurations.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={
                      d.status === 'critical' ? 'text-red-600' :
                      d.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                    }>
                      ●
                    </span>
                    <span className="font-medium">{d.resource}:</span>
                    <span>{d.daysRemaining} day{d.daysRemaining === 1 ? '' : 's'}</span>
                    <span className="text-gray-500 text-xs">— {d.note}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Away-from-home protocols */}
        {plan.awayProtocols.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Away-From-Home Protocols
            </h3>
            <div className="space-y-3">
              {plan.awayProtocols.map(ap => {
                const member = plan.units.flatMap(u => u.members).find(m => m.id === ap.memberId)
                if (!member) return null
                return (
                  <Card key={ap.memberId}>
                    <h4 className="font-bold text-gray-900 mb-1">{member.name}</h4>
                    {member.awayLocation && (
                      <p className="text-xs text-gray-500 mb-2">
                        Typically away at: {member.awayLocation.description} — {member.awayLocation.address}
                      </p>
                    )}
                    <dl className="text-sm space-y-1">
                      <div><dt className="inline font-medium text-gray-700">Local: </dt><dd className="inline text-gray-600">{ap.localInstruction}</dd></div>
                      <div><dt className="inline font-medium text-gray-700">In-state: </dt><dd className="inline text-gray-600">{ap.inStateInstruction}</dd></div>
                      <div><dt className="inline font-medium text-gray-700">Out-of-state: </dt><dd className="inline text-gray-600">{ap.outOfStateInstruction}</dd></div>
                      {ap.schoolPickupPassphraseNote && (
                        <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                          <strong>School pickup:</strong> {ap.schoolPickupPassphraseNote}
                        </div>
                      )}
                    </dl>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* EV summary */}
        {plan.evCoordinations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Electric Vehicle (EV) Coordination
            </h3>
            <Card variant="warning">
              {plan.evCoordinations.map(evc => {
                const evUnit = plan.units.find(u => u.id === evc.evUnitId)
                const gasUnit = plan.units.find(u => u.id === evc.pickupByUnitId)
                return (
                  <p key={evc.evUnitId} className="text-sm text-amber-900">
                    ⚡ <strong>{evUnit?.name}</strong> picked up by{' '}
                    <strong>{gasUnit?.name}</strong> at{' '}
                    <span className="font-mono">{evc.coordinationAddress}</span>{' '}
                    ({evc.availableSeats} seats)
                  </p>
                )
              })}
            </Card>
          </div>
        )}
      </div>

      {/* Print-only mount points. The print CSS class on <body> reveals only
          one of these at a time; all others remain display:none in print. */}
      <div className="print-only-wallet-cards"><WalletCard /></div>
      <div className="print-only-binder"><FullBinder /></div>
      <div className="print-only-vehicle-copy"><VehicleCopy /></div>
      <div className="print-only-flowchart"><FlowChart /></div>
      <div className="print-only-sensitive"><SensitiveInventoryPrint /></div>
    </div>
  )
}
