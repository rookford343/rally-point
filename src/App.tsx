import { useState } from 'react'
import { useFamilyPlan } from './store/family-plan'
import { WizardContainer } from './components/intake/WizardContainer'
import { PlanDashboard } from './components/plan/PlanDashboard'

// The wizard has 11 total steps (indices 0–10). When all 11 are marked
// complete the app naturally lands on the dashboard. The user can also force
// "view dashboard" by clicking the View Plan button (handled inline below)
// and likewise return to the wizard from the dashboard.
const TOTAL_WIZARD_STEPS = 11

export default function App() {
  const { plan } = useFamilyPlan()

  // Default view: wizard if not all steps complete, dashboard otherwise.
  // forcedView lets the user toggle into the dashboard early (or back to the
  // wizard from the dashboard).
  const wizardComplete = plan.completedSteps.length >= TOTAL_WIZARD_STEPS
  const [forcedView, setForcedView] = useState<'wizard' | 'dashboard' | null>(null)

  const view = forcedView ?? (wizardComplete ? 'dashboard' : 'wizard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Slim app header — shown on every view, hidden in print */}
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
          {view === 'dashboard' && (
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
