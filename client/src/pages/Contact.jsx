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
    return () => {
      document.body.classList.remove("contact-active");
    };
  }, []);

  return (
    <>

      <motion.main
        className="relative w-full overflow-x-hidden bg-[#0A0A0C]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <ContactHero />
        <ContactOptions />
        <ContactForm />
        <ContactSocials />
        <ContactFAQ />
        <ContactReasons />
        <ContactFeedback />
        <ContactCTA />
      </motion.main>
      <ContactFooter />
    </>
  );
}
