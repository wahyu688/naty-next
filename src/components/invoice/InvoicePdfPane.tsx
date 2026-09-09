'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import InvoiceDocument from './InvoiceDocument'
import { invoiceFilename, type InvoiceData } from '@/lib/invoice'

/**
 * Renders the invoice to a PDF blob entirely in the browser — nothing is uploaded
 * or stored. The preview is debounced; the download always re-renders from the
 * data as it stands at click time, so it can never lag behind the form.
 */
export default function InvoicePdfPane({ data }: { data: InvoiceData }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [building, setBuilding] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  const render = useCallback(() => pdf(<InvoiceDocument data={data} />).toBlob(), [data])

  useEffect(() => {
    let cancelled = false
    setBuilding(true)
    const timer = setTimeout(async () => {
      try {
        const blob = await render()
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        urlRef.current = url
        setPreviewUrl(url)
        setError(null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Preview failed to render')
      } finally {
        if (!cancelled) setBuilding(false)
      }
    }, 500)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [render])

  // Release the last preview blob when the section unmounts.
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const blob = await render()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = invoiceFilename(data)
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Let the browser start the download before the blob is released.
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF generation failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-[14px]">Preview</span>
          {building && <span className="text-[11px] text-muted">rendering…</span>}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="font-display font-semibold text-[13px] px-4 py-2 rounded-sm bg-ink text-bg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {downloading ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {error && (
        <div className="px-5 py-3 text-[12px] text-red border-b border-white/[0.05] bg-red/[0.06]">
          {error}
        </div>
      )}

      <div className="bg-bg" style={{ height: 'clamp(520px, 78vh, 900px)' }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title="Invoice preview"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[13px] text-muted">
            {error ? 'Preview unavailable' : 'Building preview…'}
          </div>
        )}
      </div>
    </div>
  )
}
