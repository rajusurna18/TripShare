import React, { useEffect } from "react";
import { motion } from "framer-motion";

import ContactFooter from "../components/contact/ContactFooter";
import ContactHero from "../components/contact/ContactHero";
import ContactOptions from "../components/contact/ContactOptions";
import ContactForm from "../components/contact/ContactForm";
import ContactSocials from "../components/contact/ContactSocials";
import ContactFAQ from "../components/contact/ContactFAQ";
import ContactReasons from "../components/contact/ContactReasons";
import ContactFeedback from "../components/contact/ContactFeedback";
import ContactCTA from "../components/contact/ContactCTA";

import { EASE } from "../components/contact/contactAnimations";

export default function Contact() {
  useEffect(() => {
    document.body.classList.add("contact-active");

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    return () => {
      document.body.classList.remove("contact-active");
    };
  }, []);

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.6,
          ease: EASE,
        }}
        className="
          relative
          min-h-screen
          w-full
          overflow-x-hidden
          bg-[#0A0A0C]
        "
      >
        {/* Hero */}
        <section className="relative">
          <ContactHero />
        </section>

        {/* Contact Options */}
        <section className="relative py-10 lg:py-14">
          <ContactOptions />
        </section>

        {/* Contact Form */}
        <section className="relative py-12 lg:py-16">
          <ContactForm />
        </section>

        {/* Social Links */}
        <section className="relative py-10 lg:py-14">
          <ContactSocials />
        </section>

        {/* FAQ */}
        <section className="relative py-10 lg:py-14">
          <ContactFAQ />
        </section>

        {/* Why Choose Us */}
        <section className="relative py-12 lg:py-16">
          <ContactReasons />
        </section>

        {/* Feedback */}
        <section className="relative py-12 lg:py-16">
          <ContactFeedback />
        </section>

        {/* CTA */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24">
          <ContactCTA />
        </section>
      </motion.main>

      <ContactFooter />
    </>
  );
}