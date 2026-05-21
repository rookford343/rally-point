import { useState, useEffect } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { calculateRoute, buildGoogleMapsUrl } from '../../lib/routing'
import type { UnitRoute, RouteOption } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

interface PairState {
  unitId: string
  unitName: string
  unitAddress: string
  hubId: string
  hubName: string
  hubAddress: string
  hasCoords: boolean
  loading: boolean
  route: RouteOption | null
  avoidRoads: string
  notes: string
}

export function RouteReviewStep({ onNext, onBack }: Props) {
  const { plan, setUnitRoutes } = useFamilyPlan()
  const [pairs, setPairs] = useState<PairState[]>([])

  useEffect(() => {
    const initialPairs: PairState[] = []
    for (const cluster of plan.clusters) {
      const hub = plan.rallyPoints.find(r => r.id === cluster.localHubId)
      if (!hub) continue
      for (const unitId of cluster.unitIds) {
        const unit = plan.units.find(u => u.id === unitId)
        if (!unit) continue
        const existing = plan.unitRoutes.find(r => r.unitId === unitId && r.toHubId === hub.id)
        const existingRoute = existing?.routes[0] ?? null
        initialPairs.push({
          unitId: unit.id,
          unitName: unit.name,
          unitAddress: unit.address,
          hubId: hub.id,
          hubName: hub.name,
          hubAddress: hub.address,
          hasCoords: unit.lat != null && unit.lng != null && hub.lat != null && hub.lng != null,
          loading: false,
          route: existingRoute,
          avoidRoads: existing?.routes[0]?.avoidRoads.join(', ') ?? '',
          notes: existing?.researchNotes ?? '',
        })
      }
    }
    setPairs(initialPairs)
  }, [])

  useEffect(() => {
    pairs.forEach((pair, i) => {
      if (!pair.hasCoords || pair.route || pair.loading) return
      const unit = plan.units.find(u => u.id === pair.unitId)
      const hub = plan.rallyPoints.find(r => r.id === pair.hubId)
      if (!unit?.lat || !unit?.lng || !hub?.lat || !hub?.lng) return

      setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, loading: true } : p))
      calculateRoute(
        { lat: unit.lat, lng: unit.lng },
        { lat: hub.lat, lng: hub.lng },
      ).then(route => {
        setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, loading: false, route } : p))
      })
    })
  }, [pairs.map(p => p.hasCoords).join(',')])

  function updatePair(i: number, field: 'avoidRoads' | 'notes', value: string) {
    setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function saveAndContinue() {
    const routes: UnitRoute[] = pairs.map(pair => {
      const baseRoute = pair.route ?? {
        label: 'Primary',
        steps: [],
        totalMiles: 0,
        estimatedMinutes: 0,
        avoidRoads: [],
        useWhen: 'Default route',
        autoCalculated: false,
      }
      return {
        unitId: pair.unitId,
        toHubId: pair.hubId,
        routes: [{
          ...baseRoute,
          avoidRoads: pair.avoidRoads.split(',').map(r => r.trim()).filter(Boolean),
        }],
        lastCalculated: pair.route ? new Date().toISOString() : undefined,
        researchNotes: pair.notes || undefined,
      }
    })
    setUnitRoutes(routes)
    onNext()
  }

  if (pairs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Your Routes</h2>
          <p className="text-gray-600 mt-1">
            No unit–hub pairings found. Make sure you have family units assigned to clusters with rally points.
          </p>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onBack}>← Back</Button>
          <Button onClick={onNext}>Skip →</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Routes</h2>
        <p className="text-gray-600 mt-1">
          Routes were auto-calculated from your addresses. Confirm the path looks right and add any roads to avoid based on local knowledge — these notes are used when real-time navigation is unavailable.
        </p>
      </div>

      {pairs.map((pair, i) => (
        <Card key={`${pair.unitId}-${pair.hubId}`} className="space-y-4">
          <CardTitle>{pair.unitName} → {pair.hubName}</CardTitle>

          {pair.loading && (
            <p className="text-sm text-gray-500 italic">Calculating route…</p>
          )}

          {!pair.loading && !pair.hasCoords && !pair.route && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              Address coordinates not available — route auto-calculation requires geocoding to complete. Save this step and return later, or enter notes manually.
            </div>
          )}

          {pair.route && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Auto-calculated route</span>
                <span className="text-sm text-gray-500">
                  {pair.route.totalMiles.toFixed(1)} mi · ~{pair.route.estimatedMinutes} min (no traffic)
                </span>
              </div>
              {pair.route.steps.length > 0 && (
                <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                  {pair.route.steps.slice(0, 8).map((step, si) => (
                    <li key={si}>{step.streetName} ({(step.distanceMiles).toFixed(1)} mi)</li>
                  ))}
                  {pair.route.steps.length > 8 && (
                    <li className="text-gray-400">…{pair.route.steps.length - 8} more steps</li>
                  )}
                </ol>
              )}
              <a
                href={buildGoogleMapsUrl(pair.unitAddress, pair.hubAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Open in Google Maps ↗
              </a>
            </div>
          )}

          <Input
            label="Roads to avoid (based on local knowledge)"
            placeholder="e.g., US-31, I-69 first hour of any evacuation"
            value={pair.avoidRoads}
            onChange={e => updatePair(i, 'avoidRoads', e.target.value)}
            hint="Separate multiple roads with commas. These print in your binder and vehicle copy."
          />

          <Input
            label="Local notes (optional)"
            placeholder="e.g., During rush hour use SR-32 through Noblesville instead"
            value={pair.notes}
            onChange={e => updatePair(i, 'notes', e.target.value)}
          />
        </Card>
      ))}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={saveAndContinue}>Save & Continue →</Button>
      </div>
    </div>
  )
}
