import { useEffect, useState } from "react";
import { getMatches } from "../services/match.api";

function Matches() {

  const [matches, setMatches] = useState([]);

  const tripId = "69fc8561761a0df82dc9e096";

  useEffect(() => {

    const fetchMatches = async () => {

      try {

        const res = await getMatches(tripId);

        setMatches(res.data);

      } catch (err) {

        console.log(err);

      }

    };

    fetchMatches();

  }, []);

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <h1 className="section-title">
          Smart Travel Matches 🌍
        </h1>

        <div className="row g-4">

          {
            matches.map((item) => (

              <div
                className="col-md-4"
                key={item.trip._id}
              >

                <div className="special-card">

                  <h4 className="text-warning">
                    {item.trip.title}
                  </h4>

                  <p>
                    📍 {item.trip.destination}
                  </p>

                  <p>
                    💰 ₹{item.trip.budget}
                  </p>

                  <p>
                    🔥 Match Score:
                    {item.score}%
                  </p>

                </div>

              </div>

            ))
          }

        </div>

      </div>

    </div>

  );
}

export default Matches;