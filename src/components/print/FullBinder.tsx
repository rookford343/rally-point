import { useFamilyPlan } from '../../store/family-plan'
import { SCENARIOS, PROBABILITY_LABELS } from '../../data/scenarios/index'
import { GO_BAG_ITEMS, HOME_SUPPLIES } from '../../data/checklists/index'
import { computeBringList, computeSupplyDurations } from '../../lib/plan-generator'
import { formatDate } from '../../lib/print'

// Print binder — large, multi-section. Each tab starts on a new printed page
// via .print-break-before (defined in index.css).

const sectionStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '10pt',
  lineHeight: 1.4,
  color: '#000',
  padding: '0.25in 0',
}

const h1Style: React.CSSProperties = { fontSize: '20pt', fontWeight: 700, margin: '0 0 6pt 0' }
const h2Style: React.CSSProperties = { fontSize: '14pt', fontWeight: 700, margin: '14pt 0 4pt 0', borderBottom: '1pt solid #000', paddingBottom: '2pt' }
const h3Style: React.CSSProperties = { fontSize: '12pt', fontWeight: 700, margin: '8pt 0 2pt 0' }
const tabHeader: React.CSSProperties = { background: '#000', color: '#fff', padding: '6pt 10pt', fontSize: '11pt', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }

export function FullBinder() {
  const { plan } = useFamilyPlan()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#000' }}>
      {/* ── Cover ───────────────────────────────────────────────────── */}
      <div style={{ ...sectionStyle, textAlign: 'center', paddingTop: '2in' }}>
        <h1 style={{ fontSize: '32pt', fontWeight: 700, margin: 0 }}>{plan.planName}</h1>
        <p style={{ fontSize: '14pt', marginTop: '12pt' }}>Family Disaster Response Plan</p>
        <p style={{ fontSize: '11pt', marginTop: '8pt', color: '#444' }}>
          Generated {formatDate(plan.updatedAt)}
        </p>
        <hr style={{ width: '40%', margin: '24pt auto', borderTop: '1pt solid #000', borderStyle: 'solid none none none' }} />
        <p style={{ fontSize: '11pt' }}>Family Units</p>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '12pt', fontWeight: 600 }}>
          {plan.units.map(u => <li key={u.id}>{u.name}</li>)}
        </ul>
      </div>

      {/* ── TAB 1: Communication ────────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 1 — COMMUNICATION PLAN</div>
        <h1 style={h1Style}>Communication Plan</h1>

        {plan.communication?.outOfStateCoordinatorName && (
          <>
            <h2 style={h2Style}>Out-of-State Coordinator</h2>
            <p style={{ fontSize: '13pt' }}>
              <strong>{plan.communication.outOfStateCoordinatorName}</strong>
              {plan.communication.outOfStateCoordinatorPhone && (
                <> · <span style={{ fontFamily: 'monospace' }}>{plan.communication.outOfStateCoordinatorPhone}</span></>
              )}
              {plan.communication.outOfStateCoordinatorRelationship && ` (${plan.communication.outOfStateCoordinatorRelationship})`}
            </p>
            <p style={{ fontSize: '10pt', color: '#444' }}>
              Every family member calls this person when local lines are down. They relay status across clusters.
            </p>
          </>
        )}

        <h2 style={h2Style}>Family Radio Service (FRS) Radio Assignments</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Family Unit</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Channel</th>
            </tr>
          </thead>
          <tbody>
            {plan.units.map(u => {
              const ch = plan.communication?.frsChannels.find(c => c.unitId === u.id)
              return (
                <tr key={u.id}>
                  <td style={{ padding: '3pt 6pt', borderBottom: '0.5pt dotted #888' }}>{u.name}</td>
                  <td style={{ padding: '3pt 6pt', borderBottom: '0.5pt dotted #888', fontFamily: 'monospace' }}>
                    {ch ? `Ch ${ch.channel}` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '10pt', marginTop: '6pt' }}>
          <strong>Check-in times:</strong>{' '}
          {plan.communication?.checkInTimes.join(' · ') ?? '08:00 · 12:00 · 18:00'}
        </p>

        <h2 style={h2Style}>Electric Vehicle (EV) Coordination</h2>
        {plan.evCoordinations.length === 0 ? (
          <p style={{ fontSize: '10pt' }}>None — all units have gas/hybrid vehicles.</p>
        ) : (
          <ul>
            {plan.evCoordinations.map(evc => {
              const ev = plan.units.find(u => u.id === evc.evUnitId)
              const gas = plan.units.find(u => u.id === evc.pickupByUnitId)
              return (
                <li key={evc.evUnitId}>
                  <strong>{ev?.name}</strong> (EV-only) → picked up by <strong>{gas?.name}</strong> at{' '}
                  <span style={{ fontFamily: 'monospace' }}>{evc.coordinationAddress}</span> · {evc.availableSeats} seats
                </li>
              )
            })}
          </ul>
        )}

        <h2 style={h2Style}>Neighbor Contacts</h2>
        {plan.communication?.neighborContacts.length ? (
          <ul>
            {plan.communication.neighborContacts.map((n, i) => (
              <li key={i}>
                <strong>{n.name}</strong> — {n.address}{n.phone && ` · ${n.phone}`}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: '10pt' }}>None recorded.</p>
        )}

        {plan.communication?.hasMeshtastic && (
          <>
            <h2 style={h2Style}>Meshtastic / LoRa Mesh Radio</h2>
            <p style={{ fontSize: '10pt' }}>
              <strong>Nodes:</strong> {plan.communication.meshtasticNodes ?? 0}
              {plan.communication.meshtasticChannelName && (
                <> · <strong>Channel:</strong> <span style={{ fontFamily: 'monospace' }}>{plan.communication.meshtasticChannelName}</span></>
              )}
              {plan.communication.meshtasticEncryptionEnabled !== undefined && (
                <> · Encryption: {plan.communication.meshtasticEncryptionEnabled ? 'on' : 'off'}</>
              )}
            </p>
            <p style={{ fontSize: '10pt' }}>
              No internet or cell signal required. In a telecom failure, send position + status on your shared channel.
              Range: 1–10+ miles depending on terrain. All nodes relay messages automatically.
            </p>
          </>
        )}
        {plan.communication?.hasHamRadio && plan.communication.hamCallsign && (
          <p style={{ fontSize: '10pt' }}>Ham callsign: <strong>{plan.communication.hamCallsign}</strong></p>
        )}
        {plan.communication?.hasNOAARadio && (
          <p style={{ fontSize: '10pt' }}>NOAA radio: {plan.communication.noaaModel ?? '(model unspecified)'}</p>
        )}
      </div>

      {/* ── TAB 1b: Away Profiles ───────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 1b — AWAY-FROM-HOME PROFILES</div>
        <h1 style={h1Style}>Away-From-Home Protocols</h1>
        {plan.awayProtocols.length === 0 ? (
          <p>No away profiles recorded.</p>
        ) : (
          plan.awayProtocols.map(ap => {
            const member = plan.units.flatMap(u => u.members).find(m => m.id === ap.memberId)
            if (!member) return null
            return (
              <div key={ap.memberId} className="print-break-avoid" style={{ marginBottom: '12pt' }}>
                <h3 style={h3Style}>{member.name}</h3>
                {member.awayLocation && (
                  <p style={{ fontSize: '9pt', color: '#444', margin: '0 0 4pt 0' }}>
                    Away at: {member.awayLocation.description} — {member.awayLocation.address}
                  </p>
                )}
                <p style={{ fontSize: '10pt' }}><strong>Local:</strong> {ap.localInstruction}</p>
                <p style={{ fontSize: '10pt' }}><strong>In-state:</strong> {ap.inStateInstruction}</p>
                <p style={{ fontSize: '10pt' }}><strong>Out-of-state:</strong> {ap.outOfStateInstruction}</p>
                {ap.schoolPickupPassphraseNote && (
                  <p style={{ fontSize: '10pt' }}><strong>School pickup:</strong> {ap.schoolPickupPassphraseNote}</p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── TAB 2: Rally Points ─────────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 2 — RALLY POINTS</div>
        <h1 style={h1Style}>Rally Points</h1>

        {plan.clusters.map(cluster => {
          const units = plan.units.filter(u => cluster.unitIds.includes(u.id))
          const hub = plan.rallyPoints.find(r => r.id === cluster.localHubId)
          if (!hub) return null
          const bring = computeBringList(hub, units)
          return (
            <div key={cluster.id} className="print-break-avoid" style={{ marginBottom: '14pt' }}>
              <h2 style={h2Style}>{cluster.name}</h2>
              <p>
                <strong>{hub.name}</strong> — <span style={{ fontFamily: 'monospace' }}>{hub.address}</span>
              </p>
              <p style={{ fontSize: '10pt', color: '#444' }}>
                Units: {units.map(u => u.name).join(', ')}
              </p>
              <p style={{ fontSize: '10pt' }}>
                Resources: water {hub.resources.waterGallons}gal · food {hub.resources.foodDays}d · capacity {hub.resources.shelterCapacity}{' '}
                {hub.resources.hasGenerator ? '· generator ✓' : ''}{' '}
                {hub.resources.hasFirstAidKit ? '· first aid ✓' : ''}{' '}
                {hub.resources.hasNOAARadio ? '· NOAA ✓' : ''}{' '}
                {hub.resources.hasFRSRadios ? '· FRS ✓' : ''}
              </p>
              {bring.length > 0 && (
                <>
                  <h3 style={h3Style}>Bring this:</h3>
                  <ul style={{ fontSize: '10pt' }}>
                    {bring.map((item, i) => (
                      <li key={i}>
                        {item.critical ? '⚠ ' : ''}{item.name} — {item.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )
        })}

        {plan.convergencePlan && (
          <div className="print-break-avoid" style={{ marginTop: '14pt' }}>
            <h2 style={h2Style}>Convergence Hub</h2>
            {(() => {
              const hub = plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
              if (!hub) return <p>Not set.</p>
              return (
                <p>
                  After day {plan.convergencePlan?.convergenceDayThreshold ?? 3}: all clusters converge at{' '}
                  <strong>{hub.name}</strong> — <span style={{ fontFamily: 'monospace' }}>{hub.address}</span>
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* ── TAB 3: Departure Signals ────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 3 — DEPARTURE SIGNAL CARDS</div>
        <h1 style={h1Style}>Departure Signals</h1>
        {plan.departureSignals.map(sig => {
          const unit = plan.units.find(u => u.id === sig.unitId)
          if (!unit) return null
          const cluster = plan.clusters.find(c => c.unitIds.includes(unit.id))
          const primary = cluster ? plan.rallyPoints.find(r => r.id === cluster.localHubId) : undefined
          const convergence = plan.convergencePlan
            ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
            : undefined
          return (
            <div key={sig.unitId} className="print-break-avoid" style={{ border: '1pt solid #000', padding: '8pt', marginBottom: '10pt' }}>
              <h3 style={h3Style}>{unit.name} — {unit.address}</h3>
              <p style={{ fontSize: '10pt' }}>Note hidden at: <strong>{sig.signalLocation}</strong></p>
              {sig.visualMarker && <p style={{ fontSize: '10pt' }}>Visual marker: <strong>{sig.visualMarker}</strong></p>}
              <p style={{ fontSize: '10pt' }}>
                "{sig.codeA}" = primary hub → <span style={{ fontFamily: 'monospace' }}>{primary?.address ?? '(not set)'}</span>
              </p>
              <p style={{ fontSize: '10pt' }}>
                "{sig.codeB}" = convergence → <span style={{ fontFamily: 'monospace' }}>{convergence?.address ?? '(not set)'}</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* ── TAB 4: Passphrase ───────────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 4 — PASSPHRASE</div>
        <h1 style={h1Style}>Family Passphrase</h1>
        {plan.passphrase ? (
          <>
            <p style={{ fontSize: '13pt' }}>Challenge: <strong>"{plan.passphrase.challengeWord}"</strong></p>
            <p style={{ fontSize: '13pt' }}>Correct response: <strong>"{plan.passphrase.responsePhrase}"</strong></p>
            <p style={{ fontSize: '11pt' }}>Backup: <strong>"{plan.passphrase.backupPhrase}"</strong></p>
            {plan.passphrase.physicalTokenDescription && (
              <p style={{ fontSize: '10pt' }}>Physical token: {plan.passphrase.physicalTokenDescription}</p>
            )}
            <p style={{ fontSize: '9pt', color: '#444', marginTop: '8pt' }}>
              Last updated {formatDate(plan.passphrase.lastUpdated)}. Review annually.
            </p>
            <p style={{ fontSize: '10pt', marginTop: '8pt' }}>
              <strong>Child protocol:</strong> Anyone picking up a child must say the response phrase exactly. Wrong answer → child stays. Practice until automatic.
            </p>
          </>
        ) : (
          <p>Not set.</p>
        )}
      </div>

      {/* ── TAB 5: Scenario Playbooks ───────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 5 — SCENARIO PLAYBOOKS</div>
        <h1 style={h1Style}>Scenarios (by likelihood)</h1>
        {SCENARIOS.map(s => (
          <div key={s.id} className="print-break-avoid print-break-before" style={{ marginTop: '10pt' }}>
            <h2 style={h2Style}>{s.title}</h2>
            <p style={{ fontSize: '9pt', color: '#444' }}>
              {PROBABILITY_LABELS[s.probabilityTier]} · {s.sourceNote}
            </p>
            <p style={{ fontSize: '10pt' }}>{s.summary}</p>
            <h3 style={h3Style}>Trigger</h3>
            <ul style={{ fontSize: '10pt' }}>{s.trigger.map((t, i) => <li key={i}>{t}</li>)}</ul>
            <h3 style={h3Style}>Immediate</h3>
            <ol style={{ fontSize: '10pt' }}>
              {s.immediateSteps.map((st, i) => (
                <li key={i} style={{ fontWeight: st.critical ? 700 : 400 }}>{st.text}</li>
              ))}
            </ol>
            <h3 style={h3Style}>Extended</h3>
            <ol style={{ fontSize: '10pt' }}>
              {s.extendedSteps.map((st, i) => <li key={i}>{st.text}</li>)}
            </ol>
            <p style={{ fontSize: '10pt' }}><strong>Rally trigger:</strong> {s.rallyTrigger}</p>
          </div>
        ))}
      </div>

      {/* ── TAB 6: Go-bag ───────────────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 6 — GO-BAG CHECKLIST</div>
        <h1 style={h1Style}>Go-Bag Checklist</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Item</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Qty</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {GO_BAG_ITEMS.map(item => {
              const inv = plan.prepInventory.find(p => p.id === item.id)
              return (
                <tr key={item.id}>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>
                    {item.priority === 'critical' && <strong>⚠ </strong>}
                    {item.name}
                  </td>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>{item.quantity}</td>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>{inv?.status ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── TAB 7: Home supplies inventory ──────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 7 — HOME SUPPLY INVENTORY</div>
        <h1 style={h1Style}>Home Supply Inventory</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Item</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Qty</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt 6pt' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {HOME_SUPPLIES.map(item => {
              const inv = plan.prepInventory.find(p => p.id === `home-${item.id}`)
              return (
                <tr key={item.id}>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>
                    {item.priority === 'critical' && <strong>⚠ </strong>}
                    {item.name}
                  </td>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>{item.quantity}</td>
                  <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #888' }}>{inv?.status ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── TAB 8: Documents cache ──────────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 8 — CRITICAL DOCUMENTS CACHE</div>
        <h1 style={h1Style}>Critical Documents Cache</h1>

        {plan.documentsPlan ? (
          <>
            {plan.documentsPlan.storageLocation && (
              <p style={{ fontSize: '12pt', fontWeight: 700 }}>
                Storage location: {plan.documentsPlan.storageLocation}
              </p>
            )}
            {plan.documentsPlan.protectionMethods.length > 0 && (
              <p style={{ fontSize: '10pt', marginBottom: '8pt' }}>
                Protection: {plan.documentsPlan.protectionMethods.join(' · ')}
              </p>
            )}
            {plan.documentsPlan.digitalBackupLocation && (
              <p style={{ fontSize: '10pt', marginBottom: '8pt' }}>
                Digital backup: {plan.documentsPlan.digitalBackupLocation}
              </p>
            )}
            {['IDs', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Contacts'].map(cat => {
              const catItems = plan.documentsPlan!.items.filter(i => i.category === cat && i.status !== 'na')
              if (catItems.length === 0) return null
              return (
                <div key={cat} style={{ marginBottom: '8pt' }}>
                  <h3 style={h3Style}>{cat}</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                    <tbody>
                      {catItems.map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #ccc', width: '70%' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #ccc', width: '15%', fontWeight: item.status === 'have' ? 400 : 700 }}>
                            {item.status === 'have' ? '✓' : 'NEEDED'}
                          </td>
                          <td style={{ padding: '2pt 6pt', borderBottom: '0.5pt dotted #ccc', width: '15%', fontSize: '9pt', color: '#444' }}>
                            {item.digitalCopy ? 'digital ✓' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </>
        ) : (
          <>
            <p>Keep a single waterproof envelope with the following — at home AND a digital copy with your out-of-state coordinator:</p>
            <ul>
              <li>Photo IDs and passports (color copies)</li>
              <li>Insurance cards: health, home, auto</li>
              <li>Most recent insurance declarations page (home/auto)</li>
              <li>Vaccination records (people and pets)</li>
              <li>Printed medication list with prescriber + pharmacy</li>
              <li>Bank account list with bank name + last 4 of account</li>
              <li>Lease or deed copy</li>
              <li>Vehicle title copies</li>
              <li>Will / power of attorney summary page</li>
              <li>Important contacts (printed and laminated)</li>
            </ul>
          </>
        )}
      </div>

      {/* ── TAB 9: Resource access guide ────────────────────────────── */}
      <div className="print-break-before" style={sectionStyle}>
        <div style={tabHeader}>TAB 9 — RESOURCE ACCESS GUIDE</div>
        <h1 style={h1Style}>Resource Access Guide</h1>
        <h2 style={h2Style}>Supply Duration Estimates</h2>
        <ul>
          {computeSupplyDurations(plan.prepInventory, plan.units.length).map((d, i) => (
            <li key={i}>
              {d.resource}: {d.daysRemaining} day(s) — {d.note}
            </li>
          ))}
        </ul>
        <h2 style={h2Style}>If Water Runs Low</h2>
        <ul>
          <li>Use ready-to-feed infant formula — needs no water.</li>
          <li>Filter from natural sources only as a last resort (LifeStraw).</li>
          <li>Hamilton County distribution sites activate during declared emergencies.</li>
        </ul>
        <h2 style={h2Style}>If Power Stays Out</h2>
        <ul>
          <li>Generator outdoors only, 20+ feet from any window — CO kills quickly.</li>
          <li>Food order: freezer → fridge → pantry → emergency cache.</li>
          <li>Day 3 = rally trigger if heat/cool extremes.</li>
        </ul>
        <h2 style={h2Style}>If Comms Stay Down</h2>
        <ul>
          <li>Family Radio Service (FRS) check-ins at the times listed in Tab 1.</li>
          {plan.communication?.hasMeshtastic && (
            <li>
              Meshtastic mesh: send position + status on channel{' '}
              <strong>{plan.communication.meshtasticChannelName ?? 'your configured channel'}</strong>.
              No internet or cell towers required.
            </li>
          )}
          <li>Local AM radio is the most resilient broadcast medium.</li>
          <li>4-hour rule: no contact → cluster hub.</li>
        </ul>
      </div>
    </div>
  )
}
