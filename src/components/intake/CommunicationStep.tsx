import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input, Checkbox } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { CommunicationPlan, FRSChannel } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

interface NeighborDraft { name: string; address: string; phone: string }

function defaultCheckIns(): string[] {
  return ['08:00', '12:00', '18:00']
}

export function CommunicationStep({ onNext, onBack }: Props) {
  const { plan, setCommunication } = useFamilyPlan()
  const existing = plan.communication

  const [frsUnitCount, setFrsUnitCount] = useState<number>(existing?.frsUnitCount ?? plan.units.length * 2)
  const [channels, setChannels] = useState<FRSChannel[]>(() => {
    if (existing?.frsChannels && existing.frsChannels.length === plan.units.length) {
      return existing.frsChannels
    }
    // Default: cluster A=ch 1, cluster B=ch 2, etc., one per unit
    return plan.units.map((u, i) => ({ unitId: u.id, channel: (i % 22) + 1 }))
  })
  const [checkInTimes, setCheckInTimes] = useState<string[]>(existing?.checkInTimes ?? defaultCheckIns())
  const [hasMeshtastic, setHasMeshtastic] = useState<boolean>(existing?.hasMeshtastic ?? false)
  const [meshtasticNodes, setMeshtasticNodes] = useState<number>(existing?.meshtasticNodes ?? 0)
  const [meshtasticChannelName, setMeshtasticChannelName] = useState<string>(existing?.meshtasticChannelName ?? '')
  const [meshtasticEncryptionEnabled, setMeshtasticEncryptionEnabled] = useState<boolean>(existing?.meshtasticEncryptionEnabled ?? true)
  const [hasHamRadio, setHasHamRadio] = useState<boolean>(existing?.hasHamRadio ?? false)
  const [hamCallsign, setHamCallsign] = useState<string>(existing?.hamCallsign ?? '')
  const [hasNOAARadio, setHasNOAARadio] = useState<boolean>(existing?.hasNOAARadio ?? false)
  const [noaaModel, setNoaaModel] = useState<string>(existing?.noaaModel ?? '')
  const [neighbors, setNeighbors] = useState<NeighborDraft[]>(() => {
    const seed = existing?.neighborContacts ?? []
    const padded: NeighborDraft[] = [...seed.map(n => ({ name: n.name, address: n.address, phone: n.phone ?? '' }))]
    while (padded.length < 2) padded.push({ name: '', address: '', phone: '' })
    return padded
  })
  const [coordName, setCoordName] = useState<string>(existing?.outOfStateCoordinatorName ?? '')
  const [coordPhone, setCoordPhone] = useState<string>(existing?.outOfStateCoordinatorPhone ?? '')
  const [coordRelationship, setCoordRelationship] = useState<string>(existing?.outOfStateCoordinatorRelationship ?? '')

  function updateChannel(unitId: string, channel: number) {
    setChannels(channels.map(c => (c.unitId === unitId ? { ...c, channel } : c)))
  }

  function updateCheckIn(i: number, value: string) {
    const next = [...checkInTimes]
    next[i] = value
    setCheckInTimes(next)
  }

  function addCheckIn() { setCheckInTimes([...checkInTimes, '20:00']) }
  function removeCheckIn(i: number) {
    if (checkInTimes.length > 1) setCheckInTimes(checkInTimes.filter((_, idx) => idx !== i))
  }

  function updateNeighbor(i: number, field: keyof NeighborDraft, value: string) {
    const next = [...neighbors]
    next[i] = { ...next[i], [field]: value }
    setNeighbors(next)
  }

  function addNeighbor() {
    if (neighbors.length < 5) setNeighbors([...neighbors, { name: '', address: '', phone: '' }])
  }

  function removeNeighbor(i: number) {
    if (neighbors.length > 2) setNeighbors(neighbors.filter((_, idx) => idx !== i))
  }

  function persistAndContinue() {
    const comm: CommunicationPlan = {
      frsUnitCount,
      frsChannels: channels,
      checkInTimes,
      hasMeshtastic,
      meshtasticNodes: hasMeshtastic ? meshtasticNodes : undefined,
      meshtasticChannelName: hasMeshtastic && meshtasticChannelName.trim() ? meshtasticChannelName.trim() : undefined,
      meshtasticEncryptionEnabled: hasMeshtastic ? meshtasticEncryptionEnabled : undefined,
      hasHamRadio,
      hamCallsign: hasHamRadio ? hamCallsign : undefined,
      hasNOAARadio,
      noaaModel: hasNOAARadio ? noaaModel : undefined,
      neighborContacts: neighbors
        .filter(n => n.name.trim().length > 0)
        .map(n => ({ name: n.name, address: n.address, phone: n.phone || undefined })),
      outOfStateCoordinatorName: coordName || undefined,
      outOfStateCoordinatorPhone: coordPhone || undefined,
      outOfStateCoordinatorRelationship: coordRelationship || undefined,
    }
    setCommunication(comm)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Communications</h2>
        <p className="text-gray-600 mt-1">
          Phones fail. The plan is Family Radio Service (FRS) radios, scheduled check-ins, and one out-of-state coordinator. Everything else (Meshtastic, ham, neighbors) is layered on top.
        </p>
      </div>

      {/* ── FRS Radios ───────────────────────────────────────────────── */}
      <Card className="space-y-4">
        <CardTitle>Family Radio Service (FRS) Radios</CardTitle>
        <p className="text-sm text-gray-600">
          FRS is the primary backup communication channel. No license required. 2-mile range on flat ground, much more if there's elevation. Each unit gets a channel.
        </p>
        <Input
          label="Total FRS radio units owned across the family"
          type="number"
          min={0}
          value={frsUnitCount}
          onChange={e => setFrsUnitCount(parseInt(e.target.value) || 0)}
          hint="Recommend 2+ per family unit (one home, one go-bag)."
        />
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Channel assignments</h4>
          <div className="space-y-2">
            {plan.units.map(u => {
              const c = channels.find(ch => ch.unitId === u.id)
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 flex-1">{u.name}</span>
                  <Input
                    label=""
                    type="number"
                    min={1}
                    max={22}
                    value={c?.channel ?? 1}
                    onChange={e => updateChannel(u.id, Math.min(22, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-24"
                  />
                  <span className="text-xs text-gray-500">Ch (1–22)</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ── Check-in times ──────────────────────────────────────────── */}
      <Card className="space-y-3">
        <CardTitle>Check-In Times</CardTitle>
        <p className="text-sm text-gray-600">
          Everyone tunes to their channel at these times. Default: 8am / 12pm / 6pm.
        </p>
        <div className="space-y-2">
          {checkInTimes.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                label=""
                type="time"
                value={t}
                onChange={e => updateCheckIn(i, e.target.value)}
                className="w-40"
              />
              {checkInTimes.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeCheckIn(i)} className="text-red-600">
                  ✕
                </Button>
              )}
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addCheckIn}>+ Add check-in</Button>
        </div>
      </Card>

      {/* ── Meshtastic / LoRa ───────────────────────────────────────── */}
      <Card className="space-y-3">
        <CardTitle>Meshtastic / LoRa Mesh Radio <span className="text-sm font-normal text-gray-500">(optional)</span></CardTitle>
        <p className="text-sm text-gray-600">
          Meshtastic devices use LoRa radio to form a mesh network — works with no internet, no cell towers, no infrastructure. Longer range than FRS (1–10+ miles depending on terrain), text-based messaging, and GPS position sharing. Strong complement to FRS for extended outages.
        </p>
        <Checkbox label="Family has Meshtastic/LoRa devices" checked={hasMeshtastic} onChange={e => setHasMeshtastic(e.target.checked)} />
        {hasMeshtastic && (
          <div className="space-y-3 pl-2 border-l-2 border-blue-200">
            <Input
              label="Number of nodes (devices)"
              type="number"
              min={1}
              value={meshtasticNodes}
              onChange={e => setMeshtasticNodes(Math.max(1, parseInt(e.target.value) || 1))}
              hint="Recommend one per family unit. Nodes relay messages even when stationary."
            />
            <Input
              label="Channel name"
              placeholder="e.g., FAMILY-1 or MARSHALLS"
              value={meshtasticChannelName}
              onChange={e => setMeshtasticChannelName(e.target.value.toUpperCase())}
              hint="A shared channel name all your nodes must use. Set this in the Meshtastic app."
            />
            <Checkbox
              label="Encryption enabled (recommended)"
              checked={meshtasticEncryptionEnabled}
              onChange={e => setMeshtasticEncryptionEnabled(e.target.checked)}
            />
            <p className="text-xs text-gray-500">
              Use the default Meshtastic LongFast preset for 3–10 mile range. If all nodes are within 1 mile, ShortFast doubles throughput.
            </p>
          </div>
        )}
      </Card>

      {/* ── Ham radio ───────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <CardTitle>Ham Radio <span className="text-sm font-normal text-gray-500">(optional)</span></CardTitle>
        <Checkbox label="Family has a licensed ham operator" checked={hasHamRadio} onChange={e => setHasHamRadio(e.target.checked)} />
        {hasHamRadio && (
          <Input
            label="Callsign"
            placeholder="e.g. K9XYZ"
            value={hamCallsign}
            onChange={e => setHamCallsign(e.target.value.toUpperCase())}
          />
        )}
      </Card>

      {/* ── NOAA radio ──────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <CardTitle>National Oceanic and Atmospheric Administration (NOAA) Weather Radio</CardTitle>
        <Checkbox label="Have a NOAA weather radio" checked={hasNOAARadio} onChange={e => setHasNOAARadio(e.target.checked)} />
        {hasNOAARadio && (
          <Input
            label="Model (optional)"
            value={noaaModel}
            onChange={e => setNoaaModel(e.target.value)}
            hint="Hand-crank models are most resilient."
          />
        )}
      </Card>

      {/* ── Neighbors ───────────────────────────────────────────────── */}
      <Card className="space-y-3">
        <CardTitle>Neighbor Contacts</CardTitle>
        <p className="text-sm text-gray-600">
          2–5 trusted neighbors. They are your fastest in-person check, can deliver a written note, and may have a working landline or different carrier.
        </p>
        {neighbors.map((n, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <Input label="Name" value={n.name} onChange={e => updateNeighbor(i, 'name', e.target.value)} />
            <Input label="Address" value={n.address} onChange={e => updateNeighbor(i, 'address', e.target.value)} className="sm:col-span-2" />
            <div className="flex gap-2">
              <Input label="Phone" type="tel" value={n.phone} onChange={e => updateNeighbor(i, 'phone', e.target.value)} className="flex-1" />
              {neighbors.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removeNeighbor(i)} className="text-red-600 mb-1">✕</Button>
              )}
            </div>
          </div>
        ))}
        {neighbors.length < 5 && (
          <Button variant="ghost" size="sm" onClick={addNeighbor}>+ Add neighbor</Button>
        )}
      </Card>

      {/* ── Out-of-state coordinator ────────────────────────────────── */}
      <Card variant={coordName && coordPhone ? 'success' : 'default'} className="space-y-3">
        <CardTitle>Out-of-State Coordinator <span className="text-sm font-normal text-gray-500">(optional)</span></CardTitle>
        <p className="text-sm text-gray-600">
          Recommended but not required. An out-of-state contact acts as a relay hub when local communication is down — someone outside the affected area who knows where each cluster is and can relay messages between them.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Name" value={coordName} onChange={e => setCoordName(e.target.value)} />
          <Input label="Phone" type="tel" value={coordPhone} onChange={e => setCoordPhone(e.target.value)} />
          <Input label="Relationship" value={coordRelationship} onChange={e => setCoordRelationship(e.target.value)} />
        </div>
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue}>
          Save & Continue →
        </Button>
      </div>
    </div>
  )
}
