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

        setReply("");

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
          maxWidth: "1000px",
          margin: "auto",
        }}
      >

        {/* HERO */}

        <div className="text-center mb-5">

          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
            }}
          >

            🤖 TripShare AI Assistant

          </h1>

          <p
            style={{
              color: "#aaa",
              marginTop: "15px",
              fontSize: "18px",
            }}
          >

            Ask anything about travel,
            hotels, food, visas,
            safety, transport,
            hidden gems, and more.

          </p>

        </div>

        {/* AI BOX */}

        <div
          style={{
            background: "#1e1e1e",
            padding: "30px",
            borderRadius: "25px",
            border:
              "1px solid #333",
          }}
        >

          <textarea

            rows="6"

            placeholder="Example: Best places to visit in Goa under ₹10,000 budget?"

            className="form-control mb-4"

            value={question}

            onChange={(e) =>

              setQuestion(
                e.target.value
              )

            }

          />

          <button

            className="btn btn-warning px-5 py-3"

            onClick={askAI}

            disabled={loading}

            style={{
              borderRadius: "15px",
              fontWeight: "600",
            }}

          >

            {

              loading

                ? "Thinking..."

                : "Ask AI 🚀"

            }

          </button>

          {/* RESPONSE */}

          {

            reply && (

              <div
                style={{
                  marginTop: "40px",
                  background: "#151515",
                  padding: "25px",
                  borderRadius: "20px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.9",
                  border:
                    "1px solid #333",
                }}
              >

                <h3
                  style={{
                    color: "#ffc107",
                    marginBottom: "20px",
                  }}
                >

                  ✨ AI Response

                </h3>

                {reply}

              </div>

            )

          }

        </div>

      </div>

    </div>

  );

}

export default AI;