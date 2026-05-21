import { useFamilyPlan } from '../../store/family-plan'
import { WelcomeStep } from './WelcomeStep'
import { FamilyUnitsStep } from './FamilyUnitsStep'
import { PetsStep } from './PetsStep'
import { RallyPointsStep } from './RallyPointsStep'
import { RouteReviewStep } from './RouteReviewStep'
import { AwayProfilesStep } from './AwayProfilesStep'
import { CommunicationStep } from './CommunicationStep'
import { DepartureSignalStep } from './DepartureSignalStep'
import { PassphraseStep } from './PassphraseStep'
import { SuppliesStep } from './SuppliesStep'
import { PrepInventoryStep } from './PrepInventoryStep'
import { ReviewStep } from './ReviewStep'

const STEPS = [
  { label: 'Welcome', component: WelcomeStep },
  { label: 'Family Units', component: FamilyUnitsStep },
  { label: 'Pets', component: PetsStep },
  { label: 'Rally Points', component: RallyPointsStep },
  { label: 'Routes', component: RouteReviewStep },
  { label: 'Away Profiles', component: AwayProfilesStep },
  { label: 'Communications', component: CommunicationStep },
  { label: 'Departure Signal', component: DepartureSignalStep },
  { label: 'Passphrase', component: PassphraseStep },
  { label: 'Supplies', component: SuppliesStep },
  { label: 'Inventory', component: PrepInventoryStep },
  { label: 'Review & Generate', component: ReviewStep },
]

interface Props {
  onComplete: () => void
}

export function WizardContainer({ onComplete }: Props) {
  const { plan, setCurrentStep, markStepComplete } = useFamilyPlan()
  const currentStep = plan.currentStep
  const StepComponent = STEPS[currentStep].component

  function goNext() {
    markStepComplete(currentStep)
    if (currentStep === STEPS.length - 1) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  function goToStep(i: number) {
    setCurrentStep(i)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-xs text-gray-500">
              {plan.completedSteps.length} of {STEPS.length} complete
            </span>
          </div>
          {/* Step tabs */}
          <div className="flex gap-1 flex-wrap">
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  i === currentStep
                    ? 'bg-blue-900 text-white'
                    : plan.completedSteps.includes(i)
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
          {/* Progress bar fill */}
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-900 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <StepComponent onNext={goNext} onBack={goBack} />
      </div>
    </div>
  )
}
