import { useFamilyPlan } from '../../store/family-plan'

// Pure-CSS/HTML decision flowchart for printing.
// Diamonds (decisions) and rectangles (terminal actions) are rendered with
// inline styles. Border patterns convey urgency for B&W printing:
//   solid       = monitor / shelter
//   double      = activate rally
//   dashed-bold = critical evacuation / shelter
//
// The chart is structured top-down by hazard family. It's intentionally
// terse — meant as a wall poster or foldable insert, not a tutorial.

interface DiamondProps { children: React.ReactNode; width?: string }

function Diamond({ children, width = '2.4in' }: DiamondProps) {
  return (
    <div style={{
      width,
      minHeight: '0.8in',
      margin: '4pt auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6pt',
      textAlign: 'center',
      fontSize: '9pt',
      fontWeight: 600,
      border: '1pt solid #000',
      transform: 'rotate(45deg)',
      position: 'relative',
    }}>
      <div style={{ transform: 'rotate(-45deg)', width: '90%' }}>{children}</div>
    </div>
  )
}

interface ActionProps {
  children: React.ReactNode
  urgency: 'shelter' | 'rally' | 'evac'
  width?: string
}

function ActionBox({ children, urgency, width = '2.6in' }: ActionProps) {
  const borderStyle = urgency === 'evac'
    ? '2pt dashed #000'
    : urgency === 'rally'
    ? '3pt double #000'
    : '1pt solid #000'
  return (
    <div style={{
      width,
      minHeight: '0.45in',
      margin: '2pt auto',
      padding: '4pt',
      textAlign: 'center',
      fontSize: '9pt',
      border: borderStyle,
      background: '#fff',
    }}>
      {children}
    </div>
  )
}

function Arrow() {
  return (
    <div style={{ textAlign: 'center', fontSize: '14pt', margin: '0', lineHeight: 1 }}>↓</div>
  )
}

function Branch({ children }: { children: React.ReactNode }) {
  // A self-contained vertical column representing one hazard branch.
  return (
    <div className="print-break-avoid" style={{
      display: 'inline-block',
      verticalAlign: 'top',
      width: '3in',
      margin: '0 4pt 10pt 4pt',
      padding: '6pt',
      border: '0.5pt dotted #888',
    }}>
      {children}
    </div>
  )
}

