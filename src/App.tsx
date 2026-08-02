import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Flower2,
  Github,
  Moon,
  PenLine,
  Plus,
  Sparkles,
} from "lucide-react";
import type { DreamEntry, MonthChapter } from "./types";
import { dreamSymbols, symbolById } from "./data/dreamSymbols";
import { sceneAssetForDream, sceneAssetForMonth } from "./data/sceneAssets";
import { createDreamEntry } from "./lib/dreamAnalysis";
import { groupDreamsByMonth } from "./lib/monthGrouping";
import { loadDreams, saveDreams } from "./lib/localStorage";
import LiquidEther from "./components/LiquidEther";
import { StarryTunnelTransition } from "./components/StarryTunnelTransition";

type View =
  | { name: "landing" }
  | { name: "archive" }
  | { name: "chapter"; monthKey: string }
  | { name: "dream"; dreamId: string }
  | { name: "new" }
  | { name: "story" };

const moods = ["safe", "curious", "tender", "anxious", "hopeful", "quiet", "wistful", "brave"];
const liquidEtherColors = ["#9bbaec", "#bba3ba", "#e2d8ea"];
const archiveRevealDelay = 1250;
const entryTransitionDuration = 2300;
const weaveGithubUrl = "https://github.com/jiexiY/Weave";

function asLocalDreamDate(date: string) {
  return new Date(date.includes("T") ? date : `${date}T12:00:00`);
}

function currentLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function App() {
  const [dreams, setDreams] = useState<DreamEntry[]>(() => loadDreams());
  const [view, setView] = useState<View>({ name: "landing" });
  const [isEntering, setIsEntering] = useState(false);
  const [showInitialVeil, setShowInitialVeil] = useState(true);
  const chapters = useMemo(() => groupDreamsByMonth(dreams), [dreams]);

  useEffect(() => {
    saveDreams(dreams);
  }, [dreams]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialVeil(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isEntering) return;

    const revealTimer = window.setTimeout(() => {
      setView({ name: "archive" });
    }, archiveRevealDelay);
    const completeTimer = window.setTimeout(() => {
      setIsEntering(false);
    }, entryTransitionDuration);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isEntering]);

  const selectedChapter =
    view.name === "chapter" ? chapters.find((chapter) => chapter.monthKey === view.monthKey) : undefined;
  const selectedDream = view.name === "dream" ? dreams.find((dream) => dream.id === view.dreamId) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  function addDream(dream: DreamEntry) {
    setDreams((current) => [dream, ...current]);
    setView({ name: "archive" });
  }

  function enterArchive() {
    if (isEntering) return;
    setIsEntering(true);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-midnight text-pearl">
      {view.name === "landing" || view.name === "archive" ? (
        <LiquidEtherBackground variant={view.name} />
      ) : (
        <DreamMistBackground />
      )}
      {!isEntering && <CustomWeaveCursor />}
      {showInitialVeil && <InitialMistVeil />}
      {view.name !== "landing" && view.name !== "archive" && (
        <AppNav
          onArchive={() => setView({ name: "archive" })}
          onNew={() => setView({ name: "new" })}
          onStory={() => setView({ name: "story" })}
        />
      )}

      {view.name === "landing" && <LandingPage onEnter={enterArchive} />}
      {isEntering && <EntryTransition />}
      {view.name === "archive" && (
        <DreamArchiveHome
          dreams={dreams}
          onOpenDream={(dreamId) => setView({ name: "dream", dreamId })}
          onNew={() => setView({ name: "new" })}
          onBack={() => setView({ name: "landing" })}
        />
      )}
      {view.name === "chapter" && selectedChapter && (
        <MonthChapterPage
          chapter={selectedChapter}
          onOpenDream={(dreamId) => setView({ name: "dream", dreamId })}
          onNew={() => setView({ name: "new" })}
        />
      )}
      {view.name === "dream" && selectedDream && (
        <DreamDetailPage dream={selectedDream} onBack={() => setView({ name: "archive" })} />
      )}
      {view.name === "new" && <NewDreamEntryPage onBack={() => setView({ name: "archive" })} onSave={addDream} />}
      {view.name === "story" && <ArchiveStoryView chapters={chapters} onBack={() => setView({ name: "archive" })} />}

      {view.name !== "landing" && view.name !== "archive" && (
        <button
          className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-thread/35 bg-pearl text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-thread"
          type="button"
          aria-label="New dream"
          data-cursor="Open"
          onClick={() => setView({ name: "new" })}
        >
          <Plus size={20} />
        </button>
      )}

    </div>
  );
}

