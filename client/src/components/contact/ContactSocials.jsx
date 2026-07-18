import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ContactSection from "./ContactSection";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";
import { SOCIALS } from "./contactData";

function SocialCard({ social }) {
  const cardRef = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 20 });
  const sry = useSpring(ry, { stiffness: 150, damping: 20 });
  const hoverOpacity = useMotionValue(0);
  const hoverSpring = useSpring(hoverOpacity, { stiffness: 150, damping: 20 });

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 20);
    rx.set(-py * 20);
    hoverOpacity.set(1);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
    hoverOpacity.set(0);
  };

  const Icon = social.icon;
  const isComingSoon = social.handle === "Coming Soon";

  return (
    <motion.a
      href={isComingSoon ? undefined : social.link}
      variants={fadeUp}
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className={`group relative flex items-center gap-6 rounded-[2rem] bg-[rgba(17,25,40,0.75)] p-8 border border-[rgba(212,175,55,0.25)] backdrop-blur-2xl transition-colors duration-500 hover:border-[#D4AF37] no-underline ${isComingSoon ? "cursor-default" : "cursor-pointer"
        }`}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none"
        style={{ opacity: hoverSpring }}
      />

      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0A0A0C] shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.25)] group-hover:border-[#D4AF37] transition-colors"
      >
        <Icon className={`h-7 w-7 ${isComingSoon ? "text-[#5F5D68]" : "text-[#D4AF37]"}`} />
      </motion.div>

      <div className="relative z-10">
        <h4 className="font-['Cormorant_Garamond'] text-2xl font-bold text-white">
          {social.name}
        </h4>
        <p className={`font-['Manrope'] text-sm mt-1 tracking-wide ${isComingSoon ? "text-[#E8967A] uppercase font-bold text-[11px]" : "text-gray-300"
          }`}>
          {social.handle}
        </p>
      </div>
    </motion.a>
  );
}

export default function ContactSocials() {
  return (
    <ContactSection
      id="contact-socials"
      eyebrow="Connect With Us"
      title="Join Our Global Network"
      innerClassName="max-w-7xl"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {SOCIALS.map((social) => (
          <SocialCard key={social.name} social={social} />
        ))}
      </motion.div>
    </ContactSection>
  );
}
