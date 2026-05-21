import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Input, Select, Checkbox } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { FamilyUnit, FamilyMember, Vehicle, HomeType, FuelType, VehicleType } from '../../types/plan'
import { computeEVCoordinations } from '../../lib/plan-generator'
import { geocodeAddress } from '../../lib/routing'

interface Props { onNext: () => void; onBack: () => void }

function generateId() { return crypto.randomUUID() }

const HOME_TYPE_OPTIONS = [
  { value: 'single-family', label: 'Single-family home' },
  { value: 'apartment', label: 'Apartment / condo' },
  { value: 'mobile', label: 'Mobile / manufactured home' },
  { value: 'condo', label: 'Condo / townhouse' },
  { value: 'other', label: 'Other' },
]

const FUEL_TYPE_OPTIONS = [
  { value: 'gas', label: 'Gas' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric (EV)' },
]

const VEHICLE_TYPE_OPTIONS = [
  { value: 'car', label: 'Car / sedan' },
  { value: 'truck', label: 'Truck' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van / minivan' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'other', label: 'Other' },
]

function emptyMember(): FamilyMember {
  return { id: generateId(), name: '', age: 0 }
}

function emptyVehicle(): Vehicle {
  return { id: generateId(), type: 'car', fuelType: 'gas', rangeEstimateMiles: 300, passengerCapacity: 4 }
}

function emptyUnit(): FamilyUnit {
  return {
    id: generateId(),
    name: '',
    address: '',
    members: [emptyMember()],
    pets: [],
    vehicles: [emptyVehicle()],
    homeType: 'single-family',
    hasBasement: false,
    hasSafeRoom: false,
    inFloodPlain: false,
    nearWaterway: false,
  }
}

export function FamilyUnitsStep({ onNext, onBack }: Props) {
  const { plan, addUnit, updateUnit, removeUnit, setEVCoordinations, setUnitCoords } = useFamilyPlan()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<FamilyUnit>(emptyUnit())

  function startNew() {
    setDraft(emptyUnit())
    setEditingId('new')
  }

  function startEdit(unit: FamilyUnit) {
    setDraft({ ...unit })
    setEditingId(unit.id)
  }

  function saveDraft() {
    if (editingId === 'new') {
      addUnit(draft)
    } else {
      updateUnit(draft)
    }
    setEditingId(null)
    // Recompute EV coordinations after any unit change
    const updatedUnits = editingId === 'new'
      ? [...plan.units, draft]
      : plan.units.map(u => u.id === draft.id ? draft : u)
    setEVCoordinations(computeEVCoordinations(updatedUnits))
    // Geocode address in background — populates lat/lng for route auto-calculation
    if (draft.address) {
      const unitId = draft.id
      geocodeAddress(draft.address).then(coords => {
        if (coords) setUnitCoords(unitId, coords.lat, coords.lng)
      })
    }
  }

  function updateMember(idx: number, field: keyof FamilyMember, value: string | number) {
    const members = [...draft.members]
    members[idx] = { ...members[idx], [field]: value }
    setDraft({ ...draft, members })
  }

  function addMember() {
    setDraft({ ...draft, members: [...draft.members, emptyMember()] })
  }

  function removeMember(idx: number) {
    setDraft({ ...draft, members: draft.members.filter((_, i) => i !== idx) })
  }

  function updateVehicle(idx: number, field: keyof Vehicle, value: string | number) {
    const vehicles = [...draft.vehicles]
    vehicles[idx] = { ...vehicles[idx], [field]: value }
    setDraft({ ...draft, vehicles })
  }

  function addVehicle() {
    setDraft({ ...draft, vehicles: [...draft.vehicles, emptyVehicle()] })
  }

  function removeVehicle(idx: number) {
    setDraft({ ...draft, vehicles: draft.vehicles.filter((_, i) => i !== idx) })
  }

  const isEVOnly = draft.vehicles.length > 0 && draft.vehicles.every(v => v.fuelType === 'electric')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Family Units</h2>
        <p className="text-gray-600 mt-1">
          Add each household that will be part of this plan. Each household is a "unit" that evacuates together. Your immediate family is one unit; in-laws or parents at a different address are another.
        </p>
      </div>

      {/* Existing units */}
      {plan.units.length > 0 && (
        <div className="space-y-3">
          {plan.units.map(unit => {
            const evOnly = unit.vehicles.every(v => v.fuelType === 'electric')
            return (
              <Card key={unit.id} variant={evOnly ? 'warning' : 'default'} className="flex items-start justify-between">
                <div>
                  <CardTitle>{unit.name || 'Unnamed unit'}</CardTitle>
                  <p className="text-sm text-gray-600">{unit.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {unit.members.length} member{unit.members.length !== 1 ? 's' : ''} ·{' '}
                    {unit.vehicles.length} vehicle{unit.vehicles.length !== 1 ? 's' : ''}{' '}
                    {evOnly && <span className="text-amber-700 font-medium">· EV-only ⚡</span>}
                    {unit.hasBasement && <span className="text-green-700"> · Basement ✓</span>}
                    {unit.homeType === 'mobile' && <span className="text-red-700"> · Mobile home ⚠</span>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(unit)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => removeUnit(unit.id)} className="text-red-600 hover:bg-red-50">Remove</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* EV coordination notice */}
      {plan.evCoordinations.length > 0 && (
        <Card variant="warning">
          <CardTitle>⚡ EV Coordination Plan Generated</CardTitle>
          {plan.evCoordinations.map(evc => {
            const evUnit = plan.units.find(u => u.id === evc.evUnitId)
            const gasUnit = plan.units.find(u => u.id === evc.pickupByUnitId)
            return (
              <p key={evc.evUnitId} className="text-sm text-amber-800 mt-1">
                <strong>{evUnit?.name}</strong> (EV-only) should be picked up by{' '}
                <strong>{gasUnit?.name}</strong> at{' '}
                <span className="font-mono">{evc.coordinationAddress}</span>.{' '}
                {evc.availableSeats} seats available.
              </p>
            )
          })}
        </Card>
      )}

      {/* Unit editor */}
      {editingId && (
        <Card className="space-y-5">
          <CardTitle>{editingId === 'new' ? 'Add New Family Unit' : 'Edit Family Unit'}</CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Unit name" placeholder="e.g., Dan & Sarah" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
            <Input label="Home address" placeholder="123 Main St, Westfield, IN 46074" value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Home type" value={draft.homeType} onChange={e => setDraft({ ...draft, homeType: e.target.value as HomeType })} options={HOME_TYPE_OPTIONS} />
          </div>

          {draft.homeType === 'mobile' && (
            <Card variant="danger">
              <p className="text-sm text-red-800 font-medium">⚠ Mobile homes are NOT safe during tornadoes. This unit will need a pre-identified nearby sturdy shelter location.</p>
            </Card>
          )}

          <div className="flex flex-wrap gap-4">
            <Checkbox label="Has basement" checked={draft.hasBasement} onChange={e => setDraft({ ...draft, hasBasement: e.target.checked })} />
            <Checkbox label="Has designated safe room" checked={draft.hasSafeRoom} onChange={e => setDraft({ ...draft, hasSafeRoom: e.target.checked })} />
            <Checkbox label="In a flood plain / near waterway" checked={draft.inFloodPlain} onChange={e => setDraft({ ...draft, inFloodPlain: e.target.checked, nearWaterway: e.target.checked })} />
          </div>

          <Input
            label="Outdoor meeting spot"
            placeholder="e.g., End of driveway by the mailbox"
            value={draft.meetingSpot ?? ''}
            onChange={e => setDraft({ ...draft, meetingSpot: e.target.value || undefined })}
            hint="Where does your family meet immediately outside after evacuating your home? Used in house fire and other quick-exit scenarios."
          />

          {/* Members */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Household Members</h4>
            <div className="space-y-3">
              {draft.members.map((m, i) => (
                <div key={m.id} className="flex gap-3 items-end">
                  <Input label="Name" value={m.name} onChange={e => updateMember(i, 'name', e.target.value)} className="flex-1" />
                  <Input label="Age" type="number" min={0} max={120} value={m.age} onChange={e => updateMember(i, 'age', parseInt(e.target.value) || 0)} className="w-20" />
                  <Input label="Phone" type="tel" value={m.phone ?? ''} onChange={e => updateMember(i, 'phone', e.target.value)} className="flex-1" />
                  {draft.members.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeMember(i)} className="text-red-600 mb-1">✕</Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addMember}>+ Add member</Button>
            </div>
          </div>

          {/* Vehicles */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Vehicles</h4>
            {isEVOnly && (
              <Card variant="warning" className="mb-3">
                <p className="text-sm text-amber-800">
                  ⚡ All vehicles in this unit are electric. If the power grid is down, charging will be unavailable. Rally point must be within current battery range, or this unit will need a gas-vehicle pickup.
                </p>
              </Card>
            )}
            <div className="space-y-4">
              {draft.vehicles.map((v, i) => (
                <div key={v.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Select label="Type" value={v.type} onChange={e => updateVehicle(i, 'type', e.target.value as VehicleType)} options={VEHICLE_TYPE_OPTIONS} />
                    <Select label="Fuel" value={v.fuelType} onChange={e => updateVehicle(i, 'fuelType', e.target.value as FuelType)} options={FUEL_TYPE_OPTIONS} />
                    <Input label="Range (miles)" type="number" min={0} value={v.rangeEstimateMiles} onChange={e => updateVehicle(i, 'rangeEstimateMiles', parseInt(e.target.value) || 0)} hint={v.fuelType === 'electric' ? 'Full charge range' : 'Full tank range'} />
                    <Input label="Seats" type="number" min={1} max={15} value={v.passengerCapacity} onChange={e => updateVehicle(i, 'passengerCapacity', parseInt(e.target.value) || 1)} />
                  </div>
                  {draft.vehicles.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeVehicle(i)} className="text-red-600">Remove vehicle</Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addVehicle}>+ Add vehicle</Button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={saveDraft} disabled={!draft.name || !draft.address}>Save Unit</Button>
          </div>
        </Card>
      )}

      {!editingId && (
        <Button variant="secondary" onClick={startNew}>+ Add Family Unit</Button>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={plan.units.length === 0}>
          Continue → ({plan.units.length} unit{plan.units.length !== 1 ? 's' : ''} added)
        </Button>
      </div>
    </div>
  )
}