function InitialMistVeil() {
  return (
    <motion.div
      className="initial-mist-veil fixed inset-0 z-[90]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

function LiquidEtherBackground({ variant }: { variant: "landing" | "archive" }) {
  return (
    <div className={`liquid-ether-backdrop liquid-ether-backdrop-${variant}`} aria-hidden="true">
      <div className="threaded-horizon-image" />
      <div className="liquid-ether-field">
        <LiquidEther
          mouseForce={20}
          cursorSize={110}
          isViscous={false}
          viscous={30}
          colors={liquidEtherColors}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce
          resolution={0.5}
        />
      </div>
    </div>
  );
}

function GithubProjectLink({ className }: { className: string }) {
  return (
    <a
      className={`github-project-link ${className}`}
      href={weaveGithubUrl}
      aria-label="Open the Weave project on GitHub"
      title="Open Weave on GitHub"
      data-cursor="Open"
    >
      <Github size={19} strokeWidth={1.5} />
    </a>
  );
}

function AppNav({
  onArchive,
  onNew,
  onStory,
}: {
  onArchive: () => void;
  onNew: () => void;
  onStory: () => void;
}) {
  return (
    <header className="weave-header">
      <button
        className="weave-header-round"
        type="button"
        aria-label="Back to dream archive"
        title="Back to dream archive"
        onClick={onArchive}
        data-cursor="Back"
      >
        <ArrowLeft size={17} strokeWidth={1.5} />
      </button>
      <button className="weave-header-brand" type="button" onClick={onArchive} data-cursor="Open">
        <Flower2 size={17} strokeWidth={1.2} />
        <span>Weave</span>
      </button>
      <nav className="weave-header-actions" aria-label="Dream archive actions">
        <button className="weave-header-link" type="button" onClick={onStory} data-cursor="Read">
          Story
        </button>
        <button className="weave-header-pill" type="button" onClick={onNew} data-cursor="Open">
          <PenLine size={14} strokeWidth={1.5} />
          <span className="weave-action-label">Write Dream</span>
        </button>
      </nav>
    </header>
  );
}

function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="relative min-h-screen">
      <GithubProjectLink className="landing-github-link" />
      <section className="landing-stage relative flex min-h-screen items-center justify-center px-6 py-20 text-center">
        <motion.div
          className="relative z-10 mx-auto flex max-w-5xl flex-col items-center"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.35, ease: "easeOut" }}
        >
          <div className="landing-sigil" aria-hidden="true">
            <Flower2 size={24} strokeWidth={1.1} />
          </div>
          <motion.div
            className="landing-wordmark-reveal"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.65, delay: 0.28, ease: "easeOut" }}
          >
            <motion.h1
              className="landing-wordmark"
              initial={{ filter: "blur(14px)", opacity: 0.35, x: -12 }}
              animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
              transition={{ duration: 1.45, delay: 0.32, ease: "easeOut" }}
            >
              Weave
            </motion.h1>
          </motion.div>
          <InkRevealText className="landing-tagline">
            A safe place to collect dreams and reconnect with your inner self.
          </InkRevealText>
          <button
            className="landing-cta"
            type="button"
            data-cursor="Enter"
            onClick={onEnter}
          >
            Enter Weave
            <Sparkles size={16} />
          </button>
        </motion.div>
        <div className="landing-footnote">
          Private archive of the inner world
        </div>
      </section>
    </main>
  );
}

