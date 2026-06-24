import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import ActivityCard from "../components/activity/ActivityCard";

function Home() {

  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedTotalPages, setFeedTotalPages] = useState(1);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const token = localStorage.getItem("token");

  const fetchFeed = async (pageNum = 1) => {
    if (!token) return;
    try {
      setLoadingFeed(true);
      const res = await API.get(`/activities?feedType=home&page=${pageNum}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (pageNum === 1) {
        setActivities(res.data.activities || []);
      } else {
        setActivities((prev) => [...prev, ...(res.data.activities || [])]);
      }
      setFeedPage(res.data.page);
      setFeedTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch public feed:", err);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  return (
    <>

      {/* HERO */}

      <section className="hero">

        <div className="overlay"></div>

        <div className="container hero-content">

          <h1>
            Travel Far. Share More. Spend Less.
          </h1>

          <p>
            Find your perfect travel buddy across all ages —
            families, friends, and solo explorers.
          </p>

          <p className="quote">
            “Travel is better when shared —
            with laughter, stories, and smiles.”
          </p>

          <button
            className="btn btn-custom"
            onClick={() => navigate("/login")}
          >
            Start Your Journey
          </button>

        </div>

      </section>

      {/* WHY TRIPSHARE */}

      <section className="why-tripshare">

        <div className="container">

          <h2 className="section-title">
            Why TripShare?
          </h2>

          <div className="row g-4">

            <div className="col-md-4">

              <div className="special-card">

                <h5>
                  “Meet. Match. Move.”
                </h5>

                <p>
                  Find travel partners with similar
                  goals and personalities.
                </p>

              </div>

            </div>

            <div className="col-md-4">

              <div className="special-card">

                <h5>
                  “Wander together, spend smarter.”
                </h5>

                <p>
                  Share travel costs and maximize
                  your experiences.
                </p>

              </div>

            </div>

            <div className="col-md-4">

              <div className="special-card">

                <h5>
                  “Solo plans, shared memories.”
                </h5>

                <p>
                  Even solo travelers find amazing
                  companions with TripShare.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* USERS SECTION */}

      <section className="users-section">

        <div className="container">

          <h2 className="users-title">
            Who is TripShare for?
          </h2>

          <div className="users-grid">

            {/* FAMILY */}

            <div className="user-card">

              <div className="user-icon">
                👨‍👩‍👧
              </div>

              <h3>
                Families
              </h3>

              <p>
                Find other families to co-plan
                safe and friendly vacations.
              </p>

            </div>

            {/* STUDENTS */}

            <div className="user-card">

              <div className="user-icon">
                🧑‍🎓
              </div>

              <h3>
                Students
              </h3>

              <p>
                Explore within budget by sharing
                trips with fellow students.
              </p>

            </div>

            {/* SENIORS */}

            <div className="user-card">

              <div className="user-icon">
                👴
              </div>

              <h3>
                Seniors
              </h3>

              <p>
                Meet age-friendly travel partners
                and rediscover joyful journeys.
              </p>

            </div>

            {/* SOLO */}

            <div className="user-card">

              <div className="user-icon">
                🌍
              </div>

              <h3>
                Solo Travelers
              </h3>

              <p>
                Never feel alone — connect and
                create unforgettable memories.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* LIVE TRAVEL FEED */}
      {token && (
        <section className="live-feed-section py-5" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <h2 className="section-title text-center text-warning fw-bold mb-4">🌍 Live Travel Feed</h2>
            <p className="text-secondary text-center mb-5" style={{ fontSize: "15px" }}>See what travelers are planning and sharing in real-time.</p>
            
            {activities.length === 0 && !loadingFeed ? (
              <div className="glass-card p-4 text-center">
                <p className="text-secondary mb-0">No public activities yet. Be the first to share your journey!</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {activities.map((activity) => (
                  <ActivityCard key={activity._id} activity={activity} />
                ))}
                {feedPage < feedTotalPages && (
                  <div className="text-center mt-3">
                    <button
                      className="btn btn-outline-warning fw-bold px-4 py-2"
                      disabled={loadingFeed}
                      onClick={() => fetchFeed(feedPage + 1)}
                      style={{ borderRadius: "8px" }}
                    >
                      {loadingFeed ? "Syncing..." : "Load More Activity"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}

      <footer className="footer">

        <div className="container text-center">

          <div className="footer-socials">

            <i className="fab fa-instagram"></i>

            <i className="fab fa-whatsapp"></i>

            <i className="fab fa-twitter"></i>

            <i className="fab fa-facebook"></i>

          </div>

          <div className="contact-text">

            Contact Us

          </div>

          <div className="copyright">

            © 2025 TripShare.
            All rights reserved.

          </div>

        </div>

      </footer>

    </>
  );
}

export default Home;