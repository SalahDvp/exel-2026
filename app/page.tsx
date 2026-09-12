"use client"

import { useEffect, useRef, useState } from "react"
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
  Globe,
  Play,
  Wifi,
  BatteryFull,
  SignalHigh,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Section schedule (auto-advancing kiosk loop)                       */
/* ------------------------------------------------------------------ */
const sections: { id: string; component: () => JSX.Element; duration: number }[] = [
  { id: "intro", component: IntroSection, duration: 10000 },
  { id: "about", component: AboutSection, duration: 9500 },
  { id: "video", component: VideoSection, duration: 23000 },
  { id: "how", component: HowItWorksSection, duration: 12500 },
  { id: "dashboard", component: DashboardSection, duration: 15000 },
  { id: "numbers", component: KeyNumbersSection, duration: 10500 },
  { id: "features", component: FeaturesSection, duration: 12500 },
  { id: "results", component: ResultsSection, duration: 11500 },
  { id: "partners", component: PartnersSection, duration: 9000 },
  { id: "pricing", component: PricingSection, duration: 12500 },
  { id: "testimonials", component: TestimonialsSection, duration: 12000 },
  { id: "offer", component: SpecialOfferSection, duration: 9500 },
  { id: "cta", component: CTASection, duration: 8500 },
]

export default function ExhibitionScreen() {
  const [currentSection, setCurrentSection] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [themeLocked, setThemeLocked] = useState(false)

  // Optional kiosk config: ?s=<index> opens a slide, ?auto=0 holds it,
  // ?theme=light|dark locks a theme, ?theme=auto alternates each loop.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = parseInt(params.get("s") || "", 10)
    if (!Number.isNaN(s)) setCurrentSection(((s % sections.length) + sections.length) % sections.length)
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
        setCurrentSection((prev) => (prev - 1 + sections.length) % sections.length)
      } else if (e.key === "ArrowRight") {
        setCurrentSection((prev) => (prev + 1) % sections.length)
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

  useEffect(() => {
    if (!autoplay) return
    const timeout = setTimeout(() => {
      const next = (currentSection + 1) % sections.length
      // Alternate dark / bright each full loop unless the user locked a theme.
      if (next === 0 && !themeLocked) setTheme((x) => (x === "dark" ? "light" : "dark"))
      setCurrentSection(next)
    }, sections[currentSection].duration)
    return () => clearTimeout(timeout)
  }, [currentSection, autoplay, themeLocked])

  const CurrentComponent = sections[currentSection].component

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
      <div className="relative z-10 flex min-h-screen items-center justify-center px-10 lg:px-20">
        <CurrentComponent key={currentSection} />
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
    </div>
  )
}

