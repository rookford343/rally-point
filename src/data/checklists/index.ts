import type { PrepInventoryItem, ScenarioId } from '../../types/plan'

export interface ChecklistItem {
  id: string
  name: string
  category: string
  quantity: string
  notes?: string
  infantRequired?: boolean
  scenarioRelevance: ScenarioId[]
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export const GO_BAG_ITEMS: ChecklistItem[] = [
  // Documents
  { id: 'docs-ids', name: 'Photo IDs / passports', category: 'Documents', quantity: 'One per person', priority: 'critical', scenarioRelevance: ['forced-evacuation', 'telecom-failure'] },
  { id: 'docs-insurance', name: 'Insurance cards (health, home, auto)', category: 'Documents', quantity: '1 set', priority: 'critical', scenarioRelevance: ['forced-evacuation'] },
  { id: 'docs-cash', name: 'Cash — small bills ($20s and below)', category: 'Documents', quantity: '$300–500', notes: 'ATMs empty fast, card systems fail', priority: 'critical', scenarioRelevance: ['forced-evacuation', 'telecom-failure', 'power-outage', 'civil-unrest'] },
  { id: 'docs-contacts', name: 'Printed contact list (all family, out-of-state coordinator)', category: 'Documents', quantity: '1 laminated', priority: 'critical', scenarioRelevance: ['telecom-failure', 'forced-evacuation'] },
  { id: 'docs-meds', name: 'Printed medication list (name, dose, prescriber, pharmacy)', category: 'Documents', quantity: '1 laminated', priority: 'high', scenarioRelevance: ['forced-evacuation', 'power-outage'] },
  // Water
  { id: 'water-stored', name: 'Water (1 gal/person/day × 3 days)', category: 'Water', quantity: '3 gal per person', priority: 'critical', scenarioRelevance: ['power-outage', 'forced-evacuation', 'telecom-failure'] },
  { id: 'water-filter', name: 'Water filter (LifeStraw or similar)', category: 'Water', quantity: '1', notes: 'Bridge gap when stored supply runs low', priority: 'high', scenarioRelevance: ['power-outage', 'telecom-failure'] },
  // Food
  { id: 'food-bars', name: 'Emergency food bars (2400 cal/person)', category: 'Food', quantity: '1 bar per person per day × 3 days', priority: 'critical', scenarioRelevance: ['forced-evacuation', 'power-outage', 'telecom-failure'] },
  { id: 'food-formula', name: 'Ready-to-feed infant formula (sterile, no mixing)', category: 'Food', quantity: '72-hour supply', notes: 'Sterile, no water needed', infantRequired: true, priority: 'critical', scenarioRelevance: ['forced-evacuation', 'power-outage', 'telecom-failure'] },
  { id: 'food-diapers', name: 'Diapers (extra pack)', category: 'Food', quantity: '1 full pack', infantRequired: true, priority: 'critical', scenarioRelevance: ['forced-evacuation', 'power-outage'] },
  { id: 'food-wipes', name: 'Baby wipes (2 packs)', category: 'Food', quantity: '2 packs', infantRequired: true, priority: 'high', scenarioRelevance: ['forced-evacuation', 'power-outage'] },
  // Medical
  { id: 'med-firstaid', name: 'First aid kit (bandages, antiseptic, gauze)', category: 'Medical', quantity: '1 full kit', priority: 'critical', scenarioRelevance: ['tornado', 'forced-evacuation', 'flooding', 'earthquake'] },
  { id: 'med-tylenol-adult', name: 'Acetaminophen (adult)', category: 'Medical', quantity: '1 bottle', priority: 'high', scenarioRelevance: ['power-outage', 'forced-evacuation'] },
  { id: 'med-tylenol-infant', name: 'Infant acetaminophen', category: 'Medical', quantity: '1 bottle', infantRequired: true, priority: 'high', scenarioRelevance: ['power-outage', 'forced-evacuation'] },
  { id: 'med-thermometer', name: 'Infant thermometer', category: 'Medical', quantity: '1', infantRequired: true, priority: 'high', scenarioRelevance: ['power-outage', 'forced-evacuation'] },
  { id: 'med-gloves', name: 'Nitrile gloves (box)', category: 'Medical', quantity: '1 box', priority: 'medium', scenarioRelevance: ['tornado', 'flooding', 'forced-evacuation'] },
  // Tools / Light
  { id: 'tools-flashlight', name: 'Flashlights with extra batteries', category: 'Tools', quantity: '2 flashlights', priority: 'critical', scenarioRelevance: ['tornado', 'power-outage', 'winter-storm', 'forced-evacuation', 'telecom-failure'] },
  { id: 'tools-multitools', name: 'Multi-tool or knife', category: 'Tools', quantity: '1', priority: 'medium', scenarioRelevance: ['forced-evacuation', 'tornado'] },
  { id: 'tools-radio', name: 'NOAA hand-crank weather radio', category: 'Tools', quantity: '1', priority: 'critical', scenarioRelevance: ['tornado', 'power-outage', 'winter-storm'] },
  { id: 'tools-frs', name: 'FRS walkie-talkies (charged)', category: 'Tools', quantity: '2+ units', priority: 'critical', scenarioRelevance: ['telecom-failure', 'power-outage', 'civil-unrest', 'forced-evacuation'] },
  { id: 'tools-solar', name: 'Solar charger / power bank', category: 'Tools', quantity: '1 per person', priority: 'high', scenarioRelevance: ['power-outage', 'telecom-failure', 'forced-evacuation'] },
  // Infant essentials
  { id: 'infant-carrier', name: 'Baby carrier / wrap (hands-free)', category: 'Infant', quantity: '1', notes: 'Critical for hands-free evacuation', infantRequired: true, priority: 'critical', scenarioRelevance: ['tornado', 'forced-evacuation', 'flooding'] },
  { id: 'infant-blankets', name: 'Baby blankets (2+)', category: 'Infant', quantity: '2', infantRequired: true, priority: 'high', scenarioRelevance: ['forced-evacuation', 'power-outage', 'winter-storm'] },
  { id: 'infant-records', name: 'Vaccination records and medical records (copy)', category: 'Infant', quantity: '1 copy, waterproof bag', infantRequired: true, priority: 'high', scenarioRelevance: ['forced-evacuation'] },
  // Clothing / warmth
  { id: 'clothing-change', name: 'Change of clothes per person (3 days)', category: 'Clothing', quantity: '3 sets per person', priority: 'medium', scenarioRelevance: ['forced-evacuation', 'power-outage'] },
  { id: 'clothing-rain', name: 'Rain gear / ponchos', category: 'Clothing', quantity: '1 per person', priority: 'medium', scenarioRelevance: ['forced-evacuation', 'flooding'] },
  { id: 'clothing-sleeping', name: 'Sleeping bag or heavy blanket', category: 'Clothing', quantity: '1 per person', priority: 'high', scenarioRelevance: ['power-outage', 'winter-storm', 'forced-evacuation'] },
  // Pets
  { id: 'pet-food', name: 'Pet food (3-day supply)', category: 'Pets', quantity: '3 days', priority: 'high', scenarioRelevance: ['forced-evacuation', 'power-outage'] },
  { id: 'pet-records', name: 'Pet vaccination records', category: 'Pets', quantity: '1 copy', notes: 'Required by most emergency shelters', priority: 'high', scenarioRelevance: ['forced-evacuation'] },
  { id: 'pet-carrier', name: 'Pet carrier (tagged with contact info)', category: 'Pets', quantity: '1 per pet', priority: 'critical', scenarioRelevance: ['forced-evacuation'] },
]

export const HOME_SUPPLIES: ChecklistItem[] = [
  { id: 'home-water', name: 'Stored water (1 gal/person/day × 14 days)', category: 'Water', quantity: '14 gal per person', priority: 'critical', scenarioRelevance: ['power-outage', 'winter-storm', 'telecom-failure'] },
  { id: 'home-food', name: 'Non-perishable food (14-day supply)', category: 'Food', quantity: '2 weeks per person', priority: 'critical', scenarioRelevance: ['power-outage', 'winter-storm', 'telecom-failure', 'civil-unrest'] },
  { id: 'home-generator', name: 'Generator (with fuel and extension cords)', category: 'Power', quantity: '1', priority: 'high', scenarioRelevance: ['power-outage', 'winter-storm', 'telecom-failure'] },
  { id: 'home-fuel-cans', name: 'Gas cans (treated with fuel stabilizer)', category: 'Power', quantity: '5–10 gallons', priority: 'high', scenarioRelevance: ['power-outage', 'winter-storm', 'forced-evacuation'] },
  { id: 'home-propane', name: 'Propane heater (outdoor-rated) + propane', category: 'Power', quantity: '1 heater, 4+ tanks', priority: 'high', scenarioRelevance: ['winter-storm', 'power-outage'] },
  { id: 'home-fire-ext', name: 'Fire extinguisher (kitchen + main floor)', category: 'Safety', quantity: '2', priority: 'critical', scenarioRelevance: ['tornado', 'power-outage', 'forced-evacuation'] },
  { id: 'home-chainsaw', name: 'Chainsaw (gas, with chain oil and bar oil)', category: 'Tools', quantity: '1', priority: 'medium', scenarioRelevance: ['tornado', 'winter-storm'] },
  { id: 'home-crowbar', name: 'Crowbar / pry bar', category: 'Tools', quantity: '1', priority: 'medium', scenarioRelevance: ['tornado', 'earthquake'] },
  { id: 'home-maps', name: 'Paper county + state maps', category: 'Navigation', quantity: '1 set', notes: 'No GPS needed', priority: 'critical', scenarioRelevance: ['telecom-failure', 'forced-evacuation', 'civil-unrest'] },
  { id: 'home-cash', name: 'Cash reserve (home safe)', category: 'Financial', quantity: '$500–1000 small bills', priority: 'high', scenarioRelevance: ['power-outage', 'telecom-failure', 'civil-unrest'] },
  { id: 'home-helmets', name: 'Bike or sports helmets (for tornado shelter)', category: 'Safety', quantity: '1 per person', priority: 'medium', scenarioRelevance: ['tornado'] },
  { id: 'home-medications', name: '30-day buffer supply of regular medications', category: 'Medical', quantity: '30-day supply per person', priority: 'critical', scenarioRelevance: ['power-outage', 'winter-storm', 'telecom-failure', 'forced-evacuation'] },
  { id: 'home-smoke-detector', name: 'Smoke detectors (test monthly, replace battery annually)', category: 'Safety', quantity: '1 per floor + each bedroom', notes: 'Interconnected alarms recommended — when one sounds, all sound', priority: 'critical', scenarioRelevance: ['house-fire', 'carbon-monoxide'] },
  { id: 'home-co-detector', name: 'Carbon monoxide (CO) detector', category: 'Safety', quantity: '1 per floor + each bedroom', notes: 'Required if home has gas appliances, attached garage, or gas furnace. Replace every 5–7 years.', priority: 'critical', scenarioRelevance: ['carbon-monoxide', 'power-outage'] },
  { id: 'home-fire-ladder', name: 'Emergency escape ladder (multi-story homes)', category: 'Safety', quantity: '1 per upper-floor bedroom', notes: 'Required for second-floor and above — store under bed', priority: 'high', scenarioRelevance: ['house-fire'] },
]

export const DEFAULT_PREP_INVENTORY: Omit<PrepInventoryItem, 'status'>[] = [
  ...GO_BAG_ITEMS.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    scenarioRelevance: item.scenarioRelevance,
    quantity: item.quantity,
    notes: item.notes,
  })),
  ...HOME_SUPPLIES.map(item => ({
    id: `home-${item.id}`,
    name: item.name,
    category: item.category,
    scenarioRelevance: item.scenarioRelevance,
    quantity: item.quantity,
    notes: item.notes,
  })),
]
