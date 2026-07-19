import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, Globe, Shield, CheckCircle2, Loader2, Send } from "lucide-react";
import ContactSection from "./ContactSection";
import ContactButton from "./ContactButton";
import { fadeUp, staggerParent, viewportOnce, EASE } from "./contactAnimations";
import { CATEGORIES, MESSAGE_LIMIT } from "./contactData";

function PremiumInput({ label, value, error, onChange, type = "text", ...props }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;

  return (
    <div className="relative flex flex-col w-full">
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`peer h-16 w-full rounded-2xl border bg-[rgba(17,25,40,0.75)] px-6 pt-6 pb-2 font-['Manrope'] text-[15px] text-white outline-none backdrop-blur-xl transition-all duration-300 ${error ? 'border-[#E8967A] focus:border-[#E8967A] shadow-[0_0_15px_rgba(232,150,122,0.1)]' : 'border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)]'
            }`}
          {...props}
        />
        <label className={`absolute left-6 transition-all duration-300 font-['Manrope'] pointer-events-none ${active ? 'top-2 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest' : 'top-5 text-[15px] text-gray-300 font-normal'
          }`}>
          {label}
        </label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 mt-2 overflow-hidden"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[#E8967A]" />
            <span className="font-['Manrope'] text-xs text-[#E8967A] font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    category: CATEGORIES[0],
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const update = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Full Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Valid Email Address is required.";
    if (!values.subject.trim()) next.subject = "Subject is required.";
    if (!values.message.trim() || values.message.trim().length < 10)
      next.message = "Message must be at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    // Simulate network request
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  const resetForm = () => {
    setValues({ name: "", email: "", subject: "", category: CATEGORIES[0], message: "" });
    setStatus("idle");
    setErrors({});
  };

  const charCount = values.message.length;

  return (
    <ContactSection
      id="contact-form"
      innerClassName="max-w-7xl relative"
      eyebrow="Get In Touch"
      title="Send Us a Message"
    >
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mt-12"
      >
        {/* Left Side: Illustration / Support Info */}
        <div className="lg:col-span-5 flex flex-col gap-12 lg:sticky lg:top-40">
          <div>
            <motion.h2
              variants={fadeUp}
              className="
    font-['Cormorant_Garamond']
    text-[2.8rem]
    sm:text-[3.2rem]
    lg:text-[3.5rem]
    font-bold
    text-white
    leading-tight
    whitespace-nowrap
  "
            >
              Luxury <br />
              Support Center
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 font-['Manrope'] text-xl font-light text-gray-300 leading-relaxed max-w-md">
              We believe every great journey requires an incredible support team behind the scenes. Connect d
            </motion.p>
          </div>

          <motion.div variants={staggerParent} className="flex flex-col gap-6">
            <motion.div variants={fadeUp} className="flex items-center gap-5 p-6 rounded-[2rem] bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] shadow-2xl hover:border-[#D4AF37] transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-['Manrope'] text-base font-bold text-white">Average Response</h4>
                <p className="font-['Manrope'] text-sm text-gray-300 mt-1">Under 24 hours globally</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-5 p-6 rounded-[2rem] bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] shadow-2xl hover:border-[#D4AF37] transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-['Manrope'] text-base font-bold text-white">Global Availability</h4>
                <p className="font-['Manrope'] text-sm text-gray-300 mt-1">Experts in 80+ countries</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="flex items-center gap-5 p-6 rounded-[2rem] bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] shadow-2xl hover:border-[#D4AF37] transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 text-[#D4AF37]">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-['Manrope'] text-base font-bold text-white">Secure Communications</h4>
                <p className="font-['Manrope'] text-sm text-gray-300 mt-1">End-to-end encrypted tickets</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <motion.div variants={fadeUp} className="p-8 sm:p-14 rounded-[3rem] bg-[rgba(17,25,40,0.75)] border border-[rgba(212,175,55,0.25)] backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Form Glow Backing */}
            <div className="absolute -inset-10 bg-gradient-to-br from-[#D4AF37]/10 to-transparent blur-3xl rounded-full pointer-events-none mix-blend-screen opacity-50" />

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex flex-col items-center py-20 text-center relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#F3D77A] to-[#B8912B] shadow-[0_0_50px_rgba(212,175,55,0.4)]"
                  >
                    <CheckCircle2 className="h-14 w-14 text-[#0A0A0C]" />
                  </motion.div>
                  <h3 className="font-['Cormorant_Garamond'] text-5xl font-bold text-white mb-6">
                    Request Submitted
                  </h3>
                  <p className="max-w-md font-['Manrope'] text-lg font-light text-gray-300 leading-relaxed">
                    Our luxury support team is reviewing your message. You will receive a response at <strong className="text-[#D4AF37] font-semibold">{values.email}</strong> shortly.
                  </p>
                  <button
                    onClick={resetForm}
                    className="mt-14 font-['Manrope'] text-sm font-bold uppercase tracking-widest text-[#E8C874] hover:text-white transition-colors"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  onSubmit={handleSubmit}
                  className="grid gap-8 sm:grid-cols-2 relative z-10"
                  noValidate
                >
                  <PremiumInput label="Full Name" value={values.name} onChange={update("name")} error={errors.name} />
                  <PremiumInput label="Email Address" type="email" value={values.email} onChange={update("email")} error={errors.email} />
                  <div className="sm:col-span-2">
                    <PremiumInput label="Subject" value={values.subject} onChange={update("subject")} error={errors.subject} />
                  </div>

                  <div className="sm:col-span-2 relative flex flex-col w-full">
                    <div className="relative">
                      <select
                        value={values.category}
                        onChange={update("category")}
                        className="peer h-16 w-full appearance-none rounded-2xl border border-[rgba(212,175,55,0.25)] bg-[rgba(17,25,40,0.75)] px-6 pt-6 pb-2 font-['Manrope'] text-[15px] text-white outline-none backdrop-blur-xl transition-all duration-300 focus:border-[#D4AF37] focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-[#14141A]">
                            {c}
                          </option>
                        ))}
                      </select>
                      <label className="absolute left-6 top-2 pointer-events-none font-['Manrope'] text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">
                        Category
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2 relative flex flex-col w-full">
                    <div className="relative">
                      <textarea
                        rows={6}
                        maxLength={MESSAGE_LIMIT}
                        value={values.message}
                        onChange={update("message")}
                        className={`peer w-full resize-none rounded-3xl border bg-[rgba(17,25,40,0.75)] px-6 pt-8 pb-4 font-['Manrope'] text-[15px] text-white outline-none backdrop-blur-xl transition-all duration-300 ${errors.message ? 'border-[#E8967A] focus:border-[#E8967A] shadow-[0_0_15px_rgba(232,150,122,0.1)]' : 'border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] focus:bg-[rgba(255,255,255,0.04)] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                          }`}
                      />
                      <label className={`absolute left-6 transition-all duration-300 font-['Manrope'] pointer-events-none ${values.message ? 'top-4 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest' : 'top-6 text-[15px] text-gray-300 font-normal'
                        }`}>
                        Message
                      </label>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-2">
                      <div className="flex-1">
                        <AnimatePresence>
                          {errors.message && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-1.5 overflow-hidden"
                            >
                              <AlertCircle className="w-4 h-4 text-[#E8967A]" />
                              <span className="font-['Manrope'] text-xs text-[#E8967A] font-medium">{errors.message}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <span className={`font-['Manrope'] text-xs font-bold tracking-widest ${charCount > MESSAGE_LIMIT * 0.9 ? 'text-[#E8967A]' : 'text-[#5F5D68]'}`}>
                        {charCount} / {MESSAGE_LIMIT}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-6">
                    <ContactButton
                      type="submit"
                      variant="gold"
                      disabled={status === "loading"}
                      className="
                        w-full
                        h-[72px]
                        rounded-2xl
                        bg-gradient-to-r
                       from-[#F4D06F]
                       via-[#D4AF37]
                        to-[#B8860B]
                        text-[#0A0A0C]
                        text-lg
                       font-bold
                        flex
                       items-center
                      justify-center
                        shadow-[0_15px_40px_rgba(212,175,55,0.35)]
                        hover:shadow-[0_20px_50px_rgba(212,175,55,0.5)]
                         hover:scale-[1.02]
                         transition-all
                       duration-300
                       disabled:opacity-70
                      disabled:cursor-not-allowed
                       "
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </ContactButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </ContactSection>
  );
}
