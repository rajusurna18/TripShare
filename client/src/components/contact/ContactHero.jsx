import React, { useState, useRef, useCallback } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ContactParticles from "./ContactParticles";
import ContactButton from "./ContactButton";
import { EASE, WORD_VARIANTS } from "./contactAnimations";

export default function ContactHero() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [headline] = useState("Let's Plan Your Next Journey Together".split(" "));

  const heroMx = useMotionValue(0);
  const heroMy = useMotionValue(0);
  const springX = useSpring(heroMx, { stiffness: 40, damping: 20 });
  const springY = useSpring(heroMy, { stiffness: 40, damping: 20 });
  const spotX = useTransform(springX, (v) => `${50 + v * 15}%`);
  const spotY = useTransform(springY, (v) => `${45 + v * 15}%`);

  const handleHeroMouse = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      heroMx.set((e.clientX - rect.left) / rect.width - 0.5);
      heroMy.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [heroMx, heroMy]
  );

  return (
    <section
      ref={heroRef}
      onMouseMove={handleHeroMouse}
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0A0A0C] pt-20"
    >
      {/* Background Noise effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Dynamic light spot tied to mouse */}
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background: useTransform(
            [spotX, spotY],
            ([x, y]) =>
              `radial-gradient(1200px circle at ${x} ${y}, rgba(212,175,55,0.12), transparent 60%)`
          ),
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />
      <ContactParticles count={60} />

      {/* Animated travel route svg line */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40 mix-blend-screen"
        viewBox="0 0 1400 900"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M -100 700 C 300 500, 400 800, 700 550 S 1100 300, 1500 400"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 18"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: EASE, delay: 0.8 }}
        />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#E8C874" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 text-center"
      >
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
          }}
          className="flex flex-wrap justify-center font-['Cormorant_Garamond'] text-[2.75rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[8rem] font-bold leading-[0.9] tracking-tight"
        >
          {headline.map((word, i) => (
            <motion.span
              key={i}
              variants={WORD_VARIANTS}
              className="mr-[1.5vw] inline-block text-transparent pb-4"
              style={{
                backgroundImage: "linear-gradient(180deg, #FDF6E3 0%, #F5F1E8 30%, #C9A227 130%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                transformOrigin: "bottom center"
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1 }}
          className="mt-8 max-w-3xl font-['Manrope'] text-lg sm:text-xl font-light leading-relaxed text-gray-300"
        >
          Whether you have a question, need support, want to collaborate, or simply want to share your travel experiences, the TripShare team is here to help you every step of the way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 1.2 }}
          className="mt-16 flex flex-col items-center gap-6 sm:flex-row"
        >
          <ContactButton
            variant="gold"
            className="h-16 px-12 text-lg rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-[#0A0A0C] font-bold"
            onClick={() =>
              document.getElementById("contact-options")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Contact Support <ArrowRight className="ml-3 h-5 w-5" />
          </ContactButton>
          <ContactButton
            variant="ghost"
            className="h-16 px-12 text-lg rounded-full !bg-transparent border border-[rgba(212,175,55,0.25)] hover:border-[#D4AF37] hover:!bg-[#D4AF37]/10 text-white flex items-center justify-center"
            onClick={() => navigate("/discover")}
          >
            Explore TripShare
          </ContactButton>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#D4AF37]/50 to-transparent overflow-hidden relative">
          <motion.div
            animate={{ y: [-64, 64] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-8 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
