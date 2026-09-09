// ═══════════════════════════════════════════
// NATY — Invoice model
// Generated on demand, never persisted.
// ═══════════════════════════════════════════

export interface InvoiceItem {
  id: string
  /** Bold headline of the row, e.g. "Stage 01 — Down Payment". */
  title: string
  /** Smaller supporting copy printed under the title. */
  description: string
  qty: number
  unitPrice: number
}

/** Drives the badge wording and the whole accent colour of the sheet. */
export type InvoiceStatus = 'UNPAID' | 'PAID'

/** One line of the full-contract payment plan printed under the totals. */
export interface ScheduleRow {
  id: string
  label: string
  amount: number
  /** The stage this invoice bills for — tagged "THIS INVOICE" in accent. */
  current: boolean
}

export interface InvoiceData {
  brandName: string
  brandTagline: string

  /** Used for the download filename and PDF metadata, not printed on the page. */
  number: string
  invoiceDate: string
  status: InvoiceStatus

  clientName: string
  clientWebsite: string
  /** Data URL (PNG/JPEG) held in memory only. */
  clientLogo: string | null

  project: string

  items: InvoiceItem[]
  taxPercent: number
  /** Absolute rupiah taken off the subtotal, before tax. Hidden when zero. */
  discount: number

  showSchedule: boolean
  schedule: ScheduleRow[]

  bankName: string
  accountName: string
  accountNumber: string
  notes: string

  /** Auto-derived from the total unless the user overrides it. */
  amountInWords: string
  autoWords: boolean

  /** Data URL (PNG/JPEG) held in memory only. */
  signature: string | null
  issuerName: string

  footerNote: string
}

export interface InvoiceTotals {
  subtotal: number
  discount: number
  taxable: number
  tax: number
  total: number
  contractTotal: number
}

const num = (v: number) => (Number.isFinite(v) ? v : 0)

export function calcTotals(data: InvoiceData): InvoiceTotals {
  const subtotal = data.items.reduce((sum, it) => sum + num(it.qty) * num(it.unitPrice), 0)
  // A discount can never exceed the subtotal, or tax would go negative.
  const discount = Math.min(Math.max(num(data.discount), 0), subtotal)
  const taxable = subtotal - discount
  const tax = taxable * (Math.max(num(data.taxPercent), 0) / 100)
  const contractTotal = data.schedule.reduce((sum, r) => sum + num(r.amount), 0)
  return { subtotal, discount, taxable, tax, total: taxable + tax, contractTotal }
}

/** Matches the mockup: no space after "Rp". */
export function formatIDR(value: number): string {
  return 'Rp' + Math.round(num(value)).toLocaleString('id-ID')
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "2026-09-09" → "9 September 2026". Falls back to the raw string if unparseable. */
export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Number → English words ──────────────────────────────────
const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion']

function underThousand(n: number): string {
  const parts: string[] = []
  const hundreds = Math.floor(n / 100)
  const rest = n % 100
  if (hundreds) parts.push(`${ONES[hundreds]} hundred`)
  if (rest < 20) {
    if (rest) parts.push(ONES[rest])
  } else {
    const t = Math.floor(rest / 10)
    const o = rest % 10
    parts.push(o ? `${TENS[t]}-${ONES[o]}` : TENS[t])
  }
  return parts.join(' ')
}

export function numberToWords(value: number): string {
  const n = Math.floor(Math.abs(num(value)))
  if (n === 0) return 'zero'
  // Beyond the scale list the wording would be wrong, so say so plainly.
  if (n >= 1e15) return 'amount too large'

  const groups: string[] = []
  let remaining = n
  let scale = 0
  while (remaining > 0) {
    const chunk = remaining % 1000
    if (chunk) {
      const words = underThousand(chunk)
      groups.unshift(SCALES[scale] ? `${words} ${SCALES[scale]}` : words)
    }
    remaining = Math.floor(remaining / 1000)
    scale++
  }
  return groups.join(' ')
}

/** 2400000 → "Two million four hundred thousand rupiah" */
export function amountInWordsIDR(value: number): string {
  const words = numberToWords(value)
  return words.charAt(0).toUpperCase() + words.slice(1) + ' rupiah'
}

// ── Factories ───────────────────────────────────────────────
const isoToday = () => {
  const d = new Date()
  // Local date, not UTC — toISOString() would shift the day in UTC+7.
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const rid = () => Math.random().toString(36).slice(2, 9)

export const newItem = (): InvoiceItem => ({
  id: rid(), title: '', description: '', qty: 1, unitPrice: 0,
})

export const newScheduleRow = (): ScheduleRow => ({
  id: rid(), label: '', amount: 0, current: false,
})

/** Nothing is stored, so the number is just a readable default the user can edit. */
export function suggestInvoiceNumber(): string {
  const d = new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
  const seq = String(Math.floor(d.getTime() / 1000) % 1000).padStart(3, '0')
  return `INV-${stamp}-${seq}`
}

export function emptyInvoice(): InvoiceData {
  return {
    brandName: 'NATY',
    brandTagline: 'Nusantara Technology',

    number: suggestInvoiceNumber(),
    invoiceDate: isoToday(),
    status: 'UNPAID',

    clientName: '',
    clientWebsite: '',
    clientLogo: null,

    project: '',

    items: [newItem()],
    taxPercent: 0,
    discount: 0,

    showSchedule: false,
    schedule: [],

    bankName: '',
    accountName: '',
    accountNumber: '',
    notes: '',

    amountInWords: '',
    autoWords: true,

    signature: null,
    issuerName: '',

    footerNote: 'This invoice was issued electronically and is valid without a signature.',
  }
}

/** The words line actually printed — auto-derived unless the user typed their own. */
export function resolveAmountInWords(data: InvoiceData, total: number): string {
  if (!data.autoWords && data.amountInWords.trim()) return data.amountInWords.trim()
  return amountInWordsIDR(total)
}

/** Safe filename: "INV-202609-123" + client → "INV-202609-123-LaCroi-Dept.pdf" */
export function invoiceFilename(data: InvoiceData): string {
  const base = (data.number || 'invoice').replace(/[^a-zA-Z0-9._-]/g, '-')
  const client = data.clientName.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  return client ? `${base}-${client}.pdf` : `${base}.pdf`
}

/** Reads a picked image into a data URL kept only in React state. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that image'))
    reader.readAsDataURL(file)
  })
}
