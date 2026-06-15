import { useState }
from "react";

import API
from "../services/api";

function Itinerary() {

  const [destination, setDestination] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [days, setDays] =
    useState("");

  const [travelers, setTravelers] =
    useState("");

  const [tripType, setTripType] =
    useState("");

  const [result, setResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // GENERATE PLAN

  const generatePlan =
    async () => {

      if (
        !destination ||
        !budget ||
        !days
      ) {

        alert(
          "Please fill all fields"
        );

        return;

      }

      try {

        setLoading(true);

        setResult("");

        const res =
          await API.post(

            "/ai/itinerary",

            {

              destination,

              budget,

              days,

              travelers,

              tripType,

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

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
      }}
    >

      <div className="container py-5">

        {/* HERO */}

        <div className="text-center mb-5">

          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
            }}
          >

            🌍 AI Trip Planner

          </h1>

          <p
            style={{
              color: "#aaa",
              marginTop: "15px",
              fontSize: "18px",
            }}
          >

            Generate smart AI-powered
            itineraries with hotels,
            food, transport & budgets.

          </p>

        </div>

        {/* MAIN CARD */}

        <div
          style={{
            background: "#1e1e1e",
            borderRadius: "25px",
            padding: "35px",
            border:
              "1px solid #333",
          }}
        >

          {/* INPUTS */}

          <div className="row g-4">

            {/* DESTINATION */}

            <div className="col-md-6">

              <label className="mb-2">

                Destination

              </label>

              <input

                type="text"

                placeholder="Goa"

                className="form-control"

                value={destination}

                onChange={(e) =>

                  setDestination(
                    e.target.value
                  )

                }

              />

            </div>

            {/* BUDGET */}

            <div className="col-md-6">

              <label className="mb-2">

                Budget

              </label>

              <input

                type="number"

                placeholder="15000"

                className="form-control"

                value={budget}

                onChange={(e) =>

                  setBudget(
                    e.target.value
                  )

                }

              />

            </div>

            {/* DAYS */}

            <div className="col-md-4">

              <label className="mb-2">

                Days

              </label>

              <input

                type="number"

                placeholder="3"

                className="form-control"

                value={days}

                onChange={(e) =>

                  setDays(
                    e.target.value
                  )

                }

              />

            </div>

            {/* TRAVELERS */}

            <div className="col-md-4">

              <label className="mb-2">

                Travelers

              </label>

              <input

                type="number"

                placeholder="2"

                className="form-control"

                value={travelers}

                onChange={(e) =>

                  setTravelers(
                    e.target.value
                  )

                }

              />

            </div>

            {/* TRIP TYPE */}

            <div className="col-md-4">

              <label className="mb-2">

                Trip Type

              </label>

              <select

                className="form-control"

                value={tripType}

                onChange={(e) =>

                  setTripType(
                    e.target.value
                  )

                }

              >

                <option value="">

                  Select

                </option>

                <option>

                  Adventure

                </option>

                <option>

                  Family

                </option>

                <option>

                  Friends

                </option>

                <option>

                  Couple

                </option>

                <option>

                  Solo

                </option>

                <option>

                  Luxury

                </option>

              </select>

            </div>

          </div>

          {/* BUTTON */}

          <div className="text-center mt-5">

            <button

              onClick={
                generatePlan
              }

              disabled={loading}

              className="btn btn-warning px-5 py-3"

              style={{
                borderRadius: "15px",
                fontWeight: "600",
                fontSize: "18px",
              }}

            >

              {

                loading

                  ? "Generating AI Plan..."

                  : "Generate AI Trip 🚀"

              }

            </button>

          </div>

          {/* RESULT */}

          {

            result && (

              <div
                style={{
                  marginTop: "50px",
                  background: "#151515",
                  padding: "30px",
                  borderRadius: "20px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.9",
                  border:
                    "1px solid #333",
                }}
              >

                <h2
                  style={{
                    color: "#ffc107",
                    marginBottom: "25px",
                  }}
                >

                  ✨ Your AI Travel Plan

                </h2>

                {<div>

                <button

                 className="btn btn-outline-warning mb-3"

                 onClick={() => {

                  navigator.clipboard.writeText(
                   result
                   );

                  alert(
                  "Copied!"
                   );

                  }}

                 >

                 Copy Plan 📋

              </button>

              <button

               className="btn btn-outline-light mb-3 ms-2"

               onClick={() => {

               const blob =
               new Blob(
 
              [result],

               {
                type:
               "text/plain",
               }

               );

             const url =
             URL.createObjectURL(
                blob
            );

            const a =
           document.createElement(
           "a"
            );

          a.href = url;

          a.download =
          "trip-plan.txt";

          a.click();

             }}

             >

               Download 📥

              </button>

               <div>

              {result}

            </div>
    
            </div>}

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default Itinerary;