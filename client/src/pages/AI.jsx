import {
  useState,
} from "react";

import API
from "../services/api";

function AI() {

  const [question, setQuestion] =
    useState("");

  const [reply, setReply] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ASK AI

  const askAI =
    async () => {

      if (!question.trim())
        return;

      try {

        setLoading(true);

        const res =
          await API.post(

            "/ai/chat",

            {

              question,

            }

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

    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
        }}
      >

        <h1 className="mb-4">

          🤖 AI Travel Assistant

        </h1>

        <p className="mb-4">

          Ask anything about travel,
          destinations, hotels,
          budgets, food, safety,
          visas, and hidden gems.

        </p>

        {/* INPUT */}

        <div
          style={{
            background: "#1e1e1e",
            padding: "25px",
            borderRadius: "20px",
            marginBottom: "30px",
          }}
        >

          <textarea

            rows="5"

            placeholder="Example: Best places to visit in Goa?"

            className="form-control mb-3"

            value={question}

            onChange={(e) =>

              setQuestion(
                e.target.value
              )

            }

          />

          <button

            className="btn btn-warning"

            onClick={askAI}

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

            <div
              style={{
                background: "#1e1e1e",
                padding: "25px",
                borderRadius: "20px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
              }}
            >

              <h3 className="mb-4">

                ✨ AI Response

              </h3>

              {reply}

            </div>

          )

        }

      </div>

    </div>

  );

}

export default AI;