import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import ContactSection from "./ContactSection";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";
import { REASONS } from "./contactData";

function FeatureCard({ feature }) {
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
    rx.set(0); ry.set(0); hoverOpacity.set(0);
  };

  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className="group relative flex flex-col h-full rounded-3xl bg-[rgba(17,25,40,0.75)] p-8 border border-[rgba(212,175,55,0.25)] backdrop-blur-2xl transition-colors duration-500 hover:border-[#D4AF37]"
    >
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none"
        style={{ opacity: hoverSpring }}
      />

      <motion.div
        whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A0A0C] shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.25)] group-hover:border-[#D4AF37] transition-colors"
      >
        <Icon className="h-6 w-6 text-[#D4AF37]" />
      </motion.div>

      <div className="relative z-10 flex-grow">
        <h4 className="font-['Cormorant_Garamond'] text-2xl font-bold text-white mb-3">
          {feature.title}
        </h4>
        <p className="font-['Manrope'] text-[15px] font-light leading-relaxed text-gray-300">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function ContactReasons() {
  return (
    <ContactSection
      id="contact-reasons"
      eyebrow="Our Commitment"
      title="Why Contact TripShare"
      innerClassName="max-w-7xl"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12"
      >
        {REASONS.map((feature, idx) => (
          <FeatureCard key={idx} feature={feature} />
        ))}
      </motion.div>
    </ContactSection>
  );
}
