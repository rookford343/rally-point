import { useFamilyPlan } from '../../store/family-plan'
import { formatShortDate } from '../../lib/print'

// Single-page condensed reference card for the glove box.
// All visible chrome is intentionally minimal — large fonts, high contrast.

export function VehicleCopy() {
  const { plan } = useFamilyPlan()

  const coord = plan.communication
  const convergenceHub = plan.convergencePlan
    ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
    : undefined

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '0.25in', fontSize: '11pt', color: '#000' }}>
      <h1 style={{ fontSize: '20pt', fontWeight: 700, margin: 0 }}>
        {plan.planName} — Vehicle Reference
      </h1>
      <p style={{ fontSize: '9pt', color: '#444', marginTop: '2pt' }}>
        Glove box copy · Generated {formatShortDate(plan.updatedAt)}
      </p>

      <hr style={{ margin: '8pt 0', border: 'none', borderTop: '1pt solid #000' }} />

      {/* Rally addresses */}
      <h2 style={{ fontSize: '14pt', margin: '6pt 0 2pt 0', fontWeight: 700 }}>Rally Addresses</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
        <tbody>
          {plan.clusters.map(c => {
            const hub = plan.rallyPoints.find(r => r.id === c.localHubId)
            return (
              <tr key={c.id} style={{ borderBottom: '0.5pt dotted #888' }}>
                <td style={{ padding: '2pt 0', fontWeight: 600, verticalAlign: 'top' }}>{c.name}</td>
                <td style={{ padding: '2pt 0' }}>{hub?.name ?? '(no hub)'}</td>
                <td style={{ padding: '2pt 0', textAlign: 'right' }}>{hub?.address ?? '(no address)'}</td>
              </tr>
            )
          })}
          {convergenceHub && (
            <tr style={{ borderBottom: '1pt solid #000', borderTop: '1pt solid #000' }}>
              <td style={{ padding: '4pt 0', fontWeight: 700 }}>Convergence (after day {plan.convergencePlan?.convergenceDayThreshold ?? 3})</td>
              <td style={{ padding: '4pt 0' }}>{convergenceHub.name}</td>
              <td style={{ padding: '4pt 0', textAlign: 'right', fontWeight: 600 }}>{convergenceHub.address}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Coordinator */}
      {coord?.outOfStateCoordinatorName && (
        <>
          <h2 style={{ fontSize: '14pt', margin: '10pt 0 2pt 0', fontWeight: 700 }}>Out-of-State Coordinator</h2>
          <p style={{ fontSize: '13pt', fontWeight: 700, margin: '2pt 0' }}>
            {coord.outOfStateCoordinatorName}
          </p>
          {coord.outOfStateCoordinatorPhone && (
            <p style={{ fontSize: '13pt', fontFamily: 'monospace', margin: 0 }}>
              {coord.outOfStateCoordinatorPhone}
            </p>
          )}
          {coord.outOfStateCoordinatorRelationship && (
            <p style={{ fontSize: '9pt', color: '#444' }}>({coord.outOfStateCoordinatorRelationship})</p>
          )}
        </>
      )}

      {/* FRS channels */}
      <h2 style={{ fontSize: '14pt', margin: '10pt 0 2pt 0', fontWeight: 700 }}>Family Radio Service (FRS) Channels</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11pt' }}>
        <tbody>
          {plan.units.map(u => {
            const ch = coord?.frsChannels.find(c => c.unitId === u.id)
            return (
              <tr key={u.id}>
                <td style={{ padding: '2pt 0' }}>{u.name}</td>
                <td style={{ padding: '2pt 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                  {ch ? `Ch ${ch.channel}` : '(none)'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ fontSize: '10pt', margin: '4pt 0' }}>
        Check-ins: <strong>{coord?.checkInTimes.join(' / ') ?? '08:00 / 12:00 / 18:00'}</strong>
      </p>

      {/* 4-hour rule */}
      <div style={{ border: '2pt solid #000', padding: '6pt', margin: '10pt 0' }}>
        <p style={{ fontSize: '13pt', fontWeight: 700, margin: 0, textAlign: 'center' }}>
          4-HOUR RULE
        </p>
        <p style={{ fontSize: '10pt', margin: '4pt 0 0 0', textAlign: 'center' }}>
          No contact with family after 4 hours of trying every method →{' '}
          <strong>activate rally protocol</strong> and go to your cluster hub.
        </p>
      </div>

      {/* Passphrase */}
      <h2 style={{ fontSize: '14pt', margin: '10pt 0 2pt 0', fontWeight: 700 }}>Passphrase</h2>
      <p style={{ fontSize: '12pt', margin: '2pt 0' }}>
        Challenge: <strong>"{plan.passphrase?.challengeWord ?? '(not set)'}"</strong>
      </p>
      <p style={{ fontSize: '12pt', margin: '2pt 0' }}>
        Response: <strong>"{plan.passphrase?.responsePhrase ?? '(not set)'}"</strong>
      </p>

      {/* Route notes */}
      <h2 style={{ fontSize: '14pt', margin: '10pt 0 2pt 0', fontWeight: 700 }}>Route Notes</h2>
      <ul style={{ fontSize: '10pt', margin: '2pt 0', paddingLeft: '14pt' }}>
        <li>Avoid I-69 and US-31 in the first hour of any major evacuation order.</li>
        <li>Prefer county roads to major corridors.</li>
        <li>Do not drive through standing water — 6" moves an adult, 12" floats a car.</li>
        <li>Highway overpasses are tornado wind tunnels — never shelter there.</li>
      </ul>
    </div>
  )
}
