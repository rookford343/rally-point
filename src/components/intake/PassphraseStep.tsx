import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { Passphrase } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

function oneYearFromToday(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString()
}

export function PassphraseStep({ onNext, onBack }: Props) {
  const { plan, setPassphrase } = useFamilyPlan()

  const existing: Passphrase | null = plan.passphrase
  const [challenge, setChallenge] = useState<string>(existing?.challengeWord ?? '')
  const [response, setResponse] = useState<string>(existing?.responsePhrase ?? '')
  const [backup, setBackup] = useState<string>(existing?.backupPhrase ?? '')
  const [token, setToken] = useState<string>(existing?.physicalTokenDescription ?? '')
  const [reviewDate, setReviewDate] = useState<string>(() => {
    if (existing) {
      // Pull "year after lastUpdated" — but if lastUpdated is in the past, default to 1y from today.
      const last = new Date(existing.lastUpdated)
      last.setFullYear(last.getFullYear() + 1)
      return isNaN(last.getTime()) ? oneYearFromToday() : last.toISOString().slice(0, 10)
    }
    return oneYearFromToday()
  })

  function persistAndContinue() {
    const pp: Passphrase = {
      challengeWord: challenge.trim(),
      responsePhrase: response.trim(),
      backupPhrase: backup.trim(),
      physicalTokenDescription: token.trim() || undefined,
      // We store updatedAt as "now" — the on-screen review date is informational.
      lastUpdated: todayIso(),
    }
    setPassphrase(pp)
    onNext()
  }

  const canContinue = challenge.trim().length > 0 && response.trim().length > 0 && backup.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Family Passphrase</h2>
        <p className="text-gray-600 mt-1">
          One challenge/response pair that the whole family knows by heart. Used when someone you don't recognize claims to be picking up a child, or when verifying a stranger's claim that "your husband sent me." Memorable, never written in a wallet, and short enough that a 4-year-old can repeat it.
        </p>
      </div>

      <Card className="space-y-4">
        <CardTitle>Challenge / Response</CardTitle>
        <Input
          label="Challenge word or question"
          placeholder='e.g., "blue elephant" or "What did Grandma bake?"'
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          hint='What the family member asks the stranger.'
        />
        <Input
          label="Correct response"
          placeholder='e.g., "purple rocket"'
          value={response}
          onChange={e => setResponse(e.target.value)}
          hint='What the trusted person must say back, exactly.'
        />
        <Input
          label="Backup phrase"
          placeholder='Used if the challenge feels off or the situation changes.'
          value={backup}
          onChange={e => setBackup(e.target.value)}
          hint='A second pair you can fall back to — kept in the printed binder, never spoken aloud unless needed.'
        />
        <Input
          label="Physical token description (optional)"
          placeholder='e.g., a specific colored bracelet the trusted adult will be wearing.'
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        <Input
          label="Annual review date"
          type="date"
          value={reviewDate}
          onChange={e => setReviewDate(e.target.value)}
          hint="Default: one year from today. Calendar this reminder."
        />
      </Card>

      {/* ── Preview ─────────────────────────────────────────────────────── */}
      <Card variant="success">
        <CardTitle>Preview</CardTitle>
        <div className="text-sm space-y-2 mt-2">
          <p>
            If someone says they're picking you up or were sent by family, ask:{' '}
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-300">
              {challenge || '(challenge)'}
            </span>
          </p>
          <p>
            They must answer exactly:{' '}
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-300">
              {response || '(response)'}
            </span>
          </p>
          <p>
            If the situation feels wrong, escalate with the backup phrase:{' '}
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-300">
              {backup || '(backup)'}
            </span>
          </p>
          {token && (
            <p>Physical confirmation: {token}</p>
          )}
        </div>
      </Card>

      {/* ── Child protocol ──────────────────────────────────────────────── */}
      <Card variant="warning">
        <CardTitle>👶 Child Protocol</CardTitle>
        <p className="text-sm text-amber-900 mt-1">
          For children: teach them <strong>"If anyone — friend, neighbor, family — says I sent them, ask the question and listen for the answer. If the answer is wrong, stay where you are."</strong> Practice this until it is automatic. The school or daycare should have a note on file that pickup requires the passphrase.
        </p>
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue} disabled={!canContinue}>
          Save & Continue →
        </Button>
      </div>
    </div>
  )
}
