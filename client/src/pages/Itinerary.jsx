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

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-8">

          AI Itinerary Generator ✨

        </h1>

        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <input
            type="text"
            placeholder="Destination"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setDestination(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Budget"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setBudget(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Days"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setDays(e.target.value)
            }
          />

        </div>

        <button
          onClick={generatePlan}
          className="bg-black text-white px-8 py-3 rounded-xl"
        >

          {
            loading
            ? "Generating..."
            : "Generate Plan"
          }

        </button>

        {
          result && (

            <div className="mt-10 bg-gray-100 p-6 rounded-xl whitespace-pre-wrap">

              {result}

            </div>
          )
        }

      </div>

    </div>
  );
}

export default Itinerary;