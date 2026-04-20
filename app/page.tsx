'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { cards, CATEGORY_LABELS, CATEGORY_BG, CATEGORY_COLORS, type Category } from '@/data/cards'

const STORAGE_KEY = 'pte-sst-progress'

function useProgress() {
  const [mastered, setMastered] = useState<Set<number>>(new Set())
  const [starred, setStarred] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setMastered(new Set(data.mastered || []))
        setStarred(new Set(data.starred || []))
      }
    } catch {}
  }, [])

  const save = useCallback((m: Set<number>, s: Set<number>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mastered: [...m], starred: [...s] }))
  }, [])

  const toggleMastered = useCallback((n: number) => {
    setMastered(prev => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      setStarred(s => { save(next, s); return s })
      return next
    })
  }, [save])

  const toggleStarred = useCallback((n: number) => {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      setMastered(m => { save(m, next); return m })
      return next
    })
  }, [save])

  return { mastered, starred, toggleMastered, toggleStarred }
}

type Tab = 'practice' | 'template' | 'list'
type FilterMode = 'all' | 'starred' | 'unmastered'

/** Split answer text into plain/highlighted segments based on keywords */
function highlightAnswer(text: string, keys: string[], bgColor: string, fgColor: string) {
  if (!keys.length) return <span>{text}</span>

  // Sort keywords longest-first to avoid partial matches swallowing longer ones
  const sorted = [...keys].sort((a, b) => b.length - a.length)
  const escaped = sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')

  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keys.some(k => k.toLowerCase() === part.toLowerCase())
        return isMatch ? (
          <mark key={i} style={{
            background: bgColor,
            color: fgColor,
            borderRadius: 4,
            padding: '1px 5px',
            fontWeight: 500,
            // No default yellow — uses category color
            WebkitTextFillColor: fgColor,
          }}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </>
  )
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('practice')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [filterCat, setFilterCat] = useState<Category | ''>('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')
  const [randomMode, setRandomMode] = useState(false)
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([])
  const { mastered, starred, toggleMastered, toggleStarred } = useProgress()

  const filteredCards = useMemo(() => cards.filter(c => {
    if (filterCat && c.cat !== filterCat) return false
    if (filterMode === 'starred' && !starred.has(c.n)) return false
    if (filterMode === 'unmastered' && mastered.has(c.n)) return false
    if (search) {
      const q = search.toLowerCase()
      return c.title.toLowerCase().includes(q) || c.keys.join(' ').toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)
    }
    return true
  }), [filterCat, filterMode, search, starred, mastered])

  const displayCards = useMemo(() => {
    if (!randomMode) return filteredCards
    return shuffledOrder.map(i => filteredCards[i]).filter(Boolean)
  }, [filteredCards, randomMode, shuffledOrder])

  useEffect(() => { setCurrentIdx(0); setRevealed(false) }, [filterCat, filterMode, search])
  useEffect(() => { setRevealed(false) }, [currentIdx])

  const shuffle = () => {
    const arr = Array.from({ length: filteredCards.length }, (_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setShuffledOrder(arr); setCurrentIdx(0); setRevealed(false)
  }

  const toggleRandom = () => { if (!randomMode) shuffle(); setRandomMode(r => !r) }
  const progress = cards.filter(c => mastered.has(c.n)).length
  const currentCard = displayCards[currentIdx]

  const goToCard = (n: number) => {
    const idx = cards.findIndex(c => c.n === n)
    if (idx >= 0) { setCurrentIdx(idx); setTab('practice'); setFilterCat(''); setFilterMode('all'); setSearch('') }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        input:focus { outline: none; border-color: var(--accent) !important; }
        select:focus { outline: none; border-color: var(--accent) !important; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 400 }}>PTE SST</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 300 }}>高频题库</span>
            </div>
            <Link href="/we" style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text-2)', fontSize: 13, textDecoration: 'none' }}>
              ✍️ WE 写作
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{progress}</span>
              <span style={{ color: 'var(--text-3)' }}> / {cards.length}</span>
            </span>
            <div style={{ width: 72, height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(progress / cards.length) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
          {([['practice','🃏 闪卡练习'],['template','📋 模板'],['list','📚 题目列表']] as [Tab,string][]).map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-2)',
              fontWeight: tab === t ? 500 : 400, transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '20px' }}>

        {/* ── PRACTICE TAB ── */}
        {tab === 'practice' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索题目..."
                style={{ flex:'1 1 140px', minWidth:120, padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif' }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif', cursor:'pointer' }}>
                <option value="">全部分类</option>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(k => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
              </select>
              <select value={filterMode} onChange={e => setFilterMode(e.target.value as FilterMode)}
                style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif', cursor:'pointer' }}>
                <option value="all">全部</option>
                <option value="starred">⭐ 收藏</option>
                <option value="unmastered">未掌握</option>
              </select>
              <button onClick={toggleRandom} style={{
                padding:'8px 14px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', cursor:'pointer', fontSize:13, fontFamily:'DM Sans, sans-serif',
                background: randomMode ? 'var(--accent)' : 'var(--surface)', color: randomMode ? '#fff' : 'var(--text-2)',
              }}>🔀 随机</button>
            </div>

            {!currentCard ? (
              <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-3)' }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🔍</div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:20 }}>没有符合条件的题目</div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', marginBottom:12, gap:12 }}>
                  <span style={{ fontSize:13, color:'var(--text-3)', flexShrink:0 }}>{currentIdx+1} / {displayCards.length}</span>
                  <div style={{ flex:1, height:3, background:'var(--surface2)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${((currentIdx+1)/displayCards.length)*100}%`, height:'100%', background:'var(--accent)', transition:'width 0.3s' }} />
                  </div>
                </div>

                {/* The card */}
                <div style={{ background:'var(--surface)', borderRadius:'var(--radius-xl)', border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)', overflow:'hidden' }}>
                  <div style={{ height:4, background: CATEGORY_COLORS[currentCard.cat as Category] }} />
                  <div style={{ padding:'28px 28px 24px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          <span style={{ padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:500, background:CATEGORY_BG[currentCard.cat as Category], color:CATEGORY_COLORS[currentCard.cat as Category] }}>
                            {CATEGORY_LABELS[currentCard.cat as Category]}
                          </span>
                          <span style={{ fontSize:12, color:'var(--text-3)' }}>#{currentCard.n}</span>
                        </div>
                        <h2 style={{ fontFamily:'Fraunces, serif', fontSize:24, fontWeight:400, lineHeight:1.2 }}>{currentCard.title}</h2>
                      </div>
                      <div style={{ display:'flex', gap:8, flexShrink:0, marginLeft:12 }}>
                        <button onClick={() => toggleStarred(currentCard.n)} title="收藏"
                          style={{ width:34, height:34, borderRadius:'50%', border:'1px solid var(--border)', background: starred.has(currentCard.n) ? '#FFF3CC' : 'var(--surface2)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>⭐</button>
                        <button onClick={() => toggleMastered(currentCard.n)} title="标记已掌握"
                          style={{ width:34, height:34, borderRadius:'50%', border:'1px solid var(--border)', background: mastered.has(currentCard.n) ? 'var(--accent-light)' : 'var(--surface2)', cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {mastered.has(currentCard.n) ? '✅' : '⬜'}
                        </button>
                      </div>
                    </div>

                    <div style={{ background:'var(--surface2)', borderRadius:'var(--radius-md)', padding:'14px 18px', marginBottom:18, borderLeft:`3px solid ${CATEGORY_COLORS[currentCard.cat as Category]}` }}>
                      <div style={{ fontSize:11, fontWeight:500, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:4 }}>记忆线索</div>
                      <div style={{ fontSize:15, color:'var(--text-2)', lineHeight:1.6 }}>{currentCard.hint}</div>
                    </div>

                    <div style={{ marginBottom:22 }}>
                      <div style={{ fontSize:11, fontWeight:500, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:8 }}>关键词</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                        {currentCard.keys.map((k: string) => (
                          <span key={k} style={{ padding:'4px 12px', borderRadius:99, fontSize:13, background:CATEGORY_BG[currentCard.cat as Category], color:CATEGORY_COLORS[currentCard.cat as Category] }}>{k}</span>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setRevealed(!revealed)} style={{
                      width:'100%', padding:'12px', borderRadius:'var(--radius-md)', border:`1.5px solid ${revealed ? 'var(--border)' : CATEGORY_COLORS[currentCard.cat as Category]}`,
                      background: revealed ? 'var(--surface2)' : CATEGORY_BG[currentCard.cat as Category],
                      cursor:'pointer', fontSize:14, fontFamily:'DM Sans, sans-serif',
                      color: revealed ? 'var(--text-2)' : CATEGORY_COLORS[currentCard.cat as Category], fontWeight:500, transition:'all 0.2s',
                    }}>
                      {revealed ? '▲ 收起示范答案' : '▼ 显示示范答案'}
                    </button>

                    {revealed && (
                      <div style={{ marginTop:14, padding:'18px 20px', background:'#FAFAF8', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', animation:'fadeIn 0.2s ease' }}>
                        <div style={{ fontSize:11, fontWeight:500, color:'var(--text-3)', letterSpacing:'0.08em', marginBottom:8 }}>示范答案</div>
                        <p style={{ fontSize:15, lineHeight:1.9, color:'var(--text)', fontFamily:'DM Sans, sans-serif' }}>{highlightAnswer(currentCard.answer, currentCard.keys, CATEGORY_BG[currentCard.cat as Category], CATEGORY_COLORS[currentCard.cat as Category])}</p>
                        <div style={{ marginTop:10, fontSize:12, color:'var(--text-3)' }}>
                          {currentCard.answer.split(' ').length} words &nbsp;·&nbsp; 目标：50–70 words
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display:'flex', gap:10, marginTop:14 }}>
                  <button onClick={() => setCurrentIdx(Math.max(0, currentIdx-1))} disabled={currentIdx===0}
                    style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', background:'var(--surface)', cursor: currentIdx===0 ? 'not-allowed' : 'pointer', fontSize:14, fontFamily:'DM Sans, sans-serif', color:'var(--text-2)', opacity: currentIdx===0 ? 0.4 : 1 }}>
                    ← 上一题
                  </button>
                  <button onClick={() => setCurrentIdx(Math.min(displayCards.length-1, currentIdx+1))} disabled={currentIdx===displayCards.length-1}
                    style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1px solid var(--accent)', background:'var(--accent)', cursor: currentIdx===displayCards.length-1 ? 'not-allowed' : 'pointer', fontSize:14, fontFamily:'DM Sans, sans-serif', color:'#fff', opacity: currentIdx===displayCards.length-1 ? 0.5 : 1 }}>
                    下一题 →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TEMPLATE TAB ── */}
        {tab === 'template' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { title:'通用模板结构', rows:[
                ['开头句','This lecture mainly discussed [主题].'],
                ['第一部分','In the first part of the lecture, the speaker stated that [要点1].'],
                ['第二部分','In the second part of the lecture, the speaker stated that [要点2].'],
                ['最后部分','In the last / final part of the lecture, the speaker stated that [要点3].'],
              ]},
              { title:'"stated that" 的替换表达', rows:[
                ['强调','highlighted / emphasized / stressed / pointed out'],
                ['提及','mentioned / noted / indicated / suggested'],
                ['认为','argued / believed / concluded / claimed'],
              ]},
              { title:'段落衔接表达', rows:[
                ['第一点','Firstly, / First, / In the first part,'],
                ['第二点','After that, / Subsequently, / Moreover,'],
                ['最后','Finally, / In conclusion, / In the final part,'],
              ]},
              { title:'字数与评分', rows:[
                ['字数范围','50–70 words（低于50或高于70均扣分）'],
                ['示范均值','约 62 words'],
                ['四维评分','内容 + 形式 + 词汇 + 语法 各占 1/4'],
              ]},
            ].map((sec, i) => (
              <div key={i} style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ padding:'12px 22px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
                  <h3 style={{ fontFamily:'Fraunces, serif', fontSize:17, fontWeight:400 }}>{sec.title}</h3>
                </div>
                {sec.rows.map(([label, text], j) => (
                  <div key={j} style={{ display:'flex', gap:16, padding:'12px 22px', borderBottom: j<sec.rows.length-1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize:12, color:'var(--text-3)', minWidth:60, flexShrink:0, paddingTop:2 }}>{label}</span>
                    <span style={{ fontSize:15, color:'var(--text)', lineHeight:1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ background:'var(--accent-dark)', borderRadius:'var(--radius-lg)', padding:'22px 26px', color:'#fff' }}>
              <div style={{ fontSize:11, letterSpacing:'0.1em', opacity:0.5, marginBottom:12, fontWeight:500 }}>TEMPLATE · FILL IN THE BLANKS</div>
              <p style={{ fontSize:15, lineHeight:2.1, opacity:0.9 }}>
                This lecture mainly discussed <span style={{ borderBottom:'1.5px solid rgba(255,255,255,0.45)', paddingBottom:1 }}>___________</span>.<br/>
                In the first part, the speaker stated that <span style={{ borderBottom:'1.5px solid rgba(255,255,255,0.45)', paddingBottom:1 }}>___________</span>.<br/>
                In the second part, the speaker stated that <span style={{ borderBottom:'1.5px solid rgba(255,255,255,0.45)', paddingBottom:1 }}>___________</span>.<br/>
                In the last part, the speaker stated that <span style={{ borderBottom:'1.5px solid rgba(255,255,255,0.45)', paddingBottom:1 }}>___________</span>.
              </p>
            </div>
          </div>
        )}

        {/* ── LIST TAB ── */}
        {tab === 'list' && (
          <ListTab mastered={mastered} starred={starred} toggleMastered={toggleMastered} toggleStarred={toggleStarred} onGoTo={goToCard} />
        )}
      </main>

      <footer style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-3)', fontSize:13, borderTop:'1px solid var(--border)', marginTop:20 }}>
        飞凡英语 · SST 高频简化版 2026.3 &nbsp;·&nbsp; 61 道核心题目 &nbsp;·&nbsp; litianzeng.cn
      </footer>
    </div>
  )
}

function ListTab({ mastered, starred, toggleMastered, toggleStarred, onGoTo }: {
  mastered: Set<number>, starred: Set<number>,
  toggleMastered: (n:number)=>void, toggleStarred: (n:number)=>void, onGoTo: (n:number)=>void
}) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<Category | ''>('')

  const filtered = useMemo(() => cards.filter(c => {
    if (catFilter && c.cat !== catFilter) return false
    if (search) { const q=search.toLowerCase(); return c.title.toLowerCase().includes(q)||c.keys.join(' ').toLowerCase().includes(q) }
    return true
  }), [search, catFilter])

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索..."
          style={{ flex:'1 1 140px', padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif' }} />
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value as any)}
          style={{ padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'DM Sans, sans-serif', cursor:'pointer' }}>
          <option value="">全部分类</option>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(k=><option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
        </select>
      </div>
      <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:12 }}>
        显示 {filtered.length} 题 &nbsp;·&nbsp; 已掌握 {cards.filter(c=>mastered.has(c.n)).length} / {cards.length}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {filtered.map(c => (
          <div key={c.n} style={{ background:'var(--surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', padding:'12px 14px', display:'flex', alignItems:'center', gap:10, opacity: mastered.has(c.n) ? 0.5 : 1, transition:'opacity 0.2s' }}>
            <span style={{ fontSize:12, color:'var(--text-3)', minWidth:22, textAlign:'right', flexShrink:0 }}>{c.n}</span>
            <button onClick={() => onGoTo(c.n)} style={{ flex:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <div style={{ fontSize:15, color:'var(--text)', fontWeight:500, marginBottom:5 }}>{c.title}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:CATEGORY_BG[c.cat], color:CATEGORY_COLORS[c.cat] }}>{CATEGORY_LABELS[c.cat]}</span>
                {c.keys.slice(0,3).map(k=><span key={k} style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--tag-bg)', color:'var(--tag-text)' }}>{k}</span>)}
              </div>
            </button>
            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
              <button onClick={()=>toggleStarred(c.n)} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid var(--border)', background: starred.has(c.n)?'#FFF3CC':'transparent', cursor:'pointer', fontSize:13 }}>⭐</button>
              <button onClick={()=>toggleMastered(c.n)} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid var(--border)', background: mastered.has(c.n)?'var(--accent-light)':'transparent', cursor:'pointer', fontSize:13 }}>
                {mastered.has(c.n)?'✅':'⬜'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
