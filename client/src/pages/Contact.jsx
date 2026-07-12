import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import toast from "react-hot-toast";
import API from "../services/api";
import "./Home.css";

// ---------------------------------------------------------
// REUSABLE COMPONENTS & UTILS
// ---------------------------------------------------------

const SectionWrapper = ({ children, bg = "transparent", className = "", style = {}, id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <section 
      id={id}
      ref={ref}
      className={`position-relative ${className}`} 
      style={{ 
        background: bg, 
        padding: "clamp(100px, 12vw, 160px) 0",
        overflow: "hidden", 
        ...style 
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container position-relative z-3"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px" }}
      >
        {children}
      </motion.div>
    </section>
  );
};

const MagneticButton = ({ children, className, style, onClick, type = "button", disabled }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      style={style}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

const TiltCard = ({ children, className = "", style = {}, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(212,175,55,0.15)", 
        borderColor: "rgba(212,175,55,0.4)"
      }}
      className={`rounded-4 p-4 p-xl-5 d-flex flex-column h-100 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        background: "rgba(255,255,255,0.02)", 
        border: "1px solid rgba(255,255,255,0.05)", 
        backdropFilter: "blur(20px)",
        transition: "border 0.3s ease, background 0.3s ease",
        ...style
      }}
    >
      {children}
    </motion.div>
  );
};

const staticParticles = Array.from({ length: 25 }).map(() => ({
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 15 + 15,
  delay: Math.random() * 5
}));

const staticStars = Array.from({ length: 30 }).map(() => ({
  size: Math.random() * 2 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: Math.random() * 0.5 + 0.1,
  duration: Math.random() * 3 + 2
}));

// ---------------------------------------------------------
// MAIN CONTACT COMPONENT
// ---------------------------------------------------------
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "Travel Support", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Mouse Spotlight
  useEffect(() => {
    document.title = "Contact | TripShare";
    window.scrollTo(0, 0);

    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const purposes = [
    { id: "Travel Support", icon: "life-ring", desc: "Need help with your trips, account, or travel planning?\nOur support team is ready to assist." },
    { id: "Feature Request", icon: "lightbulb", desc: "Have an idea that could improve TripShare?\nWe'd love to hear your suggestions." },
    { id: "Report an Issue", icon: "bug", desc: "Found something unexpected?\nHelp us improve by reporting it." },
    { id: "Business Partnerships", icon: "handshake", desc: "Interested in collaborating with TripShare?\nLet's build better travel experiences together." },
    { id: "Media & Press", icon: "bullhorn", desc: "Press inquiries, interviews, and community collaborations." },
    { id: "General Inquiry", icon: "comment-dots", desc: "Have another question?\nWe're always happy to connect." }
  ];

  const whyContact = [
    { title: "Reliable Support", desc: "Our team is here to help you enjoy a smooth and reliable travel experience.", icon: "headset" },
    { title: "Business Opportunities", desc: "We're always open to meaningful collaborations with travel brands, creators, and organizations.", icon: "briefcase" },
    { title: "Shape TripShare", desc: "Every suggestion and every piece of feedback helps us build a better platform for travelers.", icon: "chart-line" }
  ];

  const timeline = [
    "You Send a Message",
    "Our Team Reviews It",
    "We Reach Out",
    "Together We Find the Best Solution"
  ];

  const faqs = [
    { q: "How do I report a problem?", a: "Select the 'Report an Issue' category in our contact form and include all relevant details." },
    { q: "How can I request a new feature?", a: "Choose the 'Feature Request' option in the form and tell us what you'd like to see." },
    { q: "How do partnerships work?", a: "Reach out via the 'Business Partnerships' category or email partnerships@tripshare.com to connect with our team." },
    { q: "How can I contact the TripShare team?", a: "The most direct method is through the contact form on this page, or you can email us directly." },
    { q: "When should I expect a response?", a: "We typically reply within one business day for all standard inquiries." },
    { q: "How do I share product feedback?", a: "Select the 'Feature Request' or 'Travel Support' option and share your thoughts. We value all feedback!" }
  ];

  const socials = [
    { name: "Instagram", icon: "instagram", brand: true },
    { name: "LinkedIn", icon: "linkedin-in", brand: true },
    { name: "WhatsApp", icon: "whatsapp", brand: true },
    { name: "Email", icon: "envelope", brand: false },
    { name: "X", icon: "twitter", brand: true }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await API.post("/contact", form);
      setTimeout(() => {
        setSuccess(true);
        setForm({ ...form, name: "", email: "", subject: "", message: "" });
        setLoading(false);
      }, 800); // Allow paper airplane animation to play
    } catch (err) {
      toast.error(err.response?.data?.message || "Delivery failed.");
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Timeline Scroll Animation
  const timelineRef = useRef(null);
  const { scrollYProgress: tlProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  const lineHeight = useTransform(tlProgress, [0, 1], ["0%", "100%"]);
  const smoothLineHeight = useSpring(lineHeight, { stiffness: 100, damping: 20 });

  return (
    <div style={{ background: "#050505", color: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Global Spotlight Overlay */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(212,175,55,0.06), transparent 40%)",
          zIndex: 50
        }}
      />

      {/* ---------------------------------------------------------
          SECTION 1 — CINEMATIC HERO
      --------------------------------------------------------- */}
      <section className="position-relative d-flex align-items-center text-center" style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "100px", overflow: "hidden", background: "#050505" }}>
        
        <div className="position-absolute w-100 h-100 top-0 start-0 z-0 pointer-events-none">
          {/* Animated Aurora */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="position-absolute w-100 h-100" 
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.15) 0%, rgba(5,5,5,1) 70%)" }} 
          />
          
          {/* Gold light sweep */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", top: "0", left: "0", width: "40%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent)", transform: "skewX(-30deg)" }}
          />

          {/* World Map Outline */}
          <div className="position-absolute top-50 start-50 translate-middle" style={{ width: "900px", height: "900px", border: "1px solid rgba(255,255,255,0.02)", borderRadius: "50%", transform: "rotateX(75deg)" }}></div>
          <div className="position-absolute top-50 start-50 translate-middle" style={{ width: "650px", height: "650px", border: "1px solid rgba(255,255,255,0.015)", borderRadius: "50%", transform: "rotateX(75deg) rotateY(20deg)" }}></div>

          {/* Animated Travel Route Drawing */}
          <svg className="position-absolute w-100 h-100 top-0 start-0" style={{ opacity: 0.3 }}>
            <motion.path
              d="M -100 500 Q 400 100 900 400 T 1900 200"
              fill="transparent"
              stroke="#d4af37"
              strokeWidth="2"
              strokeDasharray="20 10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Airplane Animation Following Route loosely */}
          <motion.div 
            className="position-absolute"
            animate={{ 
              x: ["-10vw", "110vw"],
              y: ["50vh", "20vh"],
              rotate: [-10, 10]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ color: "rgba(212,175,55,0.6)", fontSize: "1.5rem" }}
          >
            <i className="fas fa-plane"></i>
          </motion.div>

          {/* Floating Particles */}
          {staticParticles.map((p, i) => (
            <motion.div
              key={i}
              className="position-absolute rounded-circle"
              style={{ width: p.size, height: p.size, background: "#d4af37", left: `${p.x}%`, top: `${p.y}%`, opacity: 0.5, filter: "blur(1px)" }}
              animate={{ y: [0, -100, 0], x: [0, 50, 0], opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        <div className="container position-relative z-3 px-4" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            <h1 className="display-1 fw-bold text-white mb-4" style={{ letterSpacing: "-2px", lineHeight: "1.05" }}>
              Let's Connect.
            </h1>
            <h3 className="text-white mb-3" style={{ fontWeight: "400" }}>
              Every great journey begins with a conversation.
            </h3>
            <p className="fs-5 mb-5 text-secondary mx-auto" style={{ fontWeight: "300", lineHeight: "1.6", maxWidth: "800px" }}>
              Whether you're planning your next adventure, sharing an idea, exploring a partnership, or looking for support, we're here to help.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <MagneticButton onClick={scrollToForm} className="btn btn-lg px-5 py-4 rounded-pill position-relative overflow-hidden" style={{ background: "#d4af37", color: "#000", fontWeight: "700", border: "none", boxShadow: "0 10px 40px rgba(212,175,55,0.2)" }}>
                Get in Touch
              </MagneticButton>
              <MagneticButton className="btn btn-lg px-5 py-4 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: "600" }}>
                <Link to="/features" className="text-decoration-none text-white d-block h-100 w-100">Explore TripShare</Link>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="position-absolute bottom-0 start-50 translate-middle-x mb-5 pb-3 text-secondary"
        >
          <div className="d-flex flex-column align-items-center" style={{ opacity: 0.6 }}>
            <span className="small mb-2 tracking-wide text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "2px" }}>Scroll</span>
            <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #d4af37, transparent)" }}></div>
          </div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------
          SECTION 2 — HOW CAN WE HELP?
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0a0a0a">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: "-1px" }}>Choose Your Purpose</h2>
          <p className="text-secondary fs-5" style={{ fontWeight: "300" }}>Select the option that best matches your reason for contacting TripShare.</p>
        </div>
        <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-3 align-items-stretch">
          {purposes.map((opt, i) => (
            <div className="col" key={i}>
              <TiltCard onClick={() => { setForm({ ...form, category: opt.id }); scrollToForm(); }}>
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-4" style={{ width: "50px", height: "50px", background: "rgba(212,175,55,0.1)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <i className={`fas fa-${opt.icon} fs-5`}></i>
                </div>
                <h4 className="fw-bold text-white mb-3">{opt.id}</h4>
                <p className="text-secondary small mb-0 flex-grow-1" style={{ lineHeight: "1.7", whiteSpace: "pre-line" }}>{opt.desc}</p>
              </TiltCard>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 3 — CONTACT FORM
      --------------------------------------------------------- */}
      <SectionWrapper bg="#050505" id="contact-form-section">
        <div className="row g-5 align-items-center">
          
          {/* Left: Info */}
          <div className="col-lg-5 pe-lg-5">
            <h3 className="display-4 fw-bold text-white mb-4" style={{ letterSpacing: "-1px" }}>Get in Touch</h3>
            <p className="text-secondary mb-5 fs-5" style={{ fontWeight: "300", lineHeight: "1.7" }}>
              We're committed to providing thoughtful, timely, and helpful responses to every message we receive.
            </p>

            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-4 flex-shrink-0" style={{ width: "50px", height: "50px", background: "rgba(255,255,255,0.05)", color: "#d4af37" }}>
                  <i className="far fa-clock fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-1">Business Hours</h6>
                  <p className="text-secondary mb-0 small">Monday – Friday<br/>9:00 AM – 6:00 PM</p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-4 flex-shrink-0" style={{ width: "50px", height: "50px", background: "rgba(255,255,255,0.05)", color: "#d4af37" }}>
                  <i className="fas fa-bolt fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-1">Response Time</h6>
                  <p className="text-secondary mb-0 small">We aim to respond within one business day.</p>
                </div>
              </div>

              <div className="d-flex align-items-start">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-4 flex-shrink-0" style={{ width: "50px", height: "50px", background: "rgba(255,255,255,0.05)", color: "#d4af37" }}>
                  <i className="fas fa-envelope fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-1">Email Contacts</h6>
                  <p className="text-secondary mb-0 small">
                    Support: support@tripshare.com<br/>
                    Business: partnerships@tripshare.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-lg-7">
            <TiltCard style={{ background: "#0a0a0a" }}>
              {success ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-5 my-md-4">
                  <div className="d-inline-flex justify-content-center align-items-center rounded-circle mb-4" style={{ width: "90px", height: "90px", background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37" }}>
                    <motion.i 
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }} 
                      className="fas fa-check fs-1" 
                    />
                  </div>
                  <h3 className="fw-bold text-white mb-3">Thank you for contacting TripShare.</h3>
                  <p className="text-secondary fs-5 mb-5" style={{ fontWeight: "300" }}>We've received your message and will respond as soon as possible.</p>
                  <MagneticButton onClick={() => setSuccess(false)} className="btn px-5 py-3 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontWeight: "600" }}>
                    Send Another Message
                  </MagneticButton>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="fw-bold text-white mb-4">Send Us a Message</h3>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" className="form-control bg-transparent text-white" id="nameInput" placeholder="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "none" }} />
                        <label htmlFor="nameInput" style={{ color: "#888" }}>Full Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="email" className="form-control bg-transparent text-white" id="emailInput" placeholder="Email Address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "none" }} />
                        <label htmlFor="emailInput" style={{ color: "#888" }}>Email Address</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select className="form-select bg-transparent text-white" id="categoryInput" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "none" }}>
                          {purposes.map((opt, idx) => (
                            <option key={idx} value={opt.id} style={{ color: "#000" }}>{opt.id}</option>
                          ))}
                        </select>
                        <label htmlFor="categoryInput" style={{ color: "#888" }}>Category</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input type="text" className="form-control bg-transparent text-white" id="subjectInput" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "none" }} />
                        <label htmlFor="subjectInput" style={{ color: "#888" }}>Subject</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea className="form-control bg-transparent text-white" id="messageInput" placeholder="Message" style={{ height: "180px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "none", resize: "none" }} required maxLength="2000" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea>
                        <label htmlFor="messageInput" style={{ color: "#888" }}>Message</label>
                      </div>
                    </div>
                    <div className="col-12 mt-4 text-center">
                      <MagneticButton type="submit" className="btn px-5 w-100 w-md-auto py-4 rounded-pill d-inline-flex justify-content-center align-items-center overflow-hidden" style={{ background: "#d4af37", color: "#000", fontWeight: "700", border: "none", fontSize: "1.1rem", boxShadow: "0 10px 30px rgba(212,175,55,0.3)", minWidth: "250px" }} disabled={loading}>
                        {loading ? (
                          <motion.i 
                            animate={{ x: [0, 80], y: [0, -80], opacity: [1, 0] }} 
                            transition={{ duration: 0.8 }} 
                            className="fas fa-paper-plane" 
                          />
                        ) : (
                          "Send Message"
                        )}
                      </MagneticButton>
                    </div>
                  </div>
                </form>
              )}
            </TiltCard>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 4 — WHY CONTACT TRIPSHARE
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0a0a0a">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: "-1px" }}>Why Reach Out?</h2>
        </div>
        <div className="row g-4 row-cols-1 row-cols-md-3 align-items-stretch">
          {whyContact.map((item, idx) => (
            <div className="col" key={idx}>
              <motion.div 
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)" }}
                className="p-5 rounded-4 h-100 d-flex flex-column align-items-center text-center"
                style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s ease" }}
              >
                <i className={`fas fa-${item.icon} mb-4`} style={{ fontSize: "2.5rem", color: "#d4af37" }}></i>
                <h4 className="fw-bold text-white mb-3">{item.title}</h4>
                <p className="text-secondary mb-0 small" style={{ fontWeight: "300", lineHeight: "1.7" }}>{item.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 5 — WHAT HAPPENS NEXT?
      --------------------------------------------------------- */}
      <SectionWrapper bg="#050505">
        <div className="text-center mb-5 pb-5">
          <h2 className="display-4 fw-bold text-white mb-4" style={{ letterSpacing: "-1px" }}>Here's What Happens Next</h2>
        </div>
        <div className="position-relative mx-auto" style={{ maxWidth: "800px" }} ref={timelineRef}>
          {/* Animated Line */}
          <div className="position-absolute top-0 start-0 ms-md-4 ms-3" style={{ width: "2px", height: "100%", background: "rgba(255,255,255,0.05)", zIndex: 1 }}></div>
          <motion.div className="position-absolute top-0 start-0 ms-md-4 ms-3" style={{ width: "2px", height: smoothLineHeight, background: "#d4af37", zIndex: 2 }}></motion.div>

          {timeline.map((step, idx) => (
            <div className="d-flex mb-5 position-relative z-3" key={idx}>
              <div className="flex-shrink-0 me-4 me-md-5 d-flex justify-content-center align-items-center rounded-circle" style={{ width: "60px", height: "60px", background: "#050505", border: "2px solid #d4af37", color: "#d4af37", fontWeight: "bold", marginLeft: "10px", marginTop: "10px", boxShadow: "0 0 20px rgba(212,175,55,0.2)", fontSize: "1.2rem" }}>
                {idx + 1}
              </div>
              <div className="pt-3">
                <h4 className="fw-bold text-white mb-0">{step}</h4>
                {idx < timeline.length - 1 && (
                  <div className="text-secondary mt-2 fs-5">↓</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-5 pt-3">
           <p className="text-secondary fst-italic" style={{ fontWeight: "300" }}>
             We carefully review every inquiry and strive to provide helpful responses as quickly as possible.
           </p>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 6 — FREQUENTLY ASKED QUESTIONS
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0a0a0a">
        <div className="text-center mb-5 pb-3">
          <h2 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: "-1px" }}>Frequently Asked Questions</h2>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="d-flex flex-column gap-3">
              {faqs.map((faq, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ background: "rgba(255,255,255,0.03)" }} 
                  className="p-4 rounded-4" 
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "all 0.3s ease" }} 
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 text-white fs-5">{faq.q}</h6>
                    <motion.div 
                      animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ms-4" 
                      style={{ width: "36px", height: "36px", background: activeFaq === idx ? "#d4af37" : "rgba(255,255,255,0.05)", color: activeFaq === idx ? "#000" : "#d4af37", transition: "background 0.3s ease, color 0.3s ease" }}
                    >
                       <i className={`fas fa-${activeFaq === idx ? "minus" : "chevron-down"} small`}></i>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-top" style={{ borderColor: "rgba(255,255,255,0.05) !important", fontWeight: "300", lineHeight: "1.6", color: "#a1a1aa", fontSize: "1.05rem" }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 7 — CONNECT WITH TRIPSHARE
      --------------------------------------------------------- */}
      <SectionWrapper bg="#050505">
        <div className="text-center mb-5 pb-3">
          <h2 className="display-4 fw-bold text-white mb-4" style={{ letterSpacing: "-1px" }}>Stay Connected</h2>
          <p className="text-secondary small">Official channel coming soon.</p>
        </div>
        <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-5">
          {socials.map((social, i) => (
            <MagneticButton key={i} className="bg-transparent border-0">
              <motion.a 
                href={social.email ? `mailto:${social.email}` : '#!'}
                whileHover={{ scale: 1.1, boxShadow: "0 10px 25px rgba(212,175,55,0.2)", border: "2px solid #d4af37", color: "#d4af37" }}
                className="d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                style={{ 
                  width: "80px", 
                  height: "80px", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "2px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  transition: "border 0.3s ease, color 0.3s ease",
                  cursor: social.email ? 'pointer' : 'not-allowed'
                }}
              >
                <i className={`${social.brand ? 'fab' : 'fas'} fa-${social.icon}`} style={{ fontSize: "2rem" }}></i>
              </motion.a>
              <div className="mt-3 text-secondary small fw-bold">{social.name}</div>
            </MagneticButton>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          SECTION 8 — FINAL CTA
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0a0a0a" style={{ borderTop: "1px solid rgba(255,255,255,0.02)" }}>
        
        {/* Cinematic Backdrop */}
        <div className="position-absolute w-100 h-100 top-0 start-0 pointer-events-none z-0">
          <div style={{ background: "radial-gradient(circle at center, rgba(212,175,55,0.1) 0%, transparent 70%)", width: "100%", height: "100%" }} />
          
          {/* Animated Aurora */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="position-absolute top-50 start-50 translate-middle rounded-circle"
            style={{ width: "400px", height: "400px", background: "rgba(212,175,55,0.05)", filter: "blur(60px)" }}
          />

          {/* Stars */}
          {staticStars.map((star, i) => (
             <motion.div
               key={i}
               className="position-absolute rounded-circle bg-white"
               style={{
                 width: star.size + "px",
                 height: star.size + "px",
                 top: star.top + "%",
                 left: star.left + "%",
                 opacity: star.opacity
               }}
               animate={{ opacity: [0.1, 0.8, 0.1] }}
               transition={{ duration: star.duration, repeat: Infinity, ease: "linear" }}
             />
          ))}
        </div>

        <div className="text-center py-md-5 position-relative z-3">
           <h2 className="display-3 fw-bold text-white mb-4 mx-auto" style={{ letterSpacing: "-1px", maxWidth: "900px" }}>Every Great Journey Starts With One Conversation.</h2>
           <p className="fs-4 mb-5 mx-auto text-secondary" style={{ fontWeight: "300", maxWidth: "800px" }}>
             Whether you're a traveler, creator, or future partner, we'd love to hear from you.
           </p>
           
           <MagneticButton onClick={scrollToForm} className="btn btn-lg px-5 py-4 rounded-pill position-relative overflow-hidden" style={{ background: "#d4af37", color: "#000", fontWeight: "700", border: "none", boxShadow: "0 10px 40px rgba(212,175,55,0.3)" }}>
             <span className="position-relative z-index-1">Contact the TripShare Team</span>
           </MagneticButton>
        </div>
      </SectionWrapper>

    </div>
  );
}

export default Contact;
