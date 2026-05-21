import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { DepartureSignal } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

const LOCATION_SUGGESTIONS = [
  'Inside the mailbox',
  'Taped under the porch railing',
  'In the meter box',
  'Under the welcome mat',
  'Inside the garden gnome',
  'Behind the loose brick by the back door',
]

function defaultSignal(unitId: string): DepartureSignal {
  return {
    unitId,
    signalLocation: 'Inside the mailbox',
    codeA: 'A',
    codeB: 'B',
    visualMarker: 'Red ribbon tied to the porch railing (left side)',
  }
}

export function DepartureSignalStep({ onNext, onBack }: Props) {
  const { plan, setDepartureSignals } = useFamilyPlan()

  const [signals, setSignals] = useState<Record<string, DepartureSignal>>(() => {
    const map: Record<string, DepartureSignal> = {}
    for (const u of plan.units) {
      const existing = plan.departureSignals.find(s => s.unitId === u.id)
      map[u.id] = existing ?? defaultSignal(u.id)
    }
    return map
  })

  function update<K extends keyof DepartureSignal>(unitId: string, field: K, value: DepartureSignal[K]) {
    setSignals(prev => ({
      ...prev,
      [unitId]: { ...prev[unitId], [field]: value },
    }))
  }

  function persistAndContinue() {
    setDepartureSignals(Object.values(signals))
    onNext()
  }

  // Resolve cluster-hub and convergence-hub addresses for the preview text
  function rallyContext(unitId: string): { primary: string; convergence: string } {
    const cluster = plan.clusters.find(c => c.unitIds.includes(unitId))
    const primaryHub = cluster ? plan.rallyPoints.find(r => r.id === cluster.localHubId) : undefined
    const convergenceHub = plan.convergencePlan
      ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
      : undefined
    return {
      primary: primaryHub?.address ?? '(not set — finish Rally Points)',
      convergence: convergenceHub?.address ?? '(not set — finish Rally Points)',
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Departure Signal</h2>
        <p className="text-gray-600 mt-1">
          When your unit evacuates, leave a brief written code at a pre-agreed spot so anyone who shows up afterward knows where you went — without giving information away to strangers.
        </p>
      </div>

      <Card variant="warning">
        <p className="text-sm text-amber-900">
          <strong>How the code works:</strong> "A" = the primary cluster hub. "B" = the convergence hub. Single letters keep the note useless to strangers but instantly meaningful to family.
        </p>
      </Card>

      {plan.units.map(unit => {
        const sig = signals[unit.id]
        if (!sig) return null
        const ctx = rallyContext(unit.id)
        return (
          <Card key={unit.id} className="space-y-4">
            <CardTitle>{unit.name}</CardTitle>
            <p className="text-sm text-gray-600 -mt-1">{unit.address}</p>

            <Input
              label="Signal location (hidden spot where you leave the note)"
              value={sig.signalLocation}
              onChange={e => update(unit.id, 'signalLocation', e.target.value)}
              hint="Suggestions: inside mailbox, taped under porch railing, in the meter box, under welcome mat."
              list={`loc-suggestions-${unit.id}`}
            />
            <datalist id={`loc-suggestions-${unit.id}`}>
              {LOCATION_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Code A meaning"
                value={sig.codeA}
                onChange={e => update(unit.id, 'codeA', e.target.value)}
                hint={`Default "A" = primary cluster hub (${ctx.primary})`}
              />
              <Input
                label="Code B meaning"
                value={sig.codeB}
                onChange={e => update(unit.id, 'codeB', e.target.value)}
                hint={`Default "B" = convergence hub (${ctx.convergence})`}
              />
            </div>

            <Input
              label="Visual marker (optional — placed where it can be seen from the street)"
              value={sig.visualMarker ?? ''}
              onChange={e => update(unit.id, 'visualMarker', e.target.value)}
              hint="e.g., red ribbon on porch railing. Lets family confirm at a glance you left."
            />

            {/* Print preview */}
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 font-mono text-xs">
              <div className="font-bold mb-1">— Departure Signal Card (preview) —</div>
              <div>{unit.name} — {unit.address}</div>
              <div className="mt-1">
                Note is hidden at: <strong>{sig.signalLocation}</strong>
              </div>
              <div>
                Visual marker out: <strong>{sig.visualMarker || '(none)'}</strong>
              </div>
              <div className="mt-2">Note contents:</div>
              <div className="pl-2 mt-1 border-l-2 border-gray-400">
                <div>"{sig.codeA}" = primary cluster hub → {ctx.primary}</div>
                <div>"{sig.codeB}" = convergence hub → {ctx.convergence}</div>
                <div>Date / time left: ________</div>
              </div>
            </div>
          </Card>
        )
      })}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue} disabled={plan.units.length === 0}>
          Save & Continue →
        </Button>
      </div>
    </div>
  )
}
