'use client'

import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import {
  calcTotals, formatIDR, formatDate, resolveAmountInWords, type InvoiceData,
} from '@/lib/invoice'

// react-pdf hyphenates by default, which breaks words like "shipping/delivery"
// mid-word. Returning the whole word disables that.
Font.registerHyphenationCallback(word => [word])

// ── Palette ─────────────────────────────────────────────────
const BG = '#0b0b0b'
const INK = '#ffffff'
const DIM = '#9a9a9a'
const FAINT = '#6b6b6b'
const LINE = '#232323'
const LINE_SOFT = '#1b1b1b'

// The sheet takes its accent from the status: yellow while owing, green once paid.
const THEMES = {
  UNPAID: { accent: '#e9ec3f', bg: '#1a1b08', border: '#3d3f13', label: '#b6b884' },
  PAID:   { accent: '#3fe07f', bg: '#08190f', border: '#164226', label: '#84b89a' },
} as const

const s = StyleSheet.create({
  page: {
    backgroundColor: BG,
    paddingTop: 44, paddingBottom: 56, paddingHorizontal: 46,
    fontFamily: 'Helvetica', fontSize: 10, color: INK, lineHeight: 1.35,
  },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  wordmark: { fontFamily: 'Helvetica-Bold', fontSize: 15, letterSpacing: 5 },
  tagline: { fontSize: 7.5, color: FAINT, marginTop: 5 },
  invoiceWord: { fontFamily: 'Helvetica-Bold', fontSize: 25, letterSpacing: -0.5 },

  // Shared label
  label: { fontSize: 7, color: FAINT, letterSpacing: 1.6, marginBottom: 5 },

  // Meta
  meta: { flexDirection: 'row', marginTop: 28 },
  metaA: { width: '35%', paddingRight: 12 },
  metaB: { width: '31%', paddingRight: 12 },
  metaC: { width: '34%' },
  clientName: { fontFamily: 'Helvetica-Bold', fontSize: 11.5 },
  clientWeb: { fontSize: 9.5, color: DIM, marginTop: 1 },
  logo: {
    width: 120, height: 40, marginTop: 14,
    objectFit: 'contain', objectPositionX: 0, alignSelf: 'flex-start',
  },

  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 2,
  },
  badgeText: { fontFamily: 'Helvetica-Bold', fontSize: 8, letterSpacing: 1.4 },

  // Items table
  thead: {
    flexDirection: 'row', marginTop: 24,
    borderBottomWidth: 1, borderBottomColor: LINE, paddingBottom: 8,
  },
  tr: {
    flexDirection: 'row', paddingTop: 13, paddingBottom: 11,
    borderBottomWidth: 1, borderBottomColor: LINE_SOFT,
  },
  cDesc: { flex: 1, paddingRight: 18 },
  cQty: { width: 60, textAlign: 'right' },
  cAmt: { width: 118, textAlign: 'right' },
  itemTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  itemDesc: { fontSize: 9, color: DIM, marginTop: 4, lineHeight: 1.45 },
  itemAmt: { fontFamily: 'Helvetica-Bold', fontSize: 12 },

  // Totals
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
  totals: { width: '52%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { fontSize: 10.5, color: DIM },
  totalValue: { fontSize: 10.5, color: DIM },
  dueBox: {
    marginTop: 9, paddingVertical: 11, paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dueLabel: { fontSize: 8, letterSpacing: 1.5 },
  dueValue: { fontFamily: 'Helvetica-Bold', fontSize: 18 },

  // Schedule
  schedule: { marginTop: 18 },
  schedRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5.5, borderBottomWidth: 1, borderBottomColor: LINE_SOFT,
  },
  schedIndex: { width: 34, fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  schedLabel: { flex: 1, fontSize: 10, paddingRight: 12 },
  schedAmount: { width: 118, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 10.5 },
  schedTag: { width: 92, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 7, letterSpacing: 1.1 },
  schedTotal: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },

  // Transfer + notes
  lower: { flexDirection: 'row', marginTop: 20 },
  lowerLeft: { width: '52%', paddingRight: 18 },
  lowerRight: { width: '48%' },
  payRow: { flexDirection: 'row', paddingVertical: 2.5 },
  payKey: { width: 118, fontSize: 10 },
  payVal: { flex: 1, fontSize: 10, color: DIM },
  noteText: { fontSize: 10, color: '#b3b3b3', lineHeight: 1.45 },

  // Signature strip
  strip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 22 },
  words: { flex: 1, paddingRight: 20, paddingBottom: 6 },
  wordsLabel: { fontSize: 9.5, color: DIM },
  wordsValue: { fontSize: 10.5 },
  issued: { width: 200, alignItems: 'center' },
  signature: { width: '100%', height: 48, objectFit: 'contain', marginBottom: 2 },
  signRule: { width: '100%', borderTopWidth: 1, borderTopColor: '#3a3a3a', paddingTop: 7 },
  issuerName: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, letterSpacing: 0.4, textAlign: 'center' },
  issuerBrand: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 6, textAlign: 'center' },
  issuerTag: { fontSize: 7.5, color: FAINT, marginTop: 2, textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute', bottom: 26, left: 46, right: 46,
    borderTopWidth: 1, borderTopColor: LINE, paddingTop: 9,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  footBrand: { fontFamily: 'Helvetica-Bold', fontSize: 9, letterSpacing: 3 },
  footTag: { fontSize: 7, color: FAINT, marginTop: 3 },
  footNote: { fontSize: 7.5, color: FAINT, textAlign: 'right', maxWidth: 300 },
})

