import { Link } from "react-router-dom";

function Dashboard() {

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="dashboard-header">

          <h1>
            Welcome Back Traveler 🌍
          </h1>

          <p>
            Plan smarter trips,
            connect with travelers,
            and explore the world with AI.
          </p>

        </div>

        {/* TOP FEATURE SECTION */}

        <div className="row g-4 mb-5">

          <div className="col-lg-8">

            <div className="special-card h-100">

              <h2 className="text-warning mb-4">
                ✨ AI Trip Planner
              </h2>

              <p className="mb-4">

                Ask AI for:
                destination ideas,
                budget trips,
                hotels,
                itineraries,
                weather,
                and smart travel suggestions.

              </p>

              <Link
                to="/ai"
                className="btn btn-custom"
              >
                Open AI Planner
              </Link>

            </div>

          </div>

          <div className="col-lg-4">

            <div className="special-card h-100">

              <h3 className="text-warning mb-4">
                📊 Travel Stats
              </h3>

              <p>
                ✈ Trips Completed: 12
              </p>

              <p>
                🌍 Countries Visited: 5
              </p>

              <p>
                👥 Travel Buddies: 18
              </p>

              <p>
                💰 Money Saved: ₹45,000
              </p>

            </div>

          </div>

        </div>

        {/* MAIN DASHBOARD GRID */}

        <div className="dashboard-grid">

          <Link
            to="/trips"
            className="dashboard-box"
          >

            <h3>
              ✈️ Trips
            </h3>

            <p>
              Explore and manage
              your upcoming adventures.
            </p>

          </Link>

          <Link
            to="/create-trip"
            className="dashboard-box"
          >

            <h3>
              🧳 Create Trip
            </h3>

            <p>
              Organize a new journey
              and invite travelers.
            </p>

          </Link>

          <Link
            to="/matches"
            className="dashboard-box"
          >

            <h3>
              👥 Smart Matches
            </h3>

            <p>
              Find travelers with
              matching interests and budgets.
            </p>

          </Link>

          <Link
            to="/chat"
            className="dashboard-box"
          >

            <h3>
              💬 Chat Box
            </h3>

            <p>
              Talk with your travel
              companions in real time.
            </p>

          </Link>

        </div>

        {/* CURRENT TRIPS */}

        <div className="mt-5">

          <h2 className="section-title">
            Current Trips ✈️
          </h2>

          <div className="row g-4">

            <div className="col-md-4">

              <div className="trip-card">

                <div className="trip-card-top">

                  <h3>Goa Escape</h3>

                  <span className="trip-badge">
                    Active
                  </span>

                </div>

                <div className="trip-details">

                  <p>
                    📍
                    <span>Goa</span>
                  </p>

                  <p>
                    💰
                    <span>₹12,000</span>
                  </p>

                  <p>
                    📅
                    <span>June 14</span>
                  </p>

                </div>

              </div>

            </div>

            <div className="col-md-4">

              <div className="trip-card">

                <div className="trip-card-top">

                  <h3>Manali Snow</h3>

                  <span className="trip-badge">
                    Upcoming
                  </span>

                </div>

                <div className="trip-details">

                  <p>
                    📍
                    <span>Manali</span>
                  </p>

                  <p>
                    💰
                    <span>₹18,000</span>
                  </p>

                  <p>
                    📅
                    <span>July 2</span>
                  </p>

                </div>

              </div>

            </div>

            <div className="col-md-4">

              <div className="trip-card">

                <div className="trip-card-top">

                  <h3>Kerala Nature</h3>

                  <span className="trip-badge">
                    Planning
                  </span>

                </div>

                <div className="trip-details">

                  <p>
                    📍
                    <span>Kerala</span>
                  </p>

                  <p>
                    💰
                    <span>₹15,000</span>
                  </p>

                  <p>
                    📅
                    <span>August 8</span>
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* PAST TRAVELS */}

        <div className="mt-5">

          <h2 className="section-title">
            Past Travels 🌍
          </h2>

          <div className="row g-4">

            <div className="col-md-6">

              <div className="special-card">

                <h4 className="text-warning">
                  Taj Mahal Journey
                </h4>

                <p>
                  Beautiful heritage trip
                  with 4 travel buddies.
                </p>

              </div>

            </div>

            <div className="col-md-6">

              <div className="special-card">

                <h4 className="text-warning">
                  Hyderabad Food Tour
                </h4>

                <p>
                  Explored famous food streets
                  and local culture.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;