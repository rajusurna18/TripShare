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

const CinematicFeatureSection = ({ bg = "#000000", title, desc, icon, highlights, invert = false, glowColor = "rgba(212,175,55,0.05)" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const textX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [invert ? 150 : -150, 0, 0, invert ? 150 : -150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  const graphicX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [invert ? -150 : 150, 0, 0, invert ? -150 : 150]);
  const graphicOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const graphicScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <div ref={ref} className="position-relative py-6 border-bottom" style={{ borderColor: "rgba(255,255,255,0.02) !important", minHeight: "80vh", background: bg, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <motion.div style={{ opacity: graphicOpacity, scale: graphicScale }} className="position-absolute w-100 h-100 top-0 start-0">
        <div className="position-absolute" style={{ top: "50%", left: invert ? "25%" : "75%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`, filter: "blur(60px)", transform: "translate(-50%, -50%)", borderRadius: "50%", zIndex: 0 }}></div>
      </motion.div>

      <div className="container position-relative z-index-1 my-5">
        <div className="row align-items-center">
          <div className={`col-lg-5 ${invert ? 'order-lg-2 offset-lg-1' : ''}`}>
             <motion.div style={{ x: textX, opacity: textOpacity }}>
                <h2 className="display-4 fw-bold text-white mb-4" style={{ letterSpacing: "-1px" }}>{title}</h2>
                <p className="fs-5 mb-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>{desc}</p>
                <div className="d-flex flex-wrap gap-2">
                  {highlights.map((h, i) => (
                    <span key={i} className="px-3 py-2 rounded-pill" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#d4af37", fontSize: "0.85rem", fontWeight: "600" }}>
                      <i className="fas fa-check me-2" style={{ opacity: 0.5 }}></i>{h}
                    </span>
                  ))}
                </div>
             </motion.div>
          </div>
          <div className={`col-lg-6 ${invert ? 'order-lg-1' : 'offset-lg-1'} mt-5 mt-lg-0`}>
             <motion.div 
               style={{ x: graphicX, opacity: graphicOpacity, scale: graphicScale, minHeight: "450px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }} 
               className="p-5 rounded-5 d-flex align-items-center justify-content-center position-relative overflow-hidden"
             >
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                   <i className={`fas ${icon}`} style={{ fontSize: "7rem", background: "-webkit-linear-gradient(45deg, #d4af37, #fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 20px 40px rgba(212,175,55,0.2))" }}></i>
                </motion.div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ step, title, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="d-flex position-relative mb-5 w-100 justify-content-center">
      {!isLast && (
        <div className="position-absolute" style={{ left: "50%", transform: "translateX(-50%)", top: "50px", bottom: "-30px", width: "2px", background: "linear-gradient(to bottom, rgba(212,175,55,0.3), rgba(212,175,55,0.05))" }} />
      )}
      <motion.div 
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={isInView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0, opacity: 0, y: 20 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="d-flex flex-column align-items-center z-index-1 bg-black px-4"
      >
        <span className="text-uppercase fw-bold mb-2" style={{ color: "#d4af37", fontSize: "0.8rem", letterSpacing: "2px" }}>{step}</span>
        <h3 className="fw-bold text-white mb-0 text-center">{title}</h3>
      </motion.div>
    </div>
  );
};

const staticParticles = Array.from({ length: 30 }).map((_, i) => ({
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5
}));

// ---------------------------------------------------------
// MAIN FEATURES COMPONENT
// ---------------------------------------------------------

function Features() {
  useEffect(() => {
    document.title = "Features | TripShare";
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
        <motion.div style={{ y: heroY }} className="position-absolute w-100 h-100 top-0 start-0">
          <div className="position-absolute w-100 h-100" style={{ background: "radial-gradient(circle at top right, rgba(212,175,55,0.1) 0%, rgba(11,11,11,1) 70%)" }} />
          
          {staticParticles.map((p, i) => (
            <motion.div
              key={i}
              className="position-absolute rounded-circle"
              style={{ width: p.size, height: p.size, background: "#d4af37", left: `${p.x}%`, top: `${p.y}%`, opacity: 0.4, filter: "blur(1px)" }}
              animate={{ y: [0, -100, 0], x: [0, 50, 0], opacity: [0.1, 0.6, 0.1] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
            />
          ))}
          
          {/* Subtle Travel Route Lines */}
          <div className="position-absolute w-100 h-100" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5, transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)" }}></div>
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="container position-relative z-index-1">
          <div className="mx-auto" style={{ maxWidth: "1000px" }}>
            <h1 className="display-1 fw-bold text-white mb-4" style={{ letterSpacing: "-2px", lineHeight: "1.1" }}>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="d-block">Everything You Need.</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="d-block" style={{ color: "#d4af37" }}>Every Journey.</motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="d-block">One Platform.</motion.span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}
              className="fs-4 mx-auto mb-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.6", maxWidth: "800px" }}
            >
              TripShare brings planning, collaboration, intelligent travel assistance, communication, memories, and experiences together in one beautifully connected platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }}
              className="d-flex flex-wrap justify-content-center gap-3"
            >
              <Link to="/register" className="btn btn-lg px-5 py-3 rounded-pill" style={{ background: "#d4af37", color: "#000", fontWeight: "600", boxShadow: "0 10px 30px rgba(212,175,55,0.2)" }}>
                Start Your Journey
              </Link>
              <Link to="/about" className="btn btn-lg px-5 py-3 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", fontWeight: "600" }}>
                Explore TripShare
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="position-absolute bottom-0 start-50 translate-middle-x mb-4 pb-2">
          <i className="fas fa-chevron-down fs-4" style={{ color: "rgba(212,175,55,0.5)" }}></i>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------
          INTRODUCTION
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212" className="text-center">
        <div className="mx-auto" style={{ maxWidth: "800px" }}>
          <h2 className="display-4 fw-bold text-white mb-4">Designed for Modern Travelers</h2>
          <p className="fs-5 text-secondary mb-3" style={{ fontWeight: "300", lineHeight: "1.7" }}>
            Planning a journey should be exciting—not complicated.
          </p>
          <p className="fs-5 text-secondary" style={{ fontWeight: "300", lineHeight: "1.7" }}>
            TripShare simplifies every stage of travel by bringing planning, collaboration, communication, organization, and unforgettable memories into one seamless experience.
          </p>
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          FEATURE SHOWCASES
      --------------------------------------------------------- */}
      <CinematicFeatureSection 
        bg="#0B0B0B"
        title="Smart Trip Planning"
        desc="Create trips in minutes. Organize destinations, schedules, travel details, and participants from one place."
        icon="fa-map-marked-alt"
        highlights={["Create trips", "Edit trips", "Invite members", "Join trips", "Manage trip information", "Collaborate effortlessly"]}
        invert={false}
      />

      <CinematicFeatureSection 
        bg="#121212"
        title="Intelligent Travel Assistant"
        desc="Receive intelligent guidance before, during, and after every journey. TripShare provides helpful travel recommendations, answers travel questions, and assists throughout your experience."
        icon="fa-robot"
        highlights={["Travel assistant", "Packing suggestions", "Smart recommendations", "Travel guidance", "Story generation"]}
        invert={true}
      />

      <CinematicFeatureSection 
        bg="#0B0B0B"
        title="Travel Timeline"
        desc="Capture every day of your journey. Organize photos, notes, expenses, and locations into a beautiful timeline that becomes a lasting travel story."
        icon="fa-stream"
        highlights={["Daily timeline", "Photos", "Notes", "Locations", "Expenses", "Travel story", "Journey summary"]}
        invert={false}
      />

      <CinematicFeatureSection 
        bg="#121212"
        title="Group Collaboration"
        desc="Travel is better together. Keep everyone connected before, during, and after the trip."
        icon="fa-users"
        highlights={["Group chat", "Trip discussions", "Member invitations", "Shared planning", "Notifications"]}
        invert={true}
      />

      <CinematicFeatureSection 
        bg="#0B0B0B"
        title="Expense Management"
        desc="Split expenses fairly and keep every traveler informed."
        icon="fa-wallet"
        highlights={["Expense tracking", "Shared expenses", "Settlement suggestions", "Spending insights", "Budget overview"]}
        invert={false}
      />

      <CinematicFeatureSection 
        bg="#121212"
        title="Memories"
        desc="Turn unforgettable experiences into beautiful memories."
        icon="fa-images"
        highlights={["Upload memories", "Like", "Comment", "Timeline integration", "Organized albums"]}
        invert={true}
      />

      <CinematicFeatureSection 
        bg="#0B0B0B"
        title="Traveler Community"
        desc="Discover like-minded travelers and build meaningful travel connections."
        icon="fa-user-friends"
        highlights={["Discover travelers", "Friend requests", "Follow travelers", "Reviews", "Community interaction"]}
        invert={false}
      />

      <CinematicFeatureSection 
        bg="#121212"
        title="Live Tracking"
        desc="Stay connected throughout the journey with real-time travel visibility."
        icon="fa-location-arrow"
        highlights={["Live locations", "Trip progress", "Connected members", "Safe collaboration"]}
        invert={true}
      />

      <CinematicFeatureSection 
        bg="#0B0B0B"
        title="Blogs & Experiences"
        desc="Share travel experiences with the community and inspire future journeys."
        icon="fa-book-open"
        highlights={["Travel blogs", "Comments", "Likes", "Sharing", "Discover experiences"]}
        invert={false}
      />

      <CinematicFeatureSection 
        bg="#121212"
        title="Analytics Dashboard"
        desc="Understand your travel activity through clean insights and visual dashboards."
        icon="fa-chart-pie"
        highlights={["Travel overview", "Recent activity", "Expenses", "Trips", "Community insights"]}
        invert={true}
      />

      {/* ---------------------------------------------------------
          WHY CHOOSE TRIPSHARE (Premium Comparison Cards)
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0B0B0B">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white">Why Choose TripShare</h2>
        </div>
        <div className="row g-4">
          {["Everything in One Platform", "Smarter Planning", "Connected Experiences", "Collaborative Travel", "Organized Memories", "Secure Platform", "Modern User Experience", "Intelligent Assistance"].map((item, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <motion.div whileHover={{ y: -5, background: "rgba(212,175,55,0.05)" }} className="p-4 rounded-4 text-center h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s ease" }}>
                <h5 className="fw-bold text-white mb-0" style={{ fontSize: "1.1rem" }}>{item}</h5>
              </motion.div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          PLATFORM OVERVIEW (Visual Workflow)
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212" className="text-center">
        <div className="mx-auto mb-5 pb-5" style={{ maxWidth: "800px" }}>
          <span className="text-uppercase fw-bold mb-2 d-inline-block" style={{ color: "#d4af37", letterSpacing: "2px" }}>Platform Overview</span>
          <h2 className="display-4 fw-bold text-white mb-4">The Complete Workflow</h2>
        </div>
        
        <div className="mx-auto" style={{ maxWidth: "600px" }}>
          <TimelineItem step="01" title="Discover" />
          <TimelineItem step="02" title="Create Trip" />
          <TimelineItem step="03" title="Invite Friends" />
          <TimelineItem step="04" title="Plan Together" />
          <TimelineItem step="05" title="Travel" />
          <TimelineItem step="06" title="Track Expenses" />
          <TimelineItem step="07" title="Capture Memories" />
          <TimelineItem step="08" title="Build Timeline" />
          <TimelineItem step="09" title="Generate Travel Story" />
          <TimelineItem step="10" title="Share Experiences" isLast={true} />
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          PLATFORM HIGHLIGHTS
      --------------------------------------------------------- */}
      <SectionWrapper bg="#0B0B0B">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white">Platform Highlights</h2>
        </div>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {["Trip Planning", "Travel Assistant", "Packing Suggestions", "Travel Timeline", "Memories", "Expense Management", "Traveler Discovery", "Real-Time Chat", "Live Tracking", "Blogs", "Analytics", "Community"].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="px-4 py-3 rounded-pill" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37", fontSize: "1rem", fontWeight: "600" }}>
              {item}
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          BUILT FOR EVERY JOURNEY
      --------------------------------------------------------- */}
      <SectionWrapper bg="#121212">
        <div className="text-center mb-5 pb-4">
          <h2 className="display-4 fw-bold text-white">Built for Every Journey</h2>
        </div>
        <div className="row g-4">
          {["Weekend Getaways", "Family Vacations", "Road Trips", "College Trips", "Business Travel", "Solo Adventures", "Group Expeditions", "International Travel"].map((item, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="p-4 rounded-4 text-center h-100" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h6 className="fw-bold text-secondary mb-0">{item}</h6>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ---------------------------------------------------------
          FINAL CTA
      --------------------------------------------------------- */}
      <section className="position-relative d-flex align-items-center justify-content-center text-center py-6" style={{ minHeight: "60vh", background: "#0B0B0B", overflow: "hidden" }}>
        <div className="position-absolute w-100 h-100" style={{ background: "radial-gradient(circle at center, rgba(212,175,55,0.15) 0%, #0B0B0B 70%)", zIndex: 0 }}></div>
        
        <div className="container position-relative z-index-1 py-5">
           <h2 className="display-2 fw-bold text-white mb-4" style={{ letterSpacing: "-2px" }}>Your Next Journey Starts Here</h2>
           <p className="fs-4 mb-5 mx-auto text-secondary" style={{ fontWeight: "300", maxWidth: "800px", lineHeight: "1.6" }}>
             Whether you're planning your first trip or your hundredth adventure, TripShare gives you everything you need to organize, collaborate, and create unforgettable travel experiences.
           </p>
           
           <div className="d-flex flex-wrap justify-content-center gap-4">
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Link to="/register" className="btn btn-lg px-5 py-4 rounded-pill position-relative overflow-hidden" style={{ background: "#d4af37", color: "#000", fontWeight: "700", border: "none", boxShadow: "0 10px 40px rgba(212,175,55,0.3)", fontSize: "1.1rem" }}>
                 <span className="position-relative z-index-1">Create Your First Trip</span>
               </Link>
             </motion.div>
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Link to="/" className="btn btn-lg px-5 py-4 rounded-pill" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: "600", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1.1rem" }}>
                 Start Exploring
               </Link>
             </motion.div>
           </div>
        </div>
      </section>

    </div>
  );
}

export default Features;
