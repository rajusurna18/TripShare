import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerParent, viewportOnce } from './contactAnimations';

export default function ContactSection({ id, innerClassName, eyebrow, title, subtitle, children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportOnce);

  return (
    <section id={id} ref={ref} className="py-24 relative overflow-hidden bg-[#0A0A0C]">
      <div className={`mx-auto px-6 ${innerClassName || 'max-w-7xl'}`}>
        {(eyebrow || title || subtitle) && (
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="text-center mb-16"
          >
            {eyebrow && (
              <motion.span variants={fadeUp} className="text-[#D4AF37] font-['Manrope'] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
                {eyebrow}
              </motion.span>
            )}
            {title && (
              <motion.h2 variants={fadeUp} className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p variants={fadeUp} className="font-['Manrope'] text-lg text-gray-400 max-w-2xl mx-auto">
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