function EntryTransition() {
  return (
    <motion.div
      className="entry-transition fixed inset-0 z-[80] overflow-hidden bg-midnight"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.2, times: [0, 0.08, 0.76, 1], ease: "easeInOut" }}
      aria-hidden="true"
    >
      <StarryTunnelTransition />
      <motion.div
        className="entry-transition-flash"
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{ opacity: [0, 0, 0.78, 0], scale: [0.25, 0.8, 1.8, 3.2] }}
        transition={{ duration: 1.8, times: [0, 0.42, 0.62, 1], ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function DreamArchiveHome({
  dreams,
  onOpenDream,
  onNew,
  onBack,
}: {
  dreams: DreamEntry[];
  onOpenDream: (dreamId: string) => void;
  onNew: () => void;
  onBack: () => void;
}) {
  return (
    <main className="archive-world archive-chapter-screen relative z-10 h-screen overflow-hidden" data-cursor="Drag">
      <span className="archive-frame" aria-hidden="true" />
      <GithubProjectLink className="archive-github-link" />
      <button
        className="archive-back-control"
        type="button"
        aria-label="Back to landing page"
        title="Back to landing page"
        data-cursor="Back"
        onClick={onBack}
      >
        <ArrowLeft size={19} strokeWidth={1.5} />
      </button>
      <button
        className="archive-write-button"
        type="button"
        aria-label="Write dream"
        title="Write dream"
        onClick={onNew}
        data-cursor="Open"
      >
        <PenLine size={16} strokeWidth={1.5} />
        <span className="weave-action-label">Write Dream</span>
      </button>
      <div className="archive-brand" aria-label="Weave dream archive">
        <Flower2 size={16} strokeWidth={1.1} />
        <span>Weave</span>
      </div>
      <section className="archive-composition">
        {dreams.length ? (
          <DreamArchiveCarousel
            dreams={dreams}
            onOpenDream={onOpenDream}
            onNew={onNew}
          />
        ) : (
          <EmptyArchiveState onNew={onNew} />
        )}
      </section>
    </main>
  );
}

function EmptyArchiveState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      className="empty-archive-state"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="empty-archive-mark" aria-hidden="true">
        <Flower2 size={21} strokeWidth={1.15} />
      </div>
      <p className="empty-archive-kicker">Your first chapter is waiting</p>
      <h1>No dreams woven yet</h1>
      <p className="empty-archive-copy">Your archive will begin when you save your first dream.</p>
      <button className="empty-archive-action" type="button" onClick={onNew} data-cursor="Open">
        <PenLine size={15} />
        Write First Dream
      </button>
    </motion.div>
  );
}

