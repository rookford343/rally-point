// Trigger the browser print dialog with a specific print class active.
// The print class is used by @media print CSS to show/hide elements.

type PrintLayout = 'wallet-cards' | 'binder' | 'vehicle-copy' | 'flowchart' | 'sensitive'

export function printLayout(layout: PrintLayout): void {
  const body = document.body
  const cls = `print-layout-${layout}`

  // Remove any existing print layout class
  body.classList.forEach(c => {
    if (c.startsWith('print-layout-')) body.classList.remove(c)
  })

  body.classList.add(cls)

  requestAnimationFrame(() => {
    window.print()
    // Clean up after print dialog closes
    body.classList.remove(cls)
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
