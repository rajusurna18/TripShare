import { useState } from "react";
import API from "../services/api";

function AI() {

  const [prompt, setPrompt] =
    useState("");

  const [reply, setReply] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleAsk = async () => {

    if (!prompt.trim())
      return;

    try {

      setLoading(true);

      const res = await API.post(
        "/api/ai/suggest",
        { prompt }
      );

      setReply(
        res.data.reply
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="ai-page min-vh-100">

      <div className="container py-5">

        <div className="ai-container">

          {/* HEADER */}

          <div className="ai-header text-center">

            <h1 className="ai-title">

              ✨ AI Travel Planner

            </h1>

            <p className="ai-subtitle">

              Ask AI about destinations,
              budgets, hotels,
              itineraries, and hidden gems.

            </p>

          </div>

          {/* INPUT */}

          <div className="ai-input-box">

            <textarea
              className="ai-input-modern"
              rows="6"
              placeholder="Example: Plan a 5-day Goa trip under ₹15,000..."
              value={prompt}
              onChange={(e) =>
                setPrompt(
                  e.target.value
                )
              }
            />

            <button
              className="ai-btn"
              onClick={handleAsk}
              disabled={loading}
            >

              {
                loading
                ? "Thinking..."
                : "Ask AI 🚀"
              }

            </button>

          </div>

          {/* RESPONSE */}

          {
            reply && (

              <div className="ai-reply-box">

                <div className="ai-reply-header">

                  🤖 AI Suggestion

                </div>

                <div className="ai-reply-content">

                  {reply}

                </div>

              </div>

            )
          }

        </div>

      </div>

    </div>

  );

}

export default AI;