function DreamArchiveCarousel({
  dreams,
  onOpenDream,
  onNew,
}: {
  dreams: DreamEntry[];
  onOpenDream: (dreamId: string) => void;
  onNew: () => void;
}) {
  const orderedDreams = useMemo(
    () => [...dreams].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)),
    [dreams],
  );
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, orderedDreams.length - 1));
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scrollFrame = useRef<number | null>(null);
  const scrollUnlockTimer = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);
  const dragState = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });
  const suppressClick = useRef(false);
  const activeDream = orderedDreams[activeIndex] ?? orderedDreams[orderedDreams.length - 1];
  const archiveYear = activeDream?.date.slice(0, 4) ?? new Date().getFullYear().toString();

  function scrollToDream(index: number, behavior: ScrollBehavior = "smooth") {
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) return;
    isProgrammaticScroll.current = true;
    if (scrollUnlockTimer.current !== null) window.clearTimeout(scrollUnlockTimer.current);
    rail.scrollTo({
      left: Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2),
      behavior,
    });
    setActiveIndex(index);
    scrollUnlockTimer.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, behavior === "smooth" ? 850 : 0);
  }

  useEffect(() => {
    const latestIndex = Math.max(0, orderedDreams.length - 1);
    const frame = window.requestAnimationFrame(() => scrollToDream(latestIndex, "auto"));
    return () => window.cancelAnimationFrame(frame);
  }, [orderedDreams.length]);

  function trackActiveCard() {
    if (isProgrammaticScroll.current) return;
    if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail) return;
      const railRect = rail.getBoundingClientRect();
      const target = railRect.left + railRect.width / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - target);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActiveIndex(nearestIndex);
    });
  }

  useEffect(() => {
    return () => {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
      if (scrollUnlockTimer.current !== null) window.clearTimeout(scrollUnlockTimer.current);
    };
  }, []);

  function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || !railRef.current) return;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: railRef.current.scrollLeft,
      moved: false,
    };
    railRef.current.setPointerCapture(event.pointerId);
  }

  function continueDrag(event: React.PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || !dragState.current.active) return;
    const distance = event.clientX - dragState.current.startX;
    if (Math.abs(distance) > 6) dragState.current.moved = true;
    rail.scrollLeft = dragState.current.startScrollLeft - distance;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    if (!rail || !dragState.current.active) return;
    dragState.current.active = false;
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (dragState.current.moved) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 80);
    }
  }

  return (
    <div className="threaded-archive" data-cursor="Drag">
      <p className="chapter-deck-kicker">
        {archiveYear} Dream Archive <span aria-hidden="true">/</span> {orderedDreams.length} saved
      </p>

      <div
        className="chapter-stage blue-layout-stage"
        ref={railRef}
        onScroll={trackActiveCard}
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY;
          }
        }}
        data-cursor="Drag"
        tabIndex={0}
        aria-label="Saved dream cards. Scroll, drag, or swipe to explore."
      >
        <div className="chapter-rail blue-layout-rail">
          {orderedDreams.map((dream, index) => (
            <DreamArchiveCard
              key={dream.id}
              buttonRef={(node) => {
                cardRefs.current[index] = node;
              }}
              dream={dream}
              index={index}
              active={index === activeIndex}
              onSelect={() => {
                if (suppressClick.current) return;
                if (index === activeIndex) onOpenDream(dream.id);
                else scrollToDream(index);
              }}
            />
          ))}
          <motion.button
            className="blue-chapter-card dream-add-card"
            type="button"
            onClick={() => {
              if (!suppressClick.current) onNew();
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 0.9, y: 0, scale: 0.86 }}
            transition={{ duration: 0.7, delay: Math.min(orderedDreams.length * 0.06, 0.3), ease: "easeOut" }}
            whileHover={{ y: -8, opacity: 1 }}
            data-cursor="Open"
            aria-label="Write another dream"
          >
            <span className="dream-add-card-mark" aria-hidden="true">
              <Plus size={25} strokeWidth={1.2} />
            </span>
            <span className="dream-add-card-kicker">Continue the archive</span>
            <span className="dream-add-card-title">Weave another dream</span>
            <span className="dream-add-card-copy">A new card will join this thread.</span>
          </motion.button>
        </div>
      </div>
      <div className="threaded-progress" aria-hidden="true">
        <p>Drag to Explore</p>
        <small>{String(activeIndex + 1).padStart(2, "0")} / {String(orderedDreams.length).padStart(2, "0")}</small>
      </div>
    </div>
  );
}

function DreamArchiveCard({
  dream,
  index,
  active,
  onSelect,
  buttonRef,
}: {
  dream: DreamEntry;
  index: number;
  active: boolean;
  onSelect: () => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  const dateLabel = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    asLocalDreamDate(dream.date),
  );
  const mood = dream.moodTags[0] ?? "quiet";
  return (
    <motion.button
      ref={buttonRef}
      className={`chapter-card blue-chapter-card group ${active ? "is-active" : ""}`}
      type="button"
      aria-label={`Open dream: ${dream.title}`}
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: active ? 1 : 0.78, y: active ? 0 : 12, scale: active ? 1 : 0.88 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      data-cursor="Open"
    >
      <SceneMiniature dream={dream} />
      <span className="chapter-card-shade" aria-hidden="true" />
      <span className="chapter-card-heading">
        <span className="chapter-card-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="chapter-card-title">{dream.title}</span>
      </span>
      <span className="chapter-card-month">{dateLabel}</span>
      <span className="chapter-card-count">{mood}</span>
      <span className="chapter-card-symbols">
        {dream.symbols.length} symbol{dream.symbols.length === 1 ? "" : "s"}
      </span>
      <span className="chapter-card-open">Open Dream</span>
    </motion.button>
  );
}

