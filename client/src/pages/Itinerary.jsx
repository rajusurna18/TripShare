import { useState }
from "react";

import API from "../services/api";

function Itinerary() {

  const [destination, setDestination] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [days, setDays] =
    useState("");

  const [result, setResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const generatePlan =
    async () => {

      try {

        setLoading(true);

        const res = await API.post(
          "/api/ai/itinerary",
          {
            destination,
            budget,
            days,
          }
        );

        setResult(
          res.data.itinerary
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

  return (

    <div className="dashboard-page min-vh-100 text-light">

      <div className="container py-5">

        {/* HERO */}

        <div className="text-center mb-5">

          <h1 className="section-title">

            AI Itinerary Generator ✨

          </h1>

          <p className="dashboard-subtitle">

            Generate smart AI-powered
            travel plans instantly.

          </p>

        </div>

        {/* MAIN BOX */}

        <div className="itinerary-box glass-card">

          {/* INPUTS */}

          <div className="row g-4">

            <div className="col-md-4">

              <label className="form-label">

                Destination

              </label>

              <input
                type="text"
                placeholder="Goa"
                className="form-control itinerary-input"
                onChange={(e) =>
                  setDestination(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-md-4">

              <label className="form-label">

                Budget

              </label>

              <input
                type="number"
                placeholder="5000"
                className="form-control itinerary-input"
                onChange={(e) =>
                  setBudget(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-md-4">

              <label className="form-label">

                Days

              </label>

              <input
                type="number"
                placeholder="3"
                className="form-control itinerary-input"
                onChange={(e) =>
                  setDays(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* BUTTON */}

          <div className="mt-5 text-center">

            <button
              onClick={generatePlan}
              disabled={loading}
              className="premium-ai-btn border-0"
            >

              {
                loading
                ? "Generating Plan..."
                : "Generate AI Plan 🚀"
              }

            </button>

          </div>

          {/* RESULT */}

          {
            result && (

              <div className="itinerary-result mt-5">

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                  <h2 className="text-warning m-0">

                    Your AI Travel Plan ✨

                  </h2>

                </div>

                <div className="itinerary-content">

                  {result}

                </div>

              </div>

            )
          }

        </div>

      </div>

    </div>

  );

}

export default Itinerary;