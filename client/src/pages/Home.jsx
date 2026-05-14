import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

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

      <section className="py-5 text-center">

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