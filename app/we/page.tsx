'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  weEssays, WE_CATEGORY_LABELS, WE_CATEGORY_COLORS, WE_CATEGORY_BG,
  WE_STANCE_LABELS, type WECategory, type StanceType, type WEEssay,
} from '@/data/we-essays'

const STORAGE_KEY = 'pte-we-progress'

function useWEProgress() {
  const [mastered, setMastered] = useState<Set<number>>(new Set())
  const [starred, setStarred] = useState<Set<number>>(new Set())
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        setMastered(new Set(d.mastered || []))
        setStarred(new Set(d.starred || []))
      }
    } catch {}
  }, [])
  const save = (m: Set<number>, s: Set<number>) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mastered: [...m], starred: [...s] }))
  const toggleMastered = (n: number) => setMastered(prev => {
    const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n)
    setStarred(s => { save(next, s); return s }); return next
  })
  const toggleStarred = (n: number) => setStarred(prev => {
    const next = new Set(prev); next.has(n) ? next.delete(n) : next.add(n)
    setMastered(m => { save(m, next); return m }); return next
  })
  return { mastered, starred, toggleMastered, toggleStarred }
}

type ViewMode = 'list' | 'card' | 'template'

const STANCE_COLORS: Record<StanceType, { bg: string, text: string }> = {
  agree:      { bg: '#E1F5EE', text: '#0F6E56' },
  disagree:   { bg: '#FDEAEA', text: '#7B2D2D' },
  partial:    { bg: '#FAEEDA', text: '#854F0B' },
  both_sides: { bg: '#E6F1FB', text: '#185FA5' },
}

