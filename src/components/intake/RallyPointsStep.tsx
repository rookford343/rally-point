import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input, Checkbox, Select } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type {
  FamilyCluster,
  RallyPoint,
  RallyPointResources,
  FamilyUnit,
  ConvergencePlan,
  CommunicationPlan,
} from '../../types/plan'
import { scoreUnitsForRallyPoint, computeBringList } from '../../lib/plan-generator'

interface Props { onNext: () => void; onBack: () => void }

function generateId() { return crypto.randomUUID() }

function emptyResources(): RallyPointResources {
  return {
    hasGenerator: false,
    waterGallons: 0,
    foodDays: 0,
    shelterCapacity: 0,
    hasFirstAidKit: false,
    hasAED: false,
    hasChainsaw: false,
    hasHandTools: false,
    hasNOAARadio: false,
    hasFRSRadios: false,
    hasLandline: false,
  }
}

// Rough straight-line distance (miles) between two lat/lng points using
// the equirectangular approximation. Good enough for "is this >15mi?" checks.
function distanceMiles(
  a: { lat?: number; lng?: number },
  b: { lat?: number; lng?: number },
): number | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null
  const toRad = (d: number) => (d * Math.PI) / 180
  const earthRadiusMiles = 3958.8
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x = (toRad(b.lng - a.lng)) * Math.cos((lat1 + lat2) / 2)
  const y = lat2 - lat1
  return Math.sqrt(x * x + y * y) * earthRadiusMiles
}

export function RallyPointsStep({ onNext, onBack }: Props) {
  const {
    plan,
    setClusters,
    addRallyPoint,
    updateRallyPoint,
    removeRallyPoint,
    setConvergencePlan,
    setCommunication,
  } = useFamilyPlan()

  // ── Local cluster draft state ────────────────────────────────────────────
  const [clusters, setLocalClusters] = useState<FamilyCluster[]>(
    plan.clusters.length > 0
      ? plan.clusters
      : [{ id: generateId(), name: 'Cluster A', unitIds: [], localHubId: '' }],
  )

  // ── Rally point editor ───────────────────────────────────────────────────
  const [editingRpId, setEditingRpId] = useState<string | null>(null)
  const [draftRp, setDraftRp] = useState<RallyPoint>({
    id: '',
    name: '',
    address: '',
    isCommunityLocation: false,
    resources: emptyResources(),
  })

  // ── Convergence + out-of-state coordinator ───────────────────────────────
  const [convergenceHubId, setConvergenceHubId] = useState<string>(
    plan.convergencePlan?.fullConvergenceHubId ?? '',
  )
  const [convergenceDays, setConvergenceDays] = useState<number>(
    plan.convergencePlan?.convergenceDayThreshold ?? 3,
  )

  const [coordName, setCoordName] = useState<string>(
    plan.communication?.outOfStateCoordinatorName ?? '',
  )
  const [coordPhone, setCoordPhone] = useState<string>(
    plan.communication?.outOfStateCoordinatorPhone ?? '',
  )
  const [coordRelationship, setCoordRelationship] = useState<string>(
    plan.communication?.outOfStateCoordinatorRelationship ?? '',
  )

  // ── Cluster mutations ────────────────────────────────────────────────────
  function addCluster() {
    const letter = String.fromCharCode(65 + clusters.length)
    setLocalClusters([
      ...clusters,
      { id: generateId(), name: `Cluster ${letter}`, unitIds: [], localHubId: '' },
    ])
  }

  function removeCluster(id: string) {
    setLocalClusters(clusters.filter(c => c.id !== id))
  }

  function renameCluster(id: string, name: string) {
    setLocalClusters(clusters.map(c => (c.id === id ? { ...c, name } : c)))
  }

  function toggleUnitInCluster(clusterId: string, unitId: string) {
    setLocalClusters(
      clusters.map(c => {
        if (c.id === clusterId) {
          const inCluster = c.unitIds.includes(unitId)
          return {
            ...c,
            unitIds: inCluster
              ? c.unitIds.filter(id => id !== unitId)
              : [...c.unitIds, unitId],
          }
        }
        // Ensure unit only belongs to one cluster — remove from other clusters
        return { ...c, unitIds: c.unitIds.filter(id => id !== unitId) }
      }),
    )
  }

  function setClusterHub(clusterId: string, hubId: string) {
    setLocalClusters(clusters.map(c => (c.id === clusterId ? { ...c, localHubId: hubId } : c)))
  }

  // ── Rally point editor handlers ──────────────────────────────────────────
  function newRallyPointForCluster(cluster: FamilyCluster) {
    setDraftRp({
      id: generateId(),
      name: `${cluster.name} Hub`,
      address: '',
      isCommunityLocation: false,
      resources: emptyResources(),
    })
    setEditingRpId('new')
  }

  function editRallyPoint(rp: RallyPoint) {
    setDraftRp({ ...rp, resources: { ...rp.resources } })
    setEditingRpId(rp.id)
  }

  function saveRallyPoint() {
    if (editingRpId === 'new') {
      addRallyPoint(draftRp)
    } else {
      updateRallyPoint(draftRp)
    }
    setEditingRpId(null)
  }

  function updateRes<K extends keyof RallyPointResources>(key: K, value: RallyPointResources[K]) {
    setDraftRp({ ...draftRp, resources: { ...draftRp.resources, [key]: value } })
  }

  // ── Persist on continue ──────────────────────────────────────────────────
  function persistAndContinue() {
    setClusters(clusters)

    if (convergenceHubId) {
      const cp: ConvergencePlan = {
        fullConvergenceHubId: convergenceHubId,
        convergenceDayThreshold: convergenceDays,
      }
      setConvergencePlan(cp)
    }

    // Persist coordinator into communication plan (preserving any other fields
    // a later step may have already filled).
    const existingComm = plan.communication
    const nextComm: CommunicationPlan = {
      frsUnitCount: existingComm?.frsUnitCount ?? 0,
      frsChannels: existingComm?.frsChannels ?? [],
      checkInTimes: existingComm?.checkInTimes ?? ['08:00', '12:00', '18:00'],
      hasMeshtastic: existingComm?.hasMeshtastic ?? false,
      meshtasticNodes: existingComm?.meshtasticNodes,
      hasHamRadio: existingComm?.hasHamRadio ?? false,
      hamCallsign: existingComm?.hamCallsign,
      hasNOAARadio: existingComm?.hasNOAARadio ?? false,
      noaaModel: existingComm?.noaaModel,
      neighborContacts: existingComm?.neighborContacts ?? [],
      outOfStateCoordinatorName: coordName,
      outOfStateCoordinatorPhone: coordPhone,
      outOfStateCoordinatorRelationship: coordRelationship,
    }
    setCommunication(nextComm)
    onNext()
  }

  // ── Derived helpers ──────────────────────────────────────────────────────
  function unitsInCluster(cluster: FamilyCluster): FamilyUnit[] {
    return plan.units.filter(u => cluster.unitIds.includes(u.id))
  }

  function findHub(cluster: FamilyCluster): RallyPoint | undefined {
    return plan.rallyPoints.find(r => r.id === cluster.localHubId)
  }

  // For sub-hub suggestion: any unit > 15 miles from the cluster hub (when coords available)
  function farUnits(cluster: FamilyCluster): FamilyUnit[] {
    const hub = findHub(cluster)
    if (!hub) return []
    return unitsInCluster(cluster).filter(u => {
      const d = distanceMiles(u, hub)
      return d != null && d > 15
    })
  }

  const allUnitsClustered = plan.units.every(u =>
    clusters.some(c => c.unitIds.includes(u.id)),
  )
  const allClustersHaveHubs = clusters.every(c => !!c.localHubId)
  const canContinue = plan.units.length > 0 && clusters.length > 0 && allUnitsClustered && allClustersHaveHubs

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rally Points</h2>
        <p className="text-gray-600 mt-1">
          Group your family units into geographic clusters. Each cluster needs a local hub — the rally point closest to those units. Suggestion scoring weighs basements, safe rooms, and household capacity.
        </p>
      </div>

      {/* ── Clusters ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {clusters.map(cluster => {
          const inCluster = unitsInCluster(cluster)
          const scores = scoreUnitsForRallyPoint(plan.units, cluster.unitIds)
          const hub = findHub(cluster)
          const far = farUnits(cluster)

          return (
            <Card key={cluster.id} className="space-y-4">
              <div className="flex justify-between items-start gap-3">
                <Input
                  label="Cluster name"
                  value={cluster.name}
                  onChange={e => renameCluster(cluster.id, e.target.value)}
                  className="flex-1"
                />
                {clusters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCluster(cluster.id)}
                    className="text-red-600 mt-6"
                  >
                    Remove cluster
                  </Button>
                )}
              </div>

              {/* Unit selection */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Units in this cluster</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plan.units.map(u => (
                    <Checkbox
                      key={u.id}
                      label={`${u.name} — ${u.address}`}
                      checked={cluster.unitIds.includes(u.id)}
                      onChange={() => toggleUnitInCluster(cluster.id, u.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Suggestion scores */}
              {scores.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-medium text-gray-700 mb-1">Hub suggestion ranking:</p>
                  {scores.map(s => (
                    <div key={s.unitId} className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{s.unitName}</span>{' '}
                        {s.disqualified ? (
                          <span className="text-red-700 text-xs">— {s.disqualifyReason}</span>
                        ) : (
                          <span className="text-xs text-gray-600">— {s.reasons.join(', ')}</span>
                        )}
                      </div>
                      <span className={`font-mono text-xs ${s.disqualified ? 'text-red-700' : 'text-gray-700'}`}>
                        {s.disqualified ? 'N/A' : `${s.score} pts`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hub picker */}
              <Select
                label="Local hub (rally point) for this cluster"
                value={cluster.localHubId}
                onChange={e => setClusterHub(cluster.id, e.target.value)}
                options={plan.rallyPoints.map(rp => ({
                  value: rp.id,
                  label: `${rp.name} — ${rp.address || '(no address)'}`,
                }))}
                hint="Pick an existing rally point, or add one below."
              />

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => newRallyPointForCluster(cluster)}>
                  + Add rally point for this cluster
                </Button>
                {hub && (
                  <Button variant="ghost" size="sm" onClick={() => editRallyPoint(hub)}>
                    Edit hub resources
                  </Button>
                )}
              </div>

              {/* Bring list preview */}
              {hub && inCluster.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="font-medium text-amber-900 text-sm mb-1">Bring this when rallying here:</p>
                  <ul className="text-xs text-amber-800 space-y-0.5">
                    {computeBringList(hub, inCluster).map((item, i) => (
                      <li key={i}>
                        {item.critical ? '⚠ ' : '• '}
                        <strong>{item.name}</strong> — {item.reason}
                      </li>
                    ))}
                    {computeBringList(hub, inCluster).length === 0 && (
                      <li>✓ Hub appears adequately stocked for this cluster.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Sub-hub prompt */}
              {far.length > 0 && (
                <Card variant="warning">
                  <p className="text-sm text-amber-900">
                    <strong>Consider a sub-hub:</strong>{' '}
                    {far.map(u => u.name).join(', ')}{' '}
                    {far.length === 1 ? 'is' : 'are'} more than 15 miles from the hub. A secondary rally point closer to them may be faster than the primary in some scenarios.
                  </p>
                </Card>
              )}
            </Card>
          )
        })}

        <Button variant="secondary" size="sm" onClick={addCluster}>+ Add another cluster</Button>
      </div>

      {/* ── Rally point editor ────────────────────────────────────────── */}
      {editingRpId && (
        <Card className="space-y-4 border-blue-300">
          <CardTitle>{editingRpId === 'new' ? 'New Rally Point' : 'Edit Rally Point'}</CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Rally point name"
              value={draftRp.name}
              onChange={e => setDraftRp({ ...draftRp, name: e.target.value })}
            />
            <Input
              label="Address"
              value={draftRp.address}
              onChange={e => setDraftRp({ ...draftRp, address: e.target.value })}
              hint="This is the address people drive/walk to — without GPS."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Host unit (if hosted at a family member's house)"
              value={draftRp.hostUnitId ?? ''}
              onChange={e => setDraftRp({
                ...draftRp,
                hostUnitId: e.target.value || undefined,
                isCommunityLocation: !e.target.value,
              })}
              options={plan.units.map(u => ({ value: u.id, label: u.name }))}
            />
            <div className="flex items-end">
              <Checkbox
                label="Community location (church, fire station, school…)"
                checked={draftRp.isCommunityLocation}
                onChange={e => setDraftRp({
                  ...draftRp,
                  isCommunityLocation: e.target.checked,
                  hostUnitId: e.target.checked ? undefined : draftRp.hostUnitId,
                })}
              />
            </div>
          </div>

          {draftRp.isCommunityLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="On-site contact name"
                value={draftRp.hostContactName ?? ''}
                onChange={e => setDraftRp({ ...draftRp, hostContactName: e.target.value })}
              />
              <Input
                label="On-site contact phone"
                type="tel"
                value={draftRp.hostContactPhone ?? ''}
                onChange={e => setDraftRp({ ...draftRp, hostContactPhone: e.target.value })}
              />
            </div>
          )}

          <h4 className="font-medium text-gray-800">Resources at this rally point</h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Checkbox
              label="Generator"
              checked={draftRp.resources.hasGenerator}
              onChange={e => updateRes('hasGenerator', e.target.checked)}
            />
            {draftRp.resources.hasGenerator && (
              <Input
                label="Generator watts"
                type="number"
                min={0}
                value={draftRp.resources.generatorWatts ?? 0}
                onChange={e => updateRes('generatorWatts', parseInt(e.target.value) || 0)}
              />
            )}
            <Input
              label="Stored water (gallons)"
              type="number"
              min={0}
              value={draftRp.resources.waterGallons}
              onChange={e => updateRes('waterGallons', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Food (days)"
              type="number"
              min={0}
              value={draftRp.resources.foodDays}
              onChange={e => updateRes('foodDays', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Shelter capacity (people)"
              type="number"
              min={0}
              value={draftRp.resources.shelterCapacity}
              onChange={e => updateRes('shelterCapacity', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Checkbox label="First aid kit" checked={draftRp.resources.hasFirstAidKit} onChange={e => updateRes('hasFirstAidKit', e.target.checked)} />
            <Checkbox label="AED" checked={draftRp.resources.hasAED} onChange={e => updateRes('hasAED', e.target.checked)} />
            <Checkbox label="Chainsaw" checked={draftRp.resources.hasChainsaw} onChange={e => updateRes('hasChainsaw', e.target.checked)} />
            <Checkbox label="Hand tools" checked={draftRp.resources.hasHandTools} onChange={e => updateRes('hasHandTools', e.target.checked)} />
            <Checkbox label="NOAA radio" checked={draftRp.resources.hasNOAARadio} onChange={e => updateRes('hasNOAARadio', e.target.checked)} />
            <Checkbox label="FRS radios" checked={draftRp.resources.hasFRSRadios} onChange={e => updateRes('hasFRSRadios', e.target.checked)} />
            <Checkbox label="Landline" checked={draftRp.resources.hasLandline} onChange={e => updateRes('hasLandline', e.target.checked)} />
          </div>

          <div className="flex justify-end gap-2">
            {editingRpId !== 'new' && (
              <Button variant="ghost" size="sm" onClick={() => { removeRallyPoint(draftRp.id); setEditingRpId(null) }} className="text-red-600">
                Delete rally point
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditingRpId(null)}>Cancel</Button>
            <Button onClick={saveRallyPoint} disabled={!draftRp.name || !draftRp.address}>
              Save Rally Point
            </Button>
          </div>
        </Card>
      )}

      {/* ── Convergence + coordinator ─────────────────────────────────── */}
      <Card className="space-y-4">
        <CardTitle>Full-Family Convergence</CardTitle>
        <p className="text-sm text-gray-600">
          After day 3 of an extended event, the plan is for all clusters to converge at one location. This is usually the strongest hub or an out-of-area family home.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Convergence hub"
            value={convergenceHubId}
            onChange={e => setConvergenceHubId(e.target.value)}
            options={plan.rallyPoints.map(rp => ({
              value: rp.id,
              label: `${rp.name} — ${rp.address}`,
            }))}
          />
          <Input
            label="Convergence trigger (days into event)"
            type="number"
            min={1}
            value={convergenceDays}
            onChange={e => setConvergenceDays(parseInt(e.target.value) || 3)}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Out-of-State Coordinator</CardTitle>
        <p className="text-sm text-gray-600">
          One person far enough away to be unaffected by your local disaster. Everyone in your plan calls this person to relay status when local lines are down.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Name" value={coordName} onChange={e => setCoordName(e.target.value)} />
          <Input label="Phone" type="tel" value={coordPhone} onChange={e => setCoordPhone(e.target.value)} />
          <Input
            label="Relationship"
            placeholder="aunt, brother…"
            value={coordRelationship}
            onChange={e => setCoordRelationship(e.target.value)}
          />
        </div>
      </Card>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue} disabled={!canContinue}>
          {canContinue
            ? 'Save & Continue →'
            : `Assign all units to a cluster with a hub`}
        </Button>
      </div>
    </div>
  )
}
