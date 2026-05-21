import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input, Checkbox } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { Pet, FamilyUnit } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

function generateId() { return crypto.randomUUID() }

export function PetsStep({ onNext, onBack }: Props) {
  const { plan, updateUnit } = useFamilyPlan()
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
  const [draftPets, setDraftPets] = useState<Pet[]>([])

  function startEditing(unit: FamilyUnit) {
    setEditingUnitId(unit.id)
    setDraftPets([...unit.pets])
  }

  function addPet() {
    setDraftPets([...draftPets, { id: generateId(), name: '', type: 'dog', hasCarrier: false }])
  }

  function updatePet(idx: number, field: keyof Pet, value: string | boolean) {
    const pets = [...draftPets]
    pets[idx] = { ...pets[idx], [field]: value }
    setDraftPets(pets)
  }

  function removePet(idx: number) {
    setDraftPets(draftPets.filter((_, i) => i !== idx))
  }

  function save() {
    const unit = plan.units.find(u => u.id === editingUnitId)
    if (unit) updateUnit({ ...unit, pets: draftPets })
    setEditingUnitId(null)
  }

  const totalPets = plan.units.reduce((sum, u) => sum + u.pets.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pets</h2>
        <p className="text-gray-600 mt-1">
          Add pets for each family unit. This affects go-bag contents, vehicle load capacity, and evacuation routes — most emergency shelters require current vaccination records.
        </p>
      </div>

      <div className="space-y-3">
        {plan.units.map(unit => (
          <Card key={unit.id}>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{unit.name}</CardTitle>
                {unit.pets.length === 0 ? (
                  <p className="text-sm text-gray-500">No pets added</p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {unit.pets.map(p => `${p.name} (${p.type})`).join(', ')}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEditing(unit)}>
                {unit.pets.length === 0 ? '+ Add pets' : 'Edit'}
              </Button>
            </div>

            {editingUnitId === unit.id && (
              <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
                {draftPets.map((pet, i) => (
                  <div key={pet.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Input label="Pet name" value={pet.name} onChange={e => updatePet(i, 'name', e.target.value)} />
                      <Input label="Type" placeholder="dog, cat, bird…" value={pet.type} onChange={e => updatePet(i, 'type', e.target.value)} />
                      <Input label="Special needs" placeholder="medications, diet…" value={pet.specialNeeds ?? ''} onChange={e => updatePet(i, 'specialNeeds', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-4">
                      <Checkbox label="Has a carrier" checked={pet.hasCarrier} onChange={e => updatePet(i, 'hasCarrier', e.target.checked)} />
                      <Button variant="ghost" size="sm" onClick={() => removePet(i)} className="text-red-600">Remove</Button>
                    </div>
                    {!pet.hasCarrier && (
                      <p className="text-xs text-amber-700">⚠ No carrier — add "Pet carrier" to your go-bag checklist.</p>
                    )}
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="ghost" size="sm" onClick={addPet}>+ Add pet</Button>
                  <Button size="sm" onClick={save}>Save</Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingUnitId(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {totalPets > 0 && (
        <Card variant="warning">
          <p className="text-sm text-amber-800">
            <strong>Reminder:</strong> Most emergency shelters require current pet vaccination records. Keep a copy in your go-bag. Not all shelters accept pets — know your nearest pet-friendly shelter in advance.
          </p>
        </Card>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </div>
  )
}
