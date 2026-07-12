import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import "./Home.css";

// ---------------------------------------------------------
// REUSABLE COMPONENTS & ANIMATIONS
// ---------------------------------------------------------

const SectionWrapper = ({ children, bg = "transparent", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <section 
      ref={ref}
      className={`position-relative py-6 ${className}`} 
      style={{ background: bg, padding: "100px 0", overflow: "hidden" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="container position-relative z-index-1"
      >
        {children}
      </motion.div>
    </section>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.4)" }}
    className="h-100 p-4 rounded-4 d-flex flex-column"
    style={{ 
      background: "rgba(255,255,255,0.02)", 
      border: "1px solid rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      transition: "all 0.4s ease"
    }}
  >
    <motion.div 
      whileHover={{ rotate: 10, scale: 1.1 }}
      className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle"
      style={{ width: "60px", height: "60px", background: "rgba(212,175,55,0.1)", color: "#d4af37" }}
    >
      <i className={`fas ${icon} fs-4`}></i>
    </motion.div>
    <h4 className="fw-bold text-white mb-3">{title}</h4>
    <p className="text-secondary mb-0" style={{ lineHeight: "1.7" }}>{desc}</p>
  </motion.div>
);

const TimelineItem = ({ step, title, icon, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="d-flex position-relative mb-5">
      {!isLast && (
        <div className="position-absolute" style={{ left: "29px", top: "60px", bottom: "-30px", width: "2px", background: "linear-gradient(to bottom, rgba(212,175,55,0.5), rgba(212,175,55,0.05))" }} />
      )}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle z-index-1"
        style={{ width: "60px", height: "60px", background: "#0B0B0B", border: "2px solid #d4af37", color: "#d4af37", boxShadow: "0 0 20px rgba(212,175,55,0.2)" }}
      >
        <i className={`fas ${icon} fs-5`}></i>
      </motion.div>
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="ms-4 pt-2"
      >
        <span className="text-uppercase fw-bold mb-1 d-block" style={{ color: "#d4af37", fontSize: "0.8rem", letterSpacing: "2px" }}>Step {step}</span>
        <h3 className="fw-bold text-white mb-2">{title}</h3>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------
// MAIN ABOUT COMPONENT
// ---------------------------------------------------------

// Particle Generator
const staticParticles = Array.from({ length: 20 }).map((_, i) => ({
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5
}));

function About() {
  useEffect(() => {
    document.title = "About | TripShare";
    window.scrollTo(0, 0);
  }, []);

  // Hero Parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  return (
    <div style={{ background: "#0B0B0B", color: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      
      {/* ---------------------------------------------------------
          HERO SECTION
      --------------------------------------------------------- */}
      <section ref={heroRef} className="position-relative d-flex align-items-center text-center" style={{ minHeight: "100vh", overflow: "hidden", background: "#0B0B0B" }}>
        {/* Animated Background */}
        <motion.div style={{ y: heroY }} className="position-absolute w-100 h-100 top-0 start-0">
          <div className="position-absolute w-100 h-100" style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, rgba(11,11,11,1) 70%)" }} />
          {/* Subtle World Map Silhouette can go here via CSS bg image if available, using radial gradients for now */}
          
          {/* Floating Gold Particles */}
          {staticParticles.map((p, i) => (
            <motion.div
              key={i}
              className="position-absolute rounded-circle"
              style={{ width: p.size, height: p.size, background: "#d4af37", left: `${p.x}%`, top: `${p.y}%`, opacity: 0.3, filter: "blur(1px)" }}
              animate={{ y: [0, -100, 0], x: [0, 50, 0], opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
            />
          ))}
          
          {/* Soft Moving Light Beams */}
          <motion.div 
            animate={{ rotate: [0, 360] }} 
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.03) 90deg, transparent 180deg)", zIndex: 0 }}
          />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="container position-relative z-index-1">
          <div className="mx-auto" style={{ maxWidth: "900px" }}>
            <h1 className="display-1 fw-bold text-white mb-4" style={{ letterSpacing: "-2px", lineHeight: "1.1" }}>
              {"Travel Together. Explore Smarter.".split(" ").map((word, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.8, delay: i * 0.15 + 0.2 }} 
                  className="d-inline-block me-3"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}
              className="fs-4 mx-auto mb-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.6", maxWidth: "700px" }}
            >
              TripShare is a modern travel platform that brings planning, collaboration, intelligent travel assistance, memories, and experiences together in one seamless journey.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3 }}
              className="d-flex flex-wrap justify-content-center gap-3"
            >
              <Link to="/register" className="btn btn-lg px-5 py-3 rounded-pill" style={{ background: "#d4af37", color: "#000", fontWeight: "600", boxShadow: "0 10px 30px rgba(212,175,55,0.2)" }}>
                Start Your Journey
              </Link>
              <Link to="/features" className="btn btn-lg px-5 py-3 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600" }}>
                Explore Features
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------
          OUR STORY
      --------------------------------------------------------- */}
      <section className="py-6 position-relative overflow-hidden" style={{ background: "#121212", padding: "120px 0" }}>
        <div className="container">
          <div className="row align-items-center">
            <motion.div 
              initial={{ opacity: 0, x: -100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}
              className="col-lg-5 mb-5 mb-lg-0"
            >
              <div className="position-relative p-2 rounded-5" style={{ background: "linear-gradient(45deg, rgba(212,175,55,0.2), transparent)", border: "1px solid rgba(212,175,55,0.1)" }}>
                <img src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=1000&auto=format&fit=crop" alt="Travel Collaboration" className="img-fluid rounded-4 shadow-lg" style={{ filter: "brightness(0.8)" }} />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}
              className="col-lg-6 offset-lg-1"
            >
              <span className="text-uppercase fw-bold mb-2 d-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>Our Story</span>
              <h2 className="display-4 fw-bold text-white mb-4">Every unforgettable journey begins with great planning.</h2>
              <p className="fs-5 text-secondary mb-4" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                But group travel is often more complicated than it should be. People switch between multiple apps to organize trips, manage expenses, communicate with friends, and preserve memories. Important information gets lost, planning becomes stressful, and shared experiences become scattered.
              </p>
              <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                TripShare was created to bring every part of a journey together into one connected platform where travelers can plan, collaborate, communicate, capture memories, and relive every adventure with ease.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          OUR MISSION & VISION
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0B0B0B">
        <div className="row g-5">
          <div className="col-lg-6">
            <motion.div whileHover={{ y: -10 }} className="p-5 rounded-5 h-100 position-relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
              <div className="position-absolute top-0 end-0 p-4 opacity-25">
                <i className="fas fa-bullseye" style={{ fontSize: "100px", color: "#d4af37" }}></i>
              </div>
              <div className="position-relative z-index-1">
                <i className="fas fa-compass fs-1 mb-4" style={{ color: "#d4af37", textShadow: "0 0 20px rgba(212,175,55,0.5)" }}></i>
                <h3 className="display-5 fw-bold text-white mb-4">Our Mission</h3>
                <p className="fs-4 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                  Our mission is to simplify travel by creating experiences that help people plan smarter, travel together, and preserve every unforgettable moment.
                </p>
              </div>
            </motion.div>
          </div>
          <div className="col-lg-6">
            <motion.div whileHover={{ y: -10 }} className="p-5 rounded-5 h-100 position-relative" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)", backdropFilter: "blur(20px)" }}>
              <div className="position-absolute top-0 end-0 p-4 opacity-25">
                <i className="fas fa-eye" style={{ fontSize: "100px", color: "#d4af37" }}></i>
              </div>
              <div className="position-relative z-index-1">
                <i className="fas fa-globe fs-1 mb-4" style={{ color: "#d4af37", textShadow: "0 0 20px rgba(212,175,55,0.5)" }}></i>
                <h3 className="display-5 fw-bold text-white mb-4">Our Vision</h3>
                <p className="fs-5 text-secondary mb-3" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                  We envision a future where every journey is connected through intelligent planning, seamless collaboration, and meaningful shared experiences.
                </p>
                <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                  TripShare aims to become a platform that travelers trust from the moment they start planning until long after they return home.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          WHAT MAKES TRIPSHARE DIFFERENT
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212">
        <div className="text-center mb-5 pb-4">
          <span className="text-uppercase fw-bold mb-2 d-inline-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>The Platform</span>
          <h2 className="display-4 fw-bold text-white">What Makes TripShare Different</h2>
        </div>
        
        <div className="row g-4">
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-map-marked-alt" title="Smart Trip Planning" desc="Create intelligent itineraries built for modern explorers." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-users" title="Group Collaboration" desc="Seamlessly coordinate with your friends in real-time." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-comment-dots" title="Real-Time Chat" desc="Integrated communication mapped directly to your journey." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-wallet" title="Expense Management" desc="Track, split, and settle balances effortlessly." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-stream" title="Travel Timeline" desc="Your entire trip presented as an interactive timeline." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-images" title="Travel Memories" desc="A shared visual canvas for every photo and moment." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-robot" title="Intelligent Assistant" desc="Contextual travel suggestions that adapt to your style." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-suitcase" title="Packing Suggestions" desc="Automated checklists ensuring you never leave essentials behind." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-user-friends" title="Traveler Discovery" desc="Find verified companions matching your exact travel vibe." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-chart-pie" title="Analytics Dashboard" desc="Visualize your travel habits, expenses, and geographic footprints." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-location-arrow" title="Live Tracking" desc="Keep your group safe and synced with real-time location." /></div>
          <div className="col-md-6 col-lg-3"><FeatureCard icon="fa-shield-alt" title="Secure Platform" desc="Enterprise-grade architecture keeping your journeys private." /></div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          THE COMPLETE TRAVEL JOURNEY (Timeline)
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0B0B0B">
        <div className="row">
          <div className="col-lg-5 mb-5 mb-lg-0">
            <div className="sticky-top" style={{ top: "120px" }}>
              <span className="text-uppercase fw-bold mb-2 d-inline-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>The Lifecycle</span>
              <h2 className="display-4 fw-bold text-white mb-4">The Complete Travel Journey</h2>
              <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
                TripShare is the only platform designed to accompany you through every single phase of exploration—from the first spark of inspiration to the lasting memories you carry forever.
              </p>
            </div>
          </div>
          <div className="col-lg-6 offset-lg-1">
            <div className="py-4">
              <TimelineItem step="1" title="Discover" icon="fa-search" />
              <TimelineItem step="2" title="Create Trip" icon="fa-plus-circle" />
              <TimelineItem step="3" title="Invite Friends" icon="fa-user-plus" />
              <TimelineItem step="4" title="Plan Together" icon="fa-map" />
              <TimelineItem step="5" title="Travel" icon="fa-plane-departure" />
              <TimelineItem step="6" title="Capture Memories" icon="fa-camera" />
              <TimelineItem step="7" title="Track Expenses" icon="fa-receipt" />
              <TimelineItem step="8" title="Travel Timeline" icon="fa-history" />
              <TimelineItem step="9" title="Generate Travel Story" icon="fa-book-open" />
              <TimelineItem step="10" title="Relive Every Journey" icon="fa-heart" isLast={true} />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          WHY TRAVELERS CHOOSE TRIPSHARE & INTELLIGENT FEATURES
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white">Why Travelers Choose TripShare</h2>
        </div>
        <div className="row g-4 mb-5 pb-5">
          {["Everything in One Place", "Collaborative Planning", "Smarter Travel Decisions", "Shared Experiences", "Organized Memories", "Secure Platform", "Beautiful User Experience", "Real-Time Collaboration"].map((item, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h5 className="fw-bold text-white mb-0" style={{ fontSize: "1.1rem" }}>{item}</h5>
              </div>
            </div>
          ))}
        </div>

        <div className="row align-items-center mt-5 pt-5 border-top" style={{ borderColor: "rgba(255,255,255,0.05) !important" }}>
          <div className="col-lg-6 mb-5 mb-lg-0">
             <span className="text-uppercase fw-bold mb-2 d-inline-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>Smart Capabilities</span>
             <h2 className="display-4 fw-bold text-white mb-4">Intelligent Features</h2>
             <p className="fs-5 text-secondary mb-4" style={{ fontWeight: "300", lineHeight: "1.7" }}>
               TripShare includes intelligent features that help travelers throughout every stage of their journey. We leverage modern algorithms to eliminate the guesswork from travel planning.
             </p>
             <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                {["Travel Assistant", "Packing Suggestions", "Travel Story Generation", "Expense Insights", "Smart Recommendations", "Traveler Matching"].map((feat, i) => (
                  <li key={i} className="d-flex align-items-center">
                    <i className="fas fa-check-circle me-3" style={{ color: "#d4af37" }}></i>
                    <span className="fs-5 text-light">{feat}</span>
                  </li>
                ))}
             </ul>
          </div>
          <div className="col-lg-5 offset-lg-1 text-center">
             <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
               <i className="fas fa-brain" style={{ fontSize: "180px", background: "-webkit-linear-gradient(45deg, #d4af37, #fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 20px 40px rgba(212,175,55,0.3))" }}></i>
             </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          PRIVACY & SECURITY
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0B0B0B">
        <div className="text-center mx-auto mb-5 pb-3" style={{ maxWidth: "800px" }}>
          <i className="fas fa-shield-check fs-1 mb-3" style={{ color: "#d4af37" }}></i>
          <h2 className="display-4 fw-bold text-white mb-4">Built with Trust</h2>
          <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
            Your journeys, memories, and conversations deserve to remain private. TripShare is designed with secure authentication, protected communication, responsible data handling, and privacy-first principles to provide a safe and trusted travel experience.
          </p>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <i className="fas fa-lock fs-2 mb-3 text-secondary"></i>
              <h5 className="text-white fw-bold">Secure Authentication</h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.1)" }}>
              <i className="fas fa-user-shield fs-2 mb-3" style={{ color: "#d4af37" }}></i>
              <h5 className="text-white fw-bold">Privacy-First Architecture</h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <i className="fas fa-server fs-2 mb-3 text-secondary"></i>
              <h5 className="text-white fw-bold">Protected Data Handling</h5>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          OUR VALUES & THE FUTURE
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212">
        <div className="row mb-5 pb-5">
           <div className="col-12 text-center mb-5">
             <h2 className="display-4 fw-bold text-white">Our Values</h2>
           </div>
           {["Innovation", "Trust", "Community", "Privacy", "Security", "Simplicity", "Reliability", "Continuous Improvement"].map((value, i) => (
             <div key={i} className="col-6 col-md-3 mb-4">
               <motion.div whileHover={{ y: -5, background: "rgba(212,175,55,0.05)" }} className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s ease" }}>
                 <h6 className="fw-bold text-white mb-0" style={{ letterSpacing: "1px" }}>{value}</h6>
               </motion.div>
             </div>
           ))}
        </div>

        <div className="row align-items-center border-top pt-5 mt-5" style={{ borderColor: "rgba(255,255,255,0.05) !important" }}>
          <div className="col-lg-5 mb-5 mb-lg-0">
             <span className="text-uppercase fw-bold mb-2 d-inline-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>The Roadmap</span>
             <h2 className="display-4 fw-bold text-white mb-4">The Journey Ahead</h2>
             <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
               TripShare continues to evolve with new ideas and thoughtful innovations designed to make travel even more connected, collaborative, and memorable.
             </p>
          </div>
          <div className="col-lg-6 offset-lg-1">
             <div className="d-flex flex-wrap gap-3">
               {["Offline Support", "Multi-language Experience", "Smarter Recommendations", "Travel Partner Integrations", "Enhanced Collaboration", "Interactive Maps", "Personalized Experiences"].map((item, i) => (
                 <span key={i} className="px-4 py-2 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0", fontSize: "0.95rem" }}>
                   {item}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          FINAL CTA
      --------------------------------------------------------- */}
      <section className="position-relative d-flex align-items-center justify-content-center text-center py-6" style={{ minHeight: "60vh", background: "#0B0B0B", overflow: "hidden" }}>
        <div className="position-absolute w-100 h-100" style={{ background: "radial-gradient(circle at center, rgba(212,175,55,0.15) 0%, #0B0B0B 70%)", zIndex: 0 }}></div>
        
        <div className="container position-relative z-index-1 py-5">
           <h2 className="display-2 fw-bold text-white mb-4" style={{ letterSpacing: "-2px" }}>Ready for Your Next Adventure?</h2>
           <p className="fs-4 mb-5 mx-auto text-secondary" style={{ fontWeight: "300", maxWidth: "700px", lineHeight: "1.6" }}>
             Whether you're planning a weekend getaway or a once-in-a-lifetime journey, TripShare helps you travel smarter, stay connected, and create memories that last forever.
           </p>
           
           <div className="d-flex flex-wrap justify-content-center gap-4">
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Link to="/register" className="btn btn-lg px-5 py-4 rounded-pill position-relative overflow-hidden" style={{ background: "#d4af37", color: "#000", fontWeight: "700", border: "none", boxShadow: "0 10px 40px rgba(212,175,55,0.3)", fontSize: "1.1rem" }}>
                 <span className="position-relative z-index-1">Get Started</span>
               </Link>
             </motion.div>
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Link to="/features" className="btn btn-lg px-5 py-4 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: "600", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1.1rem" }}>
                 Explore Features
               </Link>
             </motion.div>
           </div>
        </div>
      </section>

    </div>
  );
}

export default About;
