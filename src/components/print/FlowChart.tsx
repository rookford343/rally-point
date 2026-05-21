import { useFamilyPlan } from '../../store/family-plan'

// Multi-page SVG decision flowchart for printing.
// Split across 3 pages so each scenario column is large enough to read without a magnifier.
// Each page covers 3 scenario columns (page 3 covers 1 col + away-from-home protocols).
//
// Urgency encoding (B&W print safe):
//   solid stroke = monitor / shelter
//   double rect  = activate rally
//   dashed       = critical / evacuate

// ── Per-page layout constants ─────────────────────────────────────────────────

const SVG_W = 900
const P_COL_W = 250
const P_COL_GAP = 15
const P_MARGIN = 62

// Three column centers for a full-page SVG
const PC = [0, 1, 2].map(i => P_MARGIN + i * (P_COL_W + P_COL_GAP) + P_COL_W / 2)
// PC[0]=187, PC[1]=452, PC[2]=717

const DH = 46         // diamond half
const BW = 232        // box width
const BH = 60         // box height (normal)
const BHT = 76        // box height (tall)

const SPINE_Y  = 12   // horizontal spine connecting root to branches
const LABEL_Y  = 28   // column label y
const BRANCH   = 95   // y of first diamond
const D2_OFF   = 122  // offset to second diamond
const A1_OFF   = 122  // offset to first action box (from D2)
const A2_OFF   = 108  // offset to second action box (from A1 center)

const D1_Y  = BRANCH
const D2_Y  = BRANCH + D2_OFF
const A1_Y  = D2_Y + A1_OFF
const A2_Y  = A1_Y + A2_OFF

const SVG_H = A2_Y + BHT / 2 + 28  // ~496

// ── SVG primitives ────────────────────────────────────────────────────────────

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3"
        orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L8,3 z" fill="#000" />
      </marker>
    </defs>
  )
}

interface DiamondProps { cx: number; cy: number; label: string; sub?: string }
function Diamond({ cx, cy, label, sub }: DiamondProps) {
  const pts = `${cx},${cy - DH} ${cx + DH},${cy} ${cx},${cy + DH} ${cx - DH},${cy}`
  return (
    <g>
      <polygon points={pts} fill="#fff" stroke="#000" strokeWidth="1.5" />
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
        fontSize="11.5" fontWeight="600" fontFamily="system-ui, sans-serif">{label}</text>
      {sub && (
        <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">{sub}</text>
      )}
    </g>
  )
}

type Urgency = 'shelter' | 'rally' | 'evac'
interface BoxProps { cx: number; cy: number; label: string; sub?: string; urgency: Urgency; h?: number }
function Box({ cx, cy, label, sub, urgency, h = BH }: BoxProps) {
  const x = cx - BW / 2
  const y = cy - h / 2
  const dash = urgency === 'evac' ? '8 4' : undefined
  return (
    <g>
      {urgency === 'rally' && (
        <rect x={x - 3} y={y - 3} width={BW + 6} height={h + 6} fill="none" stroke="#000" strokeWidth="1" />
      )}
      <rect x={x} y={y} width={BW} height={h} fill="#fff" stroke="#000"
        strokeWidth={urgency === 'evac' ? 2 : 1.5} strokeDasharray={dash} rx="3" />
      <text x={cx} y={sub ? cy - 8 : cy} textAnchor="middle" dominantBaseline="middle"
        fontSize="10.5" fontFamily="system-ui, sans-serif">{label}</text>
      {sub && (
        <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontFamily="system-ui, sans-serif" fill="#333">{sub}</text>
      )}
    </g>
  )
}

interface ArrProps { x1: number; y1: number; x2: number; y2: number; label?: string; markerId: string }
function Arr({ x1, y1, x2, y2, label, markerId }: ArrProps) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="1.3"
        markerEnd={`url(#${markerId})`} />
      {label && (
        <text x={mx + 5} y={my - 4} fontSize="9" fontFamily="system-ui, sans-serif" fill="#444">{label}</text>
      )}
    </g>
  )
}

// ── Page header (rendered once per page as SVG text rows) ─────────────────────