function MonthChapterPage({
  chapter,
  onOpenDream,
  onNew,
}: {
  chapter: MonthChapter;
  onOpenDream: (dreamId: string) => void;
  onNew: () => void;
}) {
  const chapterScene = sceneAssetForMonth(chapter.monthKey);
  return (
    <main className={`chapter-world chapter-world-${chapter.recurringSymbols[0]?.id ?? "quiet"} relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-44 md:px-8`}>
      <img
        className="chapter-page-backdrop"
        src={chapterScene.src}
        alt=""
        style={{ objectPosition: chapterScene.objectPosition }}
        aria-hidden="true"
      />
      <span className="chapter-page-tint" aria-hidden="true" />
      <section className="chapter-intro mt-10 grid min-h-[34rem] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0.35, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-thread/80">{chapter.monthName}</p>
          <h2 className="font-display text-5xl leading-tight md:text-7xl">{chapter.title}</h2>
          <InkRevealText className="mt-6 text-lg leading-8 text-pearl/70">{chapter.summary}</InkRevealText>
        </motion.div>
        <PaperPanel className="chapter-note p-7 md:p-9">
          <h3 className="font-display text-3xl text-ink">Your inner child this month</h3>
          <p className="mt-4 text-base leading-7 text-ink/70">{chapter.innerChildReflection}</p>
          <button className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink" onClick={onNew} data-cursor="Open">
            <Plus size={16} />
            Add another dream to this chapter
          </button>
        </PaperPanel>
      </section>
      <section className="chapter-dream-path mt-8">
        {chapter.dreams.map((dream, index) => (
          <motion.div
            key={dream.id}
            className={`dream-path-item dream-path-item-${index % 3}`}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.72, delay: index * 0.08 }}
          >
            <DreamCard dream={dream} onOpen={() => onOpenDream(dream.id)} />
          </motion.div>
        ))}
      </section>
      <section className="chapter-patterns mt-14 grid gap-6 lg:grid-cols-2">
        <RecurringPanel title="Recurring symbols" items={chapter.recurringSymbols.map((item) => ({
          label: item.label,
          detail: `${item.count} dream${item.count === 1 ? "" : "s"}`,
        }))} />
        <RecurringPanel title="Recurring emotions" items={chapter.recurringMoods.map((item) => ({
          label: item.mood,
          detail: `${item.count} time${item.count === 1 ? "" : "s"}`,
        }))} />
      </section>
    </main>
  );
}

function DreamCard({ dream, onOpen, compact = false }: { dream: DreamEntry; onOpen: () => void; compact?: boolean }) {
  return (
    <motion.article className="dream-card group" whileHover={{ y: -10, rotate: -0.6 }} data-cursor="Enter">
      <SceneMiniature dream={dream} />
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-ink/45">
          <span>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(asLocalDreamDate(dream.date))}</span>
          <span>{dream.moodTags[0]}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl leading-7 text-ink">{dream.title}</h3>
        <p className="dream-card-excerpt mt-3 text-sm leading-6 text-ink/70">{dream.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dream.symbols.slice(0, 4).map((id) => (
            <span key={id} className="symbol-chip">
              {symbolById.get(id)?.label ?? id}
            </span>
          ))}
        </div>
        <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink" type="button" onClick={onOpen} data-cursor="Enter">
          Enter dream
          <span className="text-ink/35">{dream.symbols.length} symbols</span>
        </button>
      </div>
    </motion.article>
  );
}

