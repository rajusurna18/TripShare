import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContactParticles from "./ContactParticles";
import ContactButton from "./ContactButton";
import { EASE } from "./contactAnimations";

export default function ContactCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-[#0A0A0C] py-32">
      {/* Background Gradients and Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />
      <ContactParticles count={40} />

      {/* Travel Line Animation (Cinematic background) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30 mix-blend-screen"
        viewBox="0 0 1400 900"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M -100 200 C 300 800, 700 100, 1100 600 S 1400 200, 1600 500"
          fill="none"
          stroke="url(#ctaGrad)"
          strokeWidth="2"
          strokeDasharray="10 20"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 4, ease: EASE }}
        />
        <defs>
          <linearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="50%" stopColor="#E8C874" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.2)]"
        >
          <Sparkles className="h-12 w-12 text-[#D4AF37]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
          className="font-['Cormorant_Garamond'] text-[4rem] sm:text-[5.5rem] font-bold leading-none tracking-tight text-transparent pb-4"
          style={{
            backgroundImage: "linear-gradient(180deg, #FDF6E3 0%, #F5F1E8 40%, #C9A227 150%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          Ready for Your Next Adventure?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="mt-8 max-w-2xl font-['Manrope'] text-xl font-light leading-relaxed text-gray-300"
        >
          Join TripShare and discover smarter travel planning, collaborative experiences, AI-powered assistance, and unforgettable memories.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          className="mt-14 flex flex-col items-center gap-6 sm:flex-row"
        >
          <ContactButton
            variant="gold"
            className="h-16 px-12 text-lg rounded-full font-bold text-[#0A0A0C] flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.4)] hover:-translate-y-1 transition-all duration-300"
            onClick={() => navigate("/create-trip")}
          >
            Create Your First Trip <Compass className="ml-3 h-5 w-5" />
          </ContactButton>

          <ContactButton
            variant="ghost"
            className="h-16 px-12 text-lg rounded-full border border-[rgba(212,175,55,0.25)] hover:border-[#D4AF37] hover:bg-[rgba(17,25,40,0.75)] text-white flex items-center justify-center transition-all duration-300"
            onClick={() => navigate("/features")}
          >
            Explore Features
          </ContactButton>
        </motion.div>
      </div>

      {/* Subtle overlay to ensure footer blends well */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0C] to-transparent pointer-events-none" />
    </section>
  );
}
