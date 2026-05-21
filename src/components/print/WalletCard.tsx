import { useFamilyPlan } from '../../store/family-plan'
import type { FamilyUnit, FamilyPlan } from '../../types/plan'

// A single wallet-size card per family unit, plus one "child version" card
// per minor in the household. 4 cards per printed page in a 2x2 grid via the
// .wallet-grid + .wallet-card classes defined in index.css.

interface CardCommonData {
  planName: string
  primaryHub: string
  secondaryHub: string
  coordName?: string
  coordPhone?: string
  frsChannel: string
  checkIns: string
  fourHourRule: string
  signalLocation: string
  codeA: string
  codeB: string
  challenge: string
  response: string
}

function buildCommon(unit: FamilyUnit, data: FamilyPlan): CardCommonData {
  const cluster = data.clusters.find(c => c.unitIds.includes(unit.id))
  const primary = cluster ? data.rallyPoints.find(r => r.id === cluster.localHubId) : undefined
  const secondary = data.convergencePlan
    ? data.rallyPoints.find(r => r.id === data.convergencePlan?.fullConvergenceHubId)
    : undefined
  const ch = data.communication?.frsChannels.find(c => c.unitId === unit.id)
  const sig = data.departureSignals.find(s => s.unitId === unit.id)
  return {
    planName: data.planName,
    primaryHub: primary?.address ?? '(not set)',
    secondaryHub: secondary?.address ?? '(not set)',
    coordName: data.communication?.outOfStateCoordinatorName,
    coordPhone: data.communication?.outOfStateCoordinatorPhone,
    frsChannel: ch ? `Ch ${ch.channel}` : '(not set)',
    checkIns: data.communication?.checkInTimes.join(' / ') ?? '08:00 / 12:00 / 18:00',
    fourHourRule: '4-hour rule: no contact ≥ 4hr → cluster hub',
    signalLocation: sig?.signalLocation ?? '(not set)',
    codeA: sig?.codeA ?? 'A',
    codeB: sig?.codeB ?? 'B',
    challenge: data.passphrase?.challengeWord ?? '(not set)',
    response: data.passphrase?.responsePhrase ?? '(not set)',
  }
}

interface SingleProps { unit: FamilyUnit; common: CardCommonData; childName?: string }

function StandardCard({ unit, common }: SingleProps) {
  return (
    <div className="wallet-card">
      <div style={{ fontWeight: 700, marginBottom: '2pt', fontSize: '8pt' }}>
        {common.planName} — {unit.name}
      </div>
      <div>
        <strong>Primary hub:</strong> {common.primaryHub}
      </div>
      <div>
        <strong>Convergence hub:</strong> {common.secondaryHub}
      </div>
      {common.coordName && (
        <div>
          <strong>Coordinator:</strong> {common.coordName}{common.coordPhone ? ` · ${common.coordPhone}` : ''}
        </div>
      )}
      <div>
        <strong>FRS:</strong> {common.frsChannel} · {common.checkIns}
      </div>
      <div style={{ marginTop: '2pt' }}>{common.fourHourRule}</div>
      <div style={{ marginTop: '2pt' }}>
        <strong>Signal:</strong> note at {common.signalLocation}.{' '}
        "{common.codeA}" → primary · "{common.codeB}" → convergence
      </div>
      <div>
        <strong>Pass:</strong> "{common.challenge}" → "{common.response}"
      </div>
    </div>
  )
}

function ChildCard({ unit, common, childName }: SingleProps) {
  return (
    <div className="wallet-card" style={{ borderStyle: 'dashed' }}>
      <div style={{ fontWeight: 700, marginBottom: '2pt', fontSize: '8pt' }}>
        For {childName} — {unit.name}
      </div>
      <div style={{ fontSize: '8pt', marginBottom: '2pt' }}>
        If anyone tries to pick you up:
      </div>
      <div>
        Ask: <strong>"{common.challenge}"</strong>
      </div>
      <div>
        Right answer: <strong>"{common.response}"</strong>
      </div>
      <div style={{ marginTop: '2pt' }}>
        Wrong answer? Stay where you are. Tell a teacher.
      </div>
      <div style={{ marginTop: '2pt' }}>
        Family meets at: <strong>{common.primaryHub}</strong>
      </div>
      {common.coordName && (
        <div>
          If we can't talk: {common.coordName}{common.coordPhone ? ` · ${common.coordPhone}` : ''}
        </div>
      )}
    </div>
  )
}

export function WalletCard() {
  const { plan } = useFamilyPlan()

  // Build the full list of cards: one per unit, plus one per minor.
  const cards: { kind: 'standard' | 'child'; unit: FamilyUnit; childName?: string }[] = []
  for (const unit of plan.units) {
    cards.push({ kind: 'standard', unit })
    for (const member of unit.members) {
      if (member.age < 18 && member.age > 0) {
        cards.push({ kind: 'child', unit, childName: member.name || 'child' })
      }
    }
  }

  // Pad to a multiple of 4 with blank slots so the grid stays clean across pages.
  while (cards.length % 4 !== 0) {
    cards.push({ kind: 'standard', unit: { ...plan.units[0], name: '' } as FamilyUnit })
    if (cards.length > 200) break // safety
  }

  return (
    <div className="wallet-grid">
      {cards.map((c, i) => {
        if (!c.unit.id) {
          return <div key={i} className="wallet-card" style={{ borderStyle: 'dotted', opacity: 0.3 }} />
        }
        const common = buildCommon(c.unit, plan)
        return c.kind === 'child'
          ? <ChildCard key={i} unit={c.unit} common={common} childName={c.childName} />
          : <StandardCard key={i} unit={c.unit} common={common} />
      })}
    </div>
  )
}