function DreamDetailPage({ dream, onBack }: { dream: DreamEntry; onBack: () => void }) {
  const [activeSymbol, setActiveSymbol] = useState(dream.symbols[0] ?? "water");
  const symbol = symbolById.get(activeSymbol);

  return (
    <main className="dream-detail-world relative z-10">
      <section className="dream-detail-stage">
        <DreamScene dream={dream} activeSymbol={activeSymbol} onSelectSymbol={setActiveSymbol} />
        <div className="dream-detail-heading">
          <button className="dream-detail-back" type="button" onClick={onBack} data-cursor="Back">
            <ArrowLeft size={15} /> Archive
          </button>
          <p className="dream-detail-date">
            <CalendarDays size={16} /> {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(asLocalDreamDate(dream.date))}
          </p>
          <h2>{dream.title}</h2>
          <p className="dream-detail-scene-label">A scene inspired by your dream</p>
        </div>
        <aside className="dream-note-float">
          <motion.div
            key={activeSymbol}
            initial={{ opacity: 0, rotate: -1.8, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, rotate: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <SymbolNoteCard symbolId={activeSymbol} />
          </motion.div>
          {symbol && (
            <p className="dream-connection-line">
              Monthly connection: {symbol.label} also belongs to {symbol.relatedThemes.slice(0, 2).join(" and ")}.
            </p>
          )}
        </aside>
      </section>
      <section className="dream-detail-journal">
        <PaperPanel className="p-7 md:p-9">
          <p className="dream-journal-kicker">Dream record</p>
          <h3 className="font-display text-4xl text-ink">Original dream text</h3>
          <p className="mt-5 whitespace-pre-line text-base leading-8 text-ink/75">{dream.rawDreamText}</p>
        </PaperPanel>
        <PaperPanel className="p-7 md:p-9">
          <p className="dream-journal-kicker">A quiet reflection</p>
          <h3 className="font-display text-4xl text-ink">What may be returning</h3>
          <InkRevealText className="mt-5 text-base leading-8 text-ink/75">{dream.reflection}</InkRevealText>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-ink/42">Meanings are reflective, not fixed truths.</p>
        </PaperPanel>
      </section>
    </main>
  );
}

function DreamScene({
  dream,
  activeSymbol,
  onSelectSymbol,
}: {
  dream: DreamEntry;
  activeSymbol: string;
  onSelectSymbol: (symbolId: string) => void;
}) {
  const scene = sceneAssetForDream(dream);
  return (
    <div className="scene-stage" data-cursor="Note">
      <img
        className="scene-stage-image"
        src={scene.src}
        alt={scene.alt}
        style={{ objectPosition: scene.objectPosition }}
      />
      {dream.symbols.map((symbolId, index) => {
        return (
          <ClickableDreamObject
            key={symbolId}
            symbolId={symbolId}
            index={index}
            active={activeSymbol === symbolId}
            onSelect={() => onSelectSymbol(symbolId)}
          />
        );
      })}
      <p className="scene-caption">{dream.generatedScenePrompt}</p>
    </div>
  );
}

function ClickableDreamObject({
  symbolId,
  index,
  active,
  onSelect,
}: {
  symbolId: string;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const symbol = symbolById.get(symbolId);
  if (!symbol) return null;
  return (
    <button
      className={`scene-object scene-object-${index % 6} ${active ? "is-active" : ""}`}
      type="button"
      onClick={onSelect}
      data-cursor="Note"
      aria-label={`Open note for ${symbol.label}`}
    >
      <span>{symbol.label}</span>
    </button>
  );
}

function SymbolNoteCard({ symbolId }: { symbolId: string }) {
  const symbol = symbolById.get(symbolId);
  if (!symbol) return null;
  return (
    <PaperPanel className="symbol-note-paper p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-thread">{symbol.category}</p>
          <h3 className="mt-2 font-display text-4xl text-ink">{symbol.label}</h3>
        </div>
        <Moon className="text-thread" size={20} />
      </div>
      <p className="mt-5 text-base leading-7 text-ink/80">{symbol.shortMeaning}</p>
      <InkRevealText className="mt-5 text-base leading-8 text-ink/70">{symbol.reflectionNote}</InkRevealText>
      <div className="mt-6 flex flex-wrap gap-2">
        {symbol.relatedEmotions.map((emotion) => (
          <span key={emotion} className="symbol-chip border-thread/30 bg-thread/10">
            {emotion}
          </span>
        ))}
      </div>
    </PaperPanel>
  );
}

function NewDreamEntryPage({ onBack, onSave }: { onBack: () => void; onSave: (dream: DreamEntry) => void }) {
  const [dreamDate, setDreamDate] = useState(currentLocalDate);
  const [title, setTitle] = useState("");
  const [rawDreamText, setRawDreamText] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [people, setPeople] = useState("");
  const [places, setPlaces] = useState("");
  const [savedDraft, setSavedDraft] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!rawDreamText.trim()) return;
    onSave(
      createDreamEntry({
        date: dreamDate,
        title,
        rawDreamText,
        moodTags: selectedMoods,
        symbols: selectedSymbols,
        people: people.split(",").map((item) => item.trim()).filter(Boolean),
        places: places.split(",").map((item) => item.trim()).filter(Boolean),
      }),
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-28 md:px-8">
      <button className="back-button" type="button" onClick={onBack} data-cursor="Open">
        <ArrowLeft size={16} /> Archive
      </button>
      <section className="mt-8">
        <p className="mb-3 text-sm uppercase tracking-[0.28em] text-thread/80">Dreams fade quickly</p>
        <h2 className="font-display text-5xl leading-tight md:text-7xl">What did you dream?</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-pearl/65">
          Capture the image first. Title, symbols, and meaning can come later.
        </p>
      </section>
      <form className="mt-9 space-y-5" onSubmit={submit}>
        <PaperPanel className="p-5 md:p-7">
          <label className="field-label" htmlFor="dream-text">
            Dream text
          </label>
          <textarea
            id="dream-text"
            className="dream-textarea"
            value={rawDreamText}
            onChange={(event) => setRawDreamText(event.target.value)}
            placeholder="I remember a hallway, rain on the windows, and someone waiting by a door..."
            rows={9}
          />
        </PaperPanel>
        <div className="grid gap-5 md:grid-cols-2">
          <PaperPanel className="p-5 md:p-7">
            <label className="field-label" htmlFor="dream-date">
              Dream date
            </label>
            <input
              id="dream-date"
              className="dream-input"
              type="date"
              value={dreamDate}
              max={currentLocalDate()}
              onChange={(event) => setDreamDate(event.target.value)}
              required
            />
            <label className="field-label mt-5" htmlFor="dream-title">
              Optional title
            </label>
            <input
              id="dream-title"
              className="dream-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="The room with two doors"
            />
            <label className="field-label mt-5" htmlFor="people">
              People
            </label>
            <input
              id="people"
              className="dream-input"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
              placeholder="younger self, mother, stranger"
            />
            <label className="field-label mt-5" htmlFor="places">
              Places
            </label>
            <input
              id="places"
              className="dream-input"
              value={places}
              onChange={(event) => setPlaces(event.target.value)}
              placeholder="school hallway, train station"
            />
          </PaperPanel>
          <PaperPanel className="p-5 md:p-7">
            <span className="field-label">Mood tags</span>
            <TagPicker values={moods} selected={selectedMoods} onChange={setSelectedMoods} />
            <span className="field-label mt-6">Symbol tags</span>
            <TagPicker
              values={dreamSymbols.slice(0, 12).map((symbol) => symbol.id)}
              labels={(id) => symbolById.get(id)?.label ?? id}
              selected={selectedSymbols}
              onChange={setSelectedSymbols}
            />
            <button className="mt-6 text-sm text-ink/65" type="button" onClick={() => setSavedDraft(true)}>
              Save draft locally
            </button>
            {savedDraft && <p className="mt-2 text-sm text-ink/60">Draft noted for this session.</p>}
          </PaperPanel>
        </div>
        <PaperPanel className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <h3 className="font-display text-3xl text-ink">Voice note placeholder</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Future capture can connect microphone transcription here. This MVP saves text first.
            </p>
          </div>
          <button className="primary-button" type="submit" data-cursor="Open">
            Weave this dream
          </button>
        </PaperPanel>
      </form>
    </main>
  );
}

function TagPicker({
  values,
  selected,
  onChange,
  labels,
}: {
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  labels?: (value: string) => string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {values.map((value) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            className={`tag-button ${active ? "is-active" : ""}`}
            type="button"
            onClick={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])}
          >
            {labels ? labels(value) : value}
          </button>
        );
      })}
    </div>
  );
}