/* ================================================================== */
/*  BRAND LOGO — faithful reproduction of the colitrack.io mark        */
/* ================================================================== */
function Logo({ size = "md" }: { size?: "md" | "xl" }) {
  const mark = size === "xl" ? "h-24 w-24 rounded-3xl text-6xl" : "h-14 w-14 rounded-2xl text-3xl"
  const word = size === "xl" ? "text-7xl" : "text-4xl"
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-4">
        <div
          className={`flex ${mark} items-center justify-center font-extrabold text-white shadow-[0_10px_28px_-10px_rgba(99,102,241,0.9)]`}
          style={{ background: "linear-gradient(135deg, #6366f1, #a5b4fc)" }}
        >
          C
        </div>
        <div className="flex flex-col">
          <span className={`wordmark font-extrabold leading-none tracking-tight ${word}`}>
            Colitrack<span style={{ color: "#6366f1", WebkitTextFillColor: "#6366f1" }}>.</span>
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
    <div className="glass-strong flex items-center gap-4 rounded-2xl px-6 py-3.5 neon-border animate-neon-pulse">
      <div className="flex flex-col items-end leading-tight">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-ink">Live at</span>
        <span className="text-2xl font-extrabold text-ink">Exel Expo 2026</span>
      </div>
      <span className="text-3xl" role="img" aria-label="Algeria">🇩🇿</span>
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

/* ================================================================== */
/*  1 · INTRO                                                          */
/* ================================================================== */
function IntroSection() {
  return (
    <div className="animate-fade-in-up flex max-w-6xl flex-col items-center space-y-11 text-center">
      <Logo size="xl" />

      <div className="space-y-8">
        <h1 className="max-w-5xl text-balance text-6xl font-bold leading-[1.06] tracking-[-0.02em] text-ink lg:text-7xl xl:text-[5.25rem]">
          Transform your e-commerce with{" "}
          <span className="text-gradient accent-serif font-normal">Smart SMS Solutions</span>
        </h1>

        <p className="mx-auto max-w-3xl text-balance text-3xl font-light leading-snug text-ink/60 lg:text-[2.1rem]">
          Real-time notifications, happier customers, and fully automated parcel tracking.
        </p>
      </div>

      <div className="mt-2 flex items-center gap-6 text-xl font-medium text-ink/55 lg:text-2xl">
        <span className="flex items-center gap-2.5">
          <MapPin className="h-6 w-6 text-accent-ink" /> Real-time tracking
        </span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span>SMS on every step</span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span>Built for Algeria 🇩🇿</span>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  2 · ABOUT / WHAT WE DO                                             */
/* ================================================================== */
function AboutSection() {
  const items = [
    { icon: Bell, title: "Automatic SMS at every step", body: "Order confirmed, out-for-delivery, delivered — sent in real time, on autopilot." },
    { icon: MapPin, title: "Live tracking across 58 wilayas", body: "Every parcel followed from pickup to the customer's door, nationwide." },
    { icon: Target, title: "Retargeting that recovers orders", body: "Re-engage no-answer customers automatically and win the sale back." },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>Smart SMS Automation</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Every parcel, <span className="text-gradient accent-serif">tracked &amp; notified.</span>
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
            <h3 className="text-3xl font-extrabold text-ink">{it.title}</h3>
            <p className="text-2xl leading-relaxed text-ink/65">{it.body}</p>
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

  // Muted-autoplay nudge for kiosk browsers.
  const nudgePlay = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    const send = (func: string) =>
      win.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*")
    let n = 0
    const id = setInterval(() => {
      send("mute")
      send("playVideo")
      if (++n >= 6) clearInterval(id)
    }, 700)
  }

  return (
    <div className="animate-fade-in-up grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-8">
        <Eyebrow>Watch it work</Eyebrow>
        <h2 className="text-balance text-6xl font-extrabold leading-[1.05] text-ink lg:text-7xl">
          See Colitrack <span className="text-gradient accent-serif">in action.</span>
        </h2>
        <p className="text-balance text-2xl leading-relaxed text-ink/65 lg:text-3xl">
          A quick look at how every parcel turns into a tracked, notified, and recovered order — fully on autopilot.
        </p>
        <div className="space-y-4">
          {[
            "Automatic SMS at every delivery step",
            "Live parcel tracking across all 58 wilayas",
            "Retargeting that recovers no-answer orders",
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-accent-ink" />
              <span className="text-2xl font-medium text-ink/85">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phone mockup showing the demo inside the Colitrack app */}
      <div className="flex justify-center">
        <PhoneMockup iframeRef={iframeRef} onVideoLoad={nudgePlay} />
      </div>
    </div>
  )
}

function PhoneMockup({
  iframeRef,
  onVideoLoad,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement>
  onVideoLoad: () => void
}) {
  return (
    <div className="relative" style={{ width: 356 }}>
      {/* Glow */}
      <div className="animate-pulse-glow absolute -inset-8 rounded-[70px] bg-[#6366f1]/25 blur-3xl" />

      {/* Side buttons */}
      <div className="absolute -left-1 top-40 h-16 w-1 rounded-l bg-[#2a2f42]" />
      <div className="absolute -left-1 top-60 h-24 w-1 rounded-l bg-[#2a2f42]" />
      <div className="absolute -right-1 top-52 h-28 w-1 rounded-r bg-[#2a2f42]" />

      {/* Device body */}
      <div
        className="relative rounded-[52px] p-[14px] shadow-[0_40px_90px_-30px_rgba(20,24,60,0.85)]"
        style={{ background: "linear-gradient(160deg,#232838,#0c0e16)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#0a0d16]" style={{ aspectRatio: "9 / 18.2" }}>
          {/* Dynamic island */}
          <div className="absolute left-1/2 top-3 z-30 h-8 w-28 -translate-x-1/2 rounded-full bg-black" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-4 pb-1 text-white">
            <span className="text-sm font-bold">9:41</span>
            <div className="flex items-center gap-1.5">
              <SignalHigh className="h-4 w-4" />
              <Wifi className="h-4 w-4" />
              <BatteryFull className="h-4 w-4" />
            </div>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #a5b4fc)" }}
              >
                C
              </div>
              <span className="text-base font-extrabold text-white">Colitrack</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
            </div>
          </div>

          {/* The demo video (16:9 fits the phone width) */}
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <iframe
              ref={iframeRef}
              onLoad={onVideoLoad}
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/82vgT6ypObw?autoplay=1&mute=1&loop=1&playlist=82vgT6ypObw&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1"
              title="Colitrack in action"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Live SMS / tracking feed */}
          <div className="space-y-3 px-4 py-4">
            <p className="px-1 text-xs font-bold uppercase tracking-widest text-white/40">Live activity</p>

            <div className="flex items-start gap-3 rounded-2xl bg-white/[0.05] p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#6366f1]/20">
                <Truck className="h-5 w-5 text-[#a5b4fc]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-snug text-white">
                  Parcel CT-90412 is out for delivery 🚚
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">Alger · SMS sent to customer · 14:02</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white/[0.05] p-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-snug text-white">Order delivered ✓ — confirmation sent</p>
                <p className="mt-0.5 text-[11px] text-white/45">Oran · Return risk avoided · 13:47</p>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] p-3">
              <p className="text-[13px] font-semibold leading-snug text-white">
                🎯 Retargeting re-engaged 214 no-answer customers
              </p>
            </div>
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2.5 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-white/40" />
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
    { n: "01", icon: Plug, title: "Connect your shipping company", body: "Link Yalidine, Noest, ZR Express or Maystro in one click. Your parcels sync automatically." },
    { n: "02", icon: MessageSquare, title: "Activate the SMS you want", body: "Order confirmation, out-for-delivery, delivered, and retargeting for no-answers." },
    { n: "03", icon: Zap, title: "We handle everything", body: "Colitrack sends the right SMS at the right moment, in real time. You just watch it work." },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-14">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>How it works</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Set it up once. <span className="text-gradient accent-serif">We handle the rest.</span>
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
              <h3 className="text-3xl font-extrabold text-ink">{s.title}</h3>
              <p className="text-2xl leading-relaxed text-ink/65">{s.body}</p>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="absolute -right-6 top-1/2 hidden h-10 w-10 -translate-y-1/2 text-[#6366f1]/60 md:block" />
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
    { icon: Package, label: "Parcels tracked · 30d", value: "12,480", delta: "+18%", up: true },
    { icon: BadgeCheck, label: "Delivery rate", value: "94.2%", delta: "+3.1%", up: true },
    { icon: Send, label: "SMS delivered", value: "38,912", delta: "+22%", up: true },
    { icon: RotateCcw, label: "Return rate", value: "5.8%", delta: "-2.4%", up: false },
  ]
  const speed = [
    { day: "Day 1", pct: 70, note: "Same / next-day" },
    { day: "Day 2", pct: 20, note: "Second attempt" },
    { day: "Day 3", pct: 10, note: "Final window" },
  ]
  const wilayas = [
    { name: "Alger", n: 3120, pct: 100 },
    { name: "Oran", n: 2560, pct: 82 },
    { name: "Constantine", n: 1990, pct: 64 },
    { name: "Blida", n: 1585, pct: 51 },
    { name: "Sétif", n: 1340, pct: 43 },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-[1500px] space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Eyebrow>Peek inside — it&apos;s live</Eyebrow>
        <h2 className="text-balance text-5xl font-extrabold text-ink lg:text-6xl">
          The whole delivery, <span className="text-gradient accent-serif">on one screen.</span>
        </h2>
      </div>

      {/* App window */}
      <div className="glass-strong overflow-hidden rounded-3xl neon-border">
        {/* Chrome bar */}
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink/[0.03] px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ff5f57]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#febc2e]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xl font-semibold text-ink/55">app.colitrack.com · Demo Store</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full bg-emerald-400/10 px-4 py-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
            <span className="text-lg font-bold uppercase tracking-widest text-[var(--pos-text)]">Live</span>
          </div>
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_1fr]">
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-5">
            {kpis.map((k, i) => (
              <div key={i} className="animate-fade-in-up rounded-2xl border border-ink/10 bg-ink/[0.03] p-6" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                    <k.icon className="h-6 w-6 text-accent-ink" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-lg font-bold text-[var(--pos-text)]">
                    {k.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {k.delta}
                  </span>
                </div>
                <p className="mt-4 text-5xl font-extrabold text-ink">{k.value}</p>
                <p className="mt-1 text-xl text-ink/55">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Delivery speed */}
            <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-6">
              <p className="text-xl font-bold text-ink">Delivery speed</p>
              <p className="mb-4 text-lg text-ink/45">Last 30 days · 12,480 parcels</p>
              <div className="space-y-4">
                {speed.map((s, i) => (
                  <div key={i}>
                    <div className="mb-1.5 flex justify-between text-lg">
                      <span className="font-semibold text-ink/80">{s.day} · {s.note}</span>
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
            <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-6">
              <p className="mb-4 text-xl font-bold text-ink">Top wilayas</p>
              <div className="space-y-3">
                {wilayas.map((w, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-28 text-lg font-semibold text-ink/80">{w.name}</span>
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
        <div className="flex items-center gap-3 border-t border-ink/10 bg-[#6366f1]/[0.06] px-8 py-4">
          <span className="h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400" style={{ animation: "live-ping 2s infinite" }} />
          <span className="text-xl font-medium text-ink/75">
            Parcel <span className="font-bold text-accent-ink">CT-90412</span> delivered — Alger · confirmation SMS sent &nbsp;·&nbsp; Retargeting re-engaged <span className="font-bold text-accent-ink">214</span> no-answer customers this week
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
          <Eyebrow>Live SMS activity</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Numbers that keep <span className="text-gradient accent-serif">moving.</span>
        </h2>
        <p className="text-2xl text-ink/55">Created by online sellers, for online sellers.</p>
      </div>
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <StatCard icon={Send} value={11257} suffix="+" label="SMS sent today" live highlight={false} />
        <StatCard icon={MessageSquare} value={5} suffix="M+" label="Total SMS sent" highlight />
        <StatCard icon={ShieldCheck} value={100} suffix="%" label="SMS delivery rate" />
        <StatCard icon={Users} value={2000} suffix="+" label="Partner stores" />
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
  label: string
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
    { icon: Link2, title: "Auto Tracking Link", body: "An automated tracking link so customers monitor delivery status right from their phone." },
    { icon: Bell, title: "Personalized SMS", body: "Tailored alerts with order details, shipping updates and delivery schedules." },
    { icon: Megaphone, title: "SMS Retargeting", body: "Re-engage no-answer and abandoned-cart customers with timely, targeted campaigns." },
    { icon: BadgeCheck, title: "Custom Sender ID", body: "Send with your brand's name so customers instantly recognise every message." },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>Advanced features</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Everything you need to <span className="text-gradient accent-serif">scale.</span>
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
              <h3 className="text-3xl font-extrabold text-ink">{f.title}</h3>
              <p className="text-2xl leading-relaxed text-ink/65">{f.body}</p>
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
    { before: "High volume of inquiries", after: "50% fewer inquiries", problem: "Lack of real-time updates", solution: "Automated SMS order-status alerts", icon: MessageSquare },
    { before: "Losing monthly customers", after: "+30% customer retention", problem: "Low customer retention", solution: "SMS retargeting campaigns", icon: Target },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>Real results</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          From a problem to <span className="text-gradient accent-serif">a fix.</span>
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {cases.map((c, i) => (
          <div key={i} className="glass-strong animate-fade-in-up space-y-7 rounded-3xl p-10" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-rose-500/10 px-4 py-2 text-xl font-semibold text-[var(--neg-text)] line-through decoration-rose-400/60">
                {c.before}
              </span>
              <ArrowRight className="h-7 w-7 text-ink/40" />
              <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-xl font-extrabold text-[var(--pos-text)]">
                {c.after}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                <c.icon className="h-8 w-8 text-accent-ink" />
              </div>
              <div>
                <p className="text-lg uppercase tracking-widest text-ink/40">The problem</p>
                <p className="text-2xl font-bold text-ink">{c.problem}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#6366f1]/30 bg-[#6366f1]/[0.08] p-6">
              <p className="text-lg uppercase tracking-widest text-accent-ink">Our solution</p>
              <p className="text-2xl font-extrabold text-ink">{c.solution}</p>
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
  const partners = ["Yalidine", "Noest", "ZR Express", "Maystro", "DHD", "Anderson", "EcoManager"]
  const row = [...partners, ...partners]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12 text-center">
      <div className="space-y-5">
        <div className="flex justify-center">
          <Eyebrow>Trusted integrations</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Connects with every <span className="text-gradient accent-serif">delivery company.</span>
        </h2>
        <p className="text-2xl text-ink/55">One click to sync your parcels — no dashboards to babysit.</p>
      </div>

      <div className="relative overflow-hidden py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[var(--page-base)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[var(--page-base)] to-transparent" />
        <div className="animate-marquee flex w-max gap-8">
          {row.map((p, i) => (
            <div key={i} className="glass-strong flex min-w-[280px] items-center gap-5 rounded-2xl px-10 py-8 neon-border">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366f1]/15 ring-1 ring-[#6366f1]/40">
                <Truck className="h-7 w-7 text-accent-ink" />
              </div>
              <span className="text-3xl font-extrabold text-ink">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-2xl font-semibold text-ink/60">
        <Users className="h-8 w-8 text-accent-ink" />
        Powering <span className="font-extrabold text-ink">2,000+</span> partner stores across Algeria
      </div>
    </div>
  )
}

/* ================================================================== */
/*  10 · PRICING                                                       */
/* ================================================================== */
function PricingSection() {
  const plans = [
    { name: "Starter", price: "$10.99", tokens: "2,400", popular: false, perks: ["SMS Notifications", "Real-time Tracking Link", "SMS Retargeting"] },
    { name: "Enterprise", price: "$100", tokens: "25,200", popular: true, perks: ["+5% Bonus Tokens FREE", "Custom Sender ID", "SMS Retargeting"] },
    { name: "Business", price: "$80", tokens: "19,200", popular: false, perks: ["SMS Notifications", "Custom Sender ID", "SMS Retargeting"] },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>Simple pricing</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Pay once. <span className="text-gradient accent-serif">Tokens never expire.</span>
        </h2>
      </div>
      <div className="grid items-center gap-7 md:grid-cols-3">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`animate-fade-in-up relative flex flex-col gap-6 rounded-3xl p-9 ${
              p.popular ? "neon-border animate-neon-pulse scale-[1.04]" : "glass-strong"
            }`}
            style={{
              animationDelay: `${i * 0.12}s`,
              background: p.popular ? "linear-gradient(165deg, rgba(99,102,241,0.22), rgba(99,102,241,0.06))" : undefined,
            }}
          >
            {p.popular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a5b4fc] px-5 py-1.5 text-lg font-extrabold uppercase tracking-wide text-white shadow-lg">
                Most Popular
              </span>
            )}
            <div>
              <p className="text-2xl font-bold text-ink/70">{p.name}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-6xl font-extrabold text-ink">{p.price}</span>
                <span className="text-xl text-ink/45">/ one-time</span>
              </p>
              <p className="mt-2 text-2xl font-bold text-accent-ink">{p.tokens} Tokens</p>
            </div>
            <div className="space-y-3">
              {p.perks.map((perk, j) => (
                <div key={j} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent-ink" />
                  <span className="text-xl font-medium text-ink/80">{perk}</span>
                </div>
              ))}
            </div>
            <div className={`mt-auto rounded-xl py-4 text-center text-xl font-extrabold ${p.popular ? "btn-pop" : "btn-solid"}`}>
              Get Started
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-10 text-xl font-semibold text-ink/55">
        <span className="flex items-center gap-2"><Wallet className="h-6 w-6 text-accent-ink" /> Instant token credit</span>
        <span className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-accent-ink" /> 99.9% uptime</span>
        <span className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-accent-ink" /> Tokens never expire</span>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  11 · TESTIMONIALS                                                  */
/* ================================================================== */
function TestimonialsSection() {
  const reviews = [
    { quote: "Colitrack transformed how we handle order communications. Customer satisfaction is up 45% since we switched on SMS automation.", name: "Walid", role: "E-commerce Manager · GRIFA SHOP" },
    { quote: "The automated tracking updates cut our support workload. It's like having an extra team member handling every shipping message.", name: "Salah Eddine", role: "Manager · SABY ANGE" },
    { quote: "As a small business, Colitrack was a game-changer. Tracking links and automated SMS gave us an enterprise-level experience.", name: "Ben Youcef", role: "Founder · BRUSH MASTER" },
  ]
  return (
    <div className="animate-fade-in-up w-full max-w-7xl space-y-12">
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <Eyebrow>Loved by stores</Eyebrow>
        </div>
        <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
          Trusted by growing <span className="text-gradient accent-serif">e-commerce brands.</span>
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
            <p className="flex-1 text-2xl leading-relaxed text-ink/85">“{r.quote}”</p>
            <div className="flex items-center gap-4 border-t border-ink/10 pt-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a5b4fc] text-2xl font-extrabold text-white">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ink">{r.name}</p>
                <p className="text-lg text-ink/50">{r.role}</p>
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
            <Eyebrow>Exel Expo 2026 exclusive</Eyebrow>
          </div>
          <h2 className="text-balance text-6xl font-extrabold text-ink lg:text-7xl">
            Get <span className="text-gradient accent-serif">1200 DA free</span> today.
          </h2>
          <p className="text-3xl font-light text-ink/70">Visit our stand and start automating your SMS with this promo code:</p>
          <div className="sheen inline-block rounded-2xl border-2 border-dashed border-[#6366f1]/60 bg-[#6366f1]/10 px-14 py-7">
            <p className="font-mono text-6xl font-extrabold tracking-[0.15em] text-ink lg:text-7xl">EXELEXPO2026</p>
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
      <Logo size="xl" />
      <h2 className="text-balance text-7xl font-bold leading-[1.06] tracking-[-0.02em] text-ink lg:text-8xl">
        Ready to <span className="text-gradient accent-serif font-normal">transform</span> your store?
      </h2>
      <p className="max-w-3xl text-balance text-3xl font-light text-ink/60">
        Join thousands of businesses automating their SMS &amp; order tracking with Colitrack.
      </p>
      <div className="glass-strong inline-flex items-center gap-5 rounded-full px-16 py-7 neon-border">
        <Globe className="h-11 w-11 text-accent-ink" />
        <p className="text-6xl font-bold tracking-tight text-gradient">colitrack.io</p>
      </div>
      <div className="flex items-center gap-5 text-xl font-medium text-ink/55 lg:text-2xl">
        <span className="flex items-center gap-2.5"><Play className="h-5 w-5 fill-accent-ink text-accent-ink" /> Try the live demo</span>
        <span className="h-1 w-1 rounded-full bg-ink/25" />
        <span>Built for Algeria 🇩🇿</span>
      </div>
    </div>
  )
}
