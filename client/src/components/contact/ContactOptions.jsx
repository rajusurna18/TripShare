import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ContactSection from "./ContactSection";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";
import { PANELS } from "./contactData";

function FloatingPanel({ panel }) {
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
    ry.set(px * 15);
    rx.set(-py * 15);
    hoverOpacity.set(1);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
    hoverOpacity.set(0);
  };

  const Icon = panel.icon;

  return (
    <motion.div
      variants={fadeUp}
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className="group relative w-full rounded-3xl bg-[rgba(17,25,40,0.75)] p-10 border border-[rgba(212,175,55,0.25)] backdrop-blur-2xl transition-colors duration-500 hover:border-[#D4AF37]"
    >
      {/* Background glow effects */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none"
        style={{ opacity: hoverSpring }}
      />
      <motion.div
        className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/30 to-transparent blur-xl pointer-events-none mix-blend-screen"
        style={{ opacity: hoverSpring }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Animated Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
          transition={{ duration: 0.7 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent shadow-[0_0_30px_rgba(212,175,55,0.15)]"
        >
          <Icon className="h-10 w-10 text-[#D4AF37]" />
        </motion.div>

        <h3 className="font-['Cormorant_Garamond'] text-4xl font-bold text-white mb-4">
          {panel.title}
        </h3>

        <p className="font-['Manrope'] text-[15px] font-light leading-relaxed text-gray-300 mb-12 flex-grow">
          {panel.desc}
        </p>

        <div className="border-t border-[rgba(212,175,55,0.25)] pt-8 mt-auto">
          <p className="font-['Manrope'] text-lg font-semibold text-[#D4AF37] mb-2">
            {panel.email}
          </p>
          <p className="font-['Manrope'] text-[13px] text-gray-300 uppercase tracking-widest font-bold">
            Response Time: {panel.response}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ContactOptions() {
  return (
    <ContactSection id="contact-options" innerClassName="max-w-7xl">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10"
      >
        {PANELS.map((panel) => (
          <FloatingPanel key={panel.title} panel={panel} />
        ))}
      </motion.div>
    </ContactSection>
  );
}