function PageHeader({ title, colLabels, markerId }: { title: string; colLabels: string[]; markerId: string }) {
  return (
    <>
      <text x={SVG_W / 2} y={SPINE_Y + 5} textAnchor="middle"
        fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">{title}</text>
      <line x1={PC[0] - P_COL_W / 2} y1={SPINE_Y + 12} x2={PC[colLabels.length - 1] + P_COL_W / 2} y2={SPINE_Y + 12}
        stroke="#000" strokeWidth="0.8" />
      {colLabels.map((lbl, i) => (
        <text key={i} x={PC[i]} y={LABEL_Y} textAnchor="middle"
          fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">{lbl}</text>
      ))}
      {colLabels.map((_, i) => (
        <Arr key={i} markerId={markerId} x1={PC[i]} y1={LABEL_Y + 8} x2={PC[i]} y2={D1_Y - DH - 2} />
      ))}
    </>
  )
}

// ── Shared page wrapper ───────────────────────────────────────────────────────

function PageSVG({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  )
}

// ── FlowChart component ───────────────────────────────────────────────────────

export function FlowChart() {
  const { plan } = useFamilyPlan()

  const primaryCluster = plan.clusters[0]
  const primaryHub = primaryCluster
    ? plan.rallyPoints.find(r => r.id === primaryCluster.localHubId)
    : undefined
  const convergenceHub = plan.convergencePlan
    ? plan.rallyPoints.find(r => r.id === plan.convergencePlan?.fullConvergenceHubId)
    : undefined
  const firstUnit = plan.units[0]
  const firstChannel = plan.communication?.frsChannels.find(c => c.unitId === firstUnit?.id)

  const hubAddr = primaryHub?.address ?? '(hub not set)'
  const hubShort = hubAddr.length > 32 ? hubAddr.slice(0, 30) + '…' : hubAddr
  const convAddr = convergenceHub?.address ?? '(convergence not set)'
  const channel = firstChannel ? `Ch ${firstChannel.channel}` : '(ch not set)'
  const coord = plan.communication?.outOfStateCoordinatorName
  const coordPhone = plan.communication?.outOfStateCoordinatorPhone
  const dayThreshold = plan.convergencePlan?.convergenceDayThreshold ?? 3

  const infoLine = (
    <p style={{ fontSize: '8pt', textAlign: 'center', color: '#444', margin: '0 0 4pt 0' }}>
      Hub: <strong>{hubShort}</strong>
      {coord && <> · Coordinator: <strong>{coord}</strong>{coordPhone && ` · ${coordPhone}`}</>}
      · FRS: <strong>{channel}</strong> · Check-in: 8am / 12pm / 6pm
    </p>
  )

  const legend = (
    <div style={{ fontSize: '7.5pt', textAlign: 'center', marginBottom: '4pt' }}>
      <span style={{ border: '1.5pt solid #000', padding: '1pt 5pt', marginRight: '8pt' }}>monitor / shelter</span>
      <span style={{ outline: '1pt solid #000', border: '2.5pt double #000', padding: '1pt 5pt', marginRight: '8pt' }}>activate rally</span>
      <span style={{ border: '1.5pt dashed #000', padding: '1pt 5pt' }}>critical / evacuate</span>
    </div>
  )

  const pageBreak: React.CSSProperties = { pageBreakBefore: 'always', breakBefore: 'page', paddingTop: '0.1in' }

  // ── Page 1: House Fire · Carbon Monoxide · Tornado ───────────────────────

  const Page1 = () => {
    const mid = 'arr-p1'
    return (
      <PageSVG>
        <Defs id={mid} />
        <PageHeader title="Part 1 of 3 — Immediate Threats" markerId={mid}
          colLabels={['🔥 House Fire', '💨 Carbon Monoxide', '🌪 Tornado']} />

        {/* House Fire */}
        <Diamond cx={PC[0]} cy={D1_Y} label="Smoke alarm" sub="or fire?" />
        <Arr markerId={mid} x1={PC[0]} y1={D1_Y + DH} x2={PC[0]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[0]} cy={D2_Y} label="Everyone" sub="out of building?" />
        <Arr markerId={mid} x1={PC[0]} y1={D2_Y + DH} x2={PC[0]} y2={A1_Y - BH / 2} label="YES" />
        <Box cx={PC[0]} cy={A1_Y} urgency="shelter"
          label="Call 911. Stay outside." sub="Do NOT re-enter for any reason." />
        <Arr markerId={mid} x1={PC[0]} y1={A1_Y + BH / 2} x2={PC[0]} y2={A2_Y - BHT / 2} label="NO" />
        <Box cx={PC[0]} cy={A2_Y} urgency="evac" h={BHT}
          label="GET OUT NOW" sub="Low to floor · close doors behind you · meet outside." />

        {/* Carbon Monoxide */}
        <Diamond cx={PC[1]} cy={D1_Y} label="CO alarm or" sub="dizziness/nausea?" />
        <Arr markerId={mid} x1={PC[1]} y1={D1_Y + DH} x2={PC[1]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[1]} cy={D2_Y} label="Everyone" sub="outside?" />
        <Arr markerId={mid} x1={PC[1]} y1={D2_Y + DH} x2={PC[1]} y2={A1_Y - BH / 2} label="YES" />
        <Box cx={PC[1]} cy={A1_Y} urgency="shelter"
          label="Call 911. Stay outside." sub="Await fire dept. clearance." />
        <Arr markerId={mid} x1={PC[1]} y1={A1_Y + BH / 2} x2={PC[1]} y2={A2_Y - BHT / 2} label="NO" />
        <Box cx={PC[1]} cy={A2_Y} urgency="evac" h={BHT}
          label="GET EVERYONE OUT" sub="CO is odorless · symptoms = poisoning." />

        {/* Tornado */}
        <Diamond cx={PC[2]} cy={D1_Y} label="Tornado" sub="WARNING issued?" />
        <Arr markerId={mid} x1={PC[2]} y1={D1_Y + DH} x2={PC[2]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[2]} cy={D2_Y} label="Basement" sub="available?" />
        <Arr markerId={mid} x1={PC[2]} y1={D2_Y + DH} x2={PC[2]} y2={A1_Y - BH / 2} label="YES" />
        <Box cx={PC[2]} cy={A1_Y} urgency="shelter"
          label="Basement → interior wall" sub="Away from windows · cover infant." />
        <Arr markerId={mid} x1={PC[2]} y1={A1_Y + BH / 2} x2={PC[2]} y2={A2_Y - BHT / 2} label="NO" />
        <Box cx={PC[2]} cy={A2_Y} urgency="evac" h={BHT}
          label="Mobile home: LEAVE NOW" sub="Nearest sturdy structure." />
      </PageSVG>
    )
  }

  // ── Page 2: Flooding · Power Out · No Comms ──────────────────────────────

  const Page2 = () => {
    const mid = 'arr-p2'
    return (
      <PageSVG>
        <Defs id={mid} />
        <PageHeader title="Part 2 of 3 — Weather &amp; Infrastructure" markerId={mid}
          colLabels={['🌊 Flooding', '⚡ Power Out', '📵 No Comms']} />

        {/* Flooding */}
        <Diamond cx={PC[0]} cy={D1_Y} label="Water rising" sub="or flood warning?" />
        <Arr markerId={mid} x1={PC[0]} y1={D1_Y + DH} x2={PC[0]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[0]} cy={D2_Y} label="Threatening" sub="first floor?" />
        <Arr markerId={mid} x1={PC[0]} y1={D2_Y + DH} x2={PC[0]} y2={A1_Y - BHT / 2} label="YES" />
        <Box cx={PC[0]} cy={A1_Y} urgency="evac" h={BHT}
          label="Go-bag → high-ground route" sub={`→ ${hubShort}`} />
        <Arr markerId={mid} x1={PC[0]} y1={A1_Y + BHT / 2} x2={PC[0]} y2={A2_Y - BH / 2} label="NO" />
        <Box cx={PC[0]} cy={A2_Y} urgency="shelter"
          label="Move valuables up. Monitor." sub="Don't drive through any water." />

        {/* Power Out */}
        <Diamond cx={PC[1]} cy={D1_Y} label="Power out" sub="no ETA?" />
        <Arr markerId={mid} x1={PC[1]} y1={D1_Y + DH} x2={PC[1]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[1]} cy={D2_Y} label="Day 3+ no heat" sub="or AC in extreme?" />
        <Arr markerId={mid} x1={PC[1]} y1={D2_Y + DH} x2={PC[1]} y2={A1_Y - BH / 2} label="NO" />
        <Box cx={PC[1]} cy={A1_Y} urgency="shelter"
          label="Shelter in place. Conserve." sub="Generator: outdoors only — never garage." />
        <Arr markerId={mid} x1={PC[1]} y1={A1_Y + BH / 2} x2={PC[1]} y2={A2_Y - BHT / 2} label="YES" />
        <Box cx={PC[1]} cy={A2_Y} urgency="rally" h={BHT}
          label="Activate rally protocol" sub={`→ ${hubShort}`} />

        {/* No Comms */}
        <Diamond cx={PC[2]} cy={D1_Y} label="Phones &amp;" sub="internet down?" />
        <Arr markerId={mid} x1={PC[2]} y1={D1_Y + DH} x2={PC[2]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[2]} cy={D2_Y} label="Contact made" sub="within 4 hours?" />
        <Arr markerId={mid} x1={PC[2]} y1={D2_Y + DH} x2={PC[2]} y2={A1_Y - BH / 2} label="NO" />
        <Box cx={PC[2]} cy={A1_Y} urgency="shelter"
          label={`FRS ${channel} check-ins`} sub="8am / 12pm / 6pm. Try landline." />
        <Arr markerId={mid} x1={PC[2]} y1={A1_Y + BH / 2} x2={PC[2]} y2={A2_Y - BHT / 2} label="4-hr rule" />
        <Box cx={PC[2]} cy={A2_Y} urgency="rally" h={BHT}
          label="4-hour rule triggered" sub={`Go-bag → ${hubShort}`} />
      </PageSVG>
    )
  }

  // ── Page 3: Civil Unrest (left) + Away From Home (right) ─────────────────

  const PAGE3_SVG_H = SVG_H + 120  // taller to fit away section
  const AWAY_DIVIDER = SVG_H - 16
  const AWAY_Y = AWAY_DIVIDER + 30

  // Civil unrest takes col 0; away section spans cols 1+2 area
  const AWAY_LEFT = PC[1] - P_COL_W / 2 - 10
  const AWAY_W_TOTAL = SVG_W - AWAY_LEFT - P_MARGIN
  const AW_THIRD = AWAY_W_TOTAL / 3
  const AW_CX = [AWAY_LEFT + AW_THIRD / 2, AWAY_LEFT + AW_THIRD * 1.5, AWAY_LEFT + AW_THIRD * 2.5]
  const AW_BW = AW_THIRD - 14
  const AW_BH = 76

  const Page3 = () => {
    const mid = 'arr-p3'
    return (
      <svg viewBox={`0 0 ${SVG_W} ${PAGE3_SVG_H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg">
        <Defs id={mid} />

        {/* Title */}
        <text x={SVG_W / 2} y={SPINE_Y + 5} textAnchor="middle"
          fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
          Part 3 of 3 — Civil Unrest &amp; Away-From-Home Protocols
        </text>
        <line x1={PC[0] - P_COL_W / 2} y1={SPINE_Y + 12} x2={SVG_W - P_MARGIN} y2={SPINE_Y + 12}
          stroke="#000" strokeWidth="0.8" />

        {/* Column labels */}
        <text x={PC[0]} y={LABEL_Y} textAnchor="middle" fontSize="10" fontWeight="700"
          fontFamily="system-ui, sans-serif">⚠️ Civil Unrest</text>
        <Arr markerId={mid} x1={PC[0]} y1={LABEL_Y + 8} x2={PC[0]} y2={D1_Y - DH - 2} />

        <text x={AWAY_LEFT + AWAY_W_TOTAL / 2} y={LABEL_Y} textAnchor="middle" fontSize="10" fontWeight="700"
          fontFamily="system-ui, sans-serif">NOT AT HOME WHEN EMERGENCY OCCURS</text>
        <line x1={AWAY_LEFT} y1={LABEL_Y + 10} x2={SVG_W - P_MARGIN} y2={LABEL_Y + 10}
          stroke="#555" strokeWidth="0.8" strokeDasharray="4 3" />

        {/* Civil Unrest column */}
        <Diamond cx={PC[0]} cy={D1_Y} label="Civil unrest" sub="nearby?" />
        <Arr markerId={mid} x1={PC[0]} y1={D1_Y + DH} x2={PC[0]} y2={D2_Y - DH} label="YES" />
        <Diamond cx={PC[0]} cy={D2_Y} label="Within 1 mi" sub="of your location?" />
        <Arr markerId={mid} x1={PC[0]} y1={D2_Y + DH} x2={PC[0]} y2={A1_Y - BH / 2} label="NO" />
        <Box cx={PC[0]} cy={A1_Y} urgency="shelter"
          label="Lock doors. Lights low." sub="Interior room. Monitor official channels." />
        <Arr markerId={mid} x1={PC[0]} y1={A1_Y + BH / 2} x2={PC[0]} y2={A2_Y - BHT / 2} label="YES / threat" />
        <Box cx={PC[0]} cy={A2_Y} urgency="evac" h={BHT}
          label="Leave via county roads only" sub={`Avoid main corridors → ${hubShort}`} />

        {/* Divider before away section */}
        <line x1={35} y1={AWAY_DIVIDER} x2={SVG_W - 35} y2={AWAY_DIVIDER}
          stroke="#000" strokeWidth="1" strokeDasharray="5 3" />

        {/* Away from home sub-columns */}
        {/* Local */}
        <text x={AW_CX[0]} y={AWAY_Y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700"
          fontFamily="system-ui, sans-serif">At work / school (local)</text>
        <rect x={AW_CX[0] - AW_BW / 2} y={AWAY_Y + 10} width={AW_BW} height={AW_BH}
          fill="#fff" stroke="#000" strokeWidth="1.5" rx="3" />
        <text x={AW_CX[0]} y={AWAY_Y + 10 + AW_BH * 0.3} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">Shelter at workplace.</text>
        <text x={AW_CX[0]} y={AWAY_Y + 10 + AW_BH * 0.55} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">Route to hub — not home.</text>
        <text x={AW_CX[0]} y={AWAY_Y + 10 + AW_BH * 0.8} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontFamily="system-ui, sans-serif" fill="#555">{hubShort}</text>

        {/* In-state */}
        <text x={AW_CX[1]} y={AWAY_Y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700"
          fontFamily="system-ui, sans-serif">Traveling in-state</text>
        <rect x={AW_CX[1] - AW_BW / 2} y={AWAY_Y + 10} width={AW_BW} height={AW_BH}
          fill="none" stroke="#000" strokeWidth="1" />
        <rect x={AW_CX[1] - AW_BW / 2 + 3} y={AWAY_Y + 13} width={AW_BW - 6} height={AW_BH - 6}
          fill="#fff" stroke="#000" strokeWidth="1.5" rx="3" />
        <text x={AW_CX[1]} y={AWAY_Y + 10 + AW_BH * 0.3} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">{'< 50 mi: go to hub.'}</text>
        <text x={AW_CX[1]} y={AWAY_Y + 10 + AW_BH * 0.55} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">{'> 50 mi: STAY PUT.'}</text>
        <text x={AW_CX[1]} y={AWAY_Y + 10 + AW_BH * 0.8} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontFamily="system-ui, sans-serif" fill="#555">
          {coord ? `Call ${coord}` : 'Call family contact outside area'}
        </text>

        {/* Out of state */}
        <text x={AW_CX[2]} y={AWAY_Y - 2} textAnchor="middle" fontSize="9.5" fontWeight="700"
          fontFamily="system-ui, sans-serif">Out of state</text>
        <rect x={AW_CX[2] - AW_BW / 2} y={AWAY_Y + 10} width={AW_BW} height={AW_BH}
          fill="#fff" stroke="#000" strokeWidth="1.5" rx="3" />
        <text x={AW_CX[2]} y={AWAY_Y + 10 + AW_BH * 0.3} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">DO NOT drive into zone.</text>
        <text x={AW_CX[2]} y={AWAY_Y + 10 + AW_BH * 0.55} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="system-ui, sans-serif">Stay put. Stay safe.</text>
        {coord && (
          <text x={AW_CX[2]} y={AWAY_Y + 10 + AW_BH * 0.8} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontFamily="system-ui, sans-serif" fill="#555">
            {`Call ${coord}${coordPhone ? ` · ${coordPhone}` : ''}`}
          </text>
        )}
      </svg>
    )
  }

  const footer = (
    <div style={{ marginTop: '4pt', borderTop: '1.5pt solid #000', paddingTop: '3pt',
      display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
      <span><strong>After Day {dayThreshold}:</strong> converge at {convAddr}.</span>
      <span><strong>4-Hour Rule:</strong> no contact after 4 hrs via all methods → activate rally.</span>
      {coord && <span><strong>Coordinator:</strong> {coord}{coordPhone && ` · ${coordPhone}`}</span>}
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#000', padding: '0.1in' }}>
      <h1 style={{ fontSize: '16pt', fontWeight: 700, margin: '0 0 2pt 0', textAlign: 'center' }}>
        {plan.planName} — Emergency Decision Flowchart
      </h1>
      {infoLine}
      {legend}
      <Page1 />

      <div style={pageBreak}>
        {infoLine}
        {legend}
        <Page2 />
      </div>

      <div style={pageBreak}>
        {infoLine}
        {legend}
        <Page3 />
        {footer}
      </div>
    </div>
  )
}
