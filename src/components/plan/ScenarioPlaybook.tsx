import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { getScenarioById, PROBABILITY_LABELS } from '../../data/scenarios/index'
import type { ProbabilityTier, Scenario } from '../../data/scenarios/index'
import type { ScenarioId } from '../../types/plan'

interface Props {
  scenarioId: ScenarioId
  onBack: () => void
}

const TIER_STYLES: Record<ProbabilityTier, string> = {
  'very-high': 'bg-red-600 text-white',
  'high': 'bg-orange-500 text-white',
  'moderate': 'bg-amber-500 text-white',
  'low': 'bg-blue-500 text-white',
  'very-low': 'bg-gray-500 text-white',
}

// Substitute family-specific fields where the scenarios use bracketed tokens.
function personalize(text: string, ctx: { rally: string; channel: string }): string {
  return text
    .replaceAll('[assigned]', ctx.channel)
    .replaceAll('[location]', '(see your printed plan)')
    .replaceAll('[your home address]', '(your home)')
    .replaceAll('[cluster hub address]', ctx.rally)
    .replaceAll('[cluster hub]', ctx.rally)
}

function relevantNotes(scenario: Scenario, hasInfant: boolean, hasPets: boolean, hasEv: boolean, hasBasement: boolean, hasMobile: boolean): string[] {
  const notes: string[] = []
  if (scenario.personalizedFields.includes('infant') && hasInfant) {
    notes.push('Infant present — review formula and carrier sections.')
  }
  if (scenario.personalizedFields.includes('pets') && hasPets) {
    notes.push('Pets present — load carriers and grab vet records.')
  }
  if (scenario.personalizedFields.includes('ev') && hasEv) {
    notes.push('EV in family — confirm range before any travel decisions.')
  }
  if (scenario.personalizedFields.includes('basement')) {
    notes.push(hasBasement ? 'Your home has a basement — shelter there.' : 'No basement — interior room / bathtub with mattress.')
  }
  if (scenario.personalizedFields.includes('mobileHome') && hasMobile) {
    notes.push('⚠ Mobile home in family — that unit must evacuate to a sturdy structure.')
  }
  return notes
}

export function ScenarioPlaybook({ scenarioId, onBack }: Props) {
  const { plan } = useFamilyPlan()
  const scenario = getScenarioById(scenarioId)
  const [awarenessOpen, setAwarenessOpen] = useState(false)

  if (!scenario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card variant="danger">
          <p>Scenario "{scenarioId}" not found.</p>
          <Button onClick={onBack} className="mt-3">← Back</Button>
        </Card>
      </div>
    )
  }

  // Personalization context
  const primaryCluster = plan.clusters[0]
  const primaryHub = primaryCluster
    ? plan.rallyPoints.find(r => r.id === primaryCluster.localHubId)
    : undefined
  const firstUnit = plan.units[0]
  const firstChannel = plan.communication?.frsChannels.find(c => c.unitId === firstUnit?.id)

  const ctx = {
    rally: primaryHub?.address ?? '(rally point not set)',
    channel: firstChannel ? `Ch ${firstChannel.channel}` : '(channel not set)',
  }

  const hasInfant = plan.units.some(u => u.members.some(m => m.age <= 1))
  const hasPets = plan.units.some(u => u.pets.length > 0)
  const hasEv = plan.units.some(u =>
    u.vehicles.length > 0 && u.vehicles.every(v => v.fuelType === 'electric'),
  )
  const hasBasement = plan.units.some(u => u.hasBasement)
  const hasMobile = plan.units.some(u => u.homeType === 'mobile')

  const notes = relevantNotes(scenario, hasInfant, hasPets, hasEv, hasBasement, hasMobile)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onBack}>← Back to dashboard</Button>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${TIER_STYLES[scenario.probabilityTier]}`}>
            {scenario.probabilityTier}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{scenario.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {PROBABILITY_LABELS[scenario.probabilityTier]} · {scenario.probabilityLabel}
          </p>
          <p className="text-xs text-gray-400 mt-1">{scenario.sourceNote}</p>
        </div>

        <Card>
          <p className="text-gray-700">{scenario.summary}</p>
        </Card>

        {notes.length > 0 && (
          <Card variant="warning">
            <CardTitle>Personalized notes for your family</CardTitle>
            <ul className="text-sm text-amber-900 mt-1 list-disc list-inside space-y-1">
              {notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </Card>
        )}

        <Card>
          <CardTitle>Trigger Conditions</CardTitle>
          <ul className="text-sm mt-2 space-y-1">
            {scenario.trigger.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue-600 font-bold">▸</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="danger">
          <CardTitle>Immediate Steps</CardTitle>
          <ol className="text-sm mt-2 space-y-2">
            {scenario.immediateSteps.map((step, i) => (
              <li
                key={i}
                className={`flex gap-3 ${step.critical ? 'font-medium text-red-900 bg-red-100 p-2 rounded' : 'text-gray-800'}`}
              >
                <span className="font-bold shrink-0">{i + 1}.</span>
                <span>{personalize(step.text, ctx)}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <CardTitle>Extended Steps (after the immediate window)</CardTitle>
          <ol className="text-sm mt-2 space-y-2">
            {scenario.extendedSteps.map((step, i) => (
              <li
                key={i}
                className={`flex gap-3 ${step.critical ? 'font-medium text-red-900' : 'text-gray-800'}`}
              >
                <span className="font-bold shrink-0 text-gray-500">{i + 1}.</span>
                <span>{personalize(step.text, ctx)}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card variant="warning">
          <CardTitle>Rally Trigger</CardTitle>
          <p className="text-sm text-amber-900 mt-1">{personalize(scenario.rallyTrigger, ctx)}</p>
        </Card>

        <Card>
          <CardTitle>Communications Protocol</CardTitle>
          <ul className="text-sm mt-2 space-y-1">
            {scenario.commsProtocol.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue-600">▸</span>
                <span>{personalize(c, ctx)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <button
            onClick={() => setAwarenessOpen(o => !o)}
            className="w-full flex justify-between items-center text-left"
            aria-expanded={awarenessOpen}
          >
            <CardTitle>{awarenessOpen ? '▾' : '▸'} What to Watch For</CardTitle>
          </button>

          {awarenessOpen && (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Early signals</h4>
                <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                  {scenario.awareness.earlySignals.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Avoid</h4>
                <ul className="list-disc list-inside space-y-0.5 text-red-800">
                  {scenario.awareness.avoid.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              {scenario.awareness.calibration && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <h4 className="font-medium text-blue-900 mb-0.5">Calibration</h4>
                  <p className="text-blue-900">{scenario.awareness.calibration}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
