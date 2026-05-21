import { useFamilyPlan } from '../../store/family-plan'

// SVG-based decision flowchart for printing.
// Uses proper diamond shapes, rectangle boxes, and directional arrows with arrowheads.
// Designed for 11×17 landscape print or folded 8.5×11.
//
// Urgency encoding (black-and-white print safe):
//   strokeWidth 1.5, solid  = monitor / shelter
//   double rect (outer + inner) = activate rally
//   strokeDasharray "8 4"   = critical / evacuate

// ── Layout constants ──────────────────────────────────────────────────────────

const W = 1400  // viewBox width
const H = 950   // viewBox height

const COL_W = 210       // width of each of the 6 branch columns
const COL_GAP = 10      // gap between columns
const COL_START_X = 35  // left edge of first column
const COL_START_Y = 185 // top of branch diamonds

// Column center X positions
const COLS = [0, 1, 2, 3, 4, 5].map(i => COL_START_X + i * (COL_W + COL_GAP) + COL_W / 2)

// Node sizes
const DIAMOND_HALF = 36    // half-width/height of decision diamond
const BOX_W = 190          // action box width
const BOX_H = 44           // action box height (single line; multi-line nodes use more)
const BOX_H_TALL = 54      // taller action box for longer text

// ── SVG primitives ────────────────────────────────────────────────────────────

function ArrowMarker() {
  return (
    <defs>
      <marker
        id="arrow"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L8,3 z" fill="#000" />
      </marker>
      <marker
        id="arrow-white"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L0,6 L8,3 z" fill="#000" />
      </marker>
    </defs>
  )
}

interface DiamondProps {
  cx: number; cy: number
  label: string
  sub?: string
  size?: number
}