function ArchiveStoryView({ chapters, onBack }: { chapters: MonthChapter[]; onBack: () => void }) {
  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 pb-24 pt-28 md:px-8">
      <button className="back-button" type="button" onClick={onBack} data-cursor="Open">
        <ArrowLeft size={16} /> Archive
      </button>
      <section className="mt-8">
        <p className="mb-3 text-sm uppercase tracking-[0.28em] text-thread/80">Archive / Story View</p>
        <h2 className="font-display text-5xl leading-tight md:text-7xl">A story of the inner world</h2>
      </section>
      <div className="mt-12 space-y-8">
        {chapters.map((chapter) => (
          <PaperPanel key={chapter.monthKey} className="p-7 md:p-9">
            <p className="text-xs uppercase tracking-[0.24em] text-thread">{chapter.monthName}</p>
            <h3 className="mt-2 font-display text-4xl text-ink">{chapter.title}</h3>
            <p className="mt-4 text-base leading-8 text-ink/70">{chapter.summary}</p>
            <p className="mt-5 border-l border-thread/40 pl-5 text-base leading-8 text-ink/65">
              {chapter.innerChildReflection}
            </p>
          </PaperPanel>
        ))}
      </div>
    </main>
  );
}

function PatternPanel({ chapters }: { chapters: MonthChapter[] }) {
  const allSymbols = chapters.flatMap((chapter) => chapter.recurringSymbols);
  const allMoods = chapters.flatMap((chapter) => chapter.recurringMoods);
  const topSymbol = allSymbols.sort((a, b) => b.count - a.count)[0];
  const topMood = allMoods.sort((a, b) => b.count - a.count)[0];

  return (
    <PaperPanel className="p-7 md:p-9">
      <div className="flex items-center gap-3 text-thread">
        <Sparkles size={18} />
        <span className="text-xs uppercase tracking-[0.24em]">Recurring patterns</span>
      </div>
      <div className="mt-7 space-y-5">
        <PatternLine label="Symbol" value={topSymbol ? `${topSymbol.label} appeared most often.` : "No symbols yet."} />
        <PatternLine label="Emotion" value={topMood ? `${topMood.mood} is the strongest tone.` : "No moods yet."} />
        <PatternLine label="Thread" value="Monthly summaries update from saved dream metadata." />
      </div>
    </PaperPanel>
  );
}

function PatternLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-ink/10 pb-4 last:border-0">
      <p className="text-xs uppercase tracking-[0.22em] text-ink/42">{label}</p>
      <p className="mt-2 text-lg leading-7 text-ink/75">{value}</p>
    </div>
  );
}

function RecurringPanel({ title, items }: { title: string; items: Array<{ label: string; detail: string }> }) {
  return (
    <PaperPanel className="p-7">
      <h3 className="font-display text-3xl text-ink">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.detail}`} className="flex items-center justify-between border-b border-ink/10 pb-3">
            <span className="capitalize text-ink/80">{item.label}</span>
            <span className="text-sm text-ink/50">{item.detail}</span>
          </div>
        ))}
      </div>
    </PaperPanel>
  );
}

function PaperPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`paper-card ${className}`}>{children}</div>;
}

function SceneMiniature({ dream, monthKey }: { dream?: DreamEntry; monthKey?: string }) {
  const scene = monthKey ? sceneAssetForMonth(monthKey) : dream ? sceneAssetForDream(dream) : sceneAssetForMonth("2026-07");
  return (
    <div className="scene-mini">
      <img
        className="scene-mini-image"
        src={scene.src}
        alt={scene.alt}
        style={{ objectPosition: scene.objectPosition }}
      />
      {scene.markers.map((label, index) => (
        <span key={label} className={`mini-symbol mini-symbol-${index}`}>
          {label}
        </span>
      ))}
    </div>
  );
}

function InkRevealText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.p
      className={`ink-reveal ${className}`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      {children}
    </motion.p>
  );
}

function DreamMistBackground() {
  return (
    <div className="dream-world-backdrop pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="dream-world-backdrop-image" />
    </div>
  );
}

function CustomWeaveCursor() {
  const [state, setState] = useState({ x: -100, y: -100, label: "" });

  useEffect(() => {
    function move(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const cursorLabel = target.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      setState({ x: event.clientX, y: event.clientY, label: cursorLabel });
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className={`custom-cursor ${state.label ? "is-active" : ""}`}
      style={{ transform: `translate3d(${state.x}px, ${state.y}px, 0)` }}
      aria-hidden="true"
    >
      <span>{state.label}</span>
    </div>
  );
}

export default App;
