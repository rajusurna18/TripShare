import React from 'react';
import { motion } from 'framer-motion';

export default function ParticleBackground({ count = 20 }) {
  const staticParticles = Array.from({ length: count }).map((_, i) => ({
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <>
      {staticParticles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, background: "#d4af37", left: `${p.x}%`, top: `${p.y}%`, opacity: 0.3, filter: "blur(1px)" }}
          animate={{ y: [0, -100, 0], x: [0, 50, 0], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </>
  );
}
