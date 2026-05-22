import { useState, useEffect } from 'react'
import { useFamilyPlan } from './store/family-plan'
import { WizardContainer } from './components/intake/WizardContainer'
import { PlanDashboard } from './components/plan/PlanDashboard'
import { DEMO_PLAN } from './demo/seed-data'

const TOTAL_WIZARD_STEPS = 12

export default function App() {
  const { plan, loadPlan, resetPlan } = useFamilyPlan()
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [forcedView, setForcedView] = useState<'wizard' | 'dashboard' | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isGitHubPages = window.location.hostname.endsWith('.github.io')
    const isPlanEmpty = plan.completedSteps.length === 0
    if (params.get('demo') === 'true' || (isGitHubPages && isPlanEmpty)) {
      loadPlan(DEMO_PLAN)
      setIsDemoMode(true)
      setForcedView('dashboard')
    }
  }, [loadPlan, plan.completedSteps.length])

  const wizardComplete = plan.completedSteps.length >= TOTAL_WIZARD_STEPS
  const view = forcedView ?? (wizardComplete ? 'dashboard' : 'wizard')

  function exitDemo() {
    resetPlan()
    setIsDemoMode(false)
    setForcedView('wizard')
    const url = new URL(window.location.href)
    url.searchParams.delete('demo')
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isDemoMode && (
        <div className="bg-amber-400 text-amber-900 no-print">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <span className="font-semibold text-sm">
              DEMO MODE — sample Hamilton County family plan. Your data is not affected.
            </span>
            <button
              onClick={exitDemo}
              className="shrink-0 text-sm font-bold bg-amber-900 text-amber-50 px-3 py-1 rounded hover:bg-amber-800 transition-colors"
            >
              Start My Own Plan →
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 no-print">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            🏠 <span>Rally Point</span>
            <span className="text-gray-400 font-normal text-sm">— {plan.planName}</span>
          </div>
          {view === 'wizard' && wizardComplete && (
            <button
              onClick={() => setForcedView('dashboard')}
              className="text-sm text-blue-900 hover:underline"
            >
              View Plan →
            </button>
          )}
          {view === 'dashboard' && !isDemoMode && (
            <button
              onClick={() => setForcedView('wizard')}
              className="text-sm text-blue-900 hover:underline"
            >
              ← Back to wizard
            </button>
          )}
        </div>
      </header>

      {view === 'wizard' ? (
        <WizardContainer onComplete={() => setForcedView('dashboard')} />
      ) : (
        <PlanDashboard onBackToWizard={() => setForcedView('wizard')} />
      )}
    </div>
  )
}
