import { useFamilyPlan } from '../../store/family-plan'
import { Card, CardTitle } from '../ui/Card'
import { computeBringList } from '../../lib/plan-generator'
import type { RallyPoint, FamilyUnit } from '../../types/plan'

interface Props {
  rallyPoint: RallyPoint
  // Units that would arrive at this rally point — used for bring list computation.
  // Pass an empty array (or omit) to skip the bring list.
  arrivingUnits?: FamilyUnit[]
}

interface ResourceCheck { label: string; have: boolean; detail?: string }

export function RallyPointCard({ rallyPoint, arrivingUnits = [] }: Props) {
  const { plan } = useFamilyPlan()
  const hostUnit = rallyPoint.hostUnitId
    ? plan.units.find(u => u.id === rallyPoint.hostUnitId)
    : undefined

  const res = rallyPoint.resources

  const checks: ResourceCheck[] = [
    { label: 'Generator', have: res.hasGenerator, detail: res.generatorWatts ? `${res.generatorWatts}W` : undefined },
    { label: 'Water', have: res.waterGallons > 0, detail: `${res.waterGallons} gal stored` },
    { label: 'Food', have: res.foodDays > 0, detail: `${res.foodDays} day(s) on hand` },
    { label: 'Shelter capacity', have: res.shelterCapacity > 0, detail: `${res.shelterCapacity} people` },
    { label: 'First aid kit', have: res.hasFirstAidKit },
    { label: 'AED', have: res.hasAED },
    { label: 'Chainsaw', have: res.hasChainsaw },
    { label: 'Hand tools', have: res.hasHandTools },
    { label: 'NOAA radio', have: res.hasNOAARadio },
    { label: 'FRS radios', have: res.hasFRSRadios },
    { label: 'Landline', have: res.hasLandline },
  ]

  const bringList = arrivingUnits.length > 0 ? computeBringList(rallyPoint, arrivingUnits) : []

  return (
    <Card>
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <CardTitle>
            {rallyPoint.name}
            {rallyPoint.isCommunityLocation && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-normal">
                community
              </span>
            )}
          </CardTitle>
          {hostUnit && (
            <p className="text-xs text-gray-500">Hosted at {hostUnit.name}</p>
          )}
        </div>
      </div>

      {/* Address — large and prominent */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-3">
        <p className="text-xs uppercase tracking-wider text-blue-700 font-bold mb-0.5">
          Navigate to:
        </p>
        <p className="font-mono text-blue-900 text-base">{rallyPoint.address}</p>
        {rallyPoint.hostContactName && (
          <p className="text-xs text-blue-700 mt-1">
            Contact: {rallyPoint.hostContactName}
            {rallyPoint.hostContactPhone && ` · ${rallyPoint.hostContactPhone}`}
          </p>
        )}
      </div>

      {/* Resource checklist */}
      <div>
        <h4 className="font-medium text-gray-800 text-sm mb-2">Resources on hand</h4>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
          {checks.map(c => (
            <div key={c.label} className="flex items-baseline gap-2">
              <span className={c.have ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                {c.have ? '✓' : '✗'}
              </span>
              <span className={c.have ? 'text-gray-800' : 'text-gray-500'}>
                {c.label}
                {c.detail && <span className="text-xs text-gray-500"> · {c.detail}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bring list */}
      {bringList.length > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="font-medium text-amber-900 text-sm mb-1">Bring this when rallying here:</h4>
          <ul className="text-xs text-amber-900 space-y-1">
            {bringList.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={item.critical ? 'text-red-600 font-bold' : 'text-amber-700'}>
                  {item.critical ? '⚠' : '•'}
                </span>
                <span>
                  <strong>{item.name}</strong> — {item.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {res.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">{res.notes}</p>
      )}
    </Card>
  )
}
