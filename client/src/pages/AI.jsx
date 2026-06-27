import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { FaTrash, FaPlus, FaComment, FaPaperPlane } from "react-icons/fa";

function AI() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // FETCH CONVERSATIONS ON MOUNT
  useEffect(() => {
    fetchConversations();
  }, []);

  // SCROLL TO BOTTOM ON NEW MESSAGES
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await API.get("/ai/conversations");
      if (res.data.success) {
        setConversations(res.data.conversations);
        // Set first conversation as active if none set
        if (res.data.conversations.length > 0 && !activeId) {
          selectConversation(res.data.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setError("Unable to load chat sessions. Please try refreshing.");
    }
  };

  const selectConversation = async (id) => {
    try {
      setActiveId(id);
      setError("");
      setLoading(true);
      const res = await API.get(`/ai/conversations/${id}`);
      if (res.data.success) {
        setMessages(res.data.conversation.messages || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve conversation messages.");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    try {
      setError("");
      const res = await API.post("/ai/conversations", { title: "New Travel Discussion" });
      if (res.data.success) {
        const newSession = res.data.conversation;
        setConversations(prev => [newSession, ...prev]);
        setActiveId(newSession._id);
        setMessages([]);
        setQuestion("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start a new chat session.");
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation(); // Avoid selecting deleted chat
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      const res = await API.delete(`/ai/conversations/${id}`);
      if (res.data.success) {
        setConversations(prev => prev.filter(c => c._id !== id));
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete chat session.");
    }
  };

  const askAI = async () => {
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/ai/chat", {
        question,
        conversationId: activeId,
      });

      if (res.data.success) {
        setMessages(res.data.conversation.messages || []);
        
        // If a new session was auto-created on the backend, update conversations list
        if (!activeId) {
          setActiveId(res.data.conversation._id);
          fetchConversations();
        } else {
          // Refresh list to update modified date/titles
          setConversations(prev =>
            prev.map(c => c._id === activeId ? res.data.conversation : c)
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError("AI assistant is temporarily busy. Retrying connection...");
      // Remove the last message from user if failed so they can resend
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  // MARKDOWN ELEMENT PARSER
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith("###")) {
        return (
          <h5 key={index} className="text-warning mt-3 mb-2 fw-bold">
            {parseBoldText(trimmed.replace(/^###\s*/, ""))}
          </h5>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h4 key={index} className="text-warning mt-4 mb-2 fw-bold border-bottom pb-2 border-secondary">
            {parseBoldText(trimmed.replace(/^##\s*/, ""))}
          </h4>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h3 key={index} className="text-warning mt-4 mb-3 fw-bold border-bottom pb-2 border-secondary">
            {parseBoldText(trimmed.replace(/^#\s*/, ""))}
          </h3>
        );
      }
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={index} className="ms-3 mb-2" style={{ listStyleType: "disc", color: "#ddd" }}>
            {parseBoldText(trimmed.replace(/^[-*]\s*/, ""))}
          </li>
        );
      }
      if (!trimmed) {
        return <div key={index} className="my-2" />;
      }
      return (
        <p key={index} className="mb-2" style={{ color: "#eee" }}>
          {parseBoldText(line)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-warning fw-bold">{part}</strong>;
      }
      return part;
    });
  };

  const handleSuggestion = (text) => {
    setQuestion(text);
  };

  return (
    <div
      style={{
        background: "#0c0c0e",
        minHeight: "100vh",
        color: "white",
        paddingTop: "20px",
      }}
    >
      <div className="container-fluid py-4" style={{ maxWidth: "1400px" }}>
        <div className="row g-4">
          
          {/* SIDEBAR: CHAT SESSIONS */}
          <div className="col-12 col-md-3">
            <div
              className="glass-card p-4 h-100"
              style={{
                background: "rgba(25, 25, 30, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                minHeight: "75vh",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-light mb-0 d-flex align-items-center gap-2">
                  🤖 Chats History
                </h5>
                <button
                  className="btn btn-warning btn-sm d-flex align-items-center justify-content-center p-2 rounded-3 shadow"
                  onClick={createSession}
                  title="New Session"
                  style={{ transition: "all 0.3s ease" }}
                >
                  <FaPlus />
                </button>
              </div>

              <div
                className="overflow-y-auto pe-1"
                style={{ maxHeight: "60vh", scrollbarWidth: "thin" }}
              >
                {conversations.length === 0 ? (
                  <div className="text-center py-5 text-secondary">
                    <p className="small mb-0">No active discussions</p>
                    <small className="text-muted">Start a new session above ➕</small>
                  </div>
                ) : (
                  conversations.map(session => (
                    <div
                      key={session._id}
                      onClick={() => selectConversation(session._id)}
                      className={`d-flex justify-content-between align-items-center p-3 mb-2 rounded-4 text-start cursor-pointer position-relative border transition-all ${
                        activeId === session._id
                          ? "bg-warning-subtle text-dark border-warning shadow-sm"
                          : "bg-dark bg-opacity-20 text-light border-secondary border-opacity-10 hover-chat-row"
                      }`}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3 overflow-hidden">
                        <FaComment className={activeId === session._id ? "text-warning" : "text-secondary"} />
                        <span className="small text-truncate" style={{ maxWidth: "160px", fontWeight: "500" }}>
                          {session.title || "Travel Discussion"}
                        </span>
                      </div>
                      <button
                        className="btn btn-link text-danger p-0 border-0 ms-2"
                        onClick={(e) => deleteSession(session._id, e)}
                        style={{ opacity: 0.8 }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="col-12 col-md-9">
            <div
              className="glass-card p-4 d-flex flex-column"
              style={{
                background: "rgba(20, 20, 25, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "25px",
                height: "75vh",
                backdropFilter: "blur(12px)",
              }}
            >
              
              {/* CHAT HEADER */}
              <div className="border-bottom border-secondary border-opacity-20 pb-3 mb-3 d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold mb-1 text-warning">TripShare AI Buddy</h4>
                  <p className="small text-secondary mb-0">
                    Your premium assistant for global itineraries, transport, and travel tips
                  </p>
                </div>
              </div>

              {/* ERROR STATE CONTAINER */}
              {error && (
                <div className="alert alert-warning py-2 px-3 mb-3 small d-flex justify-content-between align-items-center rounded-4 border-0 shadow-sm">
                  <span>⚠️ {error}</span>
                  <button className="btn btn-link text-warning p-0 text-decoration-none small fw-bold" onClick={fetchConversations}>
                    Refresh
                  </button>
                </div>
              )}

              {/* MESSAGES THREAD */}
              <div
                className="flex-grow-1 overflow-y-auto px-2 mb-4 d-flex flex-column gap-3"
                style={{ scrollbarWidth: "thin" }}
              >
                {messages.length === 0 ? (
                  <div className="my-auto text-center py-5">
                    <h2 className="display-6 mb-3">✈️ Where to next?</h2>
                    <p className="text-secondary mb-5">
                      Ask about destination budgets, hotels, transport options, or hidden sights.
                    </p>
                    
                    {/* SUGGESTION CARDS */}
                    <div className="row g-3 justify-content-center">
                      {[
                        "Best places to visit in Goa under ₹10,000?",
                        "Plan a 5-day cultural trip to Kyoto, Japan.",
                        "What are the top safety tips for solo travel?",
                        "Recommend budget hotels and street food in Hanoi.",
                      ].map((item, idx) => (
                        <div key={idx} className="col-12 col-sm-6 max-w-lg">
                          <div
                            onClick={() => handleSuggestion(item)}
                            className="p-3 bg-dark bg-opacity-40 border border-secondary border-opacity-20 rounded-4 text-start cursor-pointer hover-suggestion transition-all"
                            style={{
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span className="small text-light text-opacity-75">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`d-flex flex-column ${
                        msg.role === "user" ? "align-items-end" : "align-items-start"
                      }`}
                    >
                      <div
                        className={`p-3 max-w-85 rounded-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-warning text-dark fw-medium"
                            : "bg-dark bg-opacity-50 border border-secondary border-opacity-20 text-light"
                        }`}
                        style={{
                          maxWidth: "75%",
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.6",
                          fontSize: "15px",
                        }}
                      >
                        {msg.role === "user" ? msg.content : renderFormattedContent(msg.content)}
                      </div>
                      <span className="text-muted small mt-1 px-2" style={{ fontSize: "10px" }}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  ))
                )}

                {/* AI LOADING SKELETON */}
                {loading && (
                  <div className="d-flex align-items-center gap-2 p-3 bg-dark bg-opacity-30 border border-secondary border-opacity-10 rounded-4 text-secondary align-self-start" style={{ width: "fit-content" }}>
                    <div className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ animationDelay: "0ms" }}></div>
                    <div className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ animationDelay: "150ms" }}></div>
                    <div className="spinner-grow spinner-grow-sm text-warning" role="status" style={{ animationDelay: "300ms" }}></div>
                    <span className="ms-2 small">Thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BOX */}
              <div className="d-flex gap-2 align-items-center">
                <textarea
                  rows="2"
                  placeholder="Ask AI Travel Buddy anything..."
                  className="form-control bg-dark text-light border-secondary border-opacity-35 p-3 rounded-4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askAI();
                    }
                  }}
                  disabled={loading}
                  style={{
                    resize: "none",
                    boxShadow: "none",
                  }}
                />
                <button
                  className="btn btn-warning h-100 px-4 rounded-4 shadow-sm"
                  onClick={askAI}
                  disabled={loading || !question.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "58px",
                  }}
                >
                  <FaPaperPlane />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
      <style>{`
        .hover-chat-row:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 193, 7, 0.3) !important;
        }
        .hover-suggestion:hover {
          background-color: rgba(255, 193, 7, 0.08) !important;
          border-color: rgba(255, 193, 7, 0.4) !important;
          transform: translateY(-2px);
        }
        .max-w-85 {
          max-width: 85%;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default AI;