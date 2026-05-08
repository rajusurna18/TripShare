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
    <div style={{ padding: "20px" }}>

      <h1>AI Travel Assistant 🤖</h1>

      <textarea
        rows="5"
        cols="50"
        placeholder="Ask AI for trip ideas..."
        value={prompt}
        onChange={(e) =>
          setPrompt(e.target.value)
        }
      />

      <br />

      <button onClick={handleAsk}>
        Ask AI
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>AI Reply:</h3>
        <p>{reply}</p>
      </div>

    </div>
  );
}

export default AI;