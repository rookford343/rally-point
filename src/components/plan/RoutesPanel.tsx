import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { buildGoogleMapsUrl } from '../../lib/routing'
import type { RouteOption } from '../../types/plan'

function formatMiles(m: number) {
  return m < 10 ? m.toFixed(1) : Math.round(m).toString()
}

function formatStep(maneuver: string, street: string, miles: number) {
  const dir = maneuver.charAt(0).toUpperCase() + maneuver.slice(1)
  return `${dir} onto ${street} (${formatMiles(miles)} mi)`
}

function RouteCard({ route, fromAddress, toAddress }: {
  route: RouteOption
  fromAddress: string
  toAddress: string
}) {
  const [expanded, setExpanded] = useState(false)
  const mapsUrl = buildGoogleMapsUrl(fromAddress, toAddress)

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{route.label}</span>
            {route.autoCalculated && (
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">auto-calculated</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-0.5">
            <strong>{formatMiles(route.totalMiles)} mi</strong>
            {' · '}
            <strong>~{route.estimatedMinutes} min</strong>
            {route.heavyTrafficMinutes && (
              <span className="text-gray-500"> (~{route.heavyTrafficMinutes} min heavy traffic)</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{route.useWhen}</p>
          {route.avoidRoads.length > 0 && (
            <p className="text-xs text-amber-700 mt-1">
              Avoid: {route.avoidRoads.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {route.steps.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)}>
              {expanded ? '▲ Steps' : '▼ Steps'}
            </Button>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            Maps ↗
          </a>
        </div>
      </div>

      {expanded && route.steps.length > 0 && (
        <ol className="mt-3 space-y-1 text-xs text-gray-700 list-decimal list-inside border-t border-gray-200 pt-2">
          {route.steps.map((step, i) => (
            <li key={i}>{formatStep(step.maneuver, step.streetName, step.distanceMiles)}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function RoutesPanel() {
  const { plan } = useFamilyPlan()

  if (!plan.unitRoutes || plan.unitRoutes.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
        Pre-Planned Routes to Rally Points
      </h3>
      <div className="space-y-4">
        {plan.unitRoutes.map(ur => {
          const unit = plan.units.find(u => u.id === ur.unitId)
          const hub = plan.rallyPoints.find(r => r.id === ur.toHubId)
          if (!unit || !hub) return null

          return (
            <Card key={`${ur.unitId}-${ur.toHubId}`}>
              <div className="mb-2">
                <h4 className="font-bold text-gray-900 text-sm">
                  {unit.name} → {hub.name}
                </h4>
                {ur.lastCalculated && (
                  <p className="text-xs text-gray-400">
                    Calculated {new Date(ur.lastCalculated).toLocaleDateString()}
                  </p>
                )}
                {ur.researchNotes && (
                  <p className="text-xs text-gray-600 mt-1 italic">{ur.researchNotes}</p>
                )}
              </div>
              <div className="space-y-2">
                {ur.routes.map((route, i) => (
                  <RouteCard
                    key={i}
                    route={route}
                    fromAddress={unit.address}
                    toAddress={hub.address}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
