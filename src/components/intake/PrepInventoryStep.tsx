import { useState, useMemo } from 'react'
import { useFamilyPlan, getSensitiveInventory, setSensitiveInventory } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import { HOME_SUPPLIES } from '../../data/checklists/index'
import type { ChecklistItem } from '../../data/checklists/index'
import type {
  PrepInventoryItem,
  SupplyStatus,
  FirearmRecord,
  SensitiveInventory,
  ScenarioId,
} from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

// Match the home-supplies id namespace used by SuppliesStep (prefixed in DEFAULT_PREP_INVENTORY).
function homeSupplyId(itemId: string): string {
  return `home-${itemId}`
}

function toInventoryItem(item: ChecklistItem, status: SupplyStatus): PrepInventoryItem {
  return {
    id: homeSupplyId(item.id),
    name: item.name,
    category: item.category,
    status,
    scenarioRelevance: item.scenarioRelevance,
    quantity: item.quantity,
    notes: item.notes,
  }
}

const STATUS_LABELS: Record<SupplyStatus, string> = {
  have: 'Have', need: 'Need', na: 'N/A',
}

const STATUS_BUTTON_STYLES: Record<SupplyStatus, string> = {
  have: 'bg-green-600 text-white',
  need: 'bg-red-600 text-white',
  na: 'bg-gray-300 text-gray-800',
}

const SCENARIO_TAG_STYLES: Record<ScenarioId, string> = {
  tornado: 'bg-red-100 text-red-800',
  'power-outage': 'bg-amber-100 text-amber-800',
  'winter-storm': 'bg-blue-100 text-blue-800',
  flooding: 'bg-cyan-100 text-cyan-800',
  'forced-evacuation': 'bg-orange-100 text-orange-800',
  'telecom-failure': 'bg-purple-100 text-purple-800',
  'civil-unrest': 'bg-gray-200 text-gray-800',
  earthquake: 'bg-yellow-100 text-yellow-800',
  'house-fire': 'bg-red-200 text-red-900',
  'carbon-monoxide': 'bg-gray-300 text-gray-900',
}

const SCENARIO_TAG_SHORT: Record<ScenarioId, string> = {
  tornado: 'tornado',
  'power-outage': 'power',
  'winter-storm': 'winter',
  flooding: 'flood',
  'forced-evacuation': 'evac',
  'telecom-failure': 'telecom',
  'civil-unrest': 'unrest',
  earthquake: 'quake',
  'house-fire': 'fire',
  'carbon-monoxide': 'CO',
}

const PRIORITY_RANK: Record<ChecklistItem['priority'], number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

const FIREARM_TYPES = [
  { value: 'handgun', label: 'Handgun' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'other', label: 'Other' },
]

function newFirearm(): FirearmRecord {
  return { id: crypto.randomUUID(), type: 'handgun', storageLocation: '' }
}

function newNonLethal(): PrepInventoryItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    category: 'Non-Lethal',
    status: 'have',
    scenarioRelevance: [],
  }
}