const dash = (v: string) => (v && v.trim() ? v.trim() : '—')

export default function InvoiceDocument({ data }: { data: InvoiceData }) {
  const t = calcTotals(data)
  const th = THEMES[data.status] ?? THEMES.UNPAID
  // Blank trailing rows are a normal side effect of editing — keep them off the page.
  const items = data.items.filter(it => it.title.trim() || it.description.trim() || it.unitPrice > 0)
  const schedule = data.schedule.filter(r => r.label.trim() || r.amount > 0)
  const showSchedule = data.showSchedule && schedule.length > 0

  return (
    <Document title={data.number || 'Invoice'} author={data.brandName || 'NATY'}>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.wordmark}>{data.brandName || 'NATY'}</Text>
            {!!data.brandTagline.trim() && <Text style={s.tagline}>{data.brandTagline}</Text>}
          </View>
          <Text style={s.invoiceWord}>Invoice</Text>
        </View>

        {/* ── Billed to / date / status ── */}
        <View style={s.meta}>
          <View style={s.metaA}>
            <Text style={s.label}>BILLED TO</Text>
            <Text style={s.clientName}>{dash(data.clientName)}</Text>
            {!!data.clientWebsite.trim() && <Text style={s.clientWeb}>{data.clientWebsite}</Text>}
            {!!data.clientLogo && <Image src={data.clientLogo} style={s.logo} />}
          </View>

          <View style={s.metaB}>
            <Text style={s.label}>INVOICE DATE</Text>
            <Text>{formatDate(data.invoiceDate)}</Text>
          </View>

          <View style={s.metaC}>
            {!!data.status.trim() && (
              <>
                <Text style={s.label}>STATUS</Text>
                <View style={[s.badge, { borderColor: th.border, backgroundColor: th.bg }]}>
                  <Text style={[s.badgeText, { color: th.accent }]}>{data.status}</Text>
                </View>
              </>
            )}
            {!!data.project.trim() && (
              <View style={{ marginTop: data.status.trim() ? 16 : 0 }}>
                <Text style={s.label}>PROJECT</Text>
                <Text style={{ lineHeight: 1.5 }}>{data.project}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Items ── */}
        <View style={s.thead}>
          <Text style={[s.label, s.cDesc, { marginBottom: 0 }]}>DESCRIPTION</Text>
          <Text style={[s.label, s.cQty, { marginBottom: 0 }]}>QTY</Text>
          <Text style={[s.label, s.cAmt, { marginBottom: 0 }]}>AMOUNT</Text>
        </View>

        {items.length === 0 ? (
          <View style={s.tr}>
            <Text style={[s.cDesc, { color: FAINT }]}>No items yet</Text>
            <Text style={s.cQty}> </Text>
            <Text style={s.cAmt}> </Text>
          </View>
        ) : items.map(it => (
          <View key={it.id} style={s.tr} wrap={false}>
            <View style={s.cDesc}>
              <Text style={s.itemTitle}>{dash(it.title)}</Text>
              {!!it.description.trim() && <Text style={s.itemDesc}>{it.description}</Text>}
            </View>
            <Text style={s.cQty}>{it.qty}</Text>
            <Text style={[s.cAmt, s.itemAmt]}>{formatIDR(it.qty * it.unitPrice)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={s.totalsWrap}>
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{formatIDR(t.subtotal)}</Text>
            </View>
            {t.discount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Discount</Text>
                <Text style={s.totalValue}>- {formatIDR(t.discount)}</Text>
              </View>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Tax ({data.taxPercent}%)</Text>
              <Text style={s.totalValue}>{formatIDR(t.tax)}</Text>
            </View>

            <View style={[s.dueBox, { borderColor: th.border, backgroundColor: th.bg }]}>
              <Text style={[s.dueLabel, { color: th.label }]}>TOTAL DUE</Text>
              <Text style={[s.dueValue, { color: th.accent }]}>{formatIDR(t.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Payment schedule ── */}
        {showSchedule && (
          <View style={s.schedule}>
            <Text style={s.label}>PAYMENT SCHEDULE — FULL CONTRACT</Text>
            {schedule.map((r, i) => (
              <View key={r.id} style={s.schedRow} wrap={false}>
                <Text style={[s.schedIndex, { color: r.current ? INK : FAINT }]}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={[s.schedLabel, { color: r.current ? INK : DIM }]}>{dash(r.label)}</Text>
                <Text style={[s.schedAmount, { color: r.current ? INK : DIM }]}>
                  {formatIDR(r.amount)}
                </Text>
                <Text style={[s.schedTag, { color: r.current ? th.accent : FAINT }]}>
                  {r.current ? 'THIS INVOICE' : 'UPCOMING'}
                </Text>
              </View>
            ))}
            <View style={s.schedTotal}>
              <Text style={s.schedIndex}> </Text>
              <Text style={[s.schedLabel, { fontFamily: 'Helvetica-Bold' }]}>Contract total</Text>
              <Text style={s.schedAmount}>{formatIDR(t.contractTotal)}</Text>
              <Text style={s.schedTag}> </Text>
            </View>
          </View>
        )}

        {/* ── Transfer / notes ── */}
        <View style={s.lower}>
          <View style={s.lowerLeft}>
            <Text style={s.label}>TRANSFER TO</Text>
            <View style={s.payRow}>
              <Text style={s.payKey}>Bank</Text>
              <Text style={s.payVal}>{dash(data.bankName)}</Text>
            </View>
            <View style={s.payRow}>
              <Text style={s.payKey}>Account name</Text>
              <Text style={s.payVal}>{dash(data.accountName)}</Text>
            </View>
            <View style={s.payRow}>
              <Text style={s.payKey}>Account number</Text>
              <Text style={s.payVal}>{dash(data.accountNumber)}</Text>
            </View>
          </View>

          <View style={s.lowerRight}>
            {!!data.notes.trim() && (
              <>
                <Text style={s.label}>NOTES</Text>
                <Text style={s.noteText}>{data.notes}</Text>
              </>
            )}
          </View>
        </View>

        {/* ── Amount in words + signature ── */}
        <View style={s.strip}>
          <View style={s.words}>
            <Text>
              <Text style={s.wordsLabel}>Amount in words  ·  </Text>
              <Text style={s.wordsValue}>{resolveAmountInWords(data, t.total)}</Text>
            </Text>
          </View>

          <View style={s.issued}>
            <Text style={[s.label, { alignSelf: 'flex-end', marginBottom: 2 }]}>ISSUED BY</Text>
            {!!data.signature && <Image src={data.signature} style={s.signature} />}
            <View style={s.signRule}>
              <Text style={s.issuerName}>{(data.issuerName || '').toUpperCase() || ' '}</Text>
            </View>
            <Text style={s.issuerBrand}>{data.brandName || 'NATY'}</Text>
            {!!data.brandTagline.trim() && <Text style={s.issuerTag}>{data.brandTagline}</Text>}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footBrand}>{data.brandName || 'NATY'}</Text>
            {!!data.brandTagline.trim() && <Text style={s.footTag}>{data.brandTagline}</Text>}
          </View>
          <Text style={s.footNote}>{data.footerNote}</Text>
        </View>

      </Page>
    </Document>
  )
}
