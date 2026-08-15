"use client";

import { motion } from "motion/react";
import { RGB } from "@/lib/spectrum";
import type { SpectrumPosition } from "@/lib/strains";

/**
 * Each spectrum bucket gets its own decorative backdrop rather than one
 * pattern re-colored — the shift between drops should read as a change of
 * scene, not just a palette swap. Shared between the Drops section and the
 * archive's selected-batch frame.
 */
export function SpectrumBackdrop({ spectrum }: { spectrum: SpectrumPosition }) {
  switch (spectrum) {
    case "Indica":
      return <EmberDriftBackdrop color={RGB.indica} />;
    case "Indica-Leaning Hybrid":
      return (
        <>
          <AuroraBackdrop from={RGB.indica} to={RGB.hybrid} flip={false} />
          <EmberDriftBackdrop color={RGB.indica} intensity={0.45} />
        </>
      );
    case "Balanced Hybrid":
      return <RippleBackdrop color={RGB.hybrid} />;
    case "Sativa-Leaning Hybrid":
      return (
        <>
          <AuroraBackdrop from={RGB.hybrid} to={RGB.sativa} flip />
          <EnergyStreakBackdrop color={RGB.sativa} intensity={0.45} />
        </>
      );
    case "Sativa":
      return <EnergyStreakBackdrop color={RGB.sativa} />;
  }
}

// Indica — small embers rising slowly through a low haze. Heavy and
// unhurried, fitting the "heavy-lidded," end-of-day strains at this end
// of the shelf.
function EmberDriftBackdrop({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const embers = Array.from({ length: Math.round(32 * intensity) }, (_, i) => ({
    left: (i * 31) % 100,
    size: 3 + ((i * 13) % 8),
    duration: 11 + ((i * 7) % 10),
    delay: (i % 12) * 0.9,
    drift: ((i % 5) - 2) * 10,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity: 0.58 * intensity }}>
      <div
        className="absolute inset-x-0 bottom-0 h-full blur-3xl"
        style={{ background: `linear-gradient(to top, ${color}, transparent)`, opacity: 0.28 }}
      />
      {embers.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            bottom: "-5%",
            width: m.size,
            height: m.size,
            backgroundColor: color,
            boxShadow: `0 0 ${m.size * 3}px ${color}`,
          }}
          animate={{ y: ["0vh", "-100vh"], x: [0, m.drift], opacity: [0, 0.95, 0] }}
          transition={{ duration: m.duration, repeat: Infinity, ease: "easeOut", delay: m.delay }}
        />
      ))}
    </div>
  );
}

// Sativa — quick streaks of light darting across in bursts, with a pause
// between each pass. Fast and sharp rather than ambient, to read as the
// energetic, cerebral, daytime end of the shelf.
function EnergyStreakBackdrop({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const streaks = Array.from({ length: Math.round(55 * intensity) }, (_, i) => {
    // Every so often a streak flares noticeably brighter than the rest —
    // a few standout passes among the dimmer ones, not a uniform brightening.
    const bright = i % 8 === 0;
    const peak = 0.12 + ((i * 7) % 9) * 0.055;
    return {
      top: 1 + ((i * 11) % 98),
      length: 90 + ((i * 41) % 550),
      duration: 1.8 + ((i % 4) * 0.3),
      delay: (i % 20) * 0.32,
      repeatDelay: 1.8 + ((i % 3) * 1.1),
      peak: bright ? Math.min(1, peak + 0.32) : peak,
      glow: bright ? 10 : 5,
    };
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ambient aura — kept outside the streaks' own intensity-scaled
          opacity below, or this got capped down to barely visible. */}
      <div
        className="absolute inset-x-0 bottom-0 h-full blur-3xl"
        style={{ background: `linear-gradient(to top, ${color}, transparent)`, opacity: 0.25 * intensity }}
      />
      <div style={{ opacity: 0.3 * intensity }}>
        {streaks.map((s, i) => (
          <motion.div
            key={i}
            className="absolute left-[-40%] rounded-full"
            style={{
              top: `${s.top}%`,
              width: s.length,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 ${s.glow}px ${color}`,
            }}
            animate={{ x: ["0vw", "140vw"], opacity: [0, s.peak, 0] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              repeatDelay: s.repeatDelay,
              ease: "easeIn",
              delay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Indica-Leaning / Sativa-Leaning Hybrid — two soft diagonal sweeps that
// breathe in and out, additively blended so the two colors glow where they
// overlap instead of just sitting side by side.
function AuroraBackdrop({ from, to, flip }: { from: string; to: string; flip?: boolean }) {
  const angle = flip ? 250 : 110;
  return (
    <div className="absolute inset-0 overflow-hidden opacity-25 mix-blend-screen">
      <motion.div
        className="absolute -inset-1/4"
        style={{ background: `linear-gradient(${angle}deg, transparent 15%, ${from} 42%, transparent 58%)` }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-1/4"
        style={{ background: `linear-gradient(${angle}deg, transparent 55%, ${to} 78%, transparent 95%)` }}
        animate={{ opacity: [0.9, 0.5, 0.9] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

// Balanced Hybrid — sonar-style rings pulsing outward from center.
function RippleBackdrop({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-25">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: color }}
          initial={{ width: 40, height: 40, opacity: 0.6 }}
          animate={{ width: 900, height: 900, opacity: 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeOut", delay: i * 2 }}
        />
      ))}
    </div>
  );
}
