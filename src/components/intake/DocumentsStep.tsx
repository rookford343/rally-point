import { useState } from 'react'
import { useFamilyPlan } from '../../store/family-plan'
import { Button } from '../ui/Button'
import { Card, CardTitle } from '../ui/Card'
import { Input, Checkbox } from '../ui/Input'
import type { DocumentItem, DocumentsPlan, DocumentStatus } from '../../types/plan'

interface Props { onNext: () => void; onBack: () => void }

const PROTECTION_OPTIONS = [
  { id: 'fireproof-bag', label: 'Fireproof document bag', hint: 'Recommended. Typically protects up to 30 min at 1200°F.' },
  { id: 'waterproof-pouch', label: 'Waterproof pouch or sleeve', hint: 'Protects against flood and rain damage.' },
  { id: 'home-safe', label: 'Home safe (bolted)', hint: 'Good for at-home storage, but won\'t go in your go-bag.' },
  { id: 'bank-vault', label: 'Bank safe deposit box', hint: 'Inaccessible during closures — keep copies at home.' },
  { id: 'encrypted-usb', label: 'Encrypted USB drive', hint: 'Digital backup you carry in your go-bag.' },
  { id: 'cloud-backup', label: 'Encrypted cloud backup', hint: 'e.g. Google Drive, iCloud with strong password.' },
]

const DEFAULT_DOCUMENTS: Omit<DocumentItem, 'status' | 'digitalCopy'>[] = [
  // IDs
  { id: 'passports', name: 'Passports', category: 'IDs' },
  { id: 'drivers-licenses', name: 'Driver\'s licenses (copies)', category: 'IDs' },
  { id: 'birth-certificates', name: 'Birth certificates', category: 'IDs' },
  { id: 'social-security', name: 'Social Security cards', category: 'IDs' },
  { id: 'immigration', name: 'Immigration / naturalization documents', category: 'IDs' },
  // Insurance & Financial
  { id: 'home-insurance', name: 'Home/renters insurance policy', category: 'Insurance' },
  { id: 'auto-insurance', name: 'Auto insurance card/policy', category: 'Insurance' },
  { id: 'health-insurance', name: 'Health insurance cards', category: 'Insurance' },
  { id: 'life-insurance', name: 'Life insurance policy', category: 'Insurance' },
  { id: 'bank-info', name: 'Bank account numbers (written, stored securely)', category: 'Financial' },
  { id: 'credit-cards', name: 'Credit card account list (not cards themselves)', category: 'Financial' },
  // Property
  { id: 'home-deed', name: 'Home deed or lease agreement', category: 'Property' },
  { id: 'vehicle-titles', name: 'Vehicle titles', category: 'Property' },
  // Medical
  { id: 'vaccination-records', name: 'Vaccination records (all family members)', category: 'Medical' },
  { id: 'prescriptions', name: 'Current prescriptions list', category: 'Medical' },
  { id: 'medical-records', name: 'Key medical records / history', category: 'Medical' },
  // Legal
  { id: 'will', name: 'Will and testament', category: 'Legal' },
  { id: 'poa', name: 'Power of attorney', category: 'Legal' },
  { id: 'advance-directive', name: 'Healthcare advance directive / living will', category: 'Legal' },
  // Contacts
  { id: 'contacts-list', name: 'Emergency contacts list (printed)', category: 'Contacts' },
  { id: 'vet-records', name: 'Pet vaccination / vet records', category: 'Contacts' },
]

function buildDefaultItems(existing: DocumentItem[]): DocumentItem[] {
  return DEFAULT_DOCUMENTS.map(doc => {
    const found = existing.find(e => e.id === doc.id)
    return found ?? { ...doc, status: 'need' as DocumentStatus, digitalCopy: false }
  })
}

const CATEGORY_ORDER = ['IDs', 'Insurance', 'Financial', 'Property', 'Medical', 'Legal', 'Contacts']

