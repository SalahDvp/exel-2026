"use client"

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  Package,
  Truck,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  Users,
  Send,
  CheckCircle2,
  RotateCcw,
  MapPin,
  Bell,
  Link2,
  Megaphone,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  Star,
  Gift,
  ArrowRight,
  Plug,
  ShieldCheck,
  Wallet,
  PackageCheck,
  QrCode,
  Globe,
  Play,
  Wifi,
  BatteryFull,
  SignalHigh,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Section schedule (auto-advancing kiosk loop)                       */
/* ------------------------------------------------------------------ */
const sections: { id: string; component: () => JSX.Element; duration: number }[] = [
  { id: "intro", component: IntroSection, duration: 12000 },
  { id: "about", component: AboutSection, duration: 11500 },
  { id: "video", component: VideoSection, duration: 26000 },
  { id: "how", component: HowItWorksSection, duration: 15000 },
  { id: "dashboard", component: DashboardSection, duration: 18000 },
  { id: "numbers", component: KeyNumbersSection, duration: 12500 },
  { id: "features", component: FeaturesSection, duration: 15000 },
  { id: "results", component: ResultsSection, duration: 14000 },
  { id: "partners", component: PartnersSection, duration: 11000 },
  { id: "pricing", component: PricingSection, duration: 15000 },
  { id: "testimonials", component: TestimonialsSection, duration: 14500 },
  { id: "offer", component: SpecialOfferSection, duration: 11500 },
  { id: "cta", component: CTASection, duration: 10500 },
]

// The kiosk plays the whole deck in English, then the whole deck in Arabic,
// then loops. We model both passes as one "step" counter: steps 0..N-1 are the
// English pass, steps N..2N-1 the Arabic pass. Slide on screen = step % N; the
// language is simply which half of the run we're in.
const TOTAL_STEPS = sections.length * 2

