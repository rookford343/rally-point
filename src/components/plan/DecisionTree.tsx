import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { getNodeById } from '../../decision-tree/nodes'
import type { TerminalAction } from '../../types/plan'

interface Props {
  onClose: () => void
}

const URGENCY_STYLES: Record<TerminalAction['urgency'], string> = {
  critical: 'bg-red-600 text-white border-red-700',
  high: 'bg-orange-600 text-white border-orange-700',
  medium: 'bg-amber-500 text-white border-amber-600',
  low: 'bg-green-600 text-white border-green-700',
}

const URGENCY_BANNER: Record<TerminalAction['urgency'], string> = {
  critical: 'bg-red-100 text-red-900 border-red-300',
  high: 'bg-orange-100 text-orange-900 border-orange-300',
  medium: 'bg-amber-100 text-amber-900 border-amber-300',
  low: 'bg-green-100 text-green-900 border-green-300',
}

// Inject plan-specific data into a terminal action's instruction list.
function personalize(text: string, ctx: {
  primaryHubAddress: string
  convergenceHubAddress: string
  frsChannel: string
  coordinatorName: string
  coordinatorPhone: string
}): string {
  return text
    .replaceAll('[cluster hub address]', ctx.primaryHubAddress)
    .replaceAll('[cluster hub]', ctx.primaryHubAddress)
    .replaceAll('[convergence hub]', ctx.convergenceHubAddress)
    .replaceAll('[your cluster hub]', ctx.primaryHubAddress)
    .replaceAll('[FRS channel]', ctx.frsChannel)
    .replaceAll('[out-of-state coordinator]', ctx.coordinatorName || 'your out-of-state coordinator')
    .replaceAll('[coordinator phone]', ctx.coordinatorPhone || '(no phone on file)')
}

export function DecisionTree({ onClose }: Props) {
  const { plan } = useFamilyPlan()

  // History stack: list of node ids visited. Top of stack = current node.
  const [history, setHistory] = useState<string[]>(['root'])
  const currentId = history[history.length - 1]
  const node = getNodeById(currentId)

  // Build the personalization context once per render.
  // We use the FIRST cluster's hub as the default primary — most plans will
  // have one cluster per device anyway, and the dashboard offers cluster-aware
  // views when there's more than one.
  const primaryCluster = plan.clusters[0]
  const primaryHub = primaryCluster
    ? plan.rallyPoints.find(r => r.id === primaryCluster.localHubId)
    : undefined
  const convergenceHub = plan.convergencePlan
    ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
    : undefined
  const firstUnit = plan.units[0]
  const firstChannel = plan.communication?.frsChannels.find(c => c.unitId === firstUnit?.id)

  const personalContext = {
    primaryHubAddress: primaryHub?.address ?? '(rally point not set)',
    convergenceHubAddress: convergenceHub?.address ?? '(convergence hub not set)',
    frsChannel: firstChannel ? `Ch ${firstChannel.channel}` : '(channel not set)',
    coordinatorName: plan.communication?.outOfStateCoordinatorName ?? '',
    coordinatorPhone: plan.communication?.outOfStateCoordinatorPhone ?? '',
  }

  function pick(nextId: string) {
    setHistory([...history, nextId])
  }

  function restart() {
    setHistory(['root'])
  }

  function goBackOneStep() {
    if (history.length > 1) setHistory(history.slice(0, -1))
  }

  if (!node) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card variant="danger">
          <p>Decision tree error: node "{currentId}" not found.</p>
          <Button onClick={restart} className="mt-3">Start Over</Button>
        </Card>
      </div>
    )
  }

  // Breadcrumb: show the labels we picked to get here
  const breadcrumb: string[] = []
  for (let i = 0; i < history.length - 1; i++) {
    const fromNode = getNodeById(history[i])
    const toId = history[i + 1]
    const opt = fromNode?.options?.find(o => o.nextId === toId)
    if (opt) breadcrumb.push(opt.label)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white sticky top-0 z-10 shadow no-print">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">What Do I Do Right Now?</h1>
            <p className="text-xs text-blue-200">Disaster decision tree</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={restart} className="text-white hover:bg-blue-800">
              Start Over
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-800">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-2xl mx-auto px-4 py-2 text-xs text-gray-600">
            <span className="font-medium">Your path:</span>{' '}
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {b}
                {i < breadcrumb.length - 1 && ' › '}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {node.terminal ? (
          // ── Terminal node: action card ─────────────────────────────────
          <div>
            <div className={`rounded-xl border-2 p-5 ${URGENCY_BANNER[node.terminal.urgency]}`}>
              <div className="flex items-start gap-3">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xl shrink-0 ${URGENCY_STYLES[node.terminal.urgency]}`}>
                  {node.terminal.urgency === 'critical' ? '!' : node.terminal.urgency === 'high' ? '⚠' : 'i'}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase font-bold tracking-wider opacity-75">
                    {node.terminal.urgency} priority
                  </div>
                  <h2 className="text-2xl font-bold mt-1">{node.terminal.title}</h2>
                </div>
              </div>

              <ol className="mt-4 space-y-3">
                {node.terminal.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold shrink-0 w-6 text-right">{i + 1}.</span>
                    <span>{personalize(step, personalContext)}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Plan-specific reference card */}
            <Card className="mt-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
                Your plan info
              </p>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Primary cluster hub:</dt>
                  <dd className="font-mono text-right">{personalContext.primaryHubAddress}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Convergence hub:</dt>
                  <dd className="font-mono text-right">{personalContext.convergenceHubAddress}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">FRS channel:</dt>
                  <dd className="font-mono text-right">{personalContext.frsChannel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-600">Out-of-state coordinator:</dt>
                  <dd className="text-right">
                    {personalContext.coordinatorName || '(not set)'}
                    {personalContext.coordinatorPhone && (
                      <span className="block font-mono text-xs">{personalContext.coordinatorPhone}</span>
                    )}
                  </dd>
                </div>
              </dl>
            </Card>

            <div className="flex gap-3 mt-4">
              <Button variant="secondary" onClick={goBackOneStep} className="flex-1">
                ← One step back
              </Button>
              <Button onClick={restart} className="flex-1">
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          // ── Question node: option buttons ──────────────────────────────
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{node.question}</h2>
            {node.context && <p className="text-gray-600 mb-4">{node.context}</p>}

            <div className="space-y-3">
              {node.options?.map(opt => (
                <button
                  key={opt.nextId}
                  onClick={() => pick(opt.nextId)}
                  className="w-full text-left bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl p-4 text-base font-medium text-gray-900 transition-colors active:bg-blue-100"
                >
                  {opt.label}
                  <span className="float-right text-gray-400">→</span>
                </button>
              ))}
            </div>

            {history.length > 1 && (
              <Button variant="secondary" onClick={goBackOneStep} className="mt-4 w-full">
                ← One step back
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