export default function WEPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<WECategory | ''>('')
  const [stanceFilter, setStanceFilter] = useState<StanceType | ''>('')
  const [selected, setSelected] = useState<WEEssay | null>(null)
  const { mastered, starred, toggleMastered, toggleStarred } = useWEProgress()

  const filtered = useMemo(() => weEssays.filter(e => {
    if (catFilter && e.cat !== catFilter) return false
    if (stanceFilter && e.stance !== stanceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.title.toLowerCase().includes(q) ||
        e.keywords.join(' ').toLowerCase().includes(q) ||
        e.stanceText.toLowerCase().includes(q)
    }
    return true
  }), [catFilter, stanceFilter, search])

  const progress = weEssays.filter(e => mastered.has(e.n)).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 24px rgba(0,0,0,0.10) !important; }
        .card-hover { transition: transform 0.18s, box-shadow 0.18s; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom:'1px solid var(--border)', background:'var(--surface)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <Link href="/" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              ← SST
            </Link>
            <span style={{ color:'var(--border-strong)' }}>|</span>
            <span style={{ fontFamily:'Fraunces, serif', fontSize:20, fontWeight:400 }}>PTE WE</span>
            <span style={{ fontSize:12, color:'var(--text-3)' }}>2026 写作题库</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, color:'var(--text-2)' }}>
              <span style={{ color:'var(--accent)', fontWeight:500 }}>{progress}</span>
              <span style={{ color:'var(--text-3)' }}> / {weEssays.length}</span>
            </span>
            <div style={{ width:72, height:4, background:'var(--surface2)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${(progress/weEssays.length)*100}%`, height:'100%', background:'var(--accent)', transition:'width 0.4s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', gap:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:4, width:'fit-content' }}>
          {([['list','📋 题目列表'],['card','🃏 闪卡练习'],['template','✍️ 万能模板']] as [ViewMode,string][]).map(([v,label]) => (
            <button key={v} onClick={() => { setView(v); setSelected(null) }} style={{
              padding:'7px 16px', borderRadius:'var(--radius-sm)', border:'none', cursor:'pointer', fontSize:14, fontFamily:'DM Sans, sans-serif',
              background: view===v ? 'var(--accent)' : 'transparent',
              color: view===v ? '#fff' : 'var(--text-2)',
              fontWeight: view===v ? 500 : 400, transition:'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth:960, margin:'0 auto', padding:'20px' }}>

        {/* ── LIST VIEW ── */}
        {view === 'list' && !selected && (
          <div>
            {/* Filters */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索题目、关键词..."
                style={{ flex:'1 1 160px', padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif', outline:'none' }} />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, cursor:'pointer', outline:'none' }}>
                <option value="">全部分类</option>
                {(Object.keys(WE_CATEGORY_LABELS) as WECategory[]).map(k => <option key={k} value={k}>{WE_CATEGORY_LABELS[k]}</option>)}
              </select>
              <select value={stanceFilter} onChange={e => setStanceFilter(e.target.value as any)}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, cursor:'pointer', outline:'none' }}>
                <option value="">全部立场</option>
                {(Object.keys(WE_STANCE_LABELS) as StanceType[]).map(k => <option key={k} value={k}>{WE_STANCE_LABELS[k]}</option>)}
              </select>
            </div>

            <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:12 }}>
              显示 {filtered.length} 篇 &nbsp;·&nbsp; 已掌握 {progress} / {weEssays.length}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
              {filtered.map(e => (
                <div key={e.n} className="card-hover" onClick={() => { setSelected(e); setView('card') }}
                  style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', boxShadow:'var(--shadow)', cursor:'pointer', overflow:'hidden', opacity: mastered.has(e.n) ? 0.55 : 1 }}>
                  <div style={{ height:3, background: WE_CATEGORY_COLORS[e.cat] }} />
                  <div style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:WE_CATEGORY_BG[e.cat], color:WE_CATEGORY_COLORS[e.cat], fontWeight:500 }}>{WE_CATEGORY_LABELS[e.cat]}</span>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:STANCE_COLORS[e.stance].bg, color:STANCE_COLORS[e.stance].text, fontWeight:500 }}>{WE_STANCE_LABELS[e.stance]}</span>
                      </div>
                      <span style={{ fontSize:12, color:'var(--text-3)' }}>{e.id}</span>
                    </div>
                    <div style={{ fontFamily:'Fraunces, serif', fontSize:16, fontWeight:400, color:'var(--text)', marginBottom:6, lineHeight:1.3 }}>{e.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.stanceText}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {e.keywords.slice(0,3).map(k => (
                        <span key={k} style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--tag-bg)', color:'var(--tag-text)' }}>{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CARD VIEW (detail) ── */}
        {view === 'card' && (
          <CardView
            essays={filtered.length > 0 ? filtered : weEssays}
            initial={selected}
            mastered={mastered} starred={starred}
            toggleMastered={toggleMastered} toggleStarred={toggleStarred}
            onBack={() => { setSelected(null); setView('list') }}
          />
        )}

        {/* ── TEMPLATE VIEW ── */}
        {view === 'template' && <TemplateView />}

      </main>

      <footer style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-3)', fontSize:13, borderTop:'1px solid var(--border)', marginTop:20 }}>
        飞凡英语 · WE 月资料 2026.4 &nbsp;·&nbsp; 42 道核心题目 &nbsp;·&nbsp; litianzeng.cn
      </footer>
    </div>
  )
}

/* ─── Card View ─── */
function CardView({ essays, initial, mastered, starred, toggleMastered, toggleStarred, onBack }: {
  essays: WEEssay[], initial: WEEssay | null,
  mastered: Set<number>, starred: Set<number>,
  toggleMastered: (n:number)=>void, toggleStarred: (n:number)=>void,
  onBack: () => void,
}) {
  const startIdx = initial ? essays.findIndex(e => e.n === initial.n) : 0
  const [idx, setIdx] = useState(Math.max(0, startIdx))
  const [showBody1, setShowBody1] = useState(false)
  const [showBody2, setShowBody2] = useState(false)

  const e = essays[idx] || essays[0]
  if (!e) return null

  const catColor = WE_CATEGORY_COLORS[e.cat]
  const catBg = WE_CATEGORY_BG[e.cat]
  const sc = STANCE_COLORS[e.stance]

  const next = () => { setIdx(i => Math.min(essays.length-1, i+1)); setShowBody1(false); setShowBody2(false) }
  const prev = () => { setIdx(i => Math.max(0, i-1)); setShowBody1(false); setShowBody2(false) }

  return (
    <div style={{ animation:'slideUp 0.25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <button onClick={onBack} style={{ padding:'6px 14px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', cursor:'pointer', fontSize:13, color:'var(--text-2)' }}>
          ← 返回列表
        </button>
        <div style={{ flex:1, height:3, background:'var(--surface2)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${((idx+1)/essays.length)*100}%`, height:'100%', background:'var(--accent)', transition:'width 0.3s' }} />
        </div>
        <span style={{ fontSize:13, color:'var(--text-3)', flexShrink:0 }}>{idx+1} / {essays.length}</span>
      </div>

      {/* Main card */}
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
        <div style={{ height:4, background:catColor }} />
        <div style={{ padding:'24px 28px 20px' }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8, alignItems:'center' }}>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:catBg, color:catColor, fontWeight:500 }}>{WE_CATEGORY_LABELS[e.cat]}</span>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:sc.bg, color:sc.text, fontWeight:500 }}>{WE_STANCE_LABELS[e.stance]}</span>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>{e.id} · #{e.n}</span>
              </div>
              <h2 style={{ fontFamily:'Fraunces, serif', fontSize:22, fontWeight:400, lineHeight:1.2, marginBottom:6 }}>{e.title}</h2>
              <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6 }}>{e.question}</p>
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0, marginLeft:12 }}>
              <button onClick={() => toggleStarred(e.n)} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid var(--border)', background: starred.has(e.n)?'#FFF3CC':'var(--surface2)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>⭐</button>
              <button onClick={() => toggleMastered(e.n)} style={{ width:34, height:34, borderRadius:'50%', border:'1px solid var(--border)', background: mastered.has(e.n)?'var(--accent-light)':'var(--surface2)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {mastered.has(e.n)?'✅':'⬜'}
              </button>
            </div>
          </div>

          {/* Thesis box */}
          <div style={{ background:catBg, borderRadius:'var(--radius-md)', padding:'14px 18px', marginBottom:16, borderLeft:`3px solid ${catColor}` }}>
            <div style={{ fontSize:11, fontWeight:500, color:catColor, letterSpacing:'0.08em', marginBottom:4 }}>立场 · THESIS</div>
            <div style={{ fontSize:15, color:'var(--text)', lineHeight:1.6, fontWeight:400 }}>{e.stanceText}</div>
          </div>

          {/* Keywords */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:8 }}>核心词汇</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {e.keywords.map(k => <span key={k} style={{ padding:'4px 12px', borderRadius:99, fontSize:13, background:catBg, color:catColor }}>{k}</span>)}
            </div>
          </div>

          {/* Logic diagram */}
          <LogicDiagram essay={e} catColor={catColor} catBg={catBg} />

          {/* Body 1 */}
          <div style={{ marginTop:16 }}>
            <button onClick={() => setShowBody1(v => !v)} style={{
              width:'100%', padding:'12px 16px', borderRadius:'var(--radius-md)', border:`1.5px solid ${showBody1 ? 'var(--border)' : catColor}`,
              background: showBody1 ? 'var(--surface2)' : catBg, cursor:'pointer', fontSize:14,
              color: showBody1 ? 'var(--text-2)' : catColor, fontWeight:500, transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'DM Sans, sans-serif',
            }}>
              <span>Body 1 · 论点一</span>
              <span>{showBody1 ? '▲' : '▼'}</span>
            </button>
            {showBody1 && (
              <div style={{ marginTop:10, padding:'18px 20px', background:'#FAFAF8', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', animation:'fadeIn 0.2s ease' }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:12, lineHeight:1.6, borderLeft:`3px solid ${catColor}`, paddingLeft:12 }}>
                  {e.body1.claim}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {e.body1.evidence.map((ev, i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ flexShrink:0, width:20, height:20, borderRadius:'50%', background:catBg, color:catColor, fontSize:11, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>{i+1}</span>
                      <span style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Body 2 */}
          <div style={{ marginTop:10 }}>
            <button onClick={() => setShowBody2(v => !v)} style={{
              width:'100%', padding:'12px 16px', borderRadius:'var(--radius-md)', border:`1.5px solid ${showBody2 ? 'var(--border)' : catColor}`,
              background: showBody2 ? 'var(--surface2)' : catBg, cursor:'pointer', fontSize:14,
              color: showBody2 ? 'var(--text-2)' : catColor, fontWeight:500, transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'DM Sans, sans-serif',
            }}>
              <span>Body 2 · 论点二</span>
              <span>{showBody2 ? '▲' : '▼'}</span>
            </button>
            {showBody2 && (
              <div style={{ marginTop:10, padding:'18px 20px', background:'#FAFAF8', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', animation:'fadeIn 0.2s ease' }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:12, lineHeight:1.6, borderLeft:`3px solid ${catColor}`, paddingLeft:12 }}>
                  {e.body2.claim}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {e.body2.evidence.map((ev, i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ flexShrink:0, width:20, height:20, borderRadius:'50%', background:catBg, color:catColor, fontSize:11, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>{i+1}</span>
                      <span style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', gap:10, marginTop:14 }}>
        <button onClick={prev} disabled={idx===0}
          style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--surface)', cursor:idx===0?'not-allowed':'pointer', fontSize:14, color:'var(--text-2)', opacity:idx===0?0.4:1 }}>
          ← 上一题
        </button>
        <button onClick={next} disabled={idx===essays.length-1}
          style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1px solid var(--accent)', background:'var(--accent)', cursor:idx===essays.length-1?'not-allowed':'pointer', fontSize:14, color:'#fff', opacity:idx===essays.length-1?0.5:1 }}>
          下一题 →
        </button>
      </div>
    </div>
  )
}

/* ─── Logic Diagram (like the image) ─── */
function LogicDiagram({ essay, catColor, catBg }: { essay: WEEssay, catColor: string, catBg: string }) {
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ fontSize:11, fontWeight:500, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:10 }}>逻辑导图</div>
      <div style={{ background:'var(--surface2)', borderRadius:'var(--radius-md)', padding:'16px', fontSize:13 }}>

        {/* Row: Thesis */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
          <div style={{ background:catColor, color:'#fff', padding:'8px 18px', borderRadius:'var(--radius-sm)', fontWeight:500, fontSize:13, maxWidth:480, textAlign:'center', lineHeight:1.4 }}>
            {essay.stanceText}
          </div>
        </div>

        {/* Arrow down */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
          <div style={{ width:2, height:16, background:catColor, opacity:0.5 }} />
        </div>

        {/* Two bodies side by side */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[essay.body1, essay.body2].map((body, bi) => (
            <div key={bi} style={{ background:'var(--surface)', borderRadius:'var(--radius-sm)', border:`1px solid ${catColor}33`, padding:'12px' }}>
              <div style={{ fontSize:11, fontWeight:600, color:catColor, marginBottom:6, letterSpacing:'0.04em' }}>
                论点 {bi+1}
              </div>
              <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.5, marginBottom:8, fontWeight:500 }}>
                {body.claim}
              </div>
              {/* Arrow */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>
                <div style={{ width:1, height:10, background:catColor, opacity:0.4 }} />
              </div>
              {/* Evidence */}
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {body.evidence.map((ev, i) => (
                  <div key={i} style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
                    <span style={{ flexShrink:0, fontSize:10, color:catColor, fontWeight:600, marginTop:2 }}>例{i+1}</span>
                    <span style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Template View ─── */
function TemplateView() {
  const [copied, setCopied] = useState(false)
  const fullTemplate = `Nowadays, [TOPIC] has fueled heated discussions. Proponents claim that [SUPPORTING SIDE], whereas opponents contend that [OPPOSING SIDE]. From my perspective, I am convinced that [YOUR STANCE].

To begin with, [BODY 1 TOPIC SENTENCE]. For example, [EVIDENCE 1]. In addition to this, [EVIDENCE 2]. Other than that, [EVIDENCE 3]. It is thus shown that [MINI CONCLUSION 1].

Besides, I also believe that [BODY 2 TOPIC SENTENCE]. On top of that, [EVIDENCE 4]. Moreover, [EVIDENCE 5]. Recently, I have examined an article arguing that [EVIDENCE 6]. This clearly proves that [MINI CONCLUSION 2].

To conclude, there is no doubt that [RESTATE TOPIC IMPORTANCE]. While some might disagree, the evidence strongly supports that [RESTATE THESIS].`

  const copyTemplate = () => {
    navigator.clipboard.writeText(fullTemplate).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const phrases = [
    { label: '引入话题', en: 'Nowadays, [TOPIC] has fueled heated discussions.', cn: '如今，[话题] 引发了热烈讨论。' },
    { label: '对立观点', en: 'Proponents claim that [A], whereas opponents contend that [B].', cn: '支持者认为 [A]，而反对者则主张 [B]。' },
    { label: '明确立场', en: 'From my perspective, I am convinced that [STANCE].', cn: '从我的角度来看，我相信 [立场]。' },
    { label: '引出论点1', en: 'To begin with, [TOPIC SENTENCE].', cn: '首先，[论点句]。' },
    { label: '第一例证', en: 'For example, [EVIDENCE 1].', cn: '例如，[论据1]。' },
    { label: '第二例证', en: 'In addition to this, [EVIDENCE 2].', cn: '除此之外，[论据2]。' },
    { label: '第三例证', en: 'Other than that, [EVIDENCE 3].', cn: '此外，[论据3]。' },
    { label: '小结论1', en: 'It is thus shown that [MINI CONCLUSION].', cn: '由此可见，[小结]。' },
    { label: '引出论点2', en: 'Besides, I also believe that [TOPIC SENTENCE].', cn: '此外，我也认为 [论点句]。' },
    { label: '第四例证', en: 'On top of that, [EVIDENCE 4].', cn: '在此基础上，[论据4]。' },
    { label: '第五例证', en: 'Moreover, [EVIDENCE 5].', cn: '此外，[论据5]。' },
    { label: '引用文章', en: 'Recently, I have examined an article arguing that [EVIDENCE 6].', cn: '最近，我读过一篇文章指出 [论据6]。' },
    { label: '小结论2', en: 'This clearly proves that [MINI CONCLUSION].', cn: '这清楚地证明了 [小结]。' },
    { label: '开始结论', en: 'To conclude, there is no doubt that [RESTATE IMPORTANCE].', cn: '总而言之，毫无疑问 [重申重要性]。' },
    { label: '让步转折', en: 'While some might disagree, the evidence strongly supports that [RESTATE THESIS].', cn: '尽管有人可能不同意，证据有力地支持 [重申论点]。' },
  ]

  const stanceGuide = [
    { type: '赞成 Agree', template: 'I strongly agree that [TOPIC]...', body1: 'The first reason is that [BENEFIT 1]...', body2: 'Furthermore, [BENEFIT 2]...' },
    { type: '反对 Disagree', template: 'I strongly disagree that [TOPIC]...', body1: 'First, [COUNTER-ARGUMENT 1]...', body2: 'Moreover, [COUNTER-ARGUMENT 2]...' },
    { type: '部分同意 Partial', template: 'I partially agree / disagree that [TOPIC]...', body1: 'On one hand, [POINT FOR]...', body2: 'On the other hand, [POINT AGAINST]...' },
    { type: '两面分析 Both Sides', template: '[TOPIC] has both positive and negative consequences...', body1: 'The positive impact is [ADVANTAGE]...', body2: 'However, the negative impact includes [DISADVANTAGE]...' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Full template */}
      <div style={{ background:'var(--accent-dark)', borderRadius:'var(--radius-xl)', padding:'24px 28px', color:'#fff' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:500, opacity:0.85 }}>WE 万能模板 · 完整版</div>
          <button onClick={copyTemplate} style={{ padding:'6px 14px', borderRadius:'var(--radius-sm)', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontSize:13 }}>
            {copied ? '✓ 已复制' : '复制模板'}
          </button>
        </div>
        <pre style={{ fontSize:13, lineHeight:1.9, opacity:0.9, whiteSpace:'pre-wrap', fontFamily:'DM Sans, sans-serif', margin:0 }}>
          {fullTemplate}
        </pre>
      </div>

      {/* Phrase by phrase */}
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'14px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
          <h3 style={{ fontFamily:'Fraunces, serif', fontSize:17, fontWeight:400 }}>逐句拆解 · 套用指南</h3>
        </div>
        {phrases.map((p, i) => (
          <div key={i} style={{ padding:'12px 22px', borderBottom: i<phrases.length-1 ? '1px solid var(--border)' : 'none', display:'flex', gap:16, alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:'var(--text-3)', minWidth:64, flexShrink:0, paddingTop:3, fontWeight:500 }}>{p.label}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, color:'var(--text)', marginBottom:3 }}>{p.en}</div>
              <div style={{ fontSize:12, color:'var(--text-3)' }}>{p.cn}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stance-specific guides */}
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'14px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
          <h3 style={{ fontFamily:'Fraunces, serif', fontSize:17, fontWeight:400 }}>四种立场的论点安排</h3>
        </div>
        <div style={{ padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
          {stanceGuide.map((s, i) => {
            const colors = Object.values(STANCE_COLORS)[i]
            return (
              <div key={i} style={{ background:colors.bg, borderRadius:'var(--radius-md)', padding:'14px', border:`1px solid ${colors.text}22` }}>
                <div style={{ fontSize:12, fontWeight:600, color:colors.text, marginBottom:8 }}>{s.type}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6, marginBottom:6 }}><strong>立场：</strong>{s.template}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6, marginBottom:4 }}><strong>B1：</strong>{s.body1}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6 }}><strong>B2：</strong>{s.body2}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Word count guide */}
      <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        <div style={{ padding:'14px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
          <h3 style={{ fontFamily:'Fraunces, serif', fontSize:17, fontWeight:400 }}>字数与结构目标</h3>
        </div>
        <div style={{ padding:'16px 22px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
          {[
            { section:'引言 Intro', words:'50–60', note:'话题引入 + 立场声明' },
            { section:'Body 1', words:'80–100', note:'论点 + 3个论据 + 小结' },
            { section:'Body 2', words:'80–100', note:'论点 + 3个论据 + 小结' },
            { section:'结论 Conclusion', words:'40–50', note:'重申立场 + 总结' },
            { section:'总计 Total', words:'250–300', note:'PTE WE 目标字数' },
          ].map((row, i) => (
            <div key={i} style={{ background:'var(--surface2)', borderRadius:'var(--radius-sm)', padding:'12px 14px' }}>
              <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', marginBottom:4 }}>{row.section}</div>
              <div style={{ fontFamily:'Fraunces, serif', fontSize:22, color:'var(--accent)', marginBottom:4 }}>{row.words}</div>
              <div style={{ fontSize:11, color:'var(--text-3)' }}>{row.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
