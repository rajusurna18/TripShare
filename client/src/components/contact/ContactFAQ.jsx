import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ContactSection from "./ContactSection";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";
import { FAQS } from "./contactData";

function Accordion({ faq, isOpen, toggleOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative group"
    >
      {/* Gold radial glow behind active accordion */}
      {isOpen && (
        <div className="absolute inset-0 bg-[#D4AF37]/5 blur-2xl rounded-[28px] transition-opacity duration-700" />
      )}

      <motion.div
        className={`relative rounded-[28px] border transition-all duration-500 overflow-hidden backdrop-blur-xl transform hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(212,175,55,0.18)] ${isOpen
          ? "bg-[rgba(17,25,40,0.75)] border-[#D4AF37] shadow-[0_8px_32px_rgba(212,175,55,0.18)]"
          : "bg-[rgba(17,25,40,0.75)] border-[rgba(212,175,55,0.25)] hover:border-[#D4AF37]"
          }`}
      >
        <button
          onClick={toggleOpen}
          className="flex w-full items-center justify-between p-8 text-left outline-none"
        >
          <span className="font-['Manrope'] text-xl font-bold pr-8 text-white tracking-wide">
            {faq.question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${isOpen
              ? "bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-105"
              : "bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] text-[#D4AF37] group-hover:bg-[rgba(255,255,255,0.04)]"
              }`}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-8 pb-8">
                <div className="h-[1px] w-full bg-gradient-to-r from-[rgba(212,175,55,0.3)] to-transparent mb-6" />
                <p className="font-['Manrope'] text-[16px] font-light leading-[1.8] text-gray-300">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <ContactSection
      id="contact-faq"
      eyebrow="Help Center"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know before contacting TripShare."
      innerClassName="max-w-[900px]"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex flex-col gap-8 mt-14"
      >
        {FAQS.map((faq, index) => (
          <Accordion
            key={index}
            faq={faq}
            isOpen={openIndex === index}
            toggleOpen={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </motion.div>
    </ContactSection>
  );
}
