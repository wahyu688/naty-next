'use client'

import { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  amountInWordsIDR, calcTotals, emptyInvoice, fileToDataUrl, formatIDR,
  newItem, newScheduleRow, suggestInvoiceNumber,
  type InvoiceData, type InvoiceItem, type InvoiceStatus, type ScheduleRow,
} from '@/lib/invoice'

// @react-pdf/renderer is browser-only and heavy — keep it out of the server
// bundle and off the wire until this section is actually opened.
const InvoicePdfPane = dynamic(() => import('@/components/invoice/InvoicePdfPane'), {
  ssr: false,
  loading: () => (
    <div className="bg-surface border border-white/[0.05] rounded-card h-[520px] flex items-center justify-center text-[13px] text-muted">
      Loading PDF engine…
    </div>
  ),
})

const INPUT = 'w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40'
const LABEL = 'block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={LABEL}>{label}</label>{children}</div>
}

function Card({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-surface border border-white/[0.05] rounded-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[14px]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  UNPAID: '#e9ec3f',
  PAID: '#3fe07f',
}

/** Blank instead of a stubborn "0" so the field is easy to type into. */
const numDisplay = (n: number) => (n === 0 ? '' : String(n))
const parseNum = (v: string) => {
  const n = Number(v.replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** PNG/JPEG only — react-pdf cannot draw SVG through <Image>. */
function ImagePicker({ label, value, onChange, hint }: {
  label: string; value: string | null; onChange: (v: string | null) => void; hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const pick = async (file?: File) => {
    if (!file) return
    if (!/^image\/(png|jpeg|jpg)$/i.test(file.type)) {
      setError('PNG or JPG only'); return
    }
    try {
      onChange(await fileToDataUrl(file))
      setError('')
    } catch {
      setError('Could not read that image')
    }
  }

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-[72px] h-[52px] rounded-sm border border-white/[0.07] bg-bg flex items-center justify-center overflow-hidden flex-shrink-0">
          {value
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt={label} className="max-w-full max-h-full object-contain" />
            : <span className="text-[10px] text-muted">none</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => ref.current?.click()}
            className="px-3 py-2 rounded-sm border border-white/[0.07] text-[12px] text-muted hover:text-ink hover:bg-white/[0.06] transition-colors">
            {value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button onClick={() => onChange(null)}
              className="px-3 py-2 rounded-sm text-[12px] text-muted hover:text-red transition-colors">
              Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg" className="hidden"
          onChange={e => pick(e.target.files?.[0])} />
      </div>
      {(error || hint) && (
        <p className={`text-[11px] mt-1.5 ${error ? 'text-red' : 'text-muted'}`}>{error || hint}</p>
      )}
    </div>
  )
}

export default function InvoiceSection() {
  const [data, setData] = useState<InvoiceData>(emptyInvoice)

  const set = <K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) =>
    setData(prev => ({ ...prev, [key]: val }))

  const setItem = (id: string, patch: Partial<InvoiceItem>) =>
    setData(prev => ({ ...prev, items: prev.items.map(it => it.id === id ? { ...it, ...patch } : it) }))

  const removeItem = (id: string) =>
    setData(prev => {
      const items = prev.items.filter(it => it.id !== id)
      // Never leave the table with no row to type into.
      return { ...prev, items: items.length ? items : [newItem()] }
    })

  const setRow = (id: string, patch: Partial<ScheduleRow>) =>
    setData(prev => ({ ...prev, schedule: prev.schedule.map(r => r.id === id ? { ...r, ...patch } : r) }))

  /** Only one stage can be "THIS INVOICE". */
  const markCurrent = (id: string) =>
    setData(prev => ({
      ...prev,
      schedule: prev.schedule.map(r => ({ ...r, current: r.id === id ? !r.current : false })),
    }))

  const reset = () => {
    if (!confirm('Clear this invoice and start a new one?')) return
    setData(emptyInvoice())
  }

  const totals = useMemo(() => calcTotals(data), [data])

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Invoice Generator</h1>
        <p className="text-[13px] text-muted">
          Nothing is saved — the PDF is generated in your browser each time you download it.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-5">

          <Card
            title="Invoice"
            action={<button onClick={reset} className="text-[12px] text-muted hover:text-red transition-colors">Reset</button>}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand name">
                <input value={data.brandName} onChange={e => set('brandName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Brand tagline">
                <input value={data.brandTagline} onChange={e => set('brandTagline', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Invoice date">
                <input type="date" value={data.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Status">
                <div className="flex gap-2">
                  {(['UNPAID', 'PAID'] as InvoiceStatus[]).map(opt => {
                    const active = data.status === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => set('status', opt)}
                        className="flex-1 py-2.5 rounded-sm text-[12px] font-semibold tracking-[0.08em] border transition-colors"
                        style={active
                          ? { color: STATUS_COLORS[opt], borderColor: STATUS_COLORS[opt] + '66', background: STATUS_COLORS[opt] + '14' }
                          : { color: '#8e8e8e', borderColor: 'rgba(255,255,255,0.07)', background: 'transparent' }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </Field>
              <div className="col-span-2">
                <label className={LABEL}>Project</label>
                <input value={data.project} onChange={e => set('project', e.target.value)}
                  placeholder="Website development — lacroidept.com" className={INPUT} />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Invoice number — filename only, not printed</label>
                <div className="flex gap-2">
                  <input value={data.number} onChange={e => set('number', e.target.value)} className={INPUT} />
                  <button onClick={() => set('number', suggestInvoiceNumber())}
                    className="px-3 py-2.5 rounded-sm border border-white/[0.07] text-[12px] text-muted hover:text-ink hover:bg-white/[0.06] transition-colors whitespace-nowrap">
                    Suggest
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Billed to">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Client name">
                <input value={data.clientName} onChange={e => set('clientName', e.target.value)}
                  placeholder="LaCroi Dept." className={INPUT} />
              </Field>
              <Field label="Website">
                <input value={data.clientWebsite} onChange={e => set('clientWebsite', e.target.value)}
                  placeholder="lacroidept.com" className={INPUT} />
              </Field>
            </div>
            <ImagePicker label="Client logo" value={data.clientLogo}
              onChange={v => set('clientLogo', v)} hint="PNG or JPG. Printed under the client name." />
          </Card>

          <Card
            title="Items"
            action={
              <button onClick={() => setData(p => ({ ...p, items: [...p.items, newItem()] }))}
                className="text-[12px] text-muted hover:text-ink transition-colors">+ Add item</button>
            }
          >
            <div className="space-y-4">
              {data.items.map((it, i) => (
                <div key={it.id} className="border border-white/[0.05] rounded-sm p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] text-muted tracking-[0.08em] uppercase">
                      Item {String(i + 1).padStart(2, '0')}
                    </span>
                    <button onClick={() => removeItem(it.id)}
                      className="text-[12px] text-muted hover:text-red transition-colors">Remove</button>
                  </div>
                  <input value={it.title} onChange={e => setItem(it.id, { title: e.target.value })}
                    placeholder="Stage 01 — Down Payment" className={INPUT + ' mb-2'} />
                  <textarea value={it.description} onChange={e => setItem(it.id, { description: e.target.value })}
                    rows={2} placeholder="40% of website creation, incl. payment gateway."
                    className={INPUT + ' resize-none leading-[1.6] mb-2'} />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Qty">
                      <input type="number" min={0} inputMode="numeric" value={numDisplay(it.qty)}
                        onChange={e => setItem(it.id, { qty: parseNum(e.target.value) })}
                        placeholder="1" className={INPUT + ' text-right'} />
                    </Field>
                    <Field label="Unit price (Rp)">
                      <input type="number" min={0} inputMode="numeric" value={numDisplay(it.unitPrice)}
                        onChange={e => setItem(it.id, { unitPrice: parseNum(e.target.value) })}
                        placeholder="0" className={INPUT + ' text-right'} />
                    </Field>
                  </div>
                  <p className="text-[11px] text-muted mt-2 text-right">
                    Amount: <span className="text-ink">{formatIDR(it.qty * it.unitPrice)}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Adjustments">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount (Rp)">
                <input type="number" min={0} inputMode="numeric" value={numDisplay(data.discount)}
                  onChange={e => set('discount', parseNum(e.target.value))} placeholder="0" className={INPUT} />
              </Field>
              <Field label="Tax / PPN (%)">
                <input type="number" min={0} inputMode="numeric" value={numDisplay(data.taxPercent)}
                  onChange={e => set('taxPercent', parseNum(e.target.value))} placeholder="0" className={INPUT} />
              </Field>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-1.5 text-[13px]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span><span className="text-ink">{formatIDR(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Discount</span><span className="text-ink">- {formatIDR(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Tax ({data.taxPercent}%)</span><span className="text-ink">{formatIDR(totals.tax)}</span>
              </div>
              <div className="flex justify-between pt-2.5 mt-1 border-t border-white/[0.05] font-display font-bold text-[16px]">
                <span>Total due</span><span>{formatIDR(totals.total)}</span>
              </div>
            </div>
          </Card>

          <Card
            title="Payment schedule"
            action={
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.showSchedule}
                  onChange={e => setData(p => ({
                    ...p,
                    showSchedule: e.target.checked,
                    // Give the user something to edit the first time they switch it on.
                    schedule: e.target.checked && p.schedule.length === 0
                      ? [newScheduleRow(), newScheduleRow(), newScheduleRow()]
                      : p.schedule,
                  }))}
                  className="w-4 h-4 rounded" />
                <span className="text-[12px] text-muted">Show on invoice</span>
              </label>
            }
          >
            {!data.showSchedule ? (
              <p className="text-[12px] text-muted">
                Off — the full-contract breakdown is hidden from the PDF.
              </p>
            ) : (
              <>
                <div className="space-y-2.5">
                  {data.schedule.map((r, i) => (
                    <div key={r.id} className="grid grid-cols-[28px_1fr_130px_auto_auto] gap-2 items-center">
                      <span className="text-[12px] text-muted font-mono">{String(i + 1).padStart(2, '0')}</span>
                      <input value={r.label} onChange={e => setRow(r.id, { label: e.target.value })}
                        placeholder="Down payment — 40%" className={INPUT} />
                      <input type="number" min={0} inputMode="numeric" value={numDisplay(r.amount)}
                        onChange={e => setRow(r.id, { amount: parseNum(e.target.value) })}
                        placeholder="0" className={INPUT + ' text-right'} />
                      <button onClick={() => markCurrent(r.id)}
                        title="Mark as the stage this invoice bills for"
                        className={`px-2.5 py-2 rounded-sm text-[10px] font-semibold tracking-[0.06em] border transition-colors whitespace-nowrap ${
                          r.current
                            ? 'border-white/25 bg-white/10 text-ink'
                            : 'border-white/[0.07] text-muted hover:text-ink'
                        }`}>
                        {r.current ? 'THIS INVOICE' : 'UPCOMING'}
                      </button>
                      <button onClick={() => setData(p => ({ ...p, schedule: p.schedule.filter(x => x.id !== r.id) }))}
                        className="px-2 py-2 rounded-sm text-muted hover:text-red transition-colors text-[16px] leading-none">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                  <button onClick={() => setData(p => ({ ...p, schedule: [...p.schedule, newScheduleRow()] }))}
                    className="text-[12px] text-muted hover:text-ink transition-colors">+ Add stage</button>
                  <span className="text-[13px] text-muted">
                    Contract total <span className="text-ink font-semibold">{formatIDR(totals.contractTotal)}</span>
                  </span>
                </div>
              </>
            )}
          </Card>

          <Card title="Transfer to & notes">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Bank">
                <input value={data.bankName} onChange={e => set('bankName', e.target.value)} placeholder="BCA" className={INPUT} />
              </Field>
              <Field label="Account name">
                <input value={data.accountName} onChange={e => set('accountName', e.target.value)} className={INPUT} />
              </Field>
              <Field label="Account number">
                <input value={data.accountNumber} onChange={e => set('accountNumber', e.target.value)} className={INPUT} />
              </Field>
            </div>
            <div className="mt-3">
              <label className={LABEL}>Notes</label>
              <textarea value={data.notes} onChange={e => set('notes', e.target.value)} rows={2}
                placeholder="Please send proof of transfer once payment is made."
                className={INPUT + ' resize-none leading-[1.7]'} />
            </div>
          </Card>

          <Card title="Signature & footer">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Issued by (name)">
                <input value={data.issuerName} onChange={e => set('issuerName', e.target.value)}
                  placeholder="Wahyu A. Barmawi" className={INPUT} />
              </Field>
              <div className="pt-[2px]">
                <ImagePicker label="Signature" value={data.signature} onChange={v => set('signature', v)} />
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <label className={LABEL + ' mb-0'}>Amount in words</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.autoWords}
                    onChange={e => setData(p => ({
                      ...p,
                      autoWords: e.target.checked,
                      // Seed the box with the generated text so editing starts from something.
                      amountInWords: e.target.checked ? p.amountInWords : amountInWordsIDR(totals.total),
                    }))}
                    className="w-4 h-4 rounded" />
                  <span className="text-[12px] text-muted">Auto</span>
                </label>
              </div>
              <input
                value={data.autoWords ? amountInWordsIDR(totals.total) : data.amountInWords}
                onChange={e => set('amountInWords', e.target.value)}
                disabled={data.autoWords}
                className={INPUT + (data.autoWords ? ' opacity-60' : '')}
              />
            </div>

            <Field label="Footer note">
              <input value={data.footerNote} onChange={e => set('footerNote', e.target.value)} className={INPUT} />
            </Field>
          </Card>
        </div>

        {/* ── Live PDF preview ── */}
        <div className="lg:sticky lg:top-24">
          <InvoicePdfPane data={data} />
        </div>
      </div>
    </>
  )
}