export default function ExhibitionScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayedStep, setDisplayedStep] = useState(0)
  const [stageVisible, setStageVisible] = useState(true)
  const [autoplay, setAutoplay] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [themeLocked, setThemeLocked] = useState(false)

  // Everything else is derived from the step: the slide index wraps every N,
  // and the language is English for the first pass, Arabic for the second.
  const currentSection = currentStep % sections.length
  const displayedSection = displayedStep % sections.length
  const lang: Lang = displayedStep < sections.length ? "en" : "ar"

  // Optional kiosk config: ?s=<index> opens a step (0..N-1 = English slides,
  // N..2N-1 = the same slides in Arabic), ?auto=0 holds it, ?theme=light|dark
  // locks a theme.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = parseInt(params.get("s") || "", 10)
    if (!Number.isNaN(s)) {
      const idx = ((s % TOTAL_STEPS) + TOTAL_STEPS) % TOTAL_STEPS
      setCurrentStep(idx)
      setDisplayedStep(idx) // a deep-link jumps straight in, no crossfade
    }
    if (params.get("auto") === "0") setAutoplay(false)
    const t = params.get("theme")
    if (t === "light" || t === "dark") {
      setTheme(t)
      setThemeLocked(true)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentStep((prev) => (prev - 1 + TOTAL_STEPS) % TOTAL_STEPS)
      } else if (e.key === "ArrowRight") {
        setCurrentStep((prev) => (prev + 1) % TOTAL_STEPS)
      } else if (e.key === " ") {
        setAutoplay((p) => !p)
      } else if (e.key.toLowerCase() === "t") {
        setTheme((x) => (x === "dark" ? "light" : "dark"))
        setThemeLocked(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Stable refs so goNext keeps a single identity (keeps timers from resetting).
  const currentStepRef = useRef(currentStep)
  const themeLockedRef = useRef(themeLocked)
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])
  useEffect(() => {
    themeLockedRef.current = themeLocked
  }, [themeLocked])

  // Advance one step (wraps around at the end of the Arabic pass).
  const goNext = useCallback(() => {
    const next = (currentStepRef.current + 1) % TOTAL_STEPS
    // Alternate dark / bright once per full English+Arabic cycle (so the theme
    // isn't tied to the language) unless the user locked a theme.
    if (next === 0 && !themeLockedRef.current) {
      setTheme((x) => (x === "dark" ? "light" : "dark"))
    }
    setCurrentStep(next)
  }, [])

  // The video slide reports when its reel has finished playing. Advance only
  // while the kiosk is auto-playing; a held slide (?auto=0) stays paused on the
  // last frame until it's manually moved forward.
  const autoplayRef = useRef(autoplay)
  useEffect(() => {
    autoplayRef.current = autoplay
  }, [autoplay])
  const advanceFromReel = useCallback(() => {
    if (autoplayRef.current) goNext()
  }, [goNext])

  // Smooth crossfade: hold the outgoing step, fade it out, swap the content
  // while it's hidden, then fade the new one in. Because the language is derived
  // from the step, the English→Arabic switch at the pass boundary also happens
  // here, hidden, so a slide never flashes the wrong language. `displayedStep`
  // is what's on screen; `currentStep` is where we're heading.
  useEffect(() => {
    if (currentStep === displayedStep) return
    setStageVisible(false)
    const t = setTimeout(() => {
      setDisplayedStep(currentStep)
      setStageVisible(true)
    }, 420)
    return () => clearTimeout(t)
  }, [currentStep, displayedStep])

  // Run the auto-play timer off the step that's actually on screen.
  useEffect(() => {
    if (!autoplay) return
    // The video slide isn't on a fixed timer — it advances when the reel ends
    // (handled inside VideoSection) so the whole clip always plays to the end.
    const section = sections[displayedStep % sections.length]
    if (section.id === "video") return
    const timeout = setTimeout(goNext, section.duration)
    return () => clearTimeout(timeout)
  }, [displayedStep, autoplay, goNext])

  const CurrentComponent = sections[displayedSection].component

  return (
    <div
      className={`screen theme-transition relative min-h-screen w-full overflow-hidden bg-[var(--page-base)] ${
        theme === "light" ? "theme-light" : ""
      }`}
    >
      {/* Ambient background */}
      <BackgroundFX />
      <AnimatedParticles />

      {/* Top bar — brand + expo badge */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-start justify-between px-10 pt-8 lg:px-16 lg:pt-10">
        <div className="animate-bounce-in">
          <Logo />
        </div>
        <div className="animate-bounce-in" style={{ animationDelay: "0.15s" }}>
          <ExpoBadge />
        </div>
      </header>

      {/* Main content */}
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="relative z-10 flex min-h-screen items-center justify-center px-10 lg:px-20"
      >
        <div
          className="w-full"
          style={{
            opacity: stageVisible ? 1 : 0,
            transform: stageVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.985)",
            transition: "opacity 420ms cubic-bezier(0.4, 0, 0.2, 1), transform 420ms cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "opacity, transform",
          }}
        >
          <LangContext.Provider value={lang}>
            <AdvanceContext.Provider value={advanceFromReel}>
              <FitStage key={displayedStep}>
                <CurrentComponent />
              </FitStage>
            </AdvanceContext.Provider>
          </LangContext.Provider>
        </div>
      </div>

      {/* Progress rail */}
      <div className="absolute bottom-11 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`h-[3px] rounded-full transition-all duration-700 ${
              index === currentSection ? "w-9 bg-accent-ink" : "w-[14px] bg-ink/15"
            }`}
          />
        ))}
      </div>

      {/* Footer web address */}
      <div className="absolute bottom-10 right-14 z-50 hidden items-center gap-2 text-base font-medium tracking-[0.02em] text-ink/45 lg:flex">
        <Globe className="h-4 w-4 text-accent-ink" />
        colitrack.io
      </div>

      {/* Bright / dark toggle — hidden until you hover the bottom-right corner */}
      <div className="group absolute bottom-0 right-0 z-50 flex h-36 w-44 items-end justify-end pb-9 pr-12">
        <button
          onClick={() => {
            setTheme((t) => (t === "dark" ? "light" : "dark"))
            setThemeLocked(true)
          }}
          aria-label="Toggle bright or dark mode"
          title="Toggle bright / dark"
          className="glass hover-glow pointer-events-none flex h-14 w-14 items-center justify-center rounded-full opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6 text-accent-ink" />
          ) : (
            <Moon className="h-6 w-6 text-accent-ink" />
          )}
        </button>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  BRAND LOGO — faithful reproduction of the colitrack.io mark        */
/* ================================================================== */
function Logo({ size = "md", localize = false }: { size?: "md" | "xl"; localize?: boolean }) {
  // On the intro & closing slides we localize the wordmark itself in the Arabic
  // pass; the header brand (rendered outside the language context) stays Latin.
  const lang = useLang()
  const arabic = localize && lang === "ar"
  const mark = size === "xl" ? "h-24 w-24 rounded-3xl text-6xl" : "h-14 w-14 rounded-2xl text-3xl"
  const word = size === "xl" ? "text-7xl" : "text-4xl"
  return (
    <div dir={arabic ? "rtl" : "ltr"} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-4">
        <div
          className={`flex ${mark} items-center justify-center font-extrabold text-white shadow-[0_10px_28px_-10px_rgba(99,102,241,0.9)]`}
          style={{ background: "linear-gradient(135deg, #6366f1, #a5b4fc)" }}
        >
          C
        </div>
        <div className="flex flex-col">
          <span
            className={`wordmark font-extrabold ${arabic ? "leading-tight tracking-normal" : "leading-none tracking-tight"} ${word}`}
          >
            {arabic ? "كولي تراك" : "Colitrack"}
            <span style={{ color: "#6366f1", WebkitTextFillColor: "#6366f1" }}>.</span>
          </span>
          {/* Parcel route line */}
          <div
            className="relative mt-2 h-[3px] w-full overflow-visible rounded-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(99,102,241,0), rgba(99,102,241,0.35) 12%, rgba(99,102,241,0.35) 88%, rgba(99,102,241,0))",
            }}
          >
            <span
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#6366f1] shadow-[0_0_10px_2px_rgba(99,102,241,0.85)]"
              style={{ animation: "parcel-run 4.5s ease-in-out infinite" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExpoBadge() {
  return (
    <div className="glass-strong flex items-center gap-4 rounded-2xl px-6 py-4 neon-border">
      <div className="flex flex-col items-end gap-1 leading-none">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-accent-ink">
          Exhibiting at
        </span>
        <span className="h-px w-full bg-ink/10" />
      </div>
      {/* Official ECSEL EXPO 2026 logo (5th edition) */}
      <img
        src="/ecsel-expo-logo.png"
        alt="ECSEL EXPO — Algiers 2026, 5th edition"
        className="h-11 w-auto lg:h-12"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }}
      />
    </div>
  )
}

/* ================================================================== */
/*  AMBIENT BACKGROUND                                                  */
/* ================================================================== */
function BackgroundFX() {
  return (
    <>
      {/* Indigo radial depth (theme-tuned) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 78% -10%, var(--glow-1), transparent 60%), radial-gradient(1000px 600px at 8% 110%, var(--glow-2), transparent 60%)",
        }}
      />
      {/* Whisper-fine static grid */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.5]">
        <div
          className="absolute inset-[-60px]"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>
      {/* One slow, soft glow for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute right-[12%] top-[6%] h-[680px] w-[680px] rounded-full bg-[#6366f1]/10 blur-[180px]" />
        <div
          className="animate-pulse-glow absolute -bottom-40 left-[6%] h-[620px] w-[620px] rounded-full bg-[#6366f1]/[0.07] blur-[190px]"
          style={{ animationDelay: "4s" }}
        />
      </div>
      {/* Vignette for legibility (fades out in bright mode) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[var(--vignette)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--vignette)] to-transparent" />
    </>
  )
}

function AnimatedParticles() {
  const particles = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    x: (i * 47 + 8) % 100,
    y: (i * 61 + 12) % 100,
    tx: ((i % 5) - 2) * 70,
    ty: ((i % 4) - 2) * 70,
    delay: (i * 1.1) % 10,
    duration: 24 + (i % 6) * 3,
  }))
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="animate-particle-float absolute h-1 w-1 rounded-full bg-accent-ink/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // @ts-ignore
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
          }}
        />
      ))}
    </div>
  )
}

/* ================================================================== */
/*  Shared helpers                                                     */
/* ================================================================== */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-4">
      <span className="h-px w-10 bg-accent-ink/40" />
      <span className="text-sm font-semibold uppercase tracking-[0.34em] text-accent-ink lg:text-base">
        {children}
      </span>
      <span className="h-px w-10 bg-accent-ink/40" />
    </div>
  )
}

function useCountUp(target: number, duration = 1700) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

/* A slide can call this (via context) to advance the kiosk itself — used by the
   video slide so it moves on only once the reel has finished. */
const AdvanceContext = createContext<() => void>(() => {})
const useAdvance = () => useContext(AdvanceContext)

/* Scales every slide to fill the same share of the screen, so each one sits in
   the same band between the header and the progress rail — no more one slide at
   80% and the next at 55%. Over-tall slides scale down to fit; sparse ones scale
   up a little (capped), never past the available width, so nothing spills off
   the edges. Scaling is visual only; layout stays centered. */
function FitStage({
  reserveV = 300,
  reserveH = 180,
  maxUp = 1.3,
  children,
}: {
  reserveV?: number
  reserveH?: number
  maxUp?: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const host = ref.current
    if (!host) return
    const measure = () => {
      const content = host.firstElementChild as HTMLElement | null
      if (!content) return
      const nH = content.offsetHeight
      const nW = content.offsetWidth
      if (!nH || !nW) return
      const availH = window.innerHeight - reserveV
      const availW = window.innerWidth - reserveH
      // Fill toward the available box on whichever axis binds first, capped so a
      // sparse slide never balloons, floored so it can't disappear.
      const s = Math.min(availH / nH, availW / nW, maxUp)
      setScale(Math.max(s, 0.5))
    }
    measure()
    // Re-measure over the next couple of frames in case fonts, layout, or a
    // late viewport change haven't settled by first paint.
    let raf = requestAnimationFrame(() => {
      measure()
      raf = requestAnimationFrame(measure)
    })
    const content = host.firstElementChild
    const ro = new ResizeObserver(measure)
    if (content) ro.observe(content)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [reserveV, reserveH, maxUp])
  return (
    <div
      ref={ref}
      className="flex w-full justify-center"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  )
}

/* ================================================================== */
/*  BILINGUAL ENGINE — the deck plays through once in English, then     */
/*  again in Arabic. Every screen simply renders the current pass's      */
/*  language (RTL is handled by the stage `dir`).                        */
/* ================================================================== */
type Lang = "en" | "ar"
const LangContext = createContext<Lang>("en")
const useLang = () => useContext(LangContext)

/* Split a headline around its accent phrase so the accent keeps the
   indigo gradient while at rest. */
function renderHeadline(full: string, accent: string | undefined, accentClassName: string) {
  if (!accent) return full
  const i = full.indexOf(accent)
  if (i === -1) return full
  return (
    <>
      {full.slice(0, i)}
      <span className={accentClassName}>{accent}</span>
      {full.slice(i + accent.length)}
    </>
  )
}

/* Headline for the active pass — English on the first run, Arabic on the
   second — with its accent phrase kept in the indigo gradient. */
function Typewriter({
  en,
  ar,
  accentEn,
  accentAr,
  accentClassName = "text-gradient accent-serif",
}: {
  en: string
  ar: string
  accentEn?: string
  accentAr?: string
  accentClassName?: string
}) {
  const lang = useLang()
  return lang === "ar"
    ? renderHeadline(ar, accentAr, accentClassName)
    : renderHeadline(en, accentEn, accentClassName)
}

/* Body copy: cross-fades English out and Arabic in on each flip. */
function T({ en, ar }: { en: React.ReactNode; ar: React.ReactNode }) {
  const lang = useLang()
  const [shown, setShown] = useState<Lang>(lang)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (shown === lang) return
    setVisible(false)
    const t = setTimeout(() => {
      setShown(lang)
      setVisible(true)
    }, 260)
    return () => clearTimeout(t)
  }, [lang, shown])
  return (
    <span className="lang-fade" style={{ opacity: visible ? 1 : 0 }}>
      {shown === "ar" ? ar : en}
    </span>
  )
}

/* ================================================================== */
/*  1 · INTRO                                                          */
/* ================================================================== */
function IntroSection() {
  return (
    <div className="animate-fade-in-up flex max-w-6xl flex-col items-center space-y-11 text-center">
      <Logo size="xl" localize />

      <div className="space-y-8">
        <h1 className="max-w-5xl text-balance text-6xl font-bold leading-[1.06] tracking-[-0.02em] text-ink lg:text-7xl xl:text-[5.25rem]">
          <Typewriter
            en="Transform your e-commerce with Smart SMS Solutions"
            ar="طوّر تجارتك الإلكترونية مع حلول SMS الذكية"
            accentEn="Smart SMS Solutions"
            accentAr="حلول SMS الذكية"
            accentClassName="text-gradient accent-serif font-normal"
          />
        </h1>

        <p className="mx-auto max-w-3xl text-balance text-3xl font-light leading-snug text-ink/60 lg:text-[2.1rem]">
          <T
            en="Real-time notifications, happier customers, and fully automated parcel tracking."
            ar="إشعارات فورية، زبائن أكثر رضًا، وتتبّع آلي كامل للطرود."
          />
        </p>
      </div>

      <div className="mt-2 flex items-center gap-6 text-xl font-medium text-ink/55 lg:text-2xl">
        <span className="flex items-center gap-2.5">
          <MapPin className="h-6 w-6 text-accent-ink" /> <T en="Real-time tracking" ar="تتبّع فوري" />
        </span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span><T en="SMS on every step" ar="رسائل SMS في كل خطوة" /></span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span><T en="Built for Algeria 🇩🇿" ar="مصمّم للجزائر 🇩🇿" /></span>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  2 · ABOUT / WHAT WE DO                                             */
/* ================================================================== */
function AboutSection() {
  const items = [
    {
      icon: Bell,
      title: { en: "Automatic SMS at every step", ar: "رسائل SMS آلية في كل خطوة" },
      body: {
        en: "Order confirmed, out-for-delivery, delivered — sent in real time, on autopilot.",
        ar: "تأكيد الطلب، خرج للتوصيل، تمّ التسليم — تُرسَل فوريًا وبشكل آلي.",
      },
    },
    {
      icon: MapPin,
      title: { en: "Live tracking across 58 wilayas", ar: "تتبّع مباشر عبر 58 ولاية" },
      body: {
        en: "Every parcel followed from pickup to the customer's door, nationwide.",
        ar: "كل طرد مُتابَع من الاستلام إلى باب الزبون، عبر كامل الوطن.",
      },
    },
    {
      icon: Target,
      title: { en: "Retargeting that recovers orders", ar: "إعادة استهداف تسترجع الطلبات" },
      body: {
        en: "Re-engage no-answer customers automatically and win the sale back.",
        ar: "أعد التواصل مع الزبائن غير المجيبين آليًا واسترجع عملية البيع.",
      },
    },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Smart SMS Automation" ar="أتمتة SMS الذكية" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Every parcel, tracked & notified."
            ar="كل طرد، يُتابَع ويصلك إشعاره."
            accentEn="tracked & notified."
            accentAr="يُتابَع ويصلك إشعاره."
          />
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="glass-strong hover-glow group animate-fade-in-up space-y-6 rounded-3xl p-10"
            style={{ animationDelay: `${i * 0.14}s` }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] shadow-[0_12px_30px_-10px_rgba(99,102,241,0.9)]">
              <it.icon className="h-11 w-11 text-white" />
            </div>
            <h3 className="text-3xl font-extrabold text-ink">
              <T en={it.title.en} ar={it.title.ar} />
            </h3>
            <p className="text-2xl leading-relaxed text-ink/65">
              <T en={it.body.en} ar={it.body.ar} />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  3 · VIDEO — the demo, inside the Colitrack phone app               */
/* ================================================================== */
function VideoSection() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)
  const advance = useAdvance()

  const post = (func: string, args: any[] = []) =>
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    )

  // Autoplay must start muted so it always plays. Then we ASK for sound — it
  // only takes on a browser launched with --autoplay-policy=no-user-gesture-
  // required (kiosk). We re-issue playVideo so a blocked unmute can't leave the
  // reel paused; on a normal browser it keeps playing muted until tapped.
  const nudgePlay = () => {
    // Subscribe to the player's events so we're notified when the reel ends.
    // We re-send this a few times: on the *second* time this slide mounts (the
    // Arabic pass) the player is often not ready to register the listener on the
    // first post, and a missed subscription means the ENDED event never arrives
    // and the slide would stall. Retrying makes the subscription stick either way.
    const subscribe = () =>
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        "*",
      )
    subscribe()
    let n = 0
    const id = setInterval(() => {
      subscribe()
      post("playVideo")
      if (++n >= 6) clearInterval(id)
    }, 500)
    setTimeout(() => {
      post("unMute")
      post("setVolume", [100])
      post("playVideo")
    }, 1400)
  }

  // Move on only once the clip has played through — never cut it off mid-reel.
  // The reel no longer loops: we watch the YouTube player's messages for the
  // ENDED state, and arm a safety timer from the clip's real length in case
  // that one event is ever dropped, so the kiosk can never stall on this slide.
  useEffect(() => {
    let done = false
    let fallback: ReturnType<typeof setTimeout>
    let lengthLocked = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(fallback)
      post("pauseVideo") // hold on the last frame — no loop, no restart
      advance() // advances only while auto-playing; a held slide stays paused
    }
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string" || !e.origin.includes("youtube")) return
      let d: any
      try {
        d = JSON.parse(e.data)
      } catch {
        return
      }
      const info = d?.info
      const state =
        d?.event === "onStateChange" ? d?.info : d?.event === "infoDelivery" ? info?.playerState : undefined
      if (state === 0) {
        finish() // 0 = ENDED
        return
      }
      // Once the real duration is known, arm a safety advance just past the end.
      if (!lengthLocked && info && typeof info.duration === "number" && info.duration > 1) {
        lengthLocked = true
        clearTimeout(fallback)
        fallback = setTimeout(finish, (info.duration + 5) * 1000)
      }
    }
    window.addEventListener("message", onMessage)
    // Last-resort ceiling until the real length is known — kept short enough that
    // the kiosk can never stall on this slide even if the player sends nothing.
    fallback = setTimeout(finish, 60000)
    return () => {
      window.removeEventListener("message", onMessage)
      clearTimeout(fallback)
    }
  }, [advance])

  const toggleSound = () => {
    if (muted) {
      post("unMute")
      post("setVolume", [100])
      post("playVideo")
    } else {
      post("mute")
    }
    setMuted((m) => !m)
  }

  return (
    <div className="animate-fade-in-up grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1fr_0.75fr]">
      <div className="space-y-8">
        <Eyebrow>
          <T en="Watch it work" ar="شاهدها تعمل" />
        </Eyebrow>
        <h2 className="text-balance text-6xl font-extrabold leading-[1.05] text-ink lg:text-7xl">
          <Typewriter
            en="See Colitrack in action."
            ar="شاهد كولي تراك أثناء العمل."
            accentEn="in action."
            accentAr="أثناء العمل."
          />
        </h2>
        <p className="text-balance text-2xl leading-relaxed text-ink/65 lg:text-3xl">
          <T
            en="A quick look at how every parcel turns into a tracked, notified, and recovered order — fully on autopilot."
            ar="نظرة سريعة على كيف يتحوّل كل طرد إلى طلب مُتتبَّع ومُشعَر به ومُسترجَع — بشكل آلي بالكامل."
          />
        </p>
        <div className="space-y-4">
          {[
            { en: "Automatic SMS at every delivery step", ar: "رسائل SMS آلية في كل خطوة توصيل" },
            { en: "Live parcel tracking across all 58 wilayas", ar: "تتبّع مباشر للطرود عبر كل 58 ولاية" },
            { en: "Retargeting that recovers no-answer orders", ar: "إعادة استهداف تسترجع طلبات غير المجيبين" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-accent-ink" />
              <span className="text-2xl font-medium text-ink/85">
                <T en={b.en} ar={b.ar} />
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={toggleSound}
          className="glass hover-glow inline-flex items-center gap-3 rounded-full px-6 py-3 text-xl font-semibold text-ink"
        >
          {muted ? <VolumeX className="h-6 w-6 text-accent-ink" /> : <Volume2 className="h-6 w-6 text-accent-ink" />}
          {muted ? <T en="Tap for sound" ar="اضغط للصوت" /> : <T en="Sound on" ar="الصوت مُفعّل" />}
        </button>
      </div>

      {/* Phone playing the vertical reel full-screen */}
      <div className="flex justify-center">
        <PhoneMockup iframeRef={iframeRef} onVideoLoad={nudgePlay} muted={muted} onToggleSound={toggleSound} />
      </div>
    </div>
  )
}

function PhoneMockup({
  iframeRef,
  onVideoLoad,
  muted,
  onToggleSound,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement>
  onVideoLoad: () => void
  muted: boolean
  onToggleSound: () => void
}) {
  return (
    <div className="relative" style={{ width: 340 }}>
      {/* Glow */}
      <div className="animate-pulse-glow absolute -inset-8 rounded-[70px] bg-[#6366f1]/20 blur-3xl" />

      {/* Side buttons */}
      <div className="absolute -left-1 top-40 h-16 w-1 rounded-l bg-[#2a2f42]" />
      <div className="absolute -left-1 top-60 h-24 w-1 rounded-l bg-[#2a2f42]" />
      <div className="absolute -right-1 top-52 h-28 w-1 rounded-r bg-[#2a2f42]" />

      {/* Device body */}
      <div
        className="relative rounded-[54px] p-[13px] shadow-[0_46px_100px_-34px_rgba(10,12,30,0.9)]"
        style={{ background: "linear-gradient(160deg,#232838,#0c0e16)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Screen — the reel fills it edge to edge */}
        <div className="relative overflow-hidden rounded-[44px] bg-black" style={{ aspectRatio: "9 / 19.3" }}>
          {/* The vertical reel, covering the whole screen */}
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              ref={iframeRef}
              onLoad={onVideoLoad}
              className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2"
              style={{ aspectRatio: "9 / 16", minWidth: "100%", minHeight: "100%" }}
              src="https://www.youtube.com/embed/82vgT6ypObw?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&fs=0&iv_load_policy=3"
              title="Colitrack in action"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Dynamic island */}
          <div className="absolute left-1/2 top-3 z-30 h-8 w-28 -translate-x-1/2 rounded-full bg-black" />

          {/* Status bar (overlaid on the reel) */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-7 pt-4 text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
            <span className="text-sm font-bold">9:41</span>
            <div className="flex items-center gap-1.5">
              <SignalHigh className="h-4 w-4" />
              <Wifi className="h-4 w-4" />
              <BatteryFull className="h-4 w-4" />
            </div>
          </div>

          {/* Top-right: Live + sound */}
          <div className="absolute right-4 top-14 z-20 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
            </div>
            <button
              onClick={onToggleSound}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Bottom scrim + reel caption */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-7 pt-16">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold text-white ring-2 ring-white/70"
                style={{ background: "linear-gradient(135deg, #6366f1, #a5b4fc)" }}
              >
                C
              </div>
              <span className="text-sm font-extrabold text-white">colitrack.io</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
                Demo
              </span>
            </div>
            <p className="mt-2.5 text-[13px] font-semibold leading-snug text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
              📦 « Votre colis a été expédié » — chaque étape, un SMS automatique.
            </p>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 z-20 h-1.5 w-32 -translate-x-1/2 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  4 · HOW IT WORKS                                                   */
/* ================================================================== */
function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      icon: Plug,
      title: { en: "Connect your shipping company", ar: "اربط شركة التوصيل" },
      body: {
        en: "Link Yalidine, Noest, ZR Express or Maystro in one click. Your parcels sync automatically.",
        ar: "اربط Yalidine أو Noest أو ZR Express أو Maystro بنقرة واحدة، وتتزامن طرودك آليًا.",
      },
    },
    {
      n: "02",
      icon: MessageSquare,
      title: { en: "Activate the SMS you want", ar: "فعّل الرسائل التي تريدها" },
      body: {
        en: "Order confirmation, out-for-delivery, delivered, and retargeting for no-answers.",
        ar: "تأكيد الطلب، خرج للتوصيل، تمّ التسليم، وإعادة استهداف غير المجيبين.",
      },
    },
    {
      n: "03",
      icon: Zap,
      title: { en: "We handle everything", ar: "نتكفّل بكل شيء" },
      body: {
        en: "Colitrack sends the right SMS at the right moment, in real time. You just watch it work.",
        ar: "يرسل كولي تراك الرسالة المناسبة في الوقت المناسب، فوريًا. ما عليك سوى المشاهدة.",
      },
    },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-14">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="How it works" ar="كيف يعمل" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Set it up once. We handle the rest."
            ar="اضبطه مرّة واحدة. ونتكفّل بالباقي."
            accentEn="We handle the rest."
            accentAr="ونتكفّل بالباقي."
          />
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="animate-fade-in-up relative" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="glass-strong hover-glow h-full space-y-6 rounded-3xl p-10">
              <div className="flex items-center justify-between">
                <span className="text-7xl font-extrabold text-ink/10">{s.n}</span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                  <s.icon className="h-8 w-8 text-accent-ink" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-ink">
                <T en={s.title.en} ar={s.title.ar} />
              </h3>
              <p className="text-2xl leading-relaxed text-ink/65">
                <T en={s.body.en} ar={s.body.ar} />
              </p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="flip-rtl absolute -right-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 text-[#6366f1]/60 md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  5 · LIVE DASHBOARD                                                 */
/* ================================================================== */
function DashboardSection() {
  const kpis = [
    { icon: Package, label: { en: "Parcels tracked · 30d", ar: "طرود مُتتبَّعة · 30 يومًا" }, value: "12,480", delta: "+18%", up: true },
    { icon: BadgeCheck, label: { en: "Delivery rate", ar: "نسبة التسليم" }, value: "94.2%", delta: "+3.1%", up: true },
    { icon: Send, label: { en: "SMS delivered", ar: "رسائل SMS مُسلَّمة" }, value: "38,912", delta: "+22%", up: true },
    { icon: RotateCcw, label: { en: "Return rate", ar: "نسبة الإرجاع" }, value: "5.8%", delta: "-2.4%", up: false },
  ]
  const speed = [
    { day: { en: "Day 1", ar: "اليوم 1" }, pct: 70, note: { en: "Same / next-day", ar: "نفس اليوم / الغد" } },
    { day: { en: "Day 2", ar: "اليوم 2" }, pct: 20, note: { en: "Second attempt", ar: "المحاولة الثانية" } },
    { day: { en: "Day 3", ar: "اليوم 3" }, pct: 10, note: { en: "Final window", ar: "النافذة الأخيرة" } },
  ]
  const wilayas = [
    { name: { en: "Alger", ar: "الجزائر" }, n: 3120, pct: 100 },
    { name: { en: "Oran", ar: "وهران" }, n: 2560, pct: 82 },
    { name: { en: "Constantine", ar: "قسنطينة" }, n: 1990, pct: 64 },
    { name: { en: "Blida", ar: "البليدة" }, n: 1585, pct: 51 },
    { name: { en: "Sétif", ar: "سطيف" }, n: 1340, pct: 43 },
  ]
  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>
          <T en="Peek inside — it's live" ar="ألقِ نظرة — إنها مباشرة" />
        </Eyebrow>
        <h2 className="text-balance text-4xl font-extrabold text-ink lg:text-5xl">
          <Typewriter
            en="The whole delivery, on one screen."
            ar="عملية التوصيل كاملة، على شاشة واحدة."
            accentEn="on one screen."
            accentAr="على شاشة واحدة."
          />
        </h2>
      </div>

      {/* App window */}
      <div className="glass-strong overflow-hidden rounded-3xl neon-border">
        {/* Chrome bar */}
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink/[0.03] px-8 py-3">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xl font-semibold text-ink/55">
              <T en="app.colitrack.com · Demo Store" ar="app.colitrack.com · متجر تجريبي" />
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full bg-emerald-400/10 px-4 py-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
            <span className="text-lg font-bold uppercase tracking-widest text-[var(--pos-text)]">Live</span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_1fr]">
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-4">
            {kpis.map((k, i) => (
              <div key={i} className="animate-fade-in-up rounded-2xl border border-ink/10 bg-ink/[0.03] p-5" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                    <k.icon className="h-6 w-6 text-accent-ink" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-lg font-bold text-[var(--pos-text)]">
                    {k.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {k.delta}
                  </span>
                </div>
                <p className="mt-3 text-4xl font-extrabold text-ink">{k.value}</p>
                <p className="mt-1 text-xl text-ink/55">
                  <T en={k.label.en} ar={k.label.ar} />
                </p>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Delivery speed */}
            <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-5">
              <p className="text-xl font-bold text-ink">
                <T en="Delivery speed" ar="سرعة التسليم" />
              </p>
              <p className="mb-3 text-lg text-ink/45">
                <T en="Last 30 days · 12,480 parcels" ar="آخر 30 يومًا · 12,480 طردًا" />
              </p>
              <div className="space-y-3">
                {speed.map((s, i) => (
                  <div key={i}>
                    <div className="mb-1.5 flex justify-between text-lg">
                      <span className="font-semibold text-ink/80">
                        <T en={`${s.day.en} · ${s.note.en}`} ar={`${s.day.ar} · ${s.note.ar}`} />
                      </span>
                      <span className="font-extrabold text-accent-ink">{s.pct}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#a5b4fc]"
                        style={{ width: `${s.pct}%`, animationDelay: `${0.3 + i * 0.15}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top wilayas */}
            <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-5">
              <p className="mb-3 text-xl font-bold text-ink">
                <T en="Top wilayas" ar="أهم الولايات" />
              </p>
              <div className="space-y-2.5">
                {wilayas.map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-28 text-lg font-semibold text-ink/80">
                      <T en={w.name.en} ar={w.name.ar} />
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                      <div className="animate-bar-grow h-full rounded-full bg-[#6366f1]" style={{ width: `${w.pct}%`, animationDelay: `${0.4 + i * 0.1}s` }} />
                    </div>
                    <span className="w-16 text-right text-lg font-extrabold text-ink">{w.n.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live activity ticker */}
        <div className="flex items-center gap-3 border-t border-ink/10 bg-[#6366f1]/[0.06] px-8 py-3">
          <span className="h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
          <span className="text-xl font-medium text-ink/75">
            <T
              en={
                <>
                  Parcel <span className="font-bold text-accent-ink">CT-90412</span> delivered — Alger · confirmation SMS
                  sent &nbsp;·&nbsp; Retargeting re-engaged <span className="font-bold text-accent-ink">214</span>{" "}
                  no-answer customers this week
                </>
              }
              ar={
                <>
                  الطرد <span className="font-bold text-accent-ink">CT-90412</span> تمّ تسليمه — الجزائر · أُرسل SMS
                  التأكيد &nbsp;·&nbsp; أعادت إعادة الاستهداف التواصل مع{" "}
                  <span className="font-bold text-accent-ink">214</span> زبونًا غير مجيب هذا الأسبوع
                </>
              }
            />
          </span>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  6 · KEY NUMBERS (animated counters)                               */
/* ================================================================== */
function KeyNumbersSection() {
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-14">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Live SMS activity" ar="نشاط SMS مباشر" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Numbers that keep moving."
            ar="أرقام لا تتوقّف عن التحرّك."
            accentEn="moving."
            accentAr="التحرّك."
          />
        </h2>
        <p className="text-2xl text-ink/55">
          <T
            en="Created by online sellers, for online sellers."
            ar="صُنعت من بائعين على الإنترنت، تجار الكترونيين."
          />
        </p>
      </div>
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <StatCard icon={Send} value={11257} suffix="+" label={<T en="SMS sent today" ar="SMS أُرسلت اليوم" />} live highlight={false} />
        <StatCard icon={MessageSquare} value={5} suffix="M+" label={<T en="Total SMS sent" ar="إجمالي SMS المُرسلة" />} highlight />
        <StatCard icon={ShieldCheck} value={100} suffix="%" label={<T en="SMS delivery rate" ar="نسبة تسليم SMS" />} />
        <StatCard icon={Users} value={2000} suffix="+" label={<T en="Partner stores" ar="متاجر شريكة" />} />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  live = false,
  highlight = false,
}: {
  icon: any
  value: number
  suffix: string
  label: React.ReactNode
  live?: boolean
  highlight?: boolean
}) {
  const animated = useCountUp(value, 1800)
  const [bonus, setBonus] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (!live) return
    const t = setTimeout(() => {
      intervalRef.current = setInterval(
        () => setBonus((b) => b + Math.floor(Math.random() * 4) + 1),
        2600,
      )
    }, 2000)
    return () => {
      clearTimeout(t)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [live])

  const shown = Math.round(animated) + bonus
  const display = suffix.startsWith("M") ? shown.toString() : shown.toLocaleString("en-US")

  return (
    <div
      className={`hover-glow relative flex flex-col items-center gap-4 rounded-3xl p-10 text-center ${
        highlight ? "neon-border animate-neon-pulse" : "border border-ink/10 bg-ink/[0.03]"
      }`}
      style={{
        background: highlight ? "linear-gradient(160deg, rgba(99,102,241,0.95), rgba(79,70,229,0.8))" : undefined,
      }}
    >
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${highlight ? "bg-white/20" : "bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40"}`}>
        <Icon className={`h-8 w-8 ${highlight ? "text-white" : "text-accent-ink"}`} />
      </div>
      <p className={`flex items-baseline text-6xl font-extrabold lg:text-7xl ${highlight ? "text-white" : "text-ink"}`}>
        {display}
        <span className={highlight ? "text-white/90" : "text-accent-ink"}>{suffix}</span>
      </p>
      <div className="flex items-center gap-2">
        {live && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />}
        <p className={`text-2xl font-semibold ${highlight ? "text-white/90" : "text-ink/65"}`}>{label}</p>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  7 · FEATURES                                                      */
/* ================================================================== */
function FeaturesSection() {
  const features = [
    {
      icon: Link2,
      title: { en: "Auto Tracking Link", ar: "رابط تتبّع آلي" },
      body: {
        en: "An automated tracking link so customers monitor delivery status right from their phone.",
        ar: "رابط تتبّع آلي يتابع به الزبائن حالة التوصيل مباشرة من هواتفهم.",
      },
    },
    {
      icon: Bell,
      title: { en: "Personalized SMS", ar: "رسائل SMS مخصّصة" },
      body: {
        en: "Tailored alerts with order details, shipping updates and delivery schedules.",
        ar: "تنبيهات مخصّصة بتفاصيل الطلب وتحديثات الشحن ومواعيد التسليم.",
      },
    },
    {
      icon: Megaphone,
      title: { en: "SMS Retargeting", ar: "إعادة استهداف عبر SMS" },
      body: {
        en: "Re-engage no-answer and abandoned-cart customers with timely, targeted campaigns.",
        ar: "أعد التواصل مع غير المجيبين وأصحاب السلال المتروكة بحملات دقيقة وفي وقتها.",
      },
    },
    {
      icon: BadgeCheck,
      title: { en: "Custom Sender ID", ar: "معرّف مُرسِل مخصّص" },
      body: {
        en: "Send with your brand's name so customers instantly recognise every message.",
        ar: "أرسل باسم علامتك التجارية ليتعرّف الزبائن على كل رسالة فورًا.",
      },
    },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Advanced features" ar="ميزات متقدّمة" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Everything you need to scale."
            ar="كل ما تحتاجه لتنمو."
            accentEn="scale."
            accentAr="لتنمو."
          />
        </h2>
      </div>
      <div className="grid gap-7 md:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={i}
            className="glass-strong hover-glow animate-fade-in-up flex items-start gap-7 rounded-3xl p-9"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] shadow-[0_12px_30px_-10px_rgba(99,102,241,0.9)]">
              <f.icon className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-ink">
                <T en={f.title.en} ar={f.title.ar} />
              </h3>
              <p className="text-2xl leading-relaxed text-ink/65">
                <T en={f.body.en} ar={f.body.ar} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  8 · RESULTS (problem → fix)                                        */
/* ================================================================== */
function ResultsSection() {
  const cases = [
    {
      before: { en: "High volume of inquiries", ar: "حجم استفسارات مرتفع" },
      after: { en: "50% fewer inquiries", ar: "استفسارات أقل بنسبة 50%" },
      problem: { en: "Lack of real-time updates", ar: "غياب التحديثات الفورية" },
      solution: { en: "Automated SMS order-status alerts", ar: "تنبيهات آلية بحالة الطلب عبر SMS" },
      icon: MessageSquare,
    },
    {
      before: { en: "Losing monthly customers", ar: "فقدان زبائن كل شهر" },
      after: { en: "+30% customer retention", ar: "+30% في الاحتفاظ بالزبائن" },
      problem: { en: "Low customer retention", ar: "ضعف الاحتفاظ بالزبائن" },
      solution: { en: "SMS retargeting campaigns", ar: "حملات إعادة استهداف عبر SMS" },
      icon: Target,
    },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Real results" ar="نتائج حقيقية" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="From a problem to a fix."
            ar="من مشكلة إلى حل."
            accentEn="a fix."
            accentAr="حل."
          />
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {cases.map((c, i) => (
          <div key={i} className="glass-strong animate-fade-in-up space-y-7 rounded-3xl p-10" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-rose-500/10 px-4 py-2 text-xl font-semibold text-[var(--neg-text)] line-through decoration-rose-400/60">
                <T en={c.before.en} ar={c.before.ar} />
              </span>
              <ArrowRight className="flip-rtl h-7 w-7 text-ink/40" />
              <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-xl font-extrabold text-[var(--pos-text)]">
                <T en={c.after.en} ar={c.after.ar} />
              </span>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                <c.icon className="h-8 w-8 text-accent-ink" />
              </div>
              <div>
                <p className="text-lg uppercase tracking-widest text-ink/40">
                  <T en="The problem" ar="المشكلة" />
                </p>
                <p className="text-2xl font-bold text-ink">
                  <T en={c.problem.en} ar={c.problem.ar} />
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#6366f1]/30 bg-[#6366f1]/[0.08] p-6">
              <p className="text-lg uppercase tracking-widest text-accent-ink">
                <T en="Our solution" ar="حلّنا" />
              </p>
              <p className="text-2xl font-extrabold text-ink">
                <T en={c.solution.en} ar={c.solution.ar} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  9 · PARTNERS / INTEGRATIONS                                        */
/* ================================================================== */
function PartnersSection() {
  const partners = [
    { name: "Yalidine", logo: "/partners/yalidine.png" },
    { name: "Noest", logo: "/partners/noest.png" },
    { name: "ZR Express", logo: "/partners/zrexpress.png" },
    { name: "Maystro Delivery", logo: "/partners/maystro.svg" },
    { name: "DHD", logo: "/partners/dhd.png" },
    { name: "Anderson Logistique", logo: "/partners/anderson.png" },
  ]
  const row = [...partners, ...partners]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12 text-center">
      <div className="space-y-5">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Trusted integrations" ar="تكاملات موثوقة" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Connects with every delivery company."
            ar="يتكامل مع كل شركات التوصيل."
            accentEn="delivery company."
            accentAr="شركات التوصيل."
          />
        </h2>
        <p className="text-2xl text-ink/55">
          <T
            en="One click to sync your parcels — no dashboards to babysit."
            ar="نقرة واحدة لمزامنة طرودك — دون لوحات تحكّم تراقبها."
          />
        </p>
      </div>

      <div className="relative overflow-hidden py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[var(--page-base)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[var(--page-base)] to-transparent" />
        <div className="animate-marquee flex w-max gap-7">
          {row.map((p, i) => (
            <div
              key={i}
              className="flex h-32 min-w-[260px] items-center justify-center rounded-3xl bg-white px-10 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/5"
            >
              <img src={p.logo} alt={p.name} className="max-h-16 max-w-[184px] object-contain" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-2xl font-semibold text-ink/60">
        <Users className="h-8 w-8 text-accent-ink" />
        <T
          en={
            <>
              Powering <span className="font-extrabold text-ink">2,000+</span> partner stores across Algeria
            </>
          }
          ar={
            <>
              يشغّل أكثر من <span className="font-extrabold text-ink">2,000</span> متجر شريك عبر الجزائر
            </>
          }
        />
      </div>
    </div>
  )
}

/* ================================================================== */
/*  10 · FEES — 10 DA per SMS, billed only on delivered parcels        */
/* ================================================================== */
function PricingSection() {
  // Counts 0 → 10 each time the slide mounts (it remounts per language pass).
  const price = useCountUp(10, 1600)
  const smsTypes = [
    { icon: Bell, en: "Order confirmed", ar: "تأكيد الطلب" },
    { icon: Truck, en: "Out for delivery", ar: "خرج للتوصيل" },
    { icon: PackageCheck, en: "Delivered", ar: "تمّ التسليم" },
    { icon: Target, en: "Retargeting", ar: "إعادة استهداف" },
  ]
  const reassure = [
    { icon: Send, en: "Pay only for what you send", ar: "ادفع فقط لما ترسله" },
    { icon: ShieldCheck, en: "No delivery, no charge", ar: "بدون تسليم، بدون رسوم" },
    { icon: Wallet, en: "No monthly subscription", ar: "بدون اشتراك شهري" },
  ]
  return (
    <div className="animate-fade-in-up flex w-full max-w-6xl flex-col items-center gap-9 text-center">
      <Eyebrow>
        <T en="Simple, honest pricing" ar="تسعير بسيط وصادق" />
      </Eyebrow>

      <h2 className="text-balance text-5xl font-extrabold text-ink lg:text-6xl">
        <Typewriter
          en="You only pay for delivered parcels."
          ar="تدفع فقط عن الطرود المُسلَّمة."
          accentEn="delivered parcels."
          accentAr="الطرود المُسلَّمة."
        />
      </h2>

      {/* The price medallion — the whole point of the slide */}
      <div className="relative mt-3">
        {/* Soft glow behind the card */}
        <div className="animate-pulse-glow absolute -inset-6 -z-10 rounded-[3.5rem] bg-[#6366f1]/25 blur-3xl" />
        {/* Ribbon sits above the card edge, outside the clipped sheen */}
        <span className="absolute -top-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#6366f1] to-[#a5b4fc] px-6 py-2 text-lg font-extrabold uppercase tracking-wide text-white shadow-[0_10px_28px_-10px_rgba(99,102,241,0.9)]">
          <Sparkles className="h-4 w-4" />
          <T en="Pay as you go" ar="الدفع حسب الاستخدام" />
        </span>

        <div className="sheen glass-strong neon-border animate-neon-pulse hover-glow rounded-[2.75rem] px-14 pb-11 pt-14 lg:px-20">
          <p className="text-xl font-semibold uppercase tracking-[0.32em] text-accent-ink">
            <T en="Only" ar="فقط" />
          </p>
          <div className="mt-1 flex items-end justify-center gap-4" dir="ltr">
            <span className="text-gradient text-[9rem] font-extrabold leading-[0.82] lg:text-[11rem]">
              {Math.round(price)}
            </span>
            <span className="mb-5 text-5xl font-extrabold text-ink lg:text-6xl">
              <T en="DA" ar="دج" />
            </span>
          </div>
          {/* per SMS — the unit — charged only on delivered parcels */}
          <p className="mt-1 text-3xl font-extrabold text-accent-ink lg:text-4xl">
            <T en="per SMS" ar="لكل رسالة" />
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2.5 rounded-full bg-[#6366f1]/15 px-6 py-2.5 text-2xl font-bold text-ink ring-1 ring-[#6366f1]/40">
              <PackageCheck className="h-6 w-6 text-accent-ink" />
              <T en="per delivered parcel" ar="لكل طرد مُسلَّم" />
            </span>
          </div>
        </div>
      </div>

      {/* The SMS you can automate — each one is 10 DA, only when delivered */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {smsTypes.map((s, i) => (
          <span
            key={i}
            className="animate-fade-in-up inline-flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-ink/[0.03] px-5 py-2.5 text-lg font-semibold text-ink/75"
            style={{ animationDelay: `${0.15 + i * 0.1}s` }}
          >
            <s.icon className="h-5 w-5 text-accent-ink" />
            <T en={s.en} ar={s.ar} />
          </span>
        ))}
      </div>

      {/* Reassurance row */}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xl font-semibold text-ink/55">
        {reassure.map((r, i) => (
          <span key={i} className="flex items-center gap-2">
            <r.icon className="h-6 w-6 text-accent-ink" />
            <T en={r.en} ar={r.ar} />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  11 · TESTIMONIALS                                                  */
/* ================================================================== */
function TestimonialsSection() {
  const reviews = [
    {
      quote: {
        en: "Colitrack transformed how we handle order communications. Customer satisfaction is up 45% since we switched on SMS automation.",
        ar: "غيّر كولي تراك طريقة تعاملنا مع مراسلات الطلبات. ارتفع رضا الزبائن بنسبة 45% منذ أن فعّلنا أتمتة SMS.",
      },
      name: { en: "Walid", ar: "وليد" },
      role: { en: "E-commerce Manager · GRIFA SHOP", ar: "مدير التجارة الإلكترونية · GRIFA SHOP" },
    },
    {
      quote: {
        en: "The automated tracking updates cut our support workload. It's like having an extra team member handling every shipping message.",
        ar: "قلّصت تحديثات التتبّع الآلية عبء الدعم لدينا. الأمر أشبه بعضو فريق إضافي يتولّى كل رسالة شحن.",
      },
      name: { en: "Salah Eddine", ar: "صلاح الدين" },
      role: { en: "Manager · SABY ANGE", ar: "مدير · SABY ANGE" },
    },
    {
      quote: {
        en: "As a small business, Colitrack was a game-changer. Tracking links and automated SMS gave us an enterprise-level experience.",
        ar: "كمشروع صغير، كان كولي تراك نقلة نوعية. منحتنا روابط التتبّع ورسائل SMS الآلية تجربة بمستوى الشركات الكبرى.",
      },
      name: { en: "Ben Youcef", ar: "بن يوسف" },
      role: { en: "Founder · BRUSH MASTER", ar: "مؤسّس · BRUSH MASTER" },
    },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>
            <T en="Loved by stores" ar="محبوب من المتاجر" />
          </Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          <Typewriter
            en="Trusted by growing e-commerce brands."
            ar="موثوق من علامات التجارة الإلكترونية النامية."
            accentEn="e-commerce brands."
            accentAr="التجارة الإلكترونية النامية."
          />
        </h2>
      </div>
      <div className="grid gap-7 md:grid-cols-3">
        {reviews.map((r, i) => (
          <div key={i} className="glass-strong hover-glow animate-fade-in-up flex flex-col gap-6 rounded-3xl p-9" style={{ animationDelay: `${i * 0.13}s` }}>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-7 w-7 fill-accent-ink text-accent-ink" />
              ))}
            </div>
            <p className="flex-1 text-2xl leading-relaxed text-ink/85">
              “<T en={r.quote.en} ar={r.quote.ar} />”
            </p>
            <div className="flex items-center gap-4 border-t border-ink/10 pt-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] text-2xl font-extrabold text-white">
                {r.name.en.charAt(0)}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ink">
                  <T en={r.name.en} ar={r.name.ar} />
                </p>
                <p className="text-lg text-ink/50">
                  <T en={r.role.en} ar={r.role.ar} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  12 · SPECIAL OFFER — Exel Expo 2026                                */
/* ================================================================== */
function SpecialOfferSection() {
  return (
    <div className="animate-fade-in-up w-full max-w-5xl text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow rounded-[40px] bg-gradient-to-r from-[#6366f1] via-[#a5b4fc] to-[#6366f1] opacity-40 blur-3xl" />
        <div className="glass-strong relative space-y-8 rounded-[40px] p-16 neon-border animate-neon-pulse">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 animate-float items-center justify-center rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] shadow-[0_16px_40px_-12px_rgba(99,102,241,0.9)]">
              <Gift className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="flex justify-center">
            <Eyebrow>
              <T en="ECSEL EXPO 2026 · 5th edition" ar="ECSEL EXPO 2026 · النسخة الخامسة" />
            </Eyebrow>
          </div>
          <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
            <Typewriter
              en="Get 1200 DA free today."
              ar="احصل على 1200 دج مجانًا اليوم."
              accentEn="1200 DA free"
              accentAr="1200 دج مجانًا"
            />
          </h2>
          <p className="text-3xl font-light text-ink/70">
            <T
              en="Visit our stand and start automating your SMS with this promo code:"
              ar="زُر جناحنا وابدأ أتمتة رسائلك مع رمز العرض هذا:"
            />
          </p>
          <div className="sheen inline-block rounded-2xl border-2 border-dashed border-[#6366f1]/60 bg-[#6366f1]/10 px-14 py-7">
            <p className="font-mono text-6xl font-extrabold tracking-[0.15em] text-ink lg:text-7xl">ECSEL2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  13 · CTA                                                           */
/* ================================================================== */
function CTASection() {
  return (
    <div className="animate-fade-in-up flex max-w-6xl flex-col items-center space-y-11 text-center">
      <Logo size="xl" localize />
      <h2 className="text-balance text-7xl font-bold leading-[1.06] tracking-[-0.02em] text-ink lg:text-8xl">
        <Typewriter
          en="Ready to transform your store?"
          ar="هل أنت جاهز لتحويل متجرك؟"
          accentEn="transform"
          accentAr="لتحويل"
          accentClassName="text-gradient accent-serif font-normal"
        />
      </h2>
      <p className="max-w-3xl text-balance text-3xl font-light text-ink/60">
        <T
          en="Join thousands of businesses automating their SMS & order tracking with Colitrack."
          ar="انضمّ إلى آلاف الأنشطة التي تُؤتمت رسائلها وتتبّع طلباتها مع كولي تراك."
        />
      </p>

      {/* Scan-to-visit: QR card beside the web address */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-11">
        <div className="relative">
          <div className="animate-pulse-glow absolute -inset-4 -z-10 rounded-[2.25rem] bg-[#6366f1]/25 blur-2xl" />
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] ring-1 ring-black/5">
            {/* Points to https://colitrack.io */}
            <img
              src="/colitrack-qr.png"
              alt="QR code — scan to visit colitrack.io"
              className="h-52 w-52 lg:h-60 lg:w-60"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:items-start">
          <span className="inline-flex items-center gap-2.5 text-xl font-semibold uppercase tracking-[0.22em] text-accent-ink">
            <QrCode className="h-6 w-6" />
            <T en="Scan to visit" ar="امسح للزيارة" />
          </span>
          <div className="glass-strong inline-flex items-center gap-4 rounded-full px-12 py-6 neon-border">
            <Globe className="h-10 w-10 text-accent-ink" />
            <p className="text-5xl font-bold tracking-tight text-gradient lg:text-6xl">colitrack.io</p>
          </div>
          <span className="text-xl text-ink/55">
            <T en="Point your camera to get started" ar="وجّه كاميرتك للبدء" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5 text-xl font-medium text-ink/55 lg:text-2xl">
        <span className="flex items-center gap-2.5"><Play className="h-5 w-5 fill-accent-ink text-accent-ink" /> <T en="Try the live demo" ar="جرّب العرض المباشر" /></span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span><T en="Built for Algeria 🇩🇿" ar="مصمّم للجزائر 🇩🇿" /></span>
      </div>
    </div>
  )
}
