import React from 'react';
import { motion } from 'framer-motion';

export default function ContactButton({ children, onClick, className = "", variant = "primary", type = "button", ...props }) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
