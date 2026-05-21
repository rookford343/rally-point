import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { summarizePlan, computeSupplyDurations } from '../../lib/plan-generator'
import { printLayout } from '../../lib/print'

interface Props { onNext: () => void; onBack: () => void }

interface Check {
  label: string
  ok: boolean
  detail?: string
}

export function ReviewStep({ onNext, onBack }: Props) {
  const { plan } = useFamilyPlan()
  const summary = summarizePlan(plan)
  const supplyDurations = computeSupplyDurations(plan.prepInventory, plan.units.length)

  const checks: Check[] = [
    { label: 'Family units defined', ok: plan.units.length > 0, detail: `${plan.units.length} unit(s)` },
    {
      label: 'Pets recorded (or confirmed none)',
      ok: plan.units.length > 0,
      detail: `${plan.units.reduce((sum, u) => sum + u.pets.length, 0)} pet(s) across all units`,
    },
    {
      label: 'Rally points and clusters set',
      ok: plan.clusters.length > 0 && plan.rallyPoints.length > 0,
      detail: `${plan.clusters.length} cluster(s), ${plan.rallyPoints.length} rally point(s)`,
    },
    {
      label: 'Away-from-home protocols',
      ok: plan.awayProtocols.length > 0 || plan.units.every(u => u.members.every(m => !m.awayLocation)),
      detail: plan.awayProtocols.length > 0 ? `${plan.awayProtocols.length} member protocol(s)` : 'No members have away locations defined',
    },
    {
      label: 'Communication plan',
      ok: summary.hasCommunicationPlan,
      detail: plan.communication
        ? `Coordinator: ${plan.communication.outOfStateCoordinatorName || '(missing)'}, ${plan.communication.frsChannels.length} FRS channel(s)`
        : 'Not yet set',
    },
    {
      label: 'Departure signals',
      ok: plan.departureSignals.length === plan.units.length && plan.units.length > 0,
      detail: `${plan.departureSignals.length}/${plan.units.length} unit(s) configured`,
    },
    {
      label: 'Family passphrase',
      ok: summary.hasPassphrase,
      detail: plan.passphrase ? 'Challenge / response set' : 'Not yet set',
    },
    {
      label: 'Supplies inventoried',
      ok: summary.hasInventory,
      detail: summary.hasInventory ? `${plan.prepInventory.length} item(s) tracked` : 'No inventory recorded',
    },
  ]

  const allReady = checks.every(c => c.ok)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Generate</h2>
        <p className="text-gray-600 mt-1">
          Final check before generating your printable plan. Green checks mean a section is complete. Red warnings mean a section needs attention — you can jump back to fix it.
        </p>
      </div>

      <Card variant={allReady ? 'success' : 'warning'}>
        <CardTitle>
          {allReady ? '✓ Your plan is ready' : '⚠ A few items need attention'}
        </CardTitle>
        {allReady ? (
          <p className="text-sm text-green-800 mt-1">
            Everything looks complete. You can print your wallet cards, binder, vehicle copy, and decision flowchart from the dashboard.
          </p>
        ) : (
          <p className="text-sm text-amber-800 mt-1">
            You can continue and finish later — the plan will still work for sections that are complete, but printed documents will note the gaps.
          </p>
        )}
      </Card>

      {/* Section checklist */}
      <Card>
        <CardTitle>Section completeness</CardTitle>
        <ul className="mt-2 space-y-2">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className={c.ok ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {c.ok ? '✓' : '✗'}
              </span>
              <div>
                <div className={c.ok ? 'text-gray-800' : 'text-red-800 font-medium'}>{c.label}</div>
                {c.detail && <div className="text-xs text-gray-500">{c.detail}</div>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* EV coordination summary */}
      {plan.evCoordinations.length > 0 && (
        <Card variant="warning">
          <CardTitle>⚡ EV Coordination</CardTitle>
          {plan.evCoordinations.map(evc => {
            const evUnit = plan.units.find(u => u.id === evc.evUnitId)
            const gasUnit = plan.units.find(u => u.id === evc.pickupByUnitId)
            return (
              <p key={evc.evUnitId} className="text-sm text-amber-900 mt-1">
                <strong>{evUnit?.name}</strong> (EV-only) → pickup by{' '}
                <strong>{gasUnit?.name}</strong> at{' '}
                <span className="font-mono">{evc.coordinationAddress}</span>.
              </p>
            )
          })}
        </Card>
      )}

      {/* Supply durations */}
      <Card>
        <CardTitle>Supply Duration Estimates</CardTitle>
        {supplyDurations.length === 0 ? (
          <p className="text-sm text-gray-600">No inventory data yet.</p>
        ) : (
          <ul className="text-sm mt-2 space-y-1">
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
        )}
      </Card>

      {/* Print quick links */}
      <Card>
        <CardTitle>Print formats</CardTitle>
        <p className="text-xs text-gray-500 mb-3">
          You can also access these from the dashboard.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => printLayout('wallet-cards')}>
            Print Wallet Cards
          </Button>
          <Button variant="secondary" size="sm" onClick={() => printLayout('binder')}>
            Print Full Binder
          </Button>
          <Button variant="secondary" size="sm" onClick={() => printLayout('vehicle-copy')}>
            Print Vehicle Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={() => printLayout('flowchart')}>
            Print Decision Flowchart
          </Button>
        </div>
      </Card>

      <Card variant="success">
        <p className="text-sm text-green-900">
          🔒 <strong>Privacy reminder:</strong> Everything you've entered stays in this browser only. Nothing was sent over a network. To remove your plan: clear this site's local storage in your browser's settings.
        </p>
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} size="lg">
          {allReady ? 'Open Plan Dashboard →' : 'Continue Anyway →'}
        </Button>
      </div>
    </div>
  )
}
