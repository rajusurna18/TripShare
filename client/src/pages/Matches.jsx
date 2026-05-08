import { useEffect, useState } from "react";
import { getMatches } from "../services/match.api";

function Matches() {

  const [matches, setMatches] = useState([]);

  // TEMP trip id
  // later this will come dynamically
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
    <div style={{ padding: "20px" }}>

      <h1>Smart Trip Matches 🌍</h1>

      {
        matches.length === 0 ? (
          <p>No matches found</p>
        ) : (
          matches.map((item) => (

            <div
              key={item.trip._id}
              style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "10px"
              }}
            >

              <h2>{item.trip.title}</h2>

              <p>
                Destination:
                {item.trip.destination}
              </p>

              <p>
                Budget:
                ₹{item.trip.budget}
              </p>

              <p>
                Match Score:
                {item.score}%
              </p>

            </div>
          ))
        )
      }

    </div>
  );
}

export default Matches;