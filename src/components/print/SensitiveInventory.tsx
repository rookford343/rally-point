import { useState, useEffect } from 'react'
import { useFamilyPlan, getSensitiveInventory } from '../../store/family-plan'
import { formatDate } from '../../lib/print'
import type { SensitiveInventory as SensitiveInventoryT } from '../../types/plan'

// Print-only sensitive inventory. Renders the firearms + non-lethal records
// stored under the separate `rally-point-sensitive-v1` localStorage key.
// A large watermark / header appears on EVERY printed page reminding the
// reader to store this separately from the main binder.

function Watermark() {
  return (
    <div style={{
      border: '4pt double #000',
      padding: '8pt',
      margin: '0 0 12pt 0',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '16pt', fontWeight: 700, margin: 0, letterSpacing: '0.1em' }}>
        SENSITIVE — STORE SEPARATELY FROM MAIN BINDER
      </p>
      <p style={{ fontSize: '9pt', margin: '4pt 0 0 0' }}>
        Do not file this document with the family plan. Recommended storage:
        locked container in a different room from the binder.
      </p>
    </div>
  )
}

export function SensitiveInventory() {
  const { plan } = useFamilyPlan()
  const [sens, setSens] = useState<SensitiveInventoryT>({ firearms: [], nonLethal: [] })

  useEffect(() => {
    const data = getSensitiveInventory() as Partial<SensitiveInventoryT>
    setSens({ firearms: data.firearms ?? [], nonLethal: data.nonLethal ?? [] })
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#000', padding: '0.25in', fontSize: '10pt' }}>
      <Watermark />

      <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: 0 }}>
        {plan.planName} — Sensitive Inventory
      </h1>
      <p style={{ fontSize: '9pt', color: '#444', margin: '2pt 0 10pt 0' }}>
        Generated {formatDate(plan.updatedAt)}
      </p>

      <h2 style={{ fontSize: '14pt', fontWeight: 700, margin: '10pt 0 4pt 0', borderBottom: '1pt solid #000' }}>
        Firearms ({sens.firearms.length})
      </h2>
      {sens.firearms.length === 0 ? (
        <p>None recorded.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Type</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Caliber</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Storage</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Safe combo location</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Ammo</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sens.firearms.map(f => (
              <tr key={f.id}>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.type}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.caliber ?? '—'}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.storageLocation}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.safeLocation ?? '—'}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.ammoQuantity ?? '—'}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{f.scenarioNotes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ fontSize: '14pt', fontWeight: 700, margin: '14pt 0 4pt 0', borderBottom: '1pt solid #000' }}>
        Non-Lethal Defensive Items ({sens.nonLethal.length})
      </h2>
      {sens.nonLethal.length === 0 ? (
        <p>None recorded.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Quantity</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Storage</th>
              <th style={{ textAlign: 'left', borderBottom: '1pt solid #000', padding: '3pt' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sens.nonLethal.map(n => (
              <tr key={n.id}>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{n.name}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{n.quantity ?? '—'}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{n.storageLocation ?? '—'}</td>
                <td style={{ padding: '3pt', borderBottom: '0.5pt dotted #888' }}>{n.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Repeat header at end as a second visual cue for multi-page prints */}
      <div className="print-break-before" />
      <Watermark />
    </div>
  )
}
