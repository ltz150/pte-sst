"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  List,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Shuffle,
  Square,
  Star,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import type { MutableRefObject, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { WfdDataset, WfdItem } from "@/lib/wfd/types";

type SpeechPart = {
  text: string;
  lang: "zh-CN" | "en-US";
};

type PlayerStatus = "idle" | "playing" | "paused";
type PlaybackKind = "audio" | "speech" | null;
type TtsMode = "premium" | "system";
type Tab = "practice" | "list" | "settings";
type FilterMode = "all" | "starred" | "unmastered";

const STORAGE_KEY = "pte-wfd-progress";

export function WfdPlayer({ dataset: initialDataset }: { dataset: WfdDataset }) {
  const [dataset, setDataset] = useState(initialDataset);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("practice");
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [randomMode, setRandomMode] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [chineseRepeats, setChineseRepeats] = useState(1);
  const [englishRepeats, setEnglishRepeats] = useState(3);
  const [rate, setRate] = useState(0.9);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [ttsMode, setTtsMode] = useState<TtsMode>("system");
  const [premiumAvailable, setPremiumAvailable] = useState<boolean | null>(null);
  const [ttsNotice, setTtsNotice] = useState("正在检测高清语音配置。");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { mastered, progress, starred, toggleMastered, toggleStarred } = useWfdProgress(
    dataset.items,
  );

  const stopRequestedRef = useRef(false);
  const runIdRef = useRef(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const releaseAudioRef = useRef<(() => void) | null>(null);
  const playbackKindRef = useRef<PlaybackKind>(null);
  const audioCacheRef = useRef(new Map<string, string>());

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return dataset.items.filter((item) => {
      if (filterMode === "starred" && !starred.has(item.id)) {
        return false;
      }

      if (filterMode === "unmastered" && mastered.has(item.id)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        item.english.toLowerCase().includes(keyword) ||
        item.chinese.toLowerCase().includes(keyword)
      );
    });
  }, [dataset.items, filterMode, mastered, query, starred]);

  const displayItems = useMemo(() => {
    if (!randomMode) {
      return filteredItems;
    }

    return shuffledOrder.map((index) => filteredItems[index]).filter(Boolean);
  }, [filteredItems, randomMode, shuffledOrder]);

  const safeCurrentIndex = Math.min(currentIndex, Math.max(0, displayItems.length - 1));
  const currentItem = displayItems[safeCurrentIndex] || displayItems[0];
  const selectedEnglishVoice = useMemo(() => selectVoice(voices, "en-US"), [voices]);
  const selectedChineseVoice = useMemo(() => selectVoice(voices, "zh-CN"), [voices]);
  const answerScore = useMemo(
    () => compareAnswer(answer, currentItem?.english || ""),
    [answer, currentItem?.english],
  );

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    const audioCache = audioCacheRef.current;

    return () => {
      for (const url of audioCache.values()) {
        URL.revokeObjectURL(url);
      }

      audioCache.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/tts", { cache: "no-store" });
        const ttsStatus = (await response.json()) as { premium?: boolean };

        if (cancelled) {
          return;
        }

        if (ttsStatus.premium) {
          setPremiumAvailable(true);
          setTtsMode("premium");
          setTtsNotice("AI 高清朗读已启用，将优先使用自然美音。");
        } else {
          setPremiumAvailable(false);
          setTtsMode("system");
          setTtsNotice("AI 高清朗读未配置，当前使用系统免费语音。");
        }
      } catch {
        if (!cancelled) {
          setPremiumAvailable(false);
          setTtsMode("system");
          setTtsNotice("无法检测高清语音配置，当前使用系统免费语音。");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsRefreshing(true);

      try {
        const response = await fetch("/api/wfd", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const nextDataset = (await response.json()) as WfdDataset;

        if (!cancelled && nextDataset.itemCount > 0) {
          setDataset(nextDataset);
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stop = useCallback(() => {
    runIdRef.current += 1;
    stopRequestedRef.current = true;
    releaseAudioRef.current?.();
    releaseAudioRef.current = null;
    activeAudioRef.current?.pause();
    activeAudioRef.current = null;
    playbackKindRef.current = null;
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }, []);

  const playFrom = useCallback(
    async (startIndex: number) => {
      if (ttsMode === "system" && !("speechSynthesis" in window)) {
        setTtsNotice("当前浏览器不支持系统朗读。");
        return;
      }

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      stopRequestedRef.current = false;
      activeAudioRef.current?.pause();
      releaseAudioRef.current = null;
      activeAudioRef.current = null;
      playbackKindRef.current = null;
      window.speechSynthesis?.cancel();
      setTtsNotice(
        ttsMode === "premium"
          ? "正在使用 AI 高清语音。"
          : "正在使用系统免费语音，声音质量取决于当前设备。",
      );

      let modeForRun = ttsMode;

      for (let index = startIndex; index < displayItems.length; index += 1) {
        const item = displayItems[index];
        setCurrentIndex(index);
        setRevealed(false);
        setAnswer("");
        setStatus("playing");

        const parts = createSpeechParts(item, chineseRepeats, englishRepeats);

        for (const part of parts) {
          if (stopRequestedRef.current || runIdRef.current !== runId) {
            return;
          }

          const result = await playSpeechPart(part, {
            activeAudioRef,
            audioCache: audioCacheRef.current,
            chineseVoice: selectedChineseVoice,
            englishVoice: selectedEnglishVoice,
            mode: modeForRun,
            playbackKindRef,
            rate,
            releaseAudioRef,
          });

          if (result.fellBackToSystem) {
            modeForRun = "system";
            setTtsMode("system");
            setTtsNotice(result.reason || "AI 高清语音暂不可用，已自动切换到系统免费语音。");
          }
        }

        if (!autoAdvance || index === displayItems.length - 1) {
          break;
        }

        await delay(350);
      }

      if (runIdRef.current === runId && !stopRequestedRef.current) {
        setStatus("idle");
      }
    },
    [
      autoAdvance,
      chineseRepeats,
      displayItems,
      englishRepeats,
      rate,
      selectedChineseVoice,
      selectedEnglishVoice,
      ttsMode,
    ],
  );

  const playCurrent = useCallback(() => {
    if (currentItem) {
      void playFrom(safeCurrentIndex);
    }
  }, [currentItem, playFrom, safeCurrentIndex]);

  const pauseOrResume = () => {
    if (status === "playing") {
      if (playbackKindRef.current === "audio" && activeAudioRef.current) {
        activeAudioRef.current.pause();
      } else {
        window.speechSynthesis?.pause();
      }

      setStatus("paused");
      return;
    }

    if (status === "paused") {
      if (playbackKindRef.current === "audio" && activeAudioRef.current) {
        void activeAudioRef.current.play();
      } else {
        window.speechSynthesis?.resume();
      }

      setStatus("playing");
    }
  };

  const moveBy = (offset: number) => {
    if (displayItems.length === 0) {
      return;
    }

    stop();
    setCurrentIndex((current) => clamp(current + offset, 0, displayItems.length - 1));
    setRevealed(false);
    setAnswer("");
  };

  const toggleRandom = () => {
    stop();

    if (!randomMode) {
      setShuffledOrder(shuffleIndexes(filteredItems.length));
      setCurrentIndex(0);
      setRevealed(false);
      setAnswer("");
    }

    setRandomMode((value) => !value);
  };

  const updateQuery = (value: string) => {
    stop();
    setQuery(value);
    setCurrentIndex(0);
    setRevealed(false);
    setAnswer("");
    setRandomMode(false);
  };

  const updateFilterMode = (value: FilterMode) => {
    stop();
    setFilterMode(value);
    setCurrentIndex(0);
    setRevealed(false);
    setAnswer("");
    setRandomMode(false);
  };

  const goToPracticeItem = (item: WfdItem) => {
    stop();
    setTab("practice");
    setQuery("");
    setFilterMode("all");
    setRandomMode(false);
    const nextIndex = dataset.items.findIndex((candidate) => candidate.id === item.id);
    setCurrentIndex(Math.max(0, nextIndex));
    setRevealed(false);
    setAnswer("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .wfd-card-hover { transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease; }
        .wfd-card-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 24px rgba(0,0,0,0.10) !important; }
      `}</style>

      <header
        style={{
          background: "rgba(255,255,255,0.84)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 16,
            height: 58,
            justifyContent: "space-between",
            margin: "0 auto",
            maxWidth: 960,
            padding: "0 20px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ alignItems: "baseline", display: "flex", gap: 9 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 400 }}>
                PTE WFD
              </span>
              <span style={{ color: "var(--text-3)", fontSize: 12 }}>高频预测</span>
            </div>
            <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 8, marginTop: 3 }}>
              <Link href="/" style={{ color: "var(--text-3)", fontSize: 12, textDecoration: "none" }}>
                SST
              </Link>
              <Link href="/we" style={{ color: "var(--text-3)", fontSize: 12, textDecoration: "none" }}>
                WE
              </Link>
              <span style={{ color: "var(--border-strong)", fontSize: 12 }}>|</span>
              <span
                style={{
                  color: "var(--text-3)",
                  fontSize: 12,
                  maxWidth: 440,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {isRefreshing ? "同步中" : dataset.sourceFileName || "等待同步"} ·{" "}
                {formatDateTime(dataset.updatedAt)}
              </span>
            </div>
          </div>

          <div style={{ alignItems: "center", display: "flex", gap: 12, flexShrink: 0 }}>
            <span style={{ color: "var(--text-2)", fontSize: 13 }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{progress}</span>
              <span style={{ color: "var(--text-3)" }}> / {dataset.itemCount}</span>
            </span>
            <div
              style={{
                background: "var(--surface2)",
                borderRadius: 2,
                height: 4,
                overflow: "hidden",
                width: 72,
              }}
            >
              <div
                style={{
                  background: "var(--accent)",
                  height: "100%",
                  transition: "width 0.35s ease",
                  width: `${dataset.itemCount ? (progress / dataset.itemCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div style={{ margin: "0 auto", maxWidth: 960, padding: "20px 20px 0" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            gap: 4,
            padding: 4,
            width: "fit-content",
          }}
        >
          <TabButton active={tab === "practice"} icon={<Volume2 size={15} />} onClick={() => setTab("practice")}>
            听写练习
          </TabButton>
          <TabButton active={tab === "list"} icon={<List size={15} />} onClick={() => setTab("list")}>
            句子列表
          </TabButton>
          <TabButton active={tab === "settings"} icon={<Settings2 size={15} />} onClick={() => setTab("settings")}>
            语音设置
          </TabButton>
        </div>
      </div>

      <main style={{ margin: "0 auto", maxWidth: 960, padding: 20 }}>
        {tab !== "settings" ? (
          <FilterBar
            filterMode={filterMode}
            query={query}
            randomMode={randomMode}
            setFilterMode={updateFilterMode}
            setQuery={updateQuery}
            toggleRandom={toggleRandom}
          />
        ) : null}

        {tab === "practice" ? (
          <PracticeView
            answer={answer}
            answerScore={answerScore}
            autoAdvance={autoAdvance}
            currentIndex={safeCurrentIndex}
            currentItem={currentItem}
            displayCount={displayItems.length}
            mastered={mastered}
            moveBy={moveBy}
            pauseOrResume={pauseOrResume}
            playCurrent={playCurrent}
            revealed={revealed}
            setAnswer={setAnswer}
            setRevealed={setRevealed}
            starred={starred}
            status={status}
            stop={stop}
            toggleMastered={toggleMastered}
            toggleStarred={toggleStarred}
            ttsMode={ttsMode}
          />
        ) : null}

        {tab === "list" ? (
          <ListView
            items={filteredItems}
            mastered={mastered}
            onGoTo={goToPracticeItem}
            starred={starred}
            toggleMastered={toggleMastered}
            toggleStarred={toggleStarred}
          />
        ) : null}

        {tab === "settings" ? (
          <SettingsView
            autoAdvance={autoAdvance}
            chineseRepeats={chineseRepeats}
            englishRepeats={englishRepeats}
            premiumAvailable={premiumAvailable}
            rate={rate}
            setAutoAdvance={setAutoAdvance}
            setChineseRepeats={setChineseRepeats}
            setEnglishRepeats={setEnglishRepeats}
            setRate={setRate}
            setTtsMode={setTtsMode}
            stop={stop}
            ttsMode={ttsMode}
            ttsNotice={ttsNotice}
            setTtsNotice={setTtsNotice}
          />
        ) : null}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--text-3)",
          fontSize: 13,
          marginTop: 20,
          padding: "34px 20px",
          textAlign: "center",
        }}
      >
        飞凡英语 · WFD 高频预测 · {dataset.itemCount} 句 · litianzeng.cn
      </footer>
    </div>
  );
}

function useWfdProgress(items: WfdItem[]) {
  const [loaded, setLoaded] = useState(false);
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          const data = JSON.parse(raw) as { mastered?: string[]; starred?: string[] };
          setMastered(new Set(data.mastered || []));
          setStarred(new Set(data.starred || []));
        }
      } catch {
        // Ignore corrupted local progress.
      } finally {
        setLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mastered: [...mastered],
        starred: [...starred],
      }),
    );
  }, [loaded, mastered, starred]);

  const toggleMastered = useCallback((id: string) => {
    setMastered((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleStarred = useCallback((id: string) => {
    setStarred((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const progress = useMemo(
    () => items.filter((item) => mastered.has(item.id)).length,
    [items, mastered],
  );

  return { mastered, progress, starred, toggleMastered, toggleStarred };
}

function PracticeView({
  answer,
  answerScore,
  currentIndex,
  currentItem,
  displayCount,
  mastered,
  moveBy,
  pauseOrResume,
  playCurrent,
  revealed,
  setAnswer,
  setRevealed,
  starred,
  status,
  stop,
  toggleMastered,
  toggleStarred,
  ttsMode,
}: {
  answer: string;
  answerScore: number;
  autoAdvance: boolean;
  currentIndex: number;
  currentItem?: WfdItem;
  displayCount: number;
  mastered: Set<string>;
  moveBy: (offset: number) => void;
  pauseOrResume: () => void;
  playCurrent: () => void;
  revealed: boolean;
  setAnswer: (value: string) => void;
  setRevealed: (value: boolean) => void;
  starred: Set<string>;
  status: PlayerStatus;
  stop: () => void;
  toggleMastered: (id: string) => void;
  toggleStarred: (id: string) => void;
  ttsMode: TtsMode;
}) {
  if (!currentItem) {
    return (
      <div style={{ color: "var(--text-3)", padding: "80px 20px", textAlign: "center" }}>
        <Search size={34} style={{ marginBottom: 14 }} />
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>没有符合条件的句子</div>
      </div>
    );
  }

  const isMastered = mastered.has(currentItem.id);
  const isStarred = starred.has(currentItem.id);

  return (
    <div style={{ animation: "fadeIn 0.22s ease" }}>
      <div style={{ alignItems: "center", display: "flex", gap: 12, marginBottom: 12 }}>
        <span style={{ color: "var(--text-3)", flexShrink: 0, fontSize: 13 }}>
          {currentIndex + 1} / {displayCount}
        </span>
        <div
          style={{
            background: "var(--surface2)",
            borderRadius: 2,
            flex: 1,
            height: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "var(--accent)",
              height: "100%",
              transition: "width 0.3s ease",
              width: `${displayCount ? ((currentIndex + 1) / displayCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ background: "var(--accent)", height: 4 }} />
        <div style={{ padding: "26px 28px 24px" }}>
          <div
            style={{
              alignItems: "flex-start",
              display: "flex",
              gap: 14,
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ alignItems: "center", display: "flex", gap: 8, marginBottom: 9 }}>
                <Badge color="var(--accent)" tone="green">
                  WFD
                </Badge>
                <span style={{ color: "var(--text-3)", fontSize: 12 }}>#{currentIndex + 1}</span>
                <Badge color={ttsMode === "premium" ? "#7C3AED" : "var(--text-3)"} tone="neutral">
                  {ttsMode === "premium" ? "AI 高清" : "系统语音"}
                </Badge>
              </div>
              <h1
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 30,
                  fontWeight: 400,
                  lineHeight: 1.16,
                }}
              >
                Write From Dictation
              </h1>
            </div>
            <div style={{ display: "flex", flexShrink: 0, gap: 8 }}>
              <RoundAction
                active={isStarred}
                label={isStarred ? "取消收藏" : "收藏"}
                onClick={() => toggleStarred(currentItem.id)}
              >
                <Star size={17} fill={isStarred ? "currentColor" : "none"} />
              </RoundAction>
              <RoundAction
                active={isMastered}
                label={isMastered ? "取消已掌握" : "标记已掌握"}
                onClick={() => toggleMastered(currentItem.id)}
              >
                <Check size={18} />
              </RoundAction>
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background: "var(--surface2)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 18,
              padding: 10,
            }}
          >
            <IconButton label="上一句" onClick={() => moveBy(-1)} disabled={currentIndex === 0}>
              <ChevronLeft size={18} />
            </IconButton>
            {status === "playing" || status === "paused" ? (
              <PrimaryButton onClick={pauseOrResume}>
                {status === "playing" ? <Pause size={17} /> : <Play size={17} />}
                {status === "playing" ? "暂停" : "继续"}
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={playCurrent}>
                <Play size={17} />
                朗读
              </PrimaryButton>
            )}
            <IconButton label="停止" onClick={stop} disabled={status === "idle"}>
              <Square size={16} />
            </IconButton>
            <IconButton
              label="下一句"
              onClick={() => moveBy(1)}
              disabled={currentIndex >= displayCount - 1}
            >
              <ChevronRight size={18} />
            </IconButton>
            <IconButton label="重播" onClick={playCurrent}>
              <RotateCcw size={17} />
            </IconButton>
          </div>

          {currentItem.chinese ? (
            <div
              style={{
                background: "#FAFAF8",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "var(--radius-md)",
                marginBottom: 18,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  marginBottom: 5,
                }}
              >
                中文提示
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7 }}>
                {currentItem.chinese}
              </div>
            </div>
          ) : null}

          <label style={{ display: "block", marginBottom: 14 }}>
            <span
              style={{
                color: "var(--text-3)",
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              听写输入
            </span>
            <textarea
              suppressHydrationWarning
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="听完后在这里输入英文句子"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontSize: 16,
                lineHeight: 1.7,
                minHeight: 112,
                padding: "14px 16px",
                resize: "vertical",
                width: "100%",
              }}
            />
          </label>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ color: "var(--text-3)", fontSize: 13 }}>
              匹配度{" "}
              <strong style={{ color: scoreColor(answerScore), fontWeight: 600 }}>
                {answer.trim() ? `${answerScore}%` : "待输入"}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setRevealed(!revealed)}
              style={{
                alignItems: "center",
                background: revealed ? "var(--surface2)" : "var(--accent-light)",
                border: `1px solid ${revealed ? "var(--border)" : "rgba(45,106,79,0.22)"}`,
                borderRadius: "var(--radius-md)",
                color: revealed ? "var(--text-2)" : "var(--accent)",
                cursor: "pointer",
                display: "inline-flex",
                fontSize: 14,
                fontWeight: 600,
                gap: 8,
                padding: "9px 14px",
              }}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
              {revealed ? "隐藏原文" : "显示原文"}
            </button>
          </div>

          {revealed ? (
            <div
              style={{
                animation: "fadeIn 0.2s ease",
                background: "var(--accent-dark)",
                borderRadius: "var(--radius-md)",
                color: "#fff",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                  opacity: 0.55,
                }}
              >
                英文原文
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.75 }}>{currentItem.english}</p>
              <div style={{ fontSize: 12, marginTop: 10, opacity: 0.55 }}>
                {currentItem.english.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ListView({
  items,
  mastered,
  onGoTo,
  starred,
  toggleMastered,
  toggleStarred,
}: {
  items: WfdItem[];
  mastered: Set<string>;
  onGoTo: (item: WfdItem) => void;
  starred: Set<string>;
  toggleMastered: (id: string) => void;
  toggleStarred: (id: string) => void;
}) {
  return (
    <div style={{ animation: "fadeIn 0.22s ease" }}>
      <div style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 12 }}>
        显示 {items.length} 句
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, index) => {
          const isMastered = mastered.has(item.id);
          const isStarred = starred.has(item.id);

          return (
            <div
              className="wfd-card-hover"
              key={item.id}
              style={{
                alignItems: "center",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow)",
                display: "flex",
                gap: 12,
                opacity: isMastered ? 0.56 : 1,
                padding: "13px 14px",
              }}
            >
              <span
                style={{
                  color: "var(--text-3)",
                  flexShrink: 0,
                  fontSize: 12,
                  textAlign: "right",
                  width: 28,
                }}
              >
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onGoTo(item)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  flex: 1,
                  minWidth: 0,
                  padding: 0,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    color: "var(--text)",
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.45,
                    marginBottom: 5,
                  }}
                >
                  {item.english}
                </div>
                {item.chinese ? (
                  <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>
                    {item.chinese}
                  </div>
                ) : null}
              </button>
              <div style={{ display: "flex", flexShrink: 0, gap: 5 }}>
                <SmallRoundAction
                  active={isStarred}
                  label={isStarred ? "取消收藏" : "收藏"}
                  onClick={() => toggleStarred(item.id)}
                >
                  <Star size={14} fill={isStarred ? "currentColor" : "none"} />
                </SmallRoundAction>
                <SmallRoundAction
                  active={isMastered}
                  label={isMastered ? "取消已掌握" : "标记已掌握"}
                  onClick={() => toggleMastered(item.id)}
                >
                  <Check size={15} />
                </SmallRoundAction>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsView({
  autoAdvance,
  chineseRepeats,
  englishRepeats,
  premiumAvailable,
  rate,
  setAutoAdvance,
  setChineseRepeats,
  setEnglishRepeats,
  setRate,
  setTtsMode,
  setTtsNotice,
  stop,
  ttsMode,
  ttsNotice,
}: {
  autoAdvance: boolean;
  chineseRepeats: number;
  englishRepeats: number;
  premiumAvailable: boolean | null;
  rate: number;
  setAutoAdvance: (value: boolean) => void;
  setChineseRepeats: (value: number) => void;
  setEnglishRepeats: (value: number) => void;
  setRate: (value: number) => void;
  setTtsMode: (value: TtsMode) => void;
  setTtsNotice: (value: string) => void;
  stop: () => void;
  ttsMode: TtsMode;
  ttsNotice: string;
}) {
  return (
    <div style={{ animation: "fadeIn 0.22s ease", display: "flex", flexDirection: "column", gap: 14 }}>
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "var(--surface2)",
            borderBottom: "1px solid var(--border)",
            padding: "13px 22px",
          }}
        >
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 400 }}>
            朗读品质
          </h2>
        </div>
        <div style={{ padding: 22 }}>
          <div
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              gap: 4,
              padding: 4,
              width: "fit-content",
            }}
          >
            <button
              type="button"
              disabled={premiumAvailable === false}
              onClick={() => {
                if (premiumAvailable === false) {
                  return;
                }

                stop();
                setTtsMode("premium");
                setTtsNotice("AI 高清朗读会优先使用自然美音，失败时自动兜底。");
              }}
              style={{
                background: ttsMode === "premium" ? "var(--accent)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color:
                  premiumAvailable === false
                    ? "var(--text-3)"
                    : ttsMode === "premium"
                      ? "#fff"
                      : "var(--text-2)",
                cursor: premiumAvailable === false ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: ttsMode === "premium" ? 600 : 400,
                padding: "8px 16px",
              }}
            >
              AI 高清
            </button>
            <button
              type="button"
              onClick={() => {
                stop();
                setTtsMode("system");
                setTtsNotice("正在使用系统免费语音，声音质量取决于当前设备。");
              }}
              style={{
                background: ttsMode === "system" ? "var(--accent)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: ttsMode === "system" ? "#fff" : "var(--text-2)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: ttsMode === "system" ? 600 : 400,
                padding: "8px 16px",
              }}
            >
              系统免费
            </button>
          </div>
          <p style={{ color: "var(--text-3)", fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>
            {ttsNotice}
          </p>
        </div>
      </section>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "var(--surface2)",
            borderBottom: "1px solid var(--border)",
            padding: "13px 22px",
          }}
        >
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 400 }}>
            播放方式
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 22 }}>
          <NumberStepper label="中文重复" max={10} min={0} onChange={setChineseRepeats} value={chineseRepeats} />
          <NumberStepper label="英文重复" max={10} min={1} onChange={setEnglishRepeats} value={englishRepeats} />
          <label style={{ display: "block" }}>
            <span style={{ color: "var(--text-3)", display: "block", fontSize: 13, marginBottom: 10 }}>
              语速 {rate.toFixed(2)}x
            </span>
            <input
              suppressHydrationWarning
              max={1.2}
              min={0.6}
              onChange={(event) => setRate(Number(event.target.value))}
              step={0.05}
              type="range"
              value={rate}
              style={{ accentColor: "var(--accent)", width: "100%" }}
            />
          </label>
          <label
            style={{
              alignItems: "center",
              background: "var(--surface2)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
            }}
          >
            <span style={{ color: "var(--text-2)", fontSize: 14, fontWeight: 600 }}>自动下一句</span>
            <input
              suppressHydrationWarning
              checked={autoAdvance}
              onChange={(event) => setAutoAdvance(event.target.checked)}
              style={{ accentColor: "var(--accent)", height: 18, width: 18 }}
              type="checkbox"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

function FilterBar({
  filterMode,
  query,
  randomMode,
  setFilterMode,
  setQuery,
  toggleRandom,
}: {
  filterMode: FilterMode;
  query: string;
  randomMode: boolean;
  setFilterMode: (value: FilterMode) => void;
  setQuery: (value: string) => void;
  toggleRandom: () => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      <label
        style={{
          alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          flex: "1 1 180px",
          gap: 8,
          minWidth: 160,
          padding: "8px 12px",
        }}
      >
        <Search size={16} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <input
          suppressHydrationWarning
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索英文或中文..."
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text)",
            fontSize: 14,
            minWidth: 0,
            outline: "none",
            width: "100%",
          }}
          value={query}
        />
      </label>
      <select
        suppressHydrationWarning
        onChange={(event) => setFilterMode(event.target.value as FilterMode)}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text)",
          cursor: "pointer",
          fontSize: 14,
          padding: "8px 12px",
        }}
        value={filterMode}
      >
        <option value="all">全部</option>
        <option value="starred">收藏</option>
        <option value="unmastered">未掌握</option>
      </select>
      <button
        onClick={toggleRandom}
        style={{
          alignItems: "center",
          background: randomMode ? "var(--accent)" : "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          color: randomMode ? "#fff" : "var(--text-2)",
          cursor: "pointer",
          display: "inline-flex",
          fontSize: 14,
          gap: 7,
          padding: "8px 13px",
        }}
        type="button"
      >
        <Shuffle size={15} />
        随机
      </button>
    </div>
  );
}

function TabButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        alignItems: "center",
        background: active ? "var(--accent)" : "transparent",
        border: "none",
        borderRadius: "var(--radius-sm)",
        color: active ? "#fff" : "var(--text-2)",
        cursor: "pointer",
        display: "inline-flex",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        gap: 7,
        padding: "8px 14px",
        transition: "all 0.15s ease",
      }}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

function Badge({ children, color, tone }: { children: ReactNode; color: string; tone: "green" | "neutral" }) {
  return (
    <span
      style={{
        background: tone === "green" ? "var(--accent-light)" : "var(--tag-bg)",
        borderRadius: 99,
        color,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
      }}
    >
      {children}
    </span>
  );
}

function IconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        alignItems: "center",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        color: "var(--text)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        height: 38,
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
        width: 38,
      }}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        alignItems: "center",
        background: "var(--accent)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius-md)",
        color: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        fontSize: 14,
        fontWeight: 600,
        gap: 8,
        minHeight: 38,
        padding: "8px 16px",
      }}
      type="button"
    >
      {children}
    </button>
  );
}

function RoundAction({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        alignItems: "center",
        background: active ? "var(--accent-light)" : "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        color: active ? "var(--accent)" : "var(--text-2)",
        cursor: "pointer",
        display: "inline-flex",
        height: 36,
        justifyContent: "center",
        width: 36,
      }}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function SmallRoundAction({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        alignItems: "center",
        background: active ? "var(--accent-light)" : "transparent",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        color: active ? "var(--accent)" : "var(--text-2)",
        cursor: "pointer",
        display: "inline-flex",
        height: 30,
        justifyContent: "center",
        width: 30,
      }}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function NumberStepper({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ color: "var(--text-2)", fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div
        style={{
          alignItems: "center",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          gap: 6,
          padding: 4,
        }}
      >
        <button
          aria-label={`${label}减少`}
          onClick={() => onChange(clamp(value - 1, min, max))}
          style={stepperButtonStyle}
          type="button"
        >
          <Minus size={14} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, minWidth: 28, textAlign: "center" }}>{value}</span>
        <button
          aria-label={`${label}增加`}
          onClick={() => onChange(clamp(value + 1, min, max))}
          style={stepperButtonStyle}
          type="button"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

const stepperButtonStyle = {
  alignItems: "center",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "50%",
  color: "var(--text)",
  cursor: "pointer",
  display: "inline-flex",
  height: 28,
  justifyContent: "center",
  width: 28,
};

function createSpeechParts(item: WfdItem, chineseRepeats: number, englishRepeats: number) {
  const parts: SpeechPart[] = [];

  for (let index = 0; index < chineseRepeats; index += 1) {
    if (item.chinese) {
      parts.push({ text: item.chinese, lang: "zh-CN" });
    }
  }

  for (let index = 0; index < englishRepeats; index += 1) {
    parts.push({ text: item.english, lang: "en-US" });
  }

  return parts;
}

async function playSpeechPart(
  part: SpeechPart,
  {
    activeAudioRef,
    audioCache,
    chineseVoice,
    englishVoice,
    mode,
    playbackKindRef,
    rate,
    releaseAudioRef,
  }: {
    activeAudioRef: MutableRefObject<HTMLAudioElement | null>;
    audioCache: Map<string, string>;
    chineseVoice?: SpeechSynthesisVoice;
    englishVoice?: SpeechSynthesisVoice;
    releaseAudioRef: MutableRefObject<(() => void) | null>;
    mode: TtsMode;
    playbackKindRef: MutableRefObject<PlaybackKind>;
    rate: number;
  },
) {
  if (mode === "premium") {
    try {
      await playPremiumPart(part, {
        activeAudioRef,
        audioCache,
        playbackKindRef,
        rate,
        releaseAudioRef,
      });

      return { fellBackToSystem: false };
    } catch (error) {
      await speakSystemPart(part, {
        chineseVoice,
        englishVoice,
        playbackKindRef,
        rate,
      });

      return {
        fellBackToSystem: true,
        reason:
          error instanceof Error
            ? error.message
            : "AI 高清语音暂不可用，已自动切换到系统免费语音。",
      };
    }
  }

  await speakSystemPart(part, {
    chineseVoice,
    englishVoice,
    playbackKindRef,
    rate,
  });

  return { fellBackToSystem: false };
}

async function playPremiumPart(
  part: SpeechPart,
  {
    activeAudioRef,
    audioCache,
    playbackKindRef,
    releaseAudioRef,
    rate,
  }: {
    activeAudioRef: MutableRefObject<HTMLAudioElement | null>;
    audioCache: Map<string, string>;
    playbackKindRef: MutableRefObject<PlaybackKind>;
    releaseAudioRef: MutableRefObject<(() => void) | null>;
    rate: number;
  },
) {
  const url = await getPremiumAudioUrl(part, rate, audioCache);

  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    let settled = false;
    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      audio.onended = null;
      audio.onerror = null;
      releaseAudioRef.current = null;
      activeAudioRef.current = null;
      callback();
    };

    activeAudioRef.current = audio;
    releaseAudioRef.current = () => {
      audio.pause();
      settle(resolve);
    };
    playbackKindRef.current = "audio";
    audio.onended = () => settle(resolve);
    audio.onerror = () => settle(() => reject(new Error("Audio playback failed.")));
    audio.playbackRate = 1;
    void audio.play().catch(reject);
  });
}

async function getPremiumAudioUrl(part: SpeechPart, rate: number, audioCache: Map<string, string>) {
  const cacheKey = `${part.lang}:${rate.toFixed(2)}:${part.text}`;
  const cached = audioCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const response = await fetch("/api/tts", {
    body: JSON.stringify({
      lang: part.lang,
      rate,
      text: part.text,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok || !response.headers.get("content-type")?.includes("audio")) {
    throw new Error(await getPremiumAudioErrorMessage(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);

  return url;
}

async function getPremiumAudioErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      code?: string | null;
      detail?: string;
      error?: string;
      message?: string | null;
      provider?: string;
    };

    if (payload.code === "insufficient_quota" || payload.detail?.includes("insufficient_quota")) {
      return "OpenAI API 额度不足，已自动切换到系统免费语音。充值 API 额度后会自动恢复 AI 高清朗读。";
    }

    if (
      payload.provider === "minimax" &&
      (payload.code === "2049" || payload.message?.toLowerCase().includes("invalid api key"))
    ) {
      return "MiniMax API key 无效或不适用于 TTS，已自动切换到系统免费语音。请在 MiniMax API Platform 创建可用于 Speech/TTS 的密钥。";
    }

    if (payload.error === "Premium TTS is temporarily rate limited.") {
      return "AI 高清语音请求过于频繁，已自动切换到系统免费语音。稍后可再试。";
    }
  } catch {
    // Fall through to the generic message below.
  }

  return "AI 高清语音暂不可用，已自动切换到系统免费语音。";
}

function speakSystemPart(
  part: SpeechPart,
  {
    chineseVoice,
    englishVoice,
    playbackKindRef,
    rate,
  }: {
    chineseVoice?: SpeechSynthesisVoice;
    englishVoice?: SpeechSynthesisVoice;
    playbackKindRef: MutableRefObject<PlaybackKind>;
    rate: number;
  },
) {
  return new Promise<void>((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(part.text);
    utterance.lang = part.lang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.voice = part.lang === "en-US" ? englishVoice || null : chineseVoice || null;
    playbackKindRef.current = "speech";
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function selectVoice(voices: SpeechSynthesisVoice[], lang: "en-US" | "zh-CN") {
  const exact = voices.filter((voice) => voice.lang === lang);

  if (lang === "en-US") {
    return (
      exact.find((voice) =>
        /samantha|alex|google us english|microsoft (aria|jenny|guy)/i.test(voice.name),
      ) ||
      exact[0] ||
      voices.find((voice) => voice.lang.startsWith("en"))
    );
  }

  return exact[0] || voices.find((voice) => voice.lang.startsWith("zh"));
}

function compareAnswer(input: string, target: string) {
  const inputWords = normalizeForCompare(input).split(" ").filter(Boolean);
  const targetWords = normalizeForCompare(target).split(" ").filter(Boolean);

  if (!inputWords.length || !targetWords.length) {
    return 0;
  }

  let matches = 0;

  for (let index = 0; index < targetWords.length; index += 1) {
    if (inputWords[index] === targetWords[index]) {
      matches += 1;
    }
  }

  return Math.round((matches / targetWords.length) * 100);
}

function normalizeForCompare(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreColor(score: number) {
  if (score >= 85) {
    return "var(--accent)";
  }

  if (score >= 60) {
    return "#9A5C16";
  }

  return "#9A3A32";
}

function shuffleIndexes(length: number) {
  const indexes = Array.from({ length }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function formatDateTime(value: string) {
  if (!value) {
    return "尚未同步";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}
