import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  return (
    <>

      <section className="hero">

        <div className="overlay"></div>

        <div className="container hero-content">

          <h1>
            Travel Far. Share More. Spend Less.
          </h1>

          <p>
            Find your perfect travel buddy across all ages –
            families, friends, and solo explorers.
          </p>

          <p className="quote">
            “Travel is better when shared – with laughter,
            stories, and smiles.”
          </p>

          <button
            className="btn btn-custom"
            onClick={() => navigate("/login")}
          >
            Start Your Journey
          </button>

        </div>

      </section>

      <section className="py-5 text-center">

        <div className="container">

          <h2 className="section-title">
            Why TripShare?
          </h2>

          <div className="row g-4">

            <div className="col-md-4">

              <div className="special-card">

                <h5>“Meet. Match. Move.”</h5>

                <p>
                  Find travel partners with similar goals
                  and personalities.
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
                  Even solo travelers find great
                  companions with TripShare.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="py-5 text-center bg-dark">

        <div className="container">

          <h2 className="section-title">
            Who is TripShare for?
          </h2>

          <div className="row g-4">

            <div className="col-md-3">

              <div className="special-card">

                <h6>👨‍👩‍👧 Families</h6>

                <p>
                  Find other families to co-plan
                  safe and friendly vacations.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="special-card">

                <h6>🧑‍🎓 Students</h6>

                <p>
                  Explore within budget by sharing
                  trips with fellow students.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="special-card">

                <h6>👴 Seniors</h6>

                <p>
                  Meet age-friendly travel partners
                  and rediscover the joy of travel.
                </p>

              </div>

            </div>

            <div className="col-md-3">

              <div className="special-card">

                <h6>🌍 Solo Travelers</h6>

                <p>
                  Never feel alone—connect and create
                  unforgettable memories.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      <footer className="footer">

        <div className="text-center">

          <div className="social-icons">

            <i className="fab fa-instagram fa-2x"></i>

            <i className="fab fa-whatsapp fa-2x"></i>

            <i className="fab fa-twitter fa-2x"></i>

            <i className="fab fa-facebook fa-2x"></i>

          </div>

          <div className="contact-text">
            Contact Us
          </div>

          <div className="copyright">
            © 2025 TripShare. All rights reserved.
          </div>

        </div>

      </footer>

    </>
  );
}

export default Home;