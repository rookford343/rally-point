import type { FamilyPlan } from '../types/plan'
import { FamilyPlanSchema } from './plan-schema'

export function exportPlan(plan: FamilyPlan): void {
  const payload = { schemaVersion: 1, exportedAt: new Date().toISOString(), plan }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rally-point-${plan.planName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importPlanFromFile(file: File): Promise<FamilyPlan> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  const data = (parsed as Record<string, unknown>)?.plan ?? parsed
  const result = FamilyPlanSchema.safeParse(data)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const path = firstIssue?.path?.join('.') ?? 'unknown'
    throw new Error(`This doesn't appear to be a valid Rally Point plan (field: ${path}).`)
  }
  return result.data as FamilyPlan
}
