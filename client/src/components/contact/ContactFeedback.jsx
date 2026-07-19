import React from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus, ArrowRight } from "lucide-react";
import ContactSection from "./ContactSection";
import { fadeUp, staggerParent, viewportOnce } from "./contactAnimations";

export default function ContactFeedback() {
  return (
    <ContactSection
      id="contact-feedback"
      innerClassName="max-w-[1500px] px-6 lg:px-10"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="
          relative
          overflow-hidden
          rounded-[3rem]
          h-[900px]
          lg:h-[950px]
          xl:h-[1000px]
          flex
          items-center
          justify-center
          px-8
          py-24
          sm:px-16
          sm:py-32
          lg:px-24
          lg:py-40
          bg-[rgba(17,25,40,0.80)]
          border
          border-[rgba(212,175,55,0.25)]
          backdrop-blur-3xl
          shadow-[0_50px_140px_rgba(0,0,0,0.6)]
        "
      >
        {/* Top Accent */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

        {/* Background Glow */}
        <div className="absolute -top-52 -right-40 h-[500px] w-[500px] rounded-full bg-[#D4AF37] blur-[170px] opacity-10" />

        <div className="absolute -bottom-52 -left-40 h-[500px] w-[500px] rounded-full bg-[#F3D77A] blur-[170px] opacity-10" />

        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

        {/* Floating Glow */}
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/5 blur-[220px]" />

        <div className="relative z-10 flex h-full w-full max-w-5xl flex-col items-center justify-center text-center">

          {/* Icon */}
          <motion.div
            variants={fadeUp}
            whileHover={{
              scale: 1.1,
              rotate: [0, 8, -8, 0],
            }}
            transition={{ duration: 0.6 }}
            className="
              mb-14
              flex
              h-32
              w-32
              items-center
              justify-center
              rounded-[2.5rem]
              bg-gradient-to-br
              from-[#D4AF37]/20
              to-[#D4AF37]/5
              border
              border-[#D4AF37]/30
              shadow-[0_0_80px_rgba(212,175,55,0.25)]
            "
          >
            <MessageSquarePlus className="h-14 w-14 text-[#D4AF37]" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="
              font-['Cormorant_Garamond']
              text-[3.5rem]
              sm:text-[4.8rem]
              lg:text-[5.5rem]
              xl:text-[6rem]
              font-bold
              leading-[1.1]
              text-white
              mb-10
            "
          >
            Help Us Build
            <br />
            Better Travel Experiences
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="
              max-w-4xl
              text-xl
              sm:text-2xl
              lg:text-[26px]
              leading-[2]
              text-gray-300
              font-['Manrope']
              font-light
              mb-20
            "
          >
            Every suggestion, feature request, and piece of feedback
            helps us improve{" "}
            <span className="text-[#D4AF37] font-semibold">
              TripShare
            </span>{" "}
            for travelers around the world.

            <br />
            <br />

            We carefully review every message and use your insights
            to build a smarter, safer, more secure and more enjoyable
            travel experience for our global community.

            <br />
            <br />

            Your voice directly shapes future features, improvements,
            and innovations that make every journey unforgettable.
          </motion.p>

          {/* Button */}
          <motion.div variants={fadeUp}>
            <button
              onClick={() =>
                document
                  .getElementById("contact-form")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="
                group
                flex
                items-center
                justify-center
                gap-4
                h-[78px]
                px-16
                rounded-full
                bg-gradient-to-r
                from-[#F7E08A]
                via-[#D4AF37]
                to-[#B8912B]
                text-[#0A0A0C]
                text-xl
                font-bold
                shadow-[0_18px_60px_rgba(212,175,55,0.4)]
                hover:shadow-[0_25px_70px_rgba(212,175,55,0.6)]
                hover:scale-105
                transition-all
                duration-300
              "
            >
              Share Your Feedback

              <ArrowRight
                size={22}
                className="transition-transform duration-300 group-hover:translate-x-2"
              />
            </button>
          </motion.div>

        </div>
      </motion.div>
    </ContactSection>
  );
}