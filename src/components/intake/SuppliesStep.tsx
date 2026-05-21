import { useState, useMemo } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { GO_BAG_ITEMS } from '../../data/checklists/index'
import type { ChecklistItem } from '../../data/checklists/index'
import type { PrepInventoryItem, SupplyStatus } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

const STATUS_LABELS: Record<SupplyStatus, string> = {
  have: 'Have it',
  need: 'Need it',
  na: 'N/A',
}

const STATUS_BUTTON_STYLES: Record<SupplyStatus, string> = {
  have: 'bg-green-600 text-white',
  need: 'bg-red-600 text-white',
  na: 'bg-gray-300 text-gray-800',
}

// We key all go-bag inventory by ChecklistItem.id directly.
function toInventoryItem(item: ChecklistItem, status: SupplyStatus): PrepInventoryItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    status,
    scenarioRelevance: item.scenarioRelevance,
    quantity: item.quantity,
    notes: item.notes,
  }
}

export function SuppliesStep({ onNext, onBack }: Props) {
  const { plan, setPrepInventory } = useFamilyPlan()

  // Initial statuses: keep any existing match by id, else default to 'need'
  const [statuses, setStatuses] = useState<Record<string, SupplyStatus>>(() => {
    const map: Record<string, SupplyStatus> = {}
    for (const item of GO_BAG_ITEMS) {
      const existing = plan.prepInventory.find(p => p.id === item.id)
      map[item.id] = existing?.status ?? 'need'
    }
    return map
  })

  const hasInfant = useMemo(
    () => plan.units.some(u => u.members.some(m => m.age <= 1)),
    [plan.units],
  )

  // Group items by category. Infant items live in their own highlighted block
  // when an infant exists; otherwise filtered out unless explicitly toggled.
  const { infantItems, byCategory } = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {}
    const infants: ChecklistItem[] = []
    for (const item of GO_BAG_ITEMS) {
      if (item.infantRequired) {
        if (hasInfant) infants.push(item)
        // If no infant, we silently drop infant-only items — they would be noise.
        continue
      }
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return { infantItems: infants, byCategory: groups }
  }, [hasInfant])

  function setStatus(id: string, status: SupplyStatus) {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  function persistAndContinue() {
    // Preserve any non-go-bag inventory items (home supplies) the user already
    // recorded — only replace go-bag items here.
    const goBagIds = new Set(GO_BAG_ITEMS.map(i => i.id))
    const preservedOther = plan.prepInventory.filter(p => !goBagIds.has(p.id))
    const goBagInventory = GO_BAG_ITEMS.map(item => toInventoryItem(item, statuses[item.id] ?? 'need'))
    setPrepInventory([...preservedOther, ...goBagInventory])
    onNext()
  }

  const criticalMissing = GO_BAG_ITEMS.filter(
    item => item.priority === 'critical' && statuses[item.id] === 'need',
  )

  function renderItem(item: ChecklistItem) {
    const status = statuses[item.id] ?? 'need'
    const priorityBadge =
      item.priority === 'critical'
        ? <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">critical</span>
        : item.priority === 'high'
        ? <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">high</span>
        : null
    return (
      <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">{item.name}</span>
              {priorityBadge}
            </div>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity}
              {item.notes ? ` · ${item.notes}` : ''}
            </p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Go-Bag Inventory</h2>
        <p className="text-gray-600 mt-1">
          Walk through your go-bag. Mark each item Have / Need / N/A. Items marked "Need" become your shopping list. Critical items are highlighted.
        </p>
      </div>

      {/* Infant-required section first if relevant */}
      {hasInfant && infantItems.length > 0 && (
        <Card variant="warning">
          <CardTitle>👶 Infant Essentials (Required)</CardTitle>
          <p className="text-xs text-amber-800 mb-2">
            You have a household member age 1 or under — these items are non-negotiable.
          </p>
          <div className="space-y-0">
            {infantItems.map(renderItem)}
          </div>
        </Card>
      )}

      {/* Categories */}
      {Object.entries(byCategory).map(([category, items]) => (
        <Card key={category}>
          <CardTitle>{category}</CardTitle>
          <div className="space-y-0">
            {items.map(renderItem)}
          </div>
        </Card>
      ))}

      {/* Summary */}
      <Card variant={criticalMissing.length > 0 ? 'danger' : 'success'}>
        <CardTitle>
          {criticalMissing.length > 0
            ? `⚠ ${criticalMissing.length} critical item${criticalMissing.length === 1 ? '' : 's'} missing`
            : '✓ All critical items accounted for'}
        </CardTitle>
        {criticalMissing.length > 0 && (
          <ul className="text-sm text-red-800 mt-2 list-disc list-inside space-y-0.5">
            {criticalMissing.map(i => <li key={i.id}>{i.name}</li>)}
          </ul>
        )}
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue}>Save & Continue →</Button>
      </div>
    </div>
  )
}