function Diamond({ cx, cy, label, sub, size = DIAMOND_HALF }: DiamondProps) {
  const pts = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`
  return (
    <g>
      <polygon points={pts} fill="#fff" stroke="#000" strokeWidth="1.5" />
      <text
        x={cx} y={cy - 4}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="9.5" fontWeight="600" fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
      {sub && (
        <text
          x={cx} y={cy + 8}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontFamily="system-ui, sans-serif"
        >
          {sub}
        </text>
      )}
    </g>
  )
}

type Urgency = 'shelter' | 'rally' | 'evac'

interface BoxProps {
  cx: number; cy: number
  label: string
  sub?: string
  urgency: Urgency
  w?: number
  h?: number
}

function ActionBox({ cx, cy, label, sub, urgency, w = BOX_W, h = BOX_H }: BoxProps) {
  const x = cx - w / 2
  const y = cy - h / 2
  const stroke = urgency === 'evac' ? '2' : '1.5'
  const dash = urgency === 'evac' ? '8 4' : undefined

  return (
    <g>
      {urgency === 'rally' && (
        // Double border for rally: outer rect slightly larger
        <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6}
          fill="none" stroke="#000" strokeWidth="1" />
      )}
      <rect
        x={x} y={y} width={w} height={h}
        fill="#fff" stroke="#000" strokeWidth={stroke}
        strokeDasharray={dash}
        rx="3"
      />
      <text
        x={cx} y={sub ? cy - 7 : cy}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8.5" fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
      {sub && (
        <text
          x={cx} y={cy + 7}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="7.5" fontFamily="system-ui, sans-serif" fill="#333"
        >
          {sub}
        </text>
      )}
    </g>
  )
}

interface ArrowProps {
  x1: number; y1: number; x2: number; y2: number
  label?: string
  bend?: boolean
}

function Arrow({ x1, y1, x2, y2, label }: ArrowProps) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#000" strokeWidth="1.2"
        markerEnd="url(#arrow)"
      />
      {label && (
        <text
          x={mx + 4} y={my - 3}
          fontSize="7.5" fontFamily="system-ui, sans-serif" fill="#444"
        >
          {label}
        </text>
      )}
    </g>
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
  const hubShort = hubAddr.length > 30 ? hubAddr.slice(0, 28) + '…' : hubAddr
  const convAddr = convergenceHub?.address ?? '(convergence not set)'
  const channel = firstChannel ? `Ch ${firstChannel.channel}` : '(ch not set)'
  const coord = plan.communication?.outOfStateCoordinatorName
  const coordPhone = plan.communication?.outOfStateCoordinatorPhone
  const dayThreshold = plan.convergencePlan?.convergenceDayThreshold ?? 3

  // Root diamond
  const ROOT_X = W / 2
  const ROOT_Y = 70

  // Horizontal spine Y (connects root to branch tops)
  const SPINE_Y = 148
  const BRANCH_TOP = COL_START_Y  // top of branch diamonds (= 185)

  // ── Per-column node Y positions ──────────────────────────────────────────────
  // Tornado column (col 0)
  const T_D1_Y  = BRANCH_TOP          // "Tornado warning?"
  const T_D2_Y  = BRANCH_TOP + 90     // "Basement available?"
  const T_A1_Y  = BRANCH_TOP + 178    // shelter action
  const T_A2_Y  = BRANCH_TOP + 238    // mobile home action

  // Flood column (col 1)
  const FL_D1_Y  = BRANCH_TOP
  const FL_D2_Y  = BRANCH_TOP + 90
  const FL_A1_Y  = BRANCH_TOP + 178
  const FL_A2_Y  = BRANCH_TOP + 238

  // Power column (col 2)
  const PW_D1_Y  = BRANCH_TOP
  const PW_D2_Y  = BRANCH_TOP + 90
  const PW_A1_Y  = BRANCH_TOP + 178
  const PW_A2_Y  = BRANCH_TOP + 252

  // Phones column (col 3)
  const PH_D1_Y  = BRANCH_TOP
  const PH_D2_Y  = BRANCH_TOP + 90
  const PH_A1_Y  = BRANCH_TOP + 178
  const PH_A2_Y  = BRANCH_TOP + 252

  // Civil unrest column (col 4)
  const CU_D1_Y  = BRANCH_TOP
  const CU_D2_Y  = BRANCH_TOP + 90
  const CU_A1_Y  = BRANCH_TOP + 178
  const CU_A2_Y  = BRANCH_TOP + 252

  // House fire column (col 5)
  const HF_D1_Y  = BRANCH_TOP
  const HF_D2_Y  = BRANCH_TOP + 90
  const HF_A1_Y  = BRANCH_TOP + 178
  const HF_A2_Y  = BRANCH_TOP + 252

  // Away from home — spans bottom across all cols
  const AWAY_Y = BRANCH_TOP + 370

  const c = COLS  // shorthand

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#000', padding: '0.15in' }}>
      <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: '0 0 2pt 0', textAlign: 'center' }}>
        {plan.planName} — Emergency Decision Flowchart
      </h1>
      <p style={{ fontSize: '8pt', textAlign: 'center', color: '#444', margin: '0 0 4pt 0' }}>
        Hub: <strong>{hubShort}</strong>
        {coord && <> · Coordinator: <strong>{coord}</strong>{coordPhone && ` · ${coordPhone}`}</>}
        · Family Radio Service (FRS): <strong>{channel}</strong> · Check-in: 8am / 12pm / 6pm
      </p>

      <div style={{ fontSize: '8pt', textAlign: 'center', marginBottom: '4pt' }}>
        <span style={{ border: '1.5pt solid #000', padding: '1pt 5pt', marginRight: '8pt' }}>monitor / shelter</span>
        <span style={{ outline: '1pt solid #000', border: '2.5pt double #000', padding: '1pt 5pt', marginRight: '8pt' }}>activate rally</span>
        <span style={{ border: '1.5pt dashed #000', padding: '1pt 5pt' }}>critical / evacuate</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ArrowMarker />

        {/* Root diamond */}
        <Diamond cx={ROOT_X} cy={ROOT_Y} label="WHAT IS" sub="HAPPENING?" size={44} />

        {/* Horizontal spine */}
        <line x1={c[0]} y1={SPINE_Y} x2={c[5]} y2={SPINE_Y} stroke="#000" strokeWidth="1.2" />

        {/* Vertical drops from spine to branch tops */}
        {c.map((cx, i) => (
          <Arrow key={i} x1={cx} y1={SPINE_Y} x2={cx} y2={BRANCH_TOP - DIAMOND_HALF - 2} />
        ))}
        {/* Root drops to spine */}
        <Arrow x1={ROOT_X} y1={ROOT_Y + 44} x2={ROOT_X} y2={SPINE_Y} />

        {/* ── Column labels ── */}
        {['🌪 Tornado', '🌊 Flooding', '⚡ Power Out', '📵 No Comms', '⚠️ Civil Unrest', '🔥 House Fire'].map((lbl, i) => (
          <text key={i} x={c[i]} y={SPINE_Y + 10} textAnchor="middle"
            fontSize="8" fontWeight="700" fontFamily="system-ui, sans-serif">{lbl}</text>
        ))}

        {/* ══ COL 0: TORNADO ══ */}
        <Diamond cx={c[0]} cy={T_D1_Y} label="Tornado" sub="warning?" />
        <Arrow x1={c[0]} y1={T_D1_Y + DIAMOND_HALF} x2={c[0]} y2={T_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[0]} cy={T_D2_Y} label="Basement" sub="available?" />
        <Arrow x1={c[0]} y1={T_D2_Y + DIAMOND_HALF} x2={c[0]} y2={T_A1_Y - BOX_H / 2} label="YES" />
        <ActionBox cx={c[0]} cy={T_A1_Y} urgency="shelter"
          label="Basement → interior wall" sub="away from windows. Cover infant." />
        <Arrow x1={c[0]} y1={T_A1_Y + BOX_H / 2} x2={c[0]} y2={T_A2_Y - BOX_H / 2} label="NO" />
        <ActionBox cx={c[0]} cy={T_A2_Y} urgency="evac"
          label="Mobile home: LEAVE NOW" sub="Go to nearest sturdy structure." />

        {/* ══ COL 1: FLOODING ══ */}
        <Diamond cx={c[1]} cy={FL_D1_Y} label="Water rising" sub="or warning?" />
        <Arrow x1={c[1]} y1={FL_D1_Y + DIAMOND_HALF} x2={c[1]} y2={FL_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[1]} cy={FL_D2_Y} label="Threatening" sub="first floor?" />
        <Arrow x1={c[1]} y1={FL_D2_Y + DIAMOND_HALF} x2={c[1]} y2={FL_A1_Y - BOX_H / 2} label="YES" />
        <ActionBox cx={c[1]} cy={FL_A1_Y} urgency="evac"
          label="Go-bag → high-ground route" sub={`→ ${hubShort}`} h={BOX_H_TALL} />
        <Arrow x1={c[1]} y1={FL_A1_Y + BOX_H_TALL / 2} x2={c[1]} y2={FL_A2_Y - BOX_H / 2} label="NO" />
        <ActionBox cx={c[1]} cy={FL_A2_Y} urgency="shelter"
          label="Move valuables up. Monitor." sub="Don't drive through water." />

        {/* ══ COL 2: POWER OUT ══ */}
        <Diamond cx={c[2]} cy={PW_D1_Y} label="Power out" sub="no ETA?" />
        <Arrow x1={c[2]} y1={PW_D1_Y + DIAMOND_HALF} x2={c[2]} y2={PW_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[2]} cy={PW_D2_Y} label="Electric vehicle" sub="can't reach hub?" />
        <Arrow x1={c[2]} y1={PW_D2_Y + DIAMOND_HALF} x2={c[2]} y2={PW_A1_Y - BOX_H / 2} label="YES" />
        <ActionBox cx={c[2]} cy={PW_A1_Y} urgency="rally"
          label="Electric vehicle pickup needed" sub={`FRS ${channel} to coordinate.`} />
        <Arrow x1={c[2]} y1={PW_A1_Y + BOX_H / 2} x2={c[2]} y2={PW_A2_Y - BOX_H_TALL / 2} label="Day 3+" />
        <ActionBox cx={c[2]} cy={PW_A2_Y} urgency="rally"
          label="Activate rally protocol" sub={`→ ${hubShort}`} h={BOX_H_TALL} />

        {/* ══ COL 3: PHONES DOWN ══ */}
        <Diamond cx={c[3]} cy={PH_D1_Y} label="Phones &" sub="internet down?" />
        <Arrow x1={c[3]} y1={PH_D1_Y + DIAMOND_HALF} x2={c[3]} y2={PH_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[3]} cy={PH_D2_Y} label="Contact made" sub="within 4 hours?" />
        <Arrow x1={c[3]} y1={PH_D2_Y + DIAMOND_HALF} x2={c[3]} y2={PH_A1_Y - BOX_H / 2} label="NO" />
        <ActionBox cx={c[3]} cy={PH_A1_Y} urgency="shelter"
          label={`FRS ${channel} — check-ins`} sub="8am / 12pm / 6pm. Try landline." />
        <Arrow x1={c[3]} y1={PH_A1_Y + BOX_H / 2} x2={c[3]} y2={PH_A2_Y - BOX_H_TALL / 2} label="4-hr rule" />
        <ActionBox cx={c[3]} cy={PH_A2_Y} urgency="rally"
          label="4-hour rule triggered" sub={`Go-bag → ${hubShort}`} h={BOX_H_TALL} />

        {/* ══ COL 4: CIVIL UNREST ══ */}
        <Diamond cx={c[4]} cy={CU_D1_Y} label="Civil unrest" sub="nearby?" />
        <Arrow x1={c[4]} y1={CU_D1_Y + DIAMOND_HALF} x2={c[4]} y2={CU_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[4]} cy={CU_D2_Y} label="Within 1 mile" sub="of your location?" />
        <Arrow x1={c[4]} y1={CU_D2_Y + DIAMOND_HALF} x2={c[4]} y2={CU_A1_Y - BOX_H / 2} label="NO" />
        <ActionBox cx={c[4]} cy={CU_A1_Y} urgency="shelter"
          label="Lock doors. Lights low." sub="Interior room. Monitor." />
        <Arrow x1={c[4]} y1={CU_A1_Y + BOX_H / 2} x2={c[4]} y2={CU_A2_Y - BOX_H_TALL / 2} label="YES / threat" />
        <ActionBox cx={c[4]} cy={CU_A2_Y} urgency="evac"
          label="Leave via county roads" sub={`Avoid main corridors → ${hubShort}`} h={BOX_H_TALL} />

        {/* ══ COL 5: HOUSE FIRE ══ */}
        <Diamond cx={c[5]} cy={HF_D1_Y} label="House fire" sub="or smoke?" />
        <Arrow x1={c[5]} y1={HF_D1_Y + DIAMOND_HALF} x2={c[5]} y2={HF_D2_Y - DIAMOND_HALF} label="YES" />
        <Diamond cx={c[5]} cy={HF_D2_Y} label="Everyone" sub="out of building?" />
        <Arrow x1={c[5]} y1={HF_D2_Y + DIAMOND_HALF} x2={c[5]} y2={HF_A1_Y - BOX_H / 2} label="YES" />
        <ActionBox cx={c[5]} cy={HF_A1_Y} urgency="shelter"
          label="Call 911. Stay outside." sub="Do NOT re-enter." />
        <Arrow x1={c[5]} y1={HF_A1_Y + BOX_H / 2} x2={c[5]} y2={HF_A2_Y - BOX_H / 2} label="NO" />
        <ActionBox cx={c[5]} cy={HF_A2_Y} urgency="evac"
          label="GET OUT NOW" sub="Close doors. Low to floor." />

        {/* ══ AWAY FROM HOME (full-width bottom section) ══ */}
        <line x1={35} y1={AWAY_Y - 20} x2={W - 35} y2={AWAY_Y - 20} stroke="#000" strokeWidth="1" strokeDasharray="4 4" />
        <text x={W / 2} y={AWAY_Y - 8} textAnchor="middle" fontSize="9" fontWeight="700"
          fontFamily="system-ui, sans-serif">NOT AT HOME WHEN EMERGENCY OCCURS</text>

        {/* Three away sub-columns */}
        {/* Local (work/school) */}
        <ActionBox cx={W * 0.18} cy={AWAY_Y + 55} urgency="shelter" w={230} h={66}
          label="At work / school (local)"
          sub="Shelter at workplace. Route to hub—not home." />

        {/* In-state */}
        <ActionBox cx={W * 0.5} cy={AWAY_Y + 55} urgency="rally" w={230} h={66}
          label="Traveling in-state"
          sub={`< 50 mi: go to hub → ${hubShort}`} />
        <ActionBox cx={W * 0.5} cy={AWAY_Y + 143} urgency="shelter" w={230} h={44}
          label="> 50 mi: STAY PUT"
          sub={coord ? `Call ${coord}` : 'Call a family contact outside the area'} />

        {/* Out of state */}
        <ActionBox cx={W * 0.82} cy={AWAY_Y + 55} urgency="shelter" w={230} h={66}
          label="Out of state"
          sub="DO NOT drive into disaster zone. Stay put." />
        {coord && (
          <ActionBox cx={W * 0.82} cy={AWAY_Y + 143} urgency="shelter" w={230} h={44}
            label={`Call ${coord}`}
            sub={coordPhone ?? 'out-of-state coordinator'} />
        )}
      </svg>

      {/* Footer */}
      <div style={{ marginTop: '6pt', borderTop: '2pt solid #000', paddingTop: '4pt',
        display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt' }}>
        <span>
          <strong>After Day {dayThreshold}:</strong> all clusters converge at {convAddr}.
        </span>
        <span>
          <strong>4-Hour Rule:</strong> no contact for 4 hrs after trying all methods → activate rally.
        </span>
        {coord && (
          <span>
            <strong>Coordinator:</strong> {coord}{coordPhone && ` · ${coordPhone}`}
          </span>
        )}
      </div>
    </div>
  )
}