export function DocumentsStep({ onNext, onBack }: Props) {
  const { plan, setDocumentsPlan } = useFamilyPlan()
  const existing = plan.documentsPlan

  const [items, setItems] = useState<DocumentItem[]>(() => buildDefaultItems(existing?.items ?? []))
  const [storageLocation, setStorageLocation] = useState(existing?.storageLocation ?? '')
  const [protectionMethods, setProtectionMethods] = useState<string[]>(existing?.protectionMethods ?? [])
  const [digitalBackupLocation, setDigitalBackupLocation] = useState(existing?.digitalBackupLocation ?? '')

  function updateItem(id: string, field: keyof DocumentItem, value: unknown) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function toggleProtection(method: string) {
    setProtectionMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
  }

  function saveAndContinue() {
    const dp: DocumentsPlan = {
      items,
      storageLocation: storageLocation.trim() || undefined,
      protectionMethods,
      digitalBackupLocation: digitalBackupLocation.trim() || undefined,
    }
    setDocumentsPlan(dp)
    onNext()
  }

  const categories = CATEGORY_ORDER.filter(cat => items.some(i => i.category === cat))

  const haveCount = items.filter(i => i.status === 'have').length
  const needCount = items.filter(i => i.status === 'need').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Important Documents</h2>
        <p className="text-gray-600 mt-1">
          In a forced evacuation, you have 15 minutes or less. This step ensures the right papers are in one place, protected, and ready to grab. Mark what you have and where it's stored.
        </p>
        <div className="flex gap-3 mt-3">
          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
            {haveCount} have
          </span>
          <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
            {needCount} still needed
          </span>
        </div>
      </div>

      {/* Storage location */}
      <Card className="space-y-3">
        <CardTitle>Document Storage Location</CardTitle>
        <p className="text-sm text-gray-600">
          Where is your document folder/binder kept right now? Everyone in the family should know this location.
        </p>
        <Input
          label="Storage location"
          placeholder="e.g., Red binder, bedroom closet — top shelf, left side"
          value={storageLocation}
          onChange={e => setStorageLocation(e.target.value)}
          hint="Be specific enough to find it in the dark."
        />
      </Card>

      {/* Protection methods */}
      <Card className="space-y-3">
        <CardTitle>Protection Methods</CardTitle>
        <p className="text-sm text-gray-600">
          Select all that apply. Layering methods provides the best protection.
        </p>
        <div className="space-y-2">
          {PROTECTION_OPTIONS.map(opt => (
            <div key={opt.id}>
              <Checkbox
                label={opt.label}
                checked={protectionMethods.includes(opt.id)}
                onChange={() => toggleProtection(opt.id)}
              />
              <p className="text-xs text-gray-500 ml-6">{opt.hint}</p>
            </div>
          ))}
        </div>
        {protectionMethods.some(m => m === 'encrypted-usb' || m === 'cloud-backup') && (
          <Input
            label="Digital backup details"
            placeholder="e.g., Encrypted USB in go-bag + Google Drive (shared with spouse)"
            value={digitalBackupLocation}
            onChange={e => setDigitalBackupLocation(e.target.value)}
          />
        )}
      </Card>

      {/* Document checklist by category */}
      {categories.map(category => (
        <Card key={category} className="space-y-3">
          <CardTitle>{category}</CardTitle>
          <div className="space-y-2">
            {items.filter(i => i.category === category).map(item => (
              <div key={item.id} className="flex items-center gap-3 py-1 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    value={item.status}
                    onChange={e => updateItem(item.id, 'status', e.target.value as DocumentStatus)}
                  >
                    <option value="have">Have ✓</option>
                    <option value="need">Need</option>
                    <option value="na">N/A</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.digitalCopy}
                      onChange={e => updateItem(item.id, 'digitalCopy', e.target.checked)}
                      className="rounded"
                    />
                    Digital
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card variant="warning" className="space-y-2">
        <CardTitle>Carrying tip</CardTitle>
        <p className="text-sm text-amber-900">
          Original documents can often be replaced — digital copies cannot be faked when originals are destroyed. Scan everything and store encrypted copies in at least two locations.
        </p>
        <p className="text-sm text-amber-900">
          Keep originals at home in a fireproof bag. Carry a USB or cloud link in your go-bag. If you have a bank safe deposit box, keep copies at home too — banks close during emergencies.
        </p>
      </Card>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={saveAndContinue}>Save & Continue →</Button>
      </div>
    </div>
  )
}
