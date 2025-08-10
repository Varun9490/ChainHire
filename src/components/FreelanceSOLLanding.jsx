"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUp,
  Check,
  Coins,
  Menu,
  ShieldCheck,
  Wallet,
  Zap,
  Sparkles,
  Wand2,
  Send,
  Star,
  X,
  Lock,
  Clock,
  Landmark,
  Shield,
} from "lucide-react";
import ContractDraftingVisual from "@/components/ui/ContractDraftingVisual";

export default function FreelanceSOLLanding() {
  // App state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Refs for sections to track visibility
  const sectionRefs = {
    hero: useRef(null),
    features: useRef(null),
    escrow: useRef(null),
    pricing: useRef(null),
    faq: useRef(null),
  };

  // Simulate loading state
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Handle scroll events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowTop(window.scrollY > 400);

      const current = Object.entries(sectionRefs).find(([_, ref]) => {
        if (!ref.current) return false;
        const rect = ref.current.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (current) {
        setActiveSection(current[0]);
      }
    };

    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionRefs]);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Background parallax
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Helpers
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false);
    }
  }

  async function onSubscribe(e) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubscribed(true);
    setEmail("");
  }

  // Animated text reveal component
  function AnimatedText({ text, className }) {
    const words = text.split(" ");
    return (
      <div className={cn("inline-block", className)}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-1.5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ once: true }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  // ✅ FIX: Corrected Typewriter component
  function ReactbitsTypewriter() {
    const phrases = useMemo(
      () => ["Trustless", "Non-custodial", "Gas-efficient", "Escrow-first"],
      []
    );
    const longestPhrase = useMemo(
      () => [...phrases].sort((a, b) => b.length - a.length)[0],
      [phrases]
    );
    const [idx, setIdx] = useState(0);

    useEffect(() => {
      const i = setInterval(
        () => setIdx((p) => (p + 1) % phrases.length),
        2000
      );
      return () => clearInterval(i);
    }, [phrases.length]);

    return (
      <span className="relative inline-grid align-top h-12 md:h-16">
        {/* Ghost element to reserve space and prevent layout shift */}
        <span className="invisible whitespace-nowrap" aria-hidden="true">
          {longestPhrase}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phrases[idx]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 whitespace-nowrap"
          >
            {phrases[idx]}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  // Shimmer gradient border card component
  function AceternityShimmerCard(props) {
    return (
      <div
        className={cn(
          "relative rounded-2xl p-[1px] overflow-hidden group",
          props.className
        )}
      >
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(34,211,238,0.28),rgba(147,51,234,0.28),rgba(16,185,129,0.28),rgba(34,211,238,0.28))] animate-[spin_6s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative rounded-[15px] bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl h-full">
          {props.children}
        </div>
      </div>
    );
  }

  // 3D Tilt Card component
  function AceternityTiltCard(props) {
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 15;
      const rotateY = (centerX - e.clientX) / 15;
      setRotate({ x: rotateX, y: rotateY });
    };
    const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

    return (
      <motion.div
        className={cn("relative transition-all duration-200", props.className)}
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {props.children}
      </motion.div>
    );
  }

  // Reveal on scroll component
  function AceternityReveal(props) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const controls = useAnimation();
    const directions = {
      up: { y: 40, x: 0 },
      down: { y: -40, x: 0 },
      left: { x: 40, y: 0 },
      right: { x: -40, y: 0 },
    };
    const dir = props.direction || "up";

    useEffect(() => {
      if (isInView) {
        controls.start("visible");
      }
    }, [isInView, controls, dir]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, ...directions[dir] },
          visible: { opacity: 1, x: 0, y: 0 },
        }}
        transition={{
          duration: 0.7,
          delay: props.delay || 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={props.className}
      >
        {props.children}
      </motion.div>
    );
  }

  // Feature row checkmark component
  const FeatureRow = ({ text }) => (
    <div className="flex items-center gap-2 text-sm text-zinc-100">
      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
      <span>{text}</span>
    </div>
  );

  // Floating element component
  function FloatingElement(props) {
    return (
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: props.delay || 0,
        }}
        className={props.className}
      >
        {props.children}
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-zinc-100 font-sans">
      {/* Top scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 origin-left"
        style={{ scaleX: width }}
      />

      {/* Background parallax */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <motion.div
          className="absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            y: y1,
            background:
              "radial-gradient(closest-side, rgba(34,211,238,0.08), rgba(147,51,234,0.06), transparent 70%)",
          }}
        />
        <motion.div
          className="absolute top-1/4 right-[-20%] h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{
            y: y2,
            background:
              "radial-gradient(closest-side, rgba(16,185,129,0.08), rgba(34,211,238,0.05), transparent 70%)",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-10%] h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{
            y: y3,
            background:
              "radial-gradient(closest-side, rgba(147,51,234,0.08), rgba(16,185,129,0.05), transparent 70%)",
          }}
        />
      </motion.div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "backdrop-blur-xl bg-[#0A0A0C]/80 border-b border-zinc-800/80"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md grid place-items-center bg-gradient-to-br from-cyan-400 via-violet-400 to-emerald-400 text-zinc-950 font-bold">
                CH
              </div>
              <span className="text-xl font-semibold">ChainHire</span>
              <Badge
                variant="outline"
                className="ml-2 bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              >
                Built on Solana
              </Badge>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {["features", "escrow", "pricing", "faq"].map((section) => (
                <Button
                  key={section}
                  variant="ghost"
                  className={cn(
                    "text-shite transition-colors",
                    activeSection === section && "bg-zinc-800/60 text-white"
                  )}
                  onClick={() => scrollToId(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" passHref>
                <Button
                  variant="outline"
                  className="border-zinc-700 bg-transparent text-white transition-all duration-300"
                >
                  Login
                  <Wallet className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/post-job" passHref>
                <Button className="bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950 hover:opacity-90 transition-opacity duration-300">
                  Post a Job
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-zinc-800 bg-zinc-900"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((s) => !s)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-2 pb-4 border-t border-zinc-800">
                  {["features", "escrow", "pricing", "faq"].map((section) => (
                    <Button
                      key={section}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => scrollToId(section)}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </Button>
                  ))}
                  <div className="pt-2 flex gap-2">
                    <Link href="/login" passHref className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-zinc-700 bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/post-job" passHref className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950">
                        Post a Job
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section ref={sectionRefs.hero} id="hero" className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 md:pt-24 pb-20 md:pb-28">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  On-chain escrow. Instant payouts. Low fees.
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight"
                >
                  <ReactbitsTypewriter /> freelancing on{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400">
                    Solana
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-4 text-zinc-300 md:text-lg"
                >
                  ChainHire is a next-gen marketplace for freelancers and
                  clients. Funds are locked in non-custodial Solana escrows and
                  released on milestones—no middlemen, just code and trust.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="mt-6 flex flex-col sm:flex-row gap-3"
                >
                  <Button
                    size="lg"
                    className="h-11 px-6 bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950 hover:opacity-90 transition-opacity duration-300"
                    onClick={() => scrollToId("features")}
                  >
                    Explore features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 px-6 bg-transparent border-zinc-700 text-white transition-all duration-300"
                    onClick={() => scrollToId("escrow")}
                  >
                    See escrow flow
                  </Button>
                </motion.div>

                <div className="mt-8 flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex -space-x-2">
                    <Avatar className="h-7 w-7 border-2 border-zinc-900">
                      <AvatarImage src="https://i.pravatar.cc/40?u=a" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-7 w-7 border-2 border-zinc-900">
                      <AvatarImage src="https://i.pravatar.cc/40?u=b" />
                      <AvatarFallback>L</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-7 w-7 border-2 border-zinc-900">
                      <AvatarImage src="https://i.pravatar.cc/40?u=c" />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>10k+ creators building on-chain businesses</div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative hidden md:block"
              >
                <AceternityTiltCard>
                  <AceternityShimmerCard>
                    <div className="p-4 md:p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">New Contract</h3>
                        <Badge
                          variant="outline"
                          className="border-violet-500/30 bg-violet-500/15 text-violet-300"
                        >
                          Milestone
                        </Badge>
                      </div>
                      {/* ✅ FIX: Correctly using conditional rendering */}
                      {loading && <Skeleton className="h-24 w-full" />}
                      {!loading && (
                        <div className="h-32 w-full ">
                          <ContractDraftingVisual />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3 bg-zinc-900/60 border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-cyan-300" />
                            <div className="text-sm font-medium text-white">
                              Low fees
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            Solana speed with cents-level fees.
                          </div>
                        </Card>
                        <Card className="p-3 bg-zinc-900/60 border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-violet-300" />
                            <div className="text-sm font-medium text-white">
                              Milestones
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            Release per deliverable, not promises.
                          </div>
                        </Card>
                      </div>
                    </div>
                  </AceternityShimmerCard>
                </AceternityTiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The rest of the component remains the same... */}

        {/* Logo marquee */}
        <div className="border-y border-zinc-800 bg-[#0A0A0C]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="text-xs text-zinc-400 mb-4 text-center md:text-left">
              BACKED BY THE BEST IN THE SOLANA ECOSYSTEM
            </div>
            <div className="relative overflow-hidden">
              <div className="flex gap-12 animate-[marquee_30s_linear_infinite]">
                {[
                  "Anchor",
                  "Metaplex",
                  "Phantom",
                  "Helius",
                  "Jito",
                  "SolanaFM",
                  "Marinade",
                ]
                  .flatMap((item) => [item, item])
                  .map((logo, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 flex items-center gap-3 text-zinc-300"
                    >
                      <Shield className="h-6 w-6 text-zinc-500" />
                      <span className="text-lg font-medium tracking-wide">
                        {logo}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-transparent to-[#0A0A0C]"></div>
            </div>
          </div>
        </div>

        {/* Features (Bento grid) */}
        <section
          ref={sectionRefs.features}
          id="features"
          className="mx-auto max-w-6xl px-4 py-20 md:py-28"
        >
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Capabilities
            </Badge>
            <AnimatedText
              text="Everything you need for on-chain freelancing"
              className="mt-3 block text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[conic-gradient(at_30%_50%,#22d3ee,#9333ea,#10b981,#22d3ee)]"
            />
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              A beautiful, secure workflow with robust features and delightful
              micro-interactions designed for the modern freelancer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Non-custodial Escrow",
                desc: "Funds locked in Solana programs that only you and your client control. Release payments by milestone.",
                icon: <ShieldCheck className="h-6 w-6" />,
                accent:
                  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                colSpan: "lg:col-span-2",
              },
              {
                title: "Instant Payouts",
                desc: "SOL/USDC paid direct to your wallet with sub-second finality. No more waiting days for bank transfers.",
                icon: <Coins className="h-6 w-6" />,
                accent: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
              },
              {
                title: "Wallet-native Identity",
                desc: "Phantom, Solflare, and Ledger support out of the box. Your wallet is your account.",
                icon: <Wallet className="h-6 w-6" />,
                accent: "bg-violet-500/15 text-violet-300 border-violet-500/30",
              },
              {
                title: "Dispute Resolution",
                desc: "Built-in tooling to pause, request partial release, or engage DAO-assisted resolution when needed.",
                icon: <Landmark className="h-6 w-6" />,
                accent: "bg-amber-500/15 text-amber-300 border-amber-500/30",
                colSpan: "lg:col-span-2",
              },
            ].map((f, i) => (
              <AceternityReveal
                key={f.title}
                delay={i * 0.1}
                direction={i % 2 === 0 ? "left" : "right"}
                className={cn("h-full", f.colSpan)}
              >
                <AceternityShimmerCard className="h-full hover:scale-[1.02] transition-transform duration-300">
                  <div className="p-6 h-full flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-lg grid place-items-center border shadow-inner shrink-0",
                          f.accent
                        )}
                      >
                        {f.icon}
                      </div>
                      <h3 className="font-semibold text-lg text-zinc-100 tracking-tight">
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400 flex-1">
                      {f.desc}
                    </p>
                  </div>
                </AceternityShimmerCard>
              </AceternityReveal>
            ))}
          </div>
        </section>

        {/* Escrow flow */}
        <section
          ref={sectionRefs.escrow}
          id="escrow"
          className="bg-zinc-950/30 border-y border-zinc-800"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Escrow Flow
              </Badge>
              <AnimatedText
                text="How It Works"
                className="mt-3 block text-3xl md:text-5xl font-extrabold tracking-tight"
              />
              <p className="mt-4 text-zinc-400">
                From hello to payout—a simple, transparent, and secure process
                for both sides.
              </p>
            </div>

            <div className="relative grid md:grid-cols-3 gap-6">
              <div
                className="absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-zinc-700 to-transparent hidden md:block"
                aria-hidden="true"
              />
              {[
                {
                  step: "1",
                  title: "Create Escrow",
                  copy: "Client funds the escrow with SOL/USDC. The contract terms are immutably stored on-chain.",
                  icon: <Lock className="h-5 w-5 text-cyan-300" />,
                },
                {
                  step: "2",
                  title: "Ship Milestones",
                  copy: "Freelancer delivers work. Each milestone is reviewed and approved by the client via a simple transaction.",
                  icon: <Clock className="h-5 w-5 text-violet-300" />,
                },
                {
                  step: "3",
                  title: "Release Funds",
                  copy: "Upon approval, funds for the milestone are released trustlessly and instantly to the freelancer's wallet.",
                  icon: <Send className="h-5 w-5 text-emerald-300" />,
                },
              ].map((s, i) => (
                <AceternityReveal
                  key={s.step}
                  delay={i * 0.15}
                  direction="up"
                  className="z-10"
                >
                  <FloatingElement delay={i * 0.5}>
                    <Card className="p-6 h-full bg-zinc-900/80 border-zinc-800 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full grid place-items-center bg-zinc-800/80 border border-zinc-700 text-cyan-300 font-bold text-lg">
                          {s.step}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {s.title}
                        </h3>
                      </div>
                      <p className="mt-4 text-sm text-zinc-400">{s.copy}</p>
                    </Card>
                  </FloatingElement>
                </AceternityReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Social Proof
            </Badge>
            <AnimatedText
              text="Creators ship faster with ChainHire"
              className="mt-3 block text-3xl md:text-5xl font-extrabold tracking-tight"
            />
            <p className="mt-4 text-zinc-400">
              Designers, developers, and marketers moving money at Solana speed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Ava Park",
                role: "Brand Designer",
                quote:
                  "Milestone escrows make my process feel premium. I get paid on time, every time, and clients feel safe throughout the project.",
                avatarId: "ava-park",
              },
              {
                name: "Leo Ramirez",
                role: "Full-stack Dev",
                quote:
                  "The fees are negligible, and payouts hit my wallet instantly after approval. All the administrative overhead of chasing invoices is just... gone.",
                avatarId: "leo-ramirez",
              },
              {
                name: "Mina Chen",
                role: "Growth Marketer",
                quote:
                  "Having a clear, on-chain record of all payments and agreements keeps everything transparent. Forecasting my cash flow is finally simple.",
                avatarId: "mina-chen",
              },
            ].map((t, i) => (
              <AceternityReveal key={t.name} delay={i * 0.1} direction="up">
                <Card className="p-6 bg-zinc-900/60 border-zinc-800 backdrop-blur-sm h-full flex flex-col">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-zinc-700">
                      <AvatarImage
                        src={`https://i.pravatar.cc/48?u=${t.avatarId}`}
                        alt={t.name}
                      />
                      <AvatarFallback>
                        {t.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{t.name}</div>
                      <div className="text-xs text-zinc-400">{t.role}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300 flex-1">
                    “{t.quote}”
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </Card>
              </AceternityReveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section
          ref={sectionRefs.pricing}
          id="pricing"
          className="bg-zinc-950/30 border-y border-zinc-800"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <Badge
                variant="outline"
                className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
              >
                <Coins className="h-3.5 w-3.5 mr-1" />
                Pricing
              </Badge>
              <AnimatedText
                text="Start free. Scale on-chain."
                className="mt-3 block text-3xl md:text-5xl font-extrabold tracking-tight"
              />
              <p className="mt-4 text-zinc-400">
                Simple, transparent plans. You only pay for what you use. Solana
                network fees apply per transaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              <AceternityReveal delay={0.1} direction="up">
                <Card className="p-8 flex flex-col h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">Free</h3>
                  <p className="mt-2 text-4xl font-extrabold text-white">$0</p>
                  <p className="text-xs text-zinc-400">Forever</p>
                  <div className="mt-6 space-y-2 flex-1">
                    <FeatureRow text="Unlimited proposals" />
                    <FeatureRow text="Basic milestone escrow" />
                    <FeatureRow text="Standard invoicing" />
                  </div>
                  <Link href="/signup" passHref>
                    <Button className="mt-8 w-full" variant="outline">
                      Get started
                    </Button>
                  </Link>
                </Card>
              </AceternityReveal>

              <AceternityReveal delay={0.2} direction="up">
                <AceternityTiltCard className="h-full">
                  <AceternityShimmerCard className="h-full">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Pro</h3>
                        <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Popular
                        </Badge>
                      </div>
                      <p className="mt-2 text-4xl font-extrabold">$19</p>
                      <p className="text-xs text-zinc-400">per month</p>
                      <div className="mt-6 space-y-2 flex-1">
                        <FeatureRow text="Everything in Free, plus:" />
                        <FeatureRow text="Advanced escrows & milestones" />
                        <FeatureRow text="Automated payment reminders" />
                        <FeatureRow text="Priority support" />
                      </div>
                      <Button className="mt-8 w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950 hover:opacity-90 transition-opacity duration-300">
                        Upgrade
                      </Button>
                    </div>
                  </AceternityShimmerCard>
                </AceternityTiltCard>
              </AceternityReveal>

              <AceternityReveal delay={0.3} direction="up">
                <Card className="p-8 flex flex-col h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">Studio</h3>
                  <p className="mt-2 text-4xl font-extrabold text-white">$49</p>
                  <p className="text-xs text-zinc-400">per month</p>
                  <div className="mt-6 space-y-2 flex-1">
                    <FeatureRow text="Everything in Pro, plus:" />
                    <FeatureRow text="Team collaboration" />
                    <FeatureRow text="Custom roles & permissions" />
                    <FeatureRow text="Dedicated success manager" />
                  </div>
                  <Button className="mt-8 w-full" variant="outline">
                    Contact sales
                  </Button>
                </Card>
              </AceternityReveal>
            </div>
          </div>
        </section>

        {/* FAQ + Waitlist */}
        <section
          ref={sectionRefs.faq}
          id="faq"
          className="mx-auto max-w-4xl px-4 py-20 md:py-28"
        >
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="bg-zinc-800 text-zinc-300 border-zinc-700"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              FAQ
            </Badge>
            <AnimatedText
              text="Answers to your questions"
              className="mt-3 block text-3xl md:text-5xl font-extrabold tracking-tight"
            />
            <p className="mt-4 text-zinc-400">
              Can't find what you're looking for? Join our waitlist for updates.
            </p>
          </div>

          <AceternityReveal delay={0.1} direction="up">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="item-1"
                className="border-b border-zinc-800"
              >
                <AccordionTrigger className="hover:text-white transition-colors text-left">
                  How exactly does the non-custodial escrow work?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  Funds are deposited into a secure Solana smart contract
                  (program). The logic is transparent and auditable. Milestones
                  trigger releases based on on-chain approvals from the client.
                  Neither ChainHire nor any other third party can unilaterally
                  access or control the funds.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="border-b border-zinc-800"
              >
                <AccordionTrigger className="hover:text-white transition-colors text-left">
                  Which wallets and currencies are supported?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  We support all major Solana wallets via the Wallet Adapter
                  standard, including Phantom, Solflare, and Ledger. Payments
                  can be made in SOL and major stablecoins like USDC.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-zinc-800">
                <AccordionTrigger className="hover:text-white transition-colors text-left">
                  What are the total fees involved?
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  ChainHire charges a small platform fee on successful milestone
                  releases, which is detailed on our pricing plans.
                  Additionally, each transaction (like creating or releasing
                  from escrow) incurs a standard Solana network fee, which is
                  typically a fraction of a cent.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AceternityReveal>

          <AceternityReveal delay={0.2} direction="up">
            <div className="mt-12">
              <Card className="p-6 md:p-8 bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
                <div className="md:flex items-center justify-between gap-6">
                  <div className="max-w-xl">
                    <h3 className="font-semibold inline-flex items-center gap-2 text-zinc-200 text-lg">
                      <Send className="h-5 w-5 text-cyan-300" />
                      Join the Waitlist
                    </h3>
                    <p className="mt-1 text-zinc-400">
                      Get product updates, early access to new features, and be
                      the first to know when we launch.
                    </p>
                  </div>
                  <form
                    onSubmit={onSubscribe}
                    className="mt-4 md:mt-0 w-full md:max-w-sm"
                  >
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="you@studio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-zinc-950 border-zinc-800 h-11 focus:border-cyan-500/50 transition-colors"
                      />
                      <Button
                        type="submit"
                        disabled={submitting || subscribed}
                        className={cn(
                          "transition-all duration-300 h-11",
                          subscribed && "bg-emerald-500 hover:bg-emerald-600"
                        )}
                      >
                        {subscribed
                          ? "Subscribed"
                          : submitting
                          ? "Submitting…"
                          : "Subscribe"}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </AceternityReveal>
        </section>
      </main>

      {/* CTA Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <AceternityReveal delay={0.1} direction="up">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  Upgrade your client experience with escrow-first payments.
                </h3>
                <p className="mt-2 text-zinc-400">
                  Start free. Invite your first client. Ship a milestone and get
                  paid in minutes, not weeks.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href="/signup" passHref>
                    <Button
                      size="lg"
                      className="h-11 px-6 bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 text-zinc-950 hover:opacity-90 transition-opacity duration-300"
                    >
                      Sign Up Free
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 px-6 bg-transparent border-zinc-700 text-white transition-colors duration-300"
                    onClick={() => scrollToId("features")}
                  >
                    See features
                  </Button>
                </div>
              </div>
            </AceternityReveal>

            <AceternityReveal delay={0.2} direction="up">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
                <div>
                  <div className="font-semibold text-white">Product</div>
                  <ul className="mt-4 space-y-3 text-zinc-400">
                    <li>
                      <button
                        onClick={() => scrollToId("escrow")}
                        className="hover:text-white transition-colors"
                      >
                        Escrow
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToId("pricing")}
                        className="hover:text-white transition-colors"
                      >
                        Pricing
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToId("faq")}
                        className="hover:text-white transition-colors"
                      >
                        FAQ
                      </button>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-white">Company</div>
                  <ul className="mt-4 space-y-3 text-zinc-400">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-white">Resources</div>
                  <ul className="mt-4 space-y-3 text-zinc-400">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Guides
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Templates
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Community
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-white">Legal</div>
                  <ul className="mt-4 space-y-3 text-zinc-400">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Terms
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Security
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </AceternityReveal>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} ChainHire. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center h-10 w-10 rounded-full border border-zinc-700 bg-zinc-900/70 backdrop-blur-xl transition-transform hover:scale-110 active:scale-95"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Global keyframes for marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
