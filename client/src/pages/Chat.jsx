import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";
import Avatar from "../components/shared/Avatar";
import toast, { Toaster } from "react-hot-toast";

function Chat() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // ======================
  // STATES
  // ======================
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // FILE + AUDIO + PREVIEWS
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [recordTime, setRecordTime] = useState(0);

  // EMOJI PICKER POPUP
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // REACTION POPOVER FOR MESSAGES
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);

  // VIDEO CALL (WebRTC)
  const [callActive, setCallActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // REFS FOR SCROLL & INPUT
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordTimerRef = useRef(null);

  // CURRENT USER
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ======================
  // NO TRIP REDIRECT
  // ======================
  if (!tripId) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light bg-black">
        <div className="text-center">
          <h1>💬 No Active Trip</h1>
          <Link to="/trips" className="btn btn-warning mt-3">
            Open Trips
          </Link>
        </div>
      </div>
    );
  }

  // ======================
  // FETCH TRIP & MESSAGES
  // ======================
  const fetchTrip = async () => {
    try {
      const res = await API.get(`/trips/${tripId}`);
      setTrip(res.data.trip || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${tripId}`);
      setMessages(res.data.messages || []);
      
      // Mark all received messages as seen locally
      if (res.data.messages?.length > 0) {
        triggerSeenStatus(res.data.messages);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // SMART AUTO SCROLL
  // ======================
  const scrollToBottom = (force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if user is scrolled near bottom (within 150px of the bottom)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [loading]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, typingUser]);

  // ======================
  // TIME FORMATTING HELPER
  // ======================
  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (date.toDateString() === now.toDateString()) {
      return timeStr;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    }

    if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
    }

    return `${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}, ${timeStr}`;
  };

  // ======================
  // TYPING ACTIONS
  // ======================
  const handleTypingEvent = () => {
    socket.emit("typing", {
      tripId,
      name: currentUser?.name,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        tripId,
      });
    }, 1200);
  };

  // ======================
  // SEEN ACTION
  // ======================
  const triggerSeenStatus = (msgsList) => {
    msgsList.forEach((msg) => {
      const isUnread = !msg.seen && (!msg.readBy || !msg.readBy.some(id => id.toString() === currentUser._id.toString()));
      if (isUnread && msg.sender?._id !== currentUser._id) {
        socket.emit("message_seen", {
          messageId: msg._id,
          userId: currentUser._id,
          tripId,
        });
      }
    });
  };

  // ======================
  // FILE ATTACHMENTS
  // ======================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // If it's an image, create object URL for previewing
    if (selectedFile.type.startsWith("image/")) {
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFilePreviewUrl(""); // Clean image URL if document
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setFilePreviewUrl("");
  };

  // ======================
  // RECORD AUDIO
  // ======================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordTime(0);

      recordTimerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      toast.error("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    }
  };

  const handleCancelAudio = () => {
    setAudioBlob(null);
    setAudioPreviewUrl("");
  };

  // ======================
  // EMOJI PICKER WRAPPER
  // ======================
  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newText = before + emoji + after;
    setMessage(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 10);
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    if ((!message.trim() && !file && !audioBlob) || sending) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("trip", tripId);
      formData.append("message", message);

      if (file) {
        formData.append("file", file);
      }
      if (audioBlob) {
        formData.append("audio", audioBlob, "voice.webm");
      }

      const res = await API.post("/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Clear input fields
      setMessage("");
      setFile(null);
      setFilePreviewUrl("");
      setAudioBlob(null);
      setAudioPreviewUrl("");
      setShowEmojiPicker(false);

      // Emit to sockets
      socket.emit("send_message", res.data.data);

      // Append locally
      setMessages((prev) => [...prev, res.data.data]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ======================
  // REACTIONS HANDLERS
  // ======================
  const handleMessageReact = async (messageId, emoji) => {
    try {
      const res = await API.put(`/messages/${messageId}/react`, { emoji });
      
      // Emit reaction change to other sockets
      socket.emit("message_reaction", {
        messageId,
        tripId,
        reactions: res.data.data.reactions,
      });

      // Update locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.data.reactions } : msg
        )
      );
      
      // Close menu
      setActiveReactionMenuId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update reaction");
    }
  };

  // ======================
  // VIDEO CALL (WebRTC)
  // ======================
  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setCallActive(true);
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      socket.emit("start_video_call", {
        tripId,
        caller: currentUser?.name,
      });
    } catch (err) {
      console.error("Video call error:", err);
      toast.error("Mic or Camera permissions denied.");
    }
  };

  const endVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setCallActive(false);
    socket.emit("end_video_call", { tripId });
  };

  // ======================
  // INITIAL LIFECYCLE
  // ======================
  useEffect(() => {
    fetchTrip();
    fetchMessages();

    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }

    socket.emit("join_trip", tripId);
    socket.emit("register_user", currentUser?._id);

    // Set connection status
    setConnected(socket.connected);

    // ==========================================
    // SOCKET EVENT REGISTRATION & CLEANUP AUDIT
    // ==========================================
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onReceiveMessage = (data) => {
      setMessages((prev) => {
        // Prevent duplicate loads
        if (prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
      // Mark as seen
      if (data.sender?._id !== currentUser._id) {
        socket.emit("message_seen", {
          messageId: data._id,
          userId: currentUser._id,
          tripId,
        });
      }
    };
    const onOnlineUsers = (users) => setOnlineUsers(users);
    const onUserTyping = (data) => setTypingUser(`${data.name} is typing...`);
    const onUserStopTyping = () => setTypingUser("");
    const onIncomingVideoCall = (data) => {
      toast((t) => (
        <span className="d-flex align-items-center gap-2">
          📞 <b>{data.caller}</b> calls video
          <button
            className="btn btn-xs btn-success text-dark fw-bold ms-2"
            onClick={() => {
              toast.dismiss(t.id);
              startVideoCall();
            }}
          >
            Accept
          </button>
        </span>
      ), { duration: 8000 });
    };
    const onVideoCallEnded = () => {
      setCallActive(false);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      toast("Call ended");
    };
    const onMessageSeenUpdate = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, seen: true, readBy: [...(msg.readBy || []), data.userId] }
            : msg
        )
      );
    };
    const onMessageReactionUpdate = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("online_users", onOnlineUsers);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);
    socket.on("incoming_video_call", onIncomingVideoCall);
    socket.on("video_call_ended", onVideoCallEnded);
    socket.on("message_seen_update", onMessageSeenUpdate);
    socket.on("message_reaction_update", onMessageReactionUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("online_users", onOnlineUsers);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
      socket.off("incoming_video_call", onIncomingVideoCall);
      socket.off("video_call_ended", onVideoCallEnded);
      socket.off("message_seen_update", onMessageSeenUpdate);
      socket.off("message_reaction_update", onMessageReactionUpdate);
      clearTimeout(typingTimeoutRef.current);
      clearInterval(recordTimerRef.current);
    };
  }, [tripId]);

  // Check if someone else in the trip is online
  const isTripMemberOnline = () => {
    if (!trip || !trip.members) return false;
    // Check if any members (excluding self) is in the onlineUsers array
    return trip.members.some(
      (mId) => mId.toString() !== currentUser._id.toString() && onlineUsers.includes(mId.toString())
    );
  };

  // Rendering Helper for single message reaction indicators
  const renderMessageReactions = (reactions = []) => {
    if (reactions.length === 0) return null;

    // Group reactions by emoji character
    const grouped = reactions.reduce((acc, curr) => {
      acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="d-flex gap-1 flex-wrap mt-1 px-1" style={{ fontSize: "11px" }}>
        {Object.entries(grouped).map(([emoji, count]) => (
          <span
            key={emoji}
            className="badge rounded-pill bg-dark border border-secondary text-light px-2 py-1"
            style={{ cursor: "pointer", background: "rgba(255,255,255,0.05)" }}
          >
            {emoji} {count}
          </span>
        ))}
      </div>
    );
  };

  // ======================
  // LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-light bg-black">
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" />
          <h4>Syncing real-time chats...</h4>
        </div>
      </div>
    );
  }

  // API URL prefix resolver
  const API_ASSET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  return (
    <div
      className="d-flex flex-column"
      style={{
        background: "#0c0c0c",
        height: "100vh",
        color: "white",
        overflow: "hidden",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Dynamic styles injection */}
      <style>{`
        @keyframes dotsBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .typing-indicator-dot {
          width: 5px;
          height: 5px;
          background-color: #ffb703;
          border-radius: 50%;
          display: inline-block;
          animation: dotsBounce 0.6s infinite alternate;
        }
        .typing-indicator-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-indicator-dot:nth-child(3) { animation-delay: 0.3s; }
        .hover-lift {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          opacity: 0.95;
        }
      `}</style>

      {/* 1. STICKY CHAT HEADER (Step 8) */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom border-secondary sticky-top"
        style={{
          background: "rgba(20, 20, 20, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06) !important",
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-light p-0 text-decoration-none"
            title="Go Back"
          >
            <h4 className="m-0">⬅</h4>
          </button>

          <div className="position-relative">
            <Avatar src={trip?.image || ""} size={44} className="border border-secondary shadow-sm" />
            <span
              className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-dark ${
                isTripMemberOnline() ? "bg-success" : "bg-secondary"
              }`}
              style={{ width: "12px", height: "12px" }}
              title={isTripMemberOnline() ? "Online" : "Offline"}
            />
          </div>

          <div>
            <h6 className="m-0 fw-bold text-white text-truncate" style={{ maxWidth: "200px" }}>
              {trip?.title || "Trip Chat"}
            </h6>
            <small className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
              <span>📍 {trip?.destination || "Unknown"}</span>
              <span className="mx-1">•</span>
              <span className={isTripMemberOnline() ? "text-success" : "text-secondary"}>
                {isTripMemberOnline() ? "Online" : "Offline"}
              </span>
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* RTC Video Call toggle trigger */}
          <button
            className={`btn btn-sm ${callActive ? "btn-danger text-light animate-pulse" : "btn-outline-warning text-warning"} fw-semibold`}
            onClick={callActive ? endVideoCall : startVideoCall}
            style={{ borderRadius: "8px" }}
          >
            {callActive ? "❌ End Call" : "📞 Call"}
          </button>

          {trip?.createdBy && (
            <Link
              to={`/profile/${trip.createdBy._id || trip.createdBy}`}
              className="btn btn-sm btn-outline-light"
              style={{ borderRadius: "8px" }}
            >
              Owner
            </Link>
          )}
        </div>
      </div>

      {/* VIDEO STREAMS OVERLAY PANEL */}
      {callActive && (
        <div
          className="p-3 border-bottom border-secondary d-flex flex-wrap gap-3 justify-content-center bg-black"
          style={{ background: "#050505", zIndex: 900 }}
        >
          <div className="position-relative" style={{ width: "240px", height: "160px" }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-100 h-100 rounded border border-warning"
              style={{ objectFit: "cover" }}
            />
            <span className="position-absolute bottom-0 start-0 bg-dark text-warning px-2 py-0.5 rounded-end" style={{ fontSize: "11px" }}>
              You
            </span>
          </div>

          {/* Fallback mock remote stream since single agent testing */}
          <div className="position-relative bg-dark rounded border border-secondary" style={{ width: "240px", height: "160px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-100 h-100 rounded"
              style={{ objectFit: "cover" }}
            />
            <span className="text-secondary" style={{ fontSize: "12px" }}>Connecting peer stream...</span>
          </div>
        </div>
      )}

      {/* 2. CHAT SCROLL STREAM CONTAINER */}
      <div
        ref={scrollContainerRef}
        className="flex-grow-1 p-3"
        style={{
          overflowY: "auto",
          background: "#0d0d0d",
        }}
      >
        {messages.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
            <span className="display-4 mb-3">💬</span>
            <h5 className="fw-bold text-secondary">Start of Chat History</h5>
            <p className="text-muted" style={{ fontSize: "13px", maxWidth: "320px" }}>
              Send text messages, voice clips, or upload attachments to coordinate with trip mates.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map((msg) => {
              const isMe = msg.sender?._id === currentUser._id;
              const hasAttachment = !!msg.fileUrl;
              const isImage = hasAttachment && (
                msg.fileType?.startsWith("image/") ||
                msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)
              );

              // Seen indicator calculation (seenBy architecture check)
              const otherRead = msg.seen || (msg.readBy && msg.readBy.some(id => id.toString() !== currentUser._id.toString()));
              const seenLabel = otherRead ? "Seen" : "Sent";

              return (
                <div
                  key={msg._id}
                  className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}
                  style={{ width: "100%" }}
                >
                  <div
                    className={`d-flex gap-2 max-w-75 ${isMe ? "flex-row-reverse" : ""}`}
                    style={{ maxWidth: "78%" }}
                  >
                    {/* Render Receiver avatar */}
                    {!isMe && (
                      <Link to={`/profile/${msg.sender?._id}`} className="mt-1 flex-shrink-0">
                        <Avatar src={msg.sender?.profileImage} size={32} />
                      </Link>
                    )}

                    <div className="d-flex flex-column align-items-start">
                      {/* Name header for receiver */}
                      {!isMe && (
                        <span className="text-secondary mb-1 ps-1" style={{ fontSize: "11px" }}>
                          {msg.sender?.name || "Traveler"}
                        </span>
                      )}

                      {/* 2. Chat Bubble (Step 2 layout) */}
                      <div
                        className={`p-3 position-relative ${
                          isMe ? "chat-bubble-sender" : "chat-bubble-receiver"
                        }`}
                        onClick={() =>
                          setActiveReactionMenuId(
                            activeReactionMenuId === msg._id ? null : msg._id
                          )
                        }
                        style={{
                          fontSize: "14.5px",
                          lineHeight: "1.4",
                          cursor: "pointer",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {/* 1. TEXT */}
                        {msg.message && <div className="mb-2">{msg.message}</div>}

                        {/* 2. IMAGE ATTACHMENT */}
                        {isImage && (
                          <div className="mb-2 rounded overflow-hidden" style={{ maxWidth: "260px" }}>
                            <a
                              href={`${API_ASSET_URL}/${msg.fileUrl}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={`${API_ASSET_URL}/${msg.fileUrl}`}
                                alt="Attachment"
                                className="w-100 object-fit-cover"
                                style={{ maxHeight: "200px" }}
                              />
                            </a>
                          </div>
                        )}

                        {/* 3. DOCUMENT FILE ATTACHMENT */}
                        {hasAttachment && !isImage && (
                          <div
                            className="p-2 mb-2 rounded bg-black d-flex align-items-center gap-2 border border-secondary"
                            style={{ maxWidth: "260px", background: "rgba(0,0,0,0.4)" }}
                          >
                            <span style={{ fontSize: "20px" }}>📄</span>
                            <div className="overflow-hidden">
                              <div
                                className="text-truncate fw-bold text-light"
                                style={{ fontSize: "12px" }}
                              >
                                {msg.fileUrl.split("/").pop()}
                              </div>
                              <small className="text-secondary" style={{ fontSize: "10px" }}>
                                {msg.fileType || "File Document"}
                              </small>
                            </div>
                            <a
                              href={`${API_ASSET_URL}/${msg.fileUrl}`}
                              download
                              className="btn btn-xs btn-warning text-dark ms-auto"
                              style={{ padding: "2px 6px", fontSize: "11px" }}
                            >
                              ⬇
                            </a>
                          </div>
                        )}

                        {/* 4. VOICE MESSAGE PLAYING */}
                        {msg.audioUrl && (
                          <div className="mb-1 mt-2">
                            <audio
                              controls
                              className="w-100"
                              style={{ scale: "0.9", transformOrigin: "left" }}
                            >
                              <source
                                src={`${API_ASSET_URL}/${msg.audioUrl}`}
                                type="audio/webm"
                              />
                            </audio>
                          </div>
                        )}

                        {/* Message Reactions display list */}
                        {renderMessageReactions(msg.reactions)}
                      </div>

                      {/* Time and Seen Info Row */}
                      <div
                        className="d-flex align-items-center gap-2 mt-1 px-1 text-secondary"
                        style={{ fontSize: "11px" }}
                      >
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMe && (
                          <>
                            <span>•</span>
                            <span className={otherRead ? "text-warning fw-semibold" : "text-muted"}>
                              {seenLabel}
                            </span>
                          </>
                        )}
                      </div>

                      {/* 3. POPUP REACTIONS PICKER (Step 14) */}
                      {activeReactionMenuId === msg._id && (
                        <div
                          className="d-flex gap-2 p-2 bg-dark border border-secondary mt-1 rounded-pill shadow-lg animate-fade"
                          style={{
                            background: "#222",
                            zIndex: 80,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          {["👍", "❤️", "🔥", "😂", "🎉"].map((emoji) => (
                            <button
                              key={emoji}
                              className="btn btn-link p-0 hover-lift text-decoration-none"
                              onClick={() => handleMessageReact(msg._id, emoji)}
                              style={{ fontSize: "18px" }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. REAL-TIME TYPING INDICATOR (Step 7) */}
      {typingUser && (
        <div className="px-3 py-1 bg-black d-flex align-items-center gap-2 border-top border-secondary" style={{ borderTopColor: "rgba(255,255,255,0.03) !important" }}>
          <small className="text-warning fw-semibold">{typingUser}</small>
          <div className="d-flex gap-1 align-items-center">
            <span className="typing-indicator-dot" />
            <span className="typing-indicator-dot" />
            <span className="typing-indicator-dot" />
          </div>
        </div>
      )}

      {/* PREVIEW BARS PANEL */}
      {/* A. Document or Image attachment preview (Step 11 & 12) */}
      {file && (
        <div
          className="p-3 border-top border-secondary bg-dark d-flex align-items-center justify-content-between"
          style={{ background: "#1a1a1a", borderTopColor: "rgba(255,255,255,0.08) !important" }}
        >
          <div className="d-flex align-items-center gap-3">
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Upload preview"
                className="rounded border"
                style={{ width: "48px", height: "48px", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "28px" }}>📄</span>
            )}
            <div className="overflow-hidden">
              <div className="text-light text-truncate fw-bold" style={{ fontSize: "13px", maxWidth: "200px" }}>
                {file.name}
              </div>
              <small className="text-secondary" style={{ fontSize: "11px" }}>
                {(file.size / 1024).toFixed(1)} KB • {file.type || "Document"}
              </small>
            </div>
          </div>

          <button className="btn btn-outline-danger btn-sm" onClick={handleCancelFile}>
            Remove ✖
          </button>
        </div>
      )}

      {/* B. Voice recording clip preview (Step 13) */}
      {audioPreviewUrl && (
        <div
          className="p-3 border-top border-secondary bg-dark d-flex align-items-center justify-content-between"
          style={{ background: "#1a1a1a", borderTopColor: "rgba(255,255,255,0.08) !important" }}
        >
          <div className="d-flex align-items-center gap-2 flex-grow-1 me-3">
            <span style={{ fontSize: "24px" }}>🎙️</span>
            <audio src={audioPreviewUrl} controls className="flex-grow-1" style={{ scale: "0.9" }} />
          </div>

          <button className="btn btn-outline-danger btn-sm" onClick={handleCancelAudio}>
            Remove ✖
          </button>
        </div>
      )}

      {/* 5. STICKY MESSAGE INPUT PANEL (Step 9 & 10) */}
      <div
        className="p-3 border-top border-secondary sticky-bottom"
        style={{
          background: "rgba(20, 20, 20, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06) !important",
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* Emoji button popover trigger */}
          <div className="position-relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-outline-secondary p-2 text-warning border-0"
              style={{ fontSize: "18px" }}
              title="Add Emoji"
            >
              😊
            </button>

            {/* Emoji Grid selection popup */}
            {showEmojiPicker && (
              <div
                className="position-absolute bottom-100 start-0 p-2 bg-dark border border-secondary shadow-lg rounded mb-2"
                style={{
                  width: "180px",
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "6px",
                  background: "#181818",
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                {["👍", "❤️", "🔥", "😂", "🎉", "😊", "🚀", "🎒", "📍", "✈️"].map((em) => (
                  <button
                    key={em}
                    onClick={() => handleEmojiSelect(em)}
                    className="btn btn-link p-1 text-center hover-lift text-decoration-none"
                    style={{ fontSize: "18px" }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Attachment button picker */}
          <div>
            <label
              htmlFor="chat-attachment-input"
              className="btn btn-outline-secondary p-2 border-0"
              style={{ cursor: "pointer", fontSize: "18px" }}
              title="Attach File"
            >
              📎
            </label>
            <input
              id="chat-attachment-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Text input area */}
          <textarea
            ref={textareaRef}
            rows="1"
            className="form-control bg-black text-light border-secondary shadow-none"
            placeholder="Type message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTypingEvent();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            style={{ resize: "none", borderRadius: "20px", padding: "8px 16px" }}
          />

          {/* Recording / Send actions toggle button */}
          {isRecording ? (
            <button className="btn btn-danger p-2 px-3 fw-bold" onClick={stopRecording} style={{ borderRadius: "20px" }}>
              ⏹ Stop ({recordTime}s)
            </button>
          ) : !message.trim() && !file && !audioBlob ? (
            <button className="btn btn-outline-warning p-2" onClick={startRecording} style={{ borderRadius: "20px" }} title="Record Voice">
              🎤 Voice
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="btn btn-warning p-2 px-4 text-dark fw-bold"
              style={{ borderRadius: "20px" }}
            >
              {sending ? "Sending" : "Send"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