export function PrepInventoryStep({ onNext, onBack }: Props) {
  const { plan, setPrepInventory } = useFamilyPlan()

  // ── Home supplies ────────────────────────────────────────────────────
  const [statuses, setStatuses] = useState<Record<string, SupplyStatus>>(() => {
    const map: Record<string, SupplyStatus> = {}
    for (const item of HOME_SUPPLIES) {
      const existing = plan.prepInventory.find(p => p.id === homeSupplyId(item.id))
      map[item.id] = existing?.status ?? 'need'
    }
    return map
  })

  // ── Sensitive inventory ──────────────────────────────────────────────
  const [sensitive, setSensitive] = useState<SensitiveInventory>(() => {
    const s = getSensitiveInventory() as Partial<SensitiveInventory>
    return {
      firearms: s.firearms ?? [],
      nonLethal: s.nonLethal ?? [],
    }
  })

  function setStatus(id: string, status: SupplyStatus) {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  // Shopping list = items currently marked Need, priority-sorted
  const shoppingList = useMemo(() => {
    return HOME_SUPPLIES
      .filter(i => statuses[i.id] === 'need')
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
  }, [statuses])

  // ── Sensitive handlers ───────────────────────────────────────────────
  function updateFirearm<K extends keyof FirearmRecord>(id: string, field: K, value: FirearmRecord[K]) {
    setSensitive(prev => ({
      ...prev,
      firearms: prev.firearms.map(f => (f.id === id ? { ...f, [field]: value } : f)),
    }))
  }

  function addFirearm() {
    setSensitive(prev => ({ ...prev, firearms: [...prev.firearms, newFirearm()] }))
  }

  function removeFirearm(id: string) {
    setSensitive(prev => ({ ...prev, firearms: prev.firearms.filter(f => f.id !== id) }))
  }

  function updateNonLethal<K extends keyof PrepInventoryItem>(id: string, field: K, value: PrepInventoryItem[K]) {
    setSensitive(prev => ({
      ...prev,
      nonLethal: prev.nonLethal.map(n => (n.id === id ? { ...n, [field]: value } : n)),
    }))
  }

  function addNonLethal() {
    setSensitive(prev => ({ ...prev, nonLethal: [...prev.nonLethal, newNonLethal()] }))
  }

  function removeNonLethal(id: string) {
    setSensitive(prev => ({ ...prev, nonLethal: prev.nonLethal.filter(n => n.id !== id) }))
  }

  // ── Save ─────────────────────────────────────────────────────────────
  function persistAndContinue() {
    // Replace only the home-supply portion of inventory; preserve go-bag entries.
    const homeIds = new Set(HOME_SUPPLIES.map(i => homeSupplyId(i.id)))
    const preservedOther = plan.prepInventory.filter(p => !homeIds.has(p.id))
    const homeInventory = HOME_SUPPLIES.map(item => toInventoryItem(item, statuses[item.id] ?? 'need'))
    setPrepInventory([...preservedOther, ...homeInventory])

    setSensitiveInventory(sensitive)
    onNext()
  }

  function renderItem(item: ChecklistItem) {
    const status = statuses[item.id] ?? 'need'
    return (
      <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">{item.name}</span>
              {item.priority === 'critical' && (
                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">critical</span>
              )}
              {item.priority === 'high' && (
                <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">high</span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity}
              {item.notes ? ` · ${item.notes}` : ''}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.scenarioRelevance.map(s => (
                <span
                  key={s}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${SCENARIO_TAG_STYLES[s]}`}
                >
                  {SCENARIO_TAG_SHORT[s]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {(['have', 'need', 'na'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(item.id, s)}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  status === s
                    ? STATUS_BUTTON_STYLES[s]
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Group home supplies by category
  const byCategory = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {}
    for (const item of HOME_SUPPLIES) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home Supply Inventory</h2>
        <p className="text-gray-600 mt-1">
          Larger home-stored supplies meant for shelter-in-place scenarios. Mark Have / Need / N/A. Items marked Need become your prioritized shopping list. Each item shows which disaster scenarios it covers.
        </p>
      </div>

      {/* Categories */}
      {Object.entries(byCategory).map(([category, items]) => (
        <Card key={category}>
          <CardTitle>{category}</CardTitle>
          <div className="space-y-0">
            {items.map(renderItem)}
          </div>
        </Card>
      ))}

      {/* Shopping list */}
      <Card variant={shoppingList.length > 0 ? 'warning' : 'success'}>
        <CardTitle>
          {shoppingList.length > 0
            ? `🛒 Shopping List — ${shoppingList.length} item${shoppingList.length === 1 ? '' : 's'}`
            : '✓ Home supplies complete'}
        </CardTitle>
        {shoppingList.length > 0 && (
          <ol className="text-sm text-amber-900 mt-2 list-decimal list-inside space-y-1">
            {shoppingList.map(i => (
              <li key={i.id}>
                <strong>{i.name}</strong> — {i.quantity}
                {i.priority === 'critical' && <span className="ml-2 text-xs bg-red-200 text-red-900 px-1 rounded">critical</span>}
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* ── Sensitive inventory ─────────────────────────────────────── */}
      <Card variant="danger">
        <CardTitle>🔒 SENSITIVE — Printed Separately</CardTitle>
        <p className="text-sm text-red-800 mb-3">
          Firearms and non-lethal defensive items are tracked separately in your browser's storage (different localStorage key from the main plan). They print on a separate document and should be stored in a different physical location from the main binder.
        </p>

        {/* Firearms */}
        <h4 className="font-medium text-gray-900 mt-4 mb-2">Firearms</h4>
        {sensitive.firearms.length === 0 && (
          <p className="text-sm text-gray-600 italic">None recorded.</p>
        )}
        {sensitive.firearms.map(f => (
          <div key={f.id} className="bg-white p-3 rounded-lg mb-2 border border-red-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Type"
                value={f.type}
                onChange={e => updateFirearm(f.id, 'type', e.target.value)}
                options={FIREARM_TYPES}
              />
              <Input
                label="Caliber / gauge"
                value={f.caliber ?? ''}
                onChange={e => updateFirearm(f.id, 'caliber', e.target.value)}
              />
              <Input
                label="Storage location"
                placeholder="e.g., master closet safe"
                value={f.storageLocation}
                onChange={e => updateFirearm(f.id, 'storageLocation', e.target.value)}
              />
              <Input
                label="Safe combination location"
                placeholder="e.g., separate from primary records"
                value={f.safeLocation ?? ''}
                onChange={e => updateFirearm(f.id, 'safeLocation', e.target.value)}
              />
              <Input
                label="Ammunition quantity"
                placeholder="e.g., 100 rounds 9mm"
                value={f.ammoQuantity ?? ''}
                onChange={e => updateFirearm(f.id, 'ammoQuantity', e.target.value)}
              />
              <Input
                label="Scenario notes"
                placeholder="e.g., home defense; not for evacuation"
                value={f.scenarioNotes ?? ''}
                onChange={e => updateFirearm(f.id, 'scenarioNotes', e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeFirearm(f.id)} className="text-red-700">
              Remove this firearm
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addFirearm}>+ Add firearm</Button>

        {/* Non-lethal */}
        <h4 className="font-medium text-gray-900 mt-6 mb-2">Non-Lethal Defensive Items</h4>
        {sensitive.nonLethal.length === 0 && (
          <p className="text-sm text-gray-600 italic">None recorded (e.g. pepper spray, taser).</p>
        )}
        {sensitive.nonLethal.map(n => (
          <div key={n.id} className="bg-white p-3 rounded-lg mb-2 border border-red-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Name"
                placeholder="e.g., pepper spray"
                value={n.name}
                onChange={e => updateNonLethal(n.id, 'name', e.target.value)}
              />
              <Input
                label="Quantity"
                value={n.quantity ?? ''}
                onChange={e => updateNonLethal(n.id, 'quantity', e.target.value)}
              />
              <Input
                label="Storage location"
                value={n.storageLocation ?? ''}
                onChange={e => updateNonLethal(n.id, 'storageLocation', e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeNonLethal(n.id)} className="text-red-700">
              Remove
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addNonLethal}>+ Add non-lethal item</Button>
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue}>Save & Continue →</Button>
      </div>
    </div>
  )
}
