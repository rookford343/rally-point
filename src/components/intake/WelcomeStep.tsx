import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useFamilyPlan } from '../../store/family-plan'

interface Props {
  onNext: () => void
  onBack: () => void
}

export function WelcomeStep({ onNext }: Props) {
  const { plan, setPlanName } = useFamilyPlan()

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-900 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
          🏠 Rally Point
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your family's plan when everything else fails.
        </h1>
        <p className="text-gray-600">
          This tool builds a customized family disaster response plan — one that works without phones, internet, or GPS. Every plan you create is stored only on this device and can be printed for use when power and connectivity are gone.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <h2 className="font-semibold text-blue-900">What you'll get</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Scenario playbooks ordered by actual likelihood, not fear</li>
          <li>✓ Geographic cluster model — nearby families rally together first</li>
          <li>✓ EV coordination for households without gas vehicles</li>
          <li>✓ Departure signals, family passphrase, and away-from-home protocols</li>
          <li>✓ Printable wallet cards, binder, vehicle copy, and decision flowchart</li>
          <li>✓ Offline-capable — works without internet once loaded</li>
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h2 className="font-semibold text-amber-900 mb-1">🔒 Your data stays here</h2>
        <p className="text-sm text-amber-800">
          Everything you enter is stored only in your browser's local storage. Nothing is transmitted to any server. This app works completely offline. See the Privacy doc for details on how to delete your data.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Name your plan"
          placeholder="e.g., Ford Family Disaster Plan 2025"
          value={plan.planName}
          onChange={e => setPlanName(e.target.value)}
          hint="This appears on all printed documents."
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg">
          Start Building Your Plan →
        </Button>
      </div>
    </div>
  )
}
