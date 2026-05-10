import { useState } from "react";
import API from "../services/api";

function AI() {

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");

  const handleAsk = async () => {

    try {

      const res = await API.post(
        "/api/ai/suggest",
        { prompt }
      );

      setReply(res.data.reply);

    } catch (err) {

      console.log(err);

    }

  };

  return (

    <div className="dashboard-page">

      <div className="container py-5">

        <div className="ai-box">

          <h1 className="section-title">
            AI Travel Planner 🤖
          </h1>

          <textarea
            className="form-control ai-input"
            rows="6"
            placeholder="Ask AI about destinations, budget trips, hotels..."
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
          />

          <button
            className="btn btn-custom mt-4"
            onClick={handleAsk}
          >
            Ask AI
          </button>

          {
            reply && (

              <div className="ai-reply mt-5">

                <h3 className="text-warning">
                  AI Suggestion ✨
                </h3>

                <p>{reply}</p>

              </div>

            )
          }

        </div>

      </div>

    </div>

  );
}

export default AI;