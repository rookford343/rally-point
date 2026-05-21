import { useState, useEffect } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Input'
import { Card, CardTitle } from '../ui/Card'
import type { AwayProtocol, FamilyMember, FamilyUnit } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

function defaultLocal(member: FamilyMember, unit: FamilyUnit, isChild: boolean): string {
  const where = member.awayLocation?.description ?? 'your usual away location'
  return isChild
    ? `Stay at ${where}. Do not leave with anyone who cannot say the family passphrase. A parent or designated adult will pick you up.`
    : `Shelter in place at ${where} until local conditions are safe. Call the out-of-state coordinator to report status. Once roads are passable, head directly to the cluster hub (printed on your wallet card) — not home, unless home is the hub. Home address: ${unit.address}.`
}

function defaultInState(): string {
  return 'If within ~50 miles of the cluster hub: head toward the hub when safe — do not drive through active disaster. If farther: stay put, call the out-of-state coordinator, wait for safe-travel guidance.'
}

function defaultOutOfState(): string {
  return 'Stay put. Do not travel back into the disaster zone. Call the out-of-state coordinator immediately — they relay your status to the rest of the family. Check in every 6–12 hours until safe to return.'
}

function childPickupNote(): string {
  return 'School/childcare pickup requires the family passphrase. Anyone you authorize to pick up must know the passphrase. If they do not know it, the child must stay.'
}

interface MemberRow {
  unit: FamilyUnit
  member: FamilyMember
  isChild: boolean
}

export function AwayProfilesStep({ onNext, onBack }: Props) {
  const { plan, setAwayProtocols } = useFamilyPlan()

  // Build the working list: every member across every unit who has an awayLocation.
  const rows: MemberRow[] = plan.units.flatMap(unit =>
    unit.members
      .filter(m => !!m.awayLocation)
      .map(member => ({ unit, member, isChild: member.age < 18 })),
  )

  // Seed local protocols from store, or defaults
  const [protocols, setProtocols] = useState<Record<string, AwayProtocol>>(() => {
    const map: Record<string, AwayProtocol> = {}
    for (const { unit, member, isChild } of rows) {
      const existing = plan.awayProtocols.find(p => p.memberId === member.id)
      map[member.id] = existing ?? {
        memberId: member.id,
        localInstruction: defaultLocal(member, unit, isChild),
        inStateInstruction: defaultInState(),
        outOfStateInstruction: defaultOutOfState(),
        schoolPickupPassphraseNote: isChild ? childPickupNote() : undefined,
      }
    }
    return map
  })

  // If a member list change occurs (e.g. user navigated back and edited),
  // re-seed any new memberIds. We don't overwrite existing edits.
  useEffect(() => {
    setProtocols(prev => {
      const next = { ...prev }
      let changed = false
      for (const { unit, member, isChild } of rows) {
        if (!next[member.id]) {
          next[member.id] = {
            memberId: member.id,
            localInstruction: defaultLocal(member, unit, isChild),
            inStateInstruction: defaultInState(),
            outOfStateInstruction: defaultOutOfState(),
            schoolPickupPassphraseNote: isChild ? childPickupNote() : undefined,
          }
          changed = true
        }
      }
      return changed ? next : prev
    })
    // rows is derived from plan.units; rebuild on units identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.units])

  function update(memberId: string, field: keyof AwayProtocol, value: string) {
    setProtocols(prev => ({
      ...prev,
      [memberId]: { ...prev[memberId], [field]: value },
    }))
  }

  function persistAndContinue() {
    setAwayProtocols(Object.values(protocols))
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Away-from-Home Profiles</h2>
        <p className="text-gray-600 mt-1">
          Each family member with a usual away location (work, school, in-laws) gets an instruction set for what to do when a disaster hits while they are away. Only members with an "away location" defined in earlier steps appear here.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card variant="warning">
          <p className="text-sm text-amber-900">
            No members have an away location defined yet. You can add this on individual family members (work address for adults, school address for kids) by going back to <strong>Family Units</strong> and editing each member. This step becomes more useful once those are set.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map(({ unit, member, isChild }) => {
            const p = protocols[member.id]
            if (!p) return null
            return (
              <Card key={member.id} className="space-y-3">
                <CardTitle>
                  {member.name}{' '}
                  <span className="text-sm font-normal text-gray-500">
                    — {unit.name}, {member.awayLocation?.description ?? 'away'}
                    {isChild && <span className="ml-2 text-amber-700">👶 minor</span>}
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 -mt-1">
                  Away address: <span className="font-mono">{member.awayLocation?.address}</span>{' '}
                  ({member.awayLocation?.awayCategory})
                </p>
                <Textarea
                  label="If at work/school (local)"
                  value={p.localInstruction}
                  onChange={e => update(member.id, 'localInstruction', e.target.value)}
                />
                <Textarea
                  label="If traveling in-state"
                  value={p.inStateInstruction}
                  onChange={e => update(member.id, 'inStateInstruction', e.target.value)}
                />
                <Textarea
                  label="If out-of-state"
                  value={p.outOfStateInstruction}
                  onChange={e => update(member.id, 'outOfStateInstruction', e.target.value)}
                />
                {isChild && (
                  <Textarea
                    label="School pickup passphrase protocol"
                    value={p.schoolPickupPassphraseNote ?? ''}
                    onChange={e => update(member.id, 'schoolPickupPassphraseNote', e.target.value)}
                    hint="Anyone picking up the child must say the family passphrase."
                  />
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={persistAndContinue}>Save & Continue →</Button>
      </div>
    </div>
  )
}
