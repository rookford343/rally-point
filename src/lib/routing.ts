import type { RouteOption, RouteStep } from '../types/plan'

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(address)}&format=json&limit=1&email=rally-point-app@example.com`
    const res = await fetch(url, { headers: { 'User-Agent': 'Rally Point Emergency Planning App' } })
    if (!res.ok) return null
    const data: Array<{ lat: string; lon: string }> = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

interface OsrmStep {
  name: string
  distance: number
  duration: number
  maneuver: { type: string; modifier?: string }
}

interface OsrmRoute {
  legs: Array<{ steps: OsrmStep[]; distance: number; duration: number }>
}

interface OsrmResponse {
  code: string
  routes: OsrmRoute[]
}

export async function calculateRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<RouteOption | null> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?steps=true&overview=false&annotations=false`
    const res = await fetch(url)
    if (!res.ok) return null
    const data: OsrmResponse = await res.json()
    if (data.code !== 'Ok' || !data.routes.length) return null

    const route = data.routes[0]
    const leg = route.legs[0]

    const steps: RouteStep[] = (leg.steps ?? [])
      .filter(s => s.name && s.name.trim())
      .map(s => ({
        streetName: s.name,
        distanceMiles: s.distance / 1609.344,
        durationSeconds: s.duration,
        maneuver: formatManeuver(s.maneuver),
      }))

    return {
      label: 'Primary',
      steps,
      totalMiles: leg.distance / 1609.344,
      estimatedMinutes: Math.round(leg.duration / 60),
      avoidRoads: [],
      useWhen: 'Default route',
      autoCalculated: true,
    }
  } catch {
    return null
  }
}

function formatManeuver(maneuver: { type: string; modifier?: string }): string {
  const parts = [maneuver.type]
  if (maneuver.modifier) parts.push(maneuver.modifier)
  return parts.join(' ')
}

export function buildGoogleMapsUrl(fromAddress: string, toAddress: string): string {
  const origin = encodeURIComponent(fromAddress)
  const destination = encodeURIComponent(toAddress)
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
}