export function FlowChart() {
  const { plan } = useFamilyPlan()

  // Personalization context: primary cluster hub, convergence hub, FRS channel, coordinator
  const primaryCluster = plan.clusters[0]
  const primaryHub = primaryCluster
    ? plan.rallyPoints.find(r => r.id === primaryCluster.localHubId)
    : undefined
  const convergenceHub = plan.convergencePlan
    ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
    : undefined
  const firstUnit = plan.units[0]
  const firstChannel = plan.communication?.frsChannels.find(c => c.unitId === firstUnit?.id)
  const hubAddr = primaryHub?.address ?? '(rally point not set)'
  const convAddr = convergenceHub?.address ?? '(convergence hub not set)'
  const channel = firstChannel ? `Ch ${firstChannel.channel}` : '(channel not set)'
  const coord = plan.communication?.outOfStateCoordinatorName ?? '(coordinator not set)'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#000', padding: '0.25in' }}>
      <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0, textAlign: 'center' }}>
        {plan.planName} — Decision Flowchart
      </h1>
      <p style={{ fontSize: '9pt', textAlign: 'center', color: '#444', margin: '2pt 0 10pt 0' }}>
        Primary hub: <strong>{hubAddr}</strong> · Convergence: <strong>{convAddr}</strong> ·{' '}
        FRS: <strong>{channel}</strong> · Coordinator: <strong>{coord}</strong>
      </p>

      <div style={{ textAlign: 'center', fontSize: '9pt', marginBottom: '6pt' }}>
        Legend:
        {' '}<span style={{ border: '1pt solid #000', padding: '0 4pt' }}>monitor / shelter</span>
        {' '}<span style={{ border: '3pt double #000', padding: '0 4pt' }}>activate rally</span>
        {' '}<span style={{ border: '2pt dashed #000', padding: '0 4pt' }}>critical / evacuate</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Diamond>WHAT IS HAPPENING?</Diamond>
      </div>

      <div style={{ textAlign: 'center', marginTop: '8pt' }}>
        <Branch>
          <Diamond>Tornado warning?</Diamond>
          <Arrow />
          <Diamond>Basement?</Diamond>
          <Arrow />
          <ActionBox urgency="shelter">Basement, interior wall, away from windows. Cover infant face-down.</ActionBox>
          <div style={{ fontSize: '8pt', textAlign: 'center', margin: '2pt 0' }}>If mobile home →</div>
          <ActionBox urgency="evac">Leave mobile home NOW. Go to nearest sturdy building or low ditch.</ActionBox>
        </Branch>

        <Branch>
          <Diamond>Flash flood / rising water?</Diamond>
          <Arrow />
          <Diamond>Water approaching first floor?</Diamond>
          <Arrow />
          <ActionBox urgency="evac">Go-bag. Pets. Departure signal. High-ground routes only → {hubAddr}.</ActionBox>
          <div style={{ fontSize: '8pt', textAlign: 'center', margin: '2pt 0' }}>If still in streets only →</div>
          <ActionBox urgency="shelter">Move valuables up. Don't drive through water. Watch for rising.</ActionBox>
        </Branch>

        <Branch>
          <Diamond>Power out?</Diamond>
          <Arrow />
          <Diamond>EV in family AND range &lt; hub?</Diamond>
          <Arrow />
          <ActionBox urgency="rally">EV pickup needed. Coordinate via FRS {channel} or landline.</ActionBox>
          <div style={{ fontSize: '8pt', textAlign: 'center', margin: '4pt 0 2pt 0' }}>Otherwise after day 3 →</div>
          <ActionBox urgency="rally">Activate rally → {hubAddr}.</ActionBox>
        </Branch>

        <Branch>
          <Diamond>Phones / internet down?</Diamond>
          <Arrow />
          <Diamond>Contact within 4 hours?</Diamond>
          <Arrow />
          <ActionBox urgency="shelter">FRS check-ins {channel} at scheduled times. Try landline. Try neighbor with different carrier.</ActionBox>
          <div style={{ fontSize: '8pt', textAlign: 'center', margin: '4pt 0 2pt 0' }}>If no contact after 4hr →</div>
          <ActionBox urgency="rally">4-hour rule. Go-bag. Pets. Departure signal. → {hubAddr}.</ActionBox>
        </Branch>

        <Branch>
          <Diamond>Civil unrest?</Diamond>
          <Arrow />
          <Diamond>Within 1 mile of you?</Diamond>
          <Arrow />
          <ActionBox urgency="shelter">Lock doors. Lights low. Interior room. FRS quietly. Avoid downtown corridors.</ActionBox>
          <div style={{ fontSize: '8pt', textAlign: 'center', margin: '4pt 0 2pt 0' }}>If home directly threatened →</div>
          <ActionBox urgency="evac">Leave via county roads. Do not display weapons. → {hubAddr}.</ActionBox>
        </Branch>

        <Branch>
          <Diamond>NOT at home?</Diamond>
          <Arrow />
          <Diamond>Local / in-state / out-of-state?</Diamond>
          <Arrow />
          <ActionBox urgency="shelter">Local: shelter in place at work/school. Pickup child only with passphrase.</ActionBox>
          <ActionBox urgency="rally">In-state &lt; 50mi: head to → {hubAddr} when safe.</ActionBox>
          <ActionBox urgency="shelter">Out of state: stay put. Call {coord}.</ActionBox>
        </Branch>
      </div>

      {/* Convergence footer */}
      <div style={{ marginTop: '14pt', borderTop: '2pt solid #000', paddingTop: '6pt', textAlign: 'center' }}>
        <p style={{ fontSize: '10pt', margin: '4pt 0' }}>
          <strong>AFTER DAY {plan.convergencePlan?.convergenceDayThreshold ?? 3}:</strong>{' '}
          all clusters converge at {convAddr}.
        </p>
        <p style={{ fontSize: '10pt', margin: '4pt 0' }}>
          <strong>4-HOUR RULE:</strong> no family contact ≥ 4 hours of trying every method → activate rally.
        </p>
        <p style={{ fontSize: '10pt', margin: '4pt 0' }}>
          <strong>OUT-OF-STATE COORDINATOR:</strong> {coord} ·{' '}
          <span style={{ fontFamily: 'monospace' }}>{plan.communication?.outOfStateCoordinatorPhone ?? '(no phone)'}</span>
        </p>
      </div>
    </div>
  )
}
