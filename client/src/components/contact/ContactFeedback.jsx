import React from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";
import ContactSection from "./ContactSection";
import ContactButton from "./ContactButton";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";

export default function ContactFeedback() {
  return (
    <ContactSection
      id="contact-feedback"
      innerClassName="max-w-[1200px]"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative overflow-hidden rounded-[3rem] bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] p-10 sm:p-20 text-center shadow-2xl backdrop-blur-2xl"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37] rounded-full blur-[100px] opacity-[0.05]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E8C874] rounded-full blur-[100px] opacity-[0.05]" />

        <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.15)]"
          >
            <MessageSquarePlus className="h-10 w-10 text-[#D4AF37]" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-['Cormorant_Garamond'] text-[2.5rem] sm:text-[3.5rem] font-bold text-white leading-tight mb-6"
          >
            Help Us Build Better Travel Experiences
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-['Manrope'] text-lg font-light leading-relaxed text-gray-300 mb-12"
          >
            Every suggestion, feature request, and piece of feedback helps us improve TripShare for travelers around the world. We read every message and actively use your insights to shape our platform.
          </motion.p>

          <motion.div variants={fadeUp}>
            <ContactButton
              variant="gold"
              className="h-14 px-10 text-base font-bold text-[#0A0A0C] rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.3)] transition-shadow duration-300"
              onClick={() => {
                document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Share Your Feedback
            </ContactButton>
          </motion.div>
        </div>
      </motion.div>
    </ContactSection>
  );
}
