import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../socket";
import Avatar from "../components/shared/Avatar";
import toast, { Toaster } from "react-hot-toast";
import { ringtonePlayer } from "../utils/ringtone";

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

  // EDITING STATES
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");

  // REACTION POPOVER FOR MESSAGES
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);

  // GROUP INFO MODAL
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);

  // VOICE & VIDEO CALL (WebRTC)
  const [callActive, setCallActive] = useState(false);
  const [groupCallActive, setGroupCallActive] = useState(false);
  const [callType, setCallType] = useState("video"); // 'voice' or 'video'
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerName, callerAvatar, offer, callType, tripId }
  const [incomingGroupCall, setIncomingGroupCall] = useState(null); // { tripId, callType, callerId, callerName, callerAvatar, participants }
  const [participants, setParticipants] = useState([]); // [{ userId, name, avatar, muted, videoOff }]
  const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // userId -> RTCPeerConnection
  const remoteStreamsRef = useRef(new Map()); // userId -> MediaStream
  const pendingCandidatesRef = useRef([]); // ICE candidate buffer
  const pendingCandidatesMapRef = useRef(new Map()); // userId -> ICE candidates
  const callTimerRef = useRef(null);

  // REFS FOR SCROLL & INPUT
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordTimerRef = useRef(null);

  // CURRENT USER
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?._id || currentUser?.id;

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
  async function fetchTrip() {
    try {
      const res = await API.get(`/trips/${tripId}`);
      setTrip(res.data.trip || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  async function fetchMessages() {
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
      const isUnread = !msg.seen && (!msg.readBy || !msg.readBy.some(id => id && currentUserId && id.toString() === currentUserId.toString()));
      if (isUnread && currentUserId && msg.sender?._id !== currentUserId) {
        socket.emit("message_seen", {
          messageId: msg._id,
          userId: currentUserId,
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

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditMessageText(msg.message);
    setMessage(msg.message);
    setActiveReactionMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageText("");
    setMessage("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await API.delete(`/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      socket.emit("delete_message", { messageId, tripId });
      setActiveReactionMenuId(null);
      toast.success("Message deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete message");
    }
  };

  const updateMessage = async () => {
    if (!message.trim() || sending) return;
    try {
      setSending(true);
      const res = await API.put(`/messages/${editingMessageId}`, { message });
      setMessages((prev) =>
        prev.map((m) => (m._id === editingMessageId ? res.data.data : m))
      );
      socket.emit("send_message", res.data.data);
      setMessage("");
      setEditingMessageId(null);
      setEditMessageText("");
      setShowEmojiPicker(false);
      toast.success("Message updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update message");
    } finally {
      setSending(false);
    }
  };

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = async () => {
    if (editingMessageId) {
      await updateMessage();
      return;
    }
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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
  // VOICE & VIDEO CALL (WebRTC Multi-Peer Mesh)
  // ======================
  const stunConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const getTargetUserObj = () => {
    if (!trip) return null;
    const allMembers = [
      ...(trip.createdBy ? [trip.createdBy] : []),
      ...(trip.members || [])
    ];
    return allMembers.find((m) => {
      const id = typeof m === "object" ? (m._id || m.id) : m;
      return id && currentUserId && id.toString() !== currentUserId.toString();
    });
  };

  const getTargetUserId = () => {
    if (!trip) return null;
    const targetObj = getTargetUserObj();
    if (!targetObj) return null;
    const targetId = typeof targetObj === "object" ? (targetObj._id || targetObj.id) : targetObj;
    return targetId ? targetId.toString() : null;
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainderSecs.toString().padStart(2, "0")}`;
  };

  const startCallTimer = () => {
    clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    clearInterval(callTimerRef.current);
    setCallDuration(0);
  };

  // WEB RTC MULTI-PEER MESH CREATOR
  const createGroupPeerConnection = (remoteUserId) => {
    const uIdStr = remoteUserId.toString();
    if (peerConnectionsRef.current.has(uIdStr)) {
      return peerConnectionsRef.current.get(uIdStr);
    }

    const pc = new RTCPeerConnection(stunConfig);
    peerConnectionsRef.current.set(uIdStr, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("group_ice_candidate", {
          tripId,
          targetUserId: uIdStr,
          fromUserId: currentUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`[Group Call] Received remote track from ${uIdStr}`);
      const stream = event.streams[0];
      if (stream) {
        remoteStreamsRef.current.set(uIdStr, stream);
        setRemoteStreams({ ...Object.fromEntries(remoteStreamsRef.current) });
      }
      setCallStatus("Connected");
      startCallTimer();
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        console.log(`[Group Call] Peer connection to ${uIdStr} lost`);
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    return pc;
  };

  // GROUP CALL ACTION HANDLERS
  const startGroupCall = async (type = "voice") => {
    if (groupCallActive || callActive) return;

    try {
      const wantVideo = type === "video";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantVideo });
      setLocalStream(stream);
      setGroupCallActive(true);
      setCallType(type);
      setCallStatus("Calling...");
      setIsMuted(false);
      setIsVideoEnabled(wantVideo);
      startCallTimer();

      setTimeout(() => {
        if (wantVideo && localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 100);

      const callerName = currentUser?.name || "Traveler";
      const callerAvatar = currentUser?.profileImage || "";

      setParticipants([
        {
          userId: currentUserId,
          name: callerName,
          avatar: callerAvatar,
          muted: false,
          videoOff: !wantVideo,
        },
      ]);

      socket.emit("start_group_call", {
        tripId,
        callType: type,
        callerId: currentUserId,
        callerName,
        callerAvatar,
      });
    } catch (err) {
      console.error("Start group call error:", err);
      toast.error("Microphone or camera permission was denied.");
      leaveGroupCall();
    }
  };

  const joinGroupCall = async (incCallData) => {
    ringtonePlayer.stop();
    const incData = incCallData || incomingGroupCall;
    if (!incData) return;

    try {
      const wantVideo = (incData.callType || callType) === "video";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantVideo });
      setLocalStream(stream);
      setGroupCallActive(true);
      setCallType(incData.callType || "voice");
      setCallStatus("Connected");
      setIsMuted(false);
      setIsVideoEnabled(wantVideo);
      setIncomingGroupCall(null);
      startCallTimer();

      setTimeout(() => {
        if (wantVideo && localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 100);

      socket.emit("join_group_call", {
        tripId,
        userId: currentUserId,
        name: currentUser?.name || "Traveler",
        avatar: currentUser?.profileImage || "",
        callType: incData.callType || "voice",
      });
    } catch (err) {
      console.error("Join group call error:", err);
      toast.error("Microphone or camera permission was denied.");
      rejectGroupCall();
    }
  };

  const rejectGroupCall = () => {
    ringtonePlayer.stop();
    if (incomingGroupCall) {
      socket.emit("reject_group_call", { tripId, userId: currentUserId });
    }
    setIncomingGroupCall(null);
  };

  const leaveGroupCall = () => {
    ringtonePlayer.stop();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch (err) {
        console.debug("Error closing peer connection:", err);
      }
    });
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    pendingCandidatesMapRef.current.clear();

    stopCallTimer();
    setLocalStream(null);
    setGroupCallActive(false);
    setCallActive(false);
    setCallStatus("");
    setIncomingGroupCall(null);
    setParticipants([]);
    setRemoteStreams({});

    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    socket.emit("leave_group_call", { tripId, userId: currentUserId });
  };

  const toggleGroupMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMutedState = !audioTrack.enabled;
        setIsMuted(newMutedState);
        socket.emit("toggle_group_media", {
          tripId,
          userId: currentUserId,
          muted: newMutedState,
        });
      }
    }
  };

  const toggleGroupVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoOffState = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        socket.emit("toggle_group_media", {
          tripId,
          userId: currentUserId,
          videoOff: newVideoOffState,
        });
      }
    }
  };

  // BACKWARD COMPATIBLE ONE-TO-ONE CALL HANDLERS
  const startCall = (type = "voice") => startGroupCall(type);
  const acceptCall = (callData) => joinGroupCall(callData);
  const rejectCall = () => rejectGroupCall();
  const endCall = () => leaveGroupCall();
  const toggleMute = () => toggleGroupMute();
  const toggleVideo = () => toggleGroupVideo();

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
    if (currentUserId) {
      socket.emit("register_user", currentUserId);
    }

    // Set connection status
    setConnected(socket.connected);

    // ==========================================
    // SOCKET EVENT REGISTRATION & CLEANUP AUDIT
    // ==========================================
    const onConnect = () => {
      console.log(`[Socket] Connected: ${socket.id}`);
      setConnected(true);
      socket.emit("join_trip", tripId);
      if (currentUserId) {
        socket.emit("register_user", currentUserId);
      }
    };
    const onDisconnect = () => {
      console.log("[Socket] Disconnected");
      setConnected(false);
    };
    const onReceiveMessage = (data) => {
      console.log("[Socket] Received new_message:", data._id);
      setMessages((prev) => {
        // Prevent duplicate loads
        if (prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
      // Mark as seen
      if (currentUserId && data.sender?._id !== currentUserId) {
        socket.emit("message_seen", {
          messageId: data._id,
          userId: currentUserId,
          tripId,
        });
      }
    };
    const onOnlineUsers = (users) => setOnlineUsers(users);
    const onUserTyping = (data) => setTypingUser(`${data.name} is typing...`);
    const onUserStopTyping = () => setTypingUser("");
    // ==========================================
    // GROUP CALL SOCKET LISTENERS
    // ==========================================
    const onIncomingGroupCall = (data) => {
      console.log("[Group Call] Incoming call received:", data);
      if (groupCallActive || data.callerId === currentUserId) return;

      setIncomingGroupCall({
        tripId: data.tripId,
        callType: data.callType || "voice",
        callerId: data.callerId,
        callerName: data.callerName || "Traveler",
        callerAvatar: data.callerAvatar || "",
        participants: data.participants || [],
      });
      ringtonePlayer.start();
    };

    const onGroupCallState = (data) => {
      console.log("[Group Call] Received call state:", data);
      if (data.participants) setParticipants(data.participants);
    };

    const onGroupCallUserJoined = async (data) => {
      console.log(`[Group Call] User joined: ${data.name} (${data.userId})`);
      if (data.participants) setParticipants(data.participants);

      const joinedUserId = data.userId ? data.userId.toString() : null;
      if (!joinedUserId || joinedUserId === currentUserId.toString()) return;

      try {
        const pc = createGroupPeerConnection(joinedUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("group_webrtc_offer", {
          tripId,
          targetUserId: joinedUserId,
          fromUserId: currentUserId,
          offer,
        });
      } catch (err) {
        console.error("Error creating group offer:", err);
      }
    };

    const onGroupWebRtcOffer = async (data) => {
      const { fromUserId, offer } = data;
      if (!fromUserId) return;
      const senderId = fromUserId.toString();
      console.log(`[Group Call] Received offer from ${senderId}`);

      try {
        const pc = createGroupPeerConnection(senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const pending = pendingCandidatesMapRef.current.get(senderId) || [];
        while (pending.length > 0) {
          const candidate = pending.shift();
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("group_webrtc_answer", {
          tripId,
          targetUserId: senderId,
          fromUserId: currentUserId,
          answer,
        });
      } catch (err) {
        console.error("Error handling group offer:", err);
      }
    };

    const onGroupWebRtcAnswer = async (data) => {
      const { fromUserId, answer } = data;
      if (!fromUserId) return;
      const senderId = fromUserId.toString();
      console.log(`[Group Call] Received answer from ${senderId}`);

      const pc = peerConnectionsRef.current.get(senderId);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          const pending = pendingCandidatesMapRef.current.get(senderId) || [];
          while (pending.length > 0) {
            const candidate = pending.shift();
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      }
    };

    const onGroupIceCandidate = async (data) => {
      const { fromUserId, candidate } = data;
      if (!fromUserId) return;
      const senderId = fromUserId.toString();

      const pc = peerConnectionsRef.current.get(senderId);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      } else {
        if (!pendingCandidatesMapRef.current.has(senderId)) {
          pendingCandidatesMapRef.current.set(senderId, []);
        }
        pendingCandidatesMapRef.current.get(senderId).push(candidate);
      }
    };

    const onGroupMediaUpdated = (data) => {
      const { userId, muted, videoOff } = data;
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, muted, videoOff } : p))
      );
    };

    const onGroupCallUserLeft = (data) => {
      const { userId, remainingParticipants } = data;
      if (!userId) return;
      const leaverId = userId.toString();
      console.log(`[Group Call] User left: ${leaverId}`);

      if (peerConnectionsRef.current.has(leaverId)) {
        try {
          peerConnectionsRef.current.get(leaverId).close();
        } catch (err) {
          console.debug("Error closing peer connection:", err);
        }
        peerConnectionsRef.current.delete(leaverId);
      }
      remoteStreamsRef.current.delete(leaverId);
      pendingCandidatesMapRef.current.delete(leaverId);

      setRemoteStreams({ ...Object.fromEntries(remoteStreamsRef.current) });
      if (remainingParticipants) setParticipants(remainingParticipants);
    };

    const onGroupCallEnded = () => {
      console.log("[Group Call] Group call ended by server");
      ringtonePlayer.stop();
      toast("Group call ended");
      leaveGroupCall();
    };

    const onIncomingCall = (data) => {
      console.log("[Socket Call] Incoming call received:", data);
      if (groupCallActive || callActive || peerConnectionRef.current || data.callerId === currentUserId) {
        return;
      }
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName || data.caller || "Traveler",
        callerAvatar: data.callerAvatar || "",
        offer: data.offer,
        callType: data.callType || "video",
        tripId: data.tripId,
      });
      ringtonePlayer.start();
    };
    
    const onCallAccepted = async (data) => {
      console.log("[Socket Call] Call accepted by remote peer");
      ringtonePlayer.stop();
      setCallStatus("Connected");
      startCallTimer();
      if (data.answer && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    };

    const onCallRejected = () => {
      console.log("[Socket Call] Call rejected");
      ringtonePlayer.stop();
      toast.error("Call declined");
      endCall(false);
    };

    const onCallEnded = () => {
      console.log("[Socket Call] Call ended");
      ringtonePlayer.stop();
      toast("Call ended");
      endCall(false);
    };

    const onWebRtcAnswer = async (data) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    };

    const onIceCandidate = async (data) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    const onPeerDisconnected = () => {
      ringtonePlayer.stop();
      if (peerConnectionRef.current) {
        toast("Peer disconnected");
        endCall(false);
      }
    };
    const onMessageSeenUpdate = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, seen: true, readBy: data.userId ? [...(msg.readBy || []), data.userId] : (msg.readBy || []) }
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
    const onMessageDeleted = (data) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);
    socket.on("online_users", onOnlineUsers);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);
    socket.on("incoming_group_call", onIncomingGroupCall);
    socket.on("group_call_state", onGroupCallState);
    socket.on("group_call_user_joined", onGroupCallUserJoined);
    socket.on("group_webrtc_offer", onGroupWebRtcOffer);
    socket.on("group_webrtc_answer", onGroupWebRtcAnswer);
    socket.on("group_ice_candidate", onGroupIceCandidate);
    socket.on("group_media_updated", onGroupMediaUpdated);
    socket.on("group_call_user_left", onGroupCallUserLeft);
    socket.on("group_call_ended", onGroupCallEnded);
    socket.on("incoming_call", onIncomingCall);
    socket.on("incoming_video_call", onIncomingCall);
    socket.on("call_accepted", onCallAccepted);
    socket.on("call_rejected", onCallRejected);
    socket.on("video_call_rejected", onCallRejected);
    socket.on("call_ended", onCallEnded);
    socket.on("video_call_ended", onCallEnded);
    socket.on("webrtc_answer", onWebRtcAnswer);
    socket.on("ice_candidate", onIceCandidate);
    socket.on("peer_disconnected", onPeerDisconnected);
    socket.on("message_seen_update", onMessageSeenUpdate);
    socket.on("message_reaction_update", onMessageReactionUpdate);
    socket.on("message_deleted", onMessageDeleted);

    return () => {
      ringtonePlayer.stop();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.off("online_users", onOnlineUsers);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
      socket.off("incoming_group_call", onIncomingGroupCall);
      socket.off("group_call_state", onGroupCallState);
      socket.off("group_call_user_joined", onGroupCallUserJoined);
      socket.off("group_webrtc_offer", onGroupWebRtcOffer);
      socket.off("group_webrtc_answer", onGroupWebRtcAnswer);
      socket.off("group_ice_candidate", onGroupIceCandidate);
      socket.off("group_media_updated", onGroupMediaUpdated);
      socket.off("group_call_user_left", onGroupCallUserLeft);
      socket.off("group_call_ended", onGroupCallEnded);
      socket.off("incoming_call", onIncomingCall);
      socket.off("incoming_video_call", onIncomingCall);
      socket.off("call_accepted", onCallAccepted);
      socket.off("call_rejected", onCallRejected);
      socket.off("video_call_rejected", onCallRejected);
      socket.off("call_ended", onCallEnded);
      socket.off("video_call_ended", onCallEnded);
      socket.off("webrtc_answer", onWebRtcAnswer);
      socket.off("ice_candidate", onIceCandidate);
      socket.off("peer_disconnected", onPeerDisconnected);
      socket.off("message_seen_update", onMessageSeenUpdate);
      socket.off("message_reaction_update", onMessageReactionUpdate);
      socket.off("message_deleted", onMessageDeleted);
      clearTimeout(typingTimeoutRef.current);
      clearInterval(recordTimerRef.current);
      leaveGroupCall(); // Cleanup on unmount
    };
  }, [tripId]);

  // Helper to extract ALL members of the trip (createdBy + members array)
  const getAllTripMembers = () => {
    if (!trip) return [];
    const membersMap = new Map();

    const addMember = (m, isOwner = false) => {
      if (!m) return;
      const idStr = typeof m === "object" ? (m._id || m.id)?.toString() : m.toString();
      if (!idStr) return;

      if (!membersMap.has(idStr)) {
        membersMap.set(idStr, {
          _id: idStr,
          name: typeof m === "object" ? (m.name || m.username || "Traveler") : "Traveler",
          profileImage: typeof m === "object" ? (m.profileImage || m.avatar || "") : "",
          email: typeof m === "object" ? m.email : "",
          isOwner,
          isOnline: onlineUsers.includes(idStr),
        });
      } else if (isOwner) {
        membersMap.get(idStr).isOwner = true;
      }
    };

    if (trip.createdBy) addMember(trip.createdBy, true);
    if (Array.isArray(trip.members)) {
      trip.members.forEach((m) => addMember(m, false));
    }

    return Array.from(membersMap.values());
  };

  // Check if someone else in the trip is online
  const isTripMemberOnline = () => {
    const allMembers = getAllTripMembers();
    return allMembers.some((m) => m._id !== currentUserId && m.isOnline);
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
        height: "calc(100dvh - 68px)",
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

      {/* 1. CHAT HEADER */}
      <div
        className="d-flex align-items-center px-2 px-sm-3 py-2 border-bottom border-secondary w-100 flex-shrink-0"
        style={{
          background: "rgba(20, 20, 20, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06) !important",
          zIndex: 1000,
          minHeight: "56px"
        }}
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-link text-light p-0 text-decoration-none flex-shrink-0 d-flex align-items-center justify-content-center me-2"
          style={{ width: "36px", height: "36px" }}
          title="Go Back"
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>⬅</span>
        </button>

        {/* AVATAR + TRIP INFO (CLICKABLE HEADER FOR GROUP INFO) */}
        <div
          className="d-flex align-items-center flex-grow-1 user-select-none"
          style={{ minWidth: 0, paddingRight: "8px", cursor: "pointer" }}
          onClick={() => setShowGroupInfoModal(true)}
          title="Click to view Group Info & Members"
        >
          <div className="position-relative flex-shrink-0 me-2">
            <Avatar src={trip?.image || ""} size={40} className="border border-warning shadow-sm" />
            <span
              className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-dark ${
                isTripMemberOnline() ? "bg-success" : "bg-secondary"
              }`}
              style={{ width: "11px", height: "11px", right: "-1px", bottom: "-1px" }}
              title={isTripMemberOnline() ? "Online members available" : "All members offline"}
            />
          </div>

          <div className="d-flex flex-column flex-grow-1 justify-content-center" style={{ minWidth: 0 }}>
            <h6 className="m-0 fw-bold text-white text-truncate" style={{ fontSize: "15px", lineHeight: "1.2" }}>
              {trip?.title || "Trip Group Chat"}
            </h6>
            <div className="text-secondary text-truncate mt-1 d-flex align-items-center gap-1" style={{ fontSize: "11.5px", lineHeight: "1.2" }}>
              <span className="text-warning fw-medium">
                {getAllTripMembers().length} {getAllTripMembers().length === 1 ? "member" : "members"}
              </span>
              <span>•</span>
              <span className={getAllTripMembers().filter((m) => m.isOnline).length > 0 ? "text-success fw-medium" : "text-secondary"}>
                {getAllTripMembers().filter((m) => m.isOnline).length} online
              </span>
              {trip?.destination && (
                <>
                  <span>•</span>
                  <span className="text-truncate">📍 {trip.destination}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
          {/* VOICE CALL BUTTON */}
          <button
            className="btn btn-sm btn-outline-warning text-warning flex-shrink-0 d-flex align-items-center justify-content-center"
            onClick={() => startCall("voice")}
            style={{ borderRadius: "50%", width: "38px", height: "38px" }}
            title="Group Voice Call 📞"
            disabled={callActive || groupCallActive}
          >
            📞
          </button>

          {/* VIDEO CALL BUTTON */}
          <button
            className="btn btn-sm btn-outline-info text-info flex-shrink-0 d-flex align-items-center justify-content-center"
            onClick={() => startCall("video")}
            style={{ borderRadius: "50%", width: "38px", height: "38px" }}
            title="Group Video Call 📹"
            disabled={callActive || groupCallActive}
          >
            📹
          </button>

          <button
            className="btn btn-sm btn-outline-light text-light flex-shrink-0 d-none d-md-flex align-items-center justify-content-center"
            onClick={() => setShowGroupInfoModal(true)}
            style={{ borderRadius: "20px", height: "38px", padding: "0 14px" }}
            title="Group Info"
          >
            👥 Members ({getAllTripMembers().length})
          </button>
        </div>
      </div>

      {/* WHATSAPP-STYLE GROUP INFO MODAL */}
      {showGroupInfoModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
          }}
          onClick={() => setShowGroupInfoModal(false)}
        >
          <div
            className="glass-card text-light rounded-4 shadow-lg border border-secondary p-0 overflow-hidden"
            style={{
              maxWidth: "460px",
              width: "92%",
              maxHeight: "85vh",
              background: "rgba(22, 22, 28, 0.98)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-secondary bg-dark bg-opacity-50">
              <h5 className="m-0 fw-bold text-white d-flex align-items-center gap-2">
                <span>👥 Group Info</span>
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary text-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
                onClick={() => setShowGroupInfoModal(false)}
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="p-4 overflow-auto flex-grow-1">
              {/* GROUP HERO CARD */}
              <div className="text-center pb-4 border-bottom border-secondary mb-3">
                <Avatar
                  src={trip?.image || ""}
                  size={96}
                  className="rounded-circle border border-3 border-warning shadow-lg mb-3"
                />
                <h4 className="fw-bold text-white mb-1">{trip?.title || "Trip Group"}</h4>
                {trip?.destination && (
                  <p className="text-warning small mb-2">📍 {trip.destination}</p>
                )}
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                    {getAllTripMembers().length} Members
                  </span>
                  <span className="badge bg-success px-3 py-2 rounded-pill fw-bold">
                    {getAllTripMembers().filter((m) => m.isOnline).length} Online
                  </span>
                </div>
              </div>

              {/* MEMBERS LIST SECTION */}
              <div>
                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "12px", letterSpacing: "1px" }}>
                  Group Members ({getAllTripMembers().length})
                </h6>

                <div className="d-flex flex-column gap-2">
                  {getAllTripMembers().map((member) => (
                    <div
                      key={member._id}
                      className="d-flex align-items-center justify-content-between p-2.5 rounded-3 hover-lift"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div className="position-relative flex-shrink-0">
                          <Avatar src={member.profileImage} size={42} className="border border-secondary" />
                          <span
                            className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-dark ${
                              member.isOnline ? "bg-success" : "bg-secondary"
                            }`}
                            style={{ width: "10px", height: "10px" }}
                          />
                        </div>

                        <div className="d-flex flex-column min-w-0">
                          <span className="fw-semibold text-white text-truncate" style={{ fontSize: "14px" }}>
                            {member.name} {member._id === currentUserId && "(You)"}
                          </span>
                          <span className="text-secondary small text-truncate" style={{ fontSize: "11px" }}>
                            {member.isOnline ? "🟢 Online" : "⚪ Offline"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {member.isOwner ? (
                          <span className="badge bg-warning text-dark font-mono" style={{ fontSize: "10px" }}>
                            Admin / Owner
                          </span>
                        ) : (
                          <span className="badge bg-secondary font-mono" style={{ fontSize: "10px" }}>
                            Member
                          </span>
                        )}

                        <Link
                          to={`/profile/${member._id}`}
                          className="btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
                          style={{ width: "30px", height: "30px", fontSize: "12px" }}
                          title="View Profile"
                        >
                          👤
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3 border-top border-secondary bg-dark bg-opacity-50 text-center">
              <button
                className="btn btn-sm btn-outline-warning w-100 rounded-pill py-2 fw-semibold"
                onClick={() => setShowGroupInfoModal(false)}
              >
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. INCOMING GROUP CALL OVERLAY MODAL (WhatsApp Style) */}
      {incomingGroupCall && !groupCallActive && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(16px)",
            zIndex: 9999,
          }}
        >
          <div
            className="glass-card text-center p-4 p-sm-5 rounded-4 shadow-lg border border-secondary"
            style={{
              maxWidth: "400px",
              width: "90%",
              background: "rgba(20, 20, 25, 0.95)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <span className="badge bg-warning text-dark fw-bold mb-2 px-3 py-2 rounded-pill" style={{ fontSize: "12px" }}>
              {incomingGroupCall.callType === "voice" ? "Incoming Group Voice Call 📞" : "Incoming Group Video Call 📹"}
            </span>
            <p className="text-warning fw-semibold small mb-3">📍 {trip?.title || "Trip Group Call"}</p>

            <div className="position-relative d-inline-block my-2">
              <Avatar
                src={incomingGroupCall.callerAvatar || ""}
                size={96}
                className="rounded-circle border border-3 border-warning shadow-lg"
              />
              <span className="position-absolute top-0 start-0 w-100 h-100 rounded-circle border border-warning animate-ping opacity-75" />
            </div>

            <h4 className="fw-bold text-white mb-1">{incomingGroupCall.callerName || "Traveler"}</h4>
            <p className="text-secondary small mb-4">is calling the trip group</p>

            <div className="d-flex justify-content-center gap-4 mt-2">
              {/* REJECT BUTTON */}
              <button
                className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center shadow-lg hover-lift"
                style={{ width: "60px", height: "60px", fontSize: "24px" }}
                onClick={rejectGroupCall}
                title="Decline Call"
              >
                ❌
              </button>

              {/* JOIN BUTTON */}
              <button
                className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow-lg hover-lift"
                style={{ width: "60px", height: "60px", fontSize: "24px" }}
                onClick={() => joinGroupCall(incomingGroupCall)}
                title="Join Call"
              >
                {incomingGroupCall.callType === "voice" ? "📞" : "📹"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVE GROUP CALL OVERLAY MODAL */}
      {groupCallActive && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between align-items-center p-2 p-md-4"
          style={{
            background: "#08080a",
            zIndex: 9990,
          }}
        >
          {/* TOP CALL STATUS BAR */}
          <div className="d-flex align-items-center justify-content-between w-100 text-white px-3 py-2 rounded-4 glass-card bg-dark bg-opacity-75" style={{ maxWidth: "800px" }}>
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">{callType === "voice" ? "📞 Group Voice" : "📹 Group Video"}</span>
              <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>
                {participants.length} Active
              </span>
            </div>

            <div className="fw-mono text-warning fw-bold fs-5">
              {formatDuration(callDuration)}
            </div>
          </div>

          {/* MAIN PARTICIPANTS CONTAINER */}
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 w-100 my-3 position-relative" style={{ maxWidth: "1000px", overflowY: "auto" }}>
            {callType === "voice" ? (
              /* GROUP VOICE CALL DISPLAY */
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 p-3 my-auto w-100">
                {/* LOCAL PARTICIPANT AVATAR CARD */}
                <div className="text-center p-3 rounded-4 glass-card bg-dark bg-opacity-75 border border-secondary" style={{ width: "160px" }}>
                  <div className="position-relative d-inline-block mb-2">
                    <Avatar
                      src={currentUser?.profileImage || ""}
                      size={80}
                      className={`rounded-circle border border-3 ${isMuted ? "border-danger" : "border-success"}`}
                    />
                    <span className="position-absolute bottom-0 end-0 bg-dark rounded-circle p-1" style={{ fontSize: "14px" }}>
                      {isMuted ? "🔇" : "🎤"}
                    </span>
                  </div>
                  <h6 className="fw-bold text-white text-truncate mb-0" style={{ fontSize: "13px" }}>
                    You ({currentUser?.name?.split(" ")[0] || "Me"})
                  </h6>
                  <span className="badge bg-success mt-1" style={{ fontSize: "9px" }}>Connected</span>
                </div>

                {/* REMOTE PARTICIPANTS AVATAR CARDS */}
                {participants
                  .filter((p) => p.userId.toString() !== currentUserId.toString())
                  .map((p) => (
                    <div key={p.userId} className="text-center p-3 rounded-4 glass-card bg-dark bg-opacity-75 border border-secondary" style={{ width: "160px" }}>
                      <div className="position-relative d-inline-block mb-2">
                        <Avatar
                          src={p.avatar || ""}
                          size={80}
                          className={`rounded-circle border border-3 ${p.muted ? "border-danger" : "border-success"}`}
                        />
                        <span className="position-absolute bottom-0 end-0 bg-dark rounded-circle p-1" style={{ fontSize: "14px" }}>
                          {p.muted ? "🔇" : "🎤"}
                        </span>
                      </div>
                      <h6 className="fw-bold text-white text-truncate mb-0" style={{ fontSize: "13px" }}>
                        {p.name || "Traveler"}
                      </h6>
                      <span className="badge bg-success mt-1" style={{ fontSize: "9px" }}>Connected</span>

                      {/* Hidden audio element for remote voice stream */}
                      {remoteStreams[p.userId] && (
                        <audio
                          autoPlay
                          playsInline
                          ref={(el) => {
                            if (el && remoteStreams[p.userId]) el.srcObject = remoteStreams[p.userId];
                          }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              /* GROUP VIDEO CALL GRID DISPLAY */
              <div className="w-100 h-100 d-flex flex-wrap align-items-center justify-content-center gap-2 p-2 rounded-4 border border-secondary bg-black overflow-hidden" style={{ minHeight: "350px" }}>
                {/* LOCAL VIDEO PARTICIPANT TILE */}
                <div
                  className="position-relative rounded-3 overflow-hidden border border-warning bg-dark flex-grow-1"
                  style={{
                    minWidth: "220px",
                    maxHeight: "100%",
                    flexBasis: participants.length <= 2 ? "45%" : "30%",
                  }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute bottom-0 start-0 bg-dark bg-opacity-75 text-warning px-2 py-1 rounded-end small" style={{ fontSize: "11px" }}>
                    You ({currentUser?.name?.split(" ")[0]}) {isMuted && "🔇"}
                  </span>
                </div>

                {/* REMOTE VIDEO PARTICIPANTS TILES */}
                {participants
                  .filter((p) => p.userId.toString() !== currentUserId.toString())
                  .map((p) => (
                    <div
                      key={p.userId}
                      className="position-relative rounded-3 overflow-hidden border border-secondary bg-dark flex-grow-1"
                      style={{
                        minWidth: "220px",
                        maxHeight: "100%",
                        flexBasis: participants.length <= 2 ? "45%" : "30%",
                      }}
                    >
                      {remoteStreams[p.userId] ? (
                        <video
                          autoPlay
                          playsInline
                          ref={(el) => {
                            if (el && remoteStreams[p.userId]) el.srcObject = remoteStreams[p.userId];
                          }}
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3 text-center">
                          <Avatar src={p.avatar} size={70} className="mb-2 border border-warning" />
                          <span className="text-secondary small">{p.name} (Connecting...)</span>
                        </div>
                      )}

                      <span className="position-absolute bottom-0 start-0 bg-dark bg-opacity-75 text-white px-2 py-1 rounded-end small" style={{ fontSize: "11px" }}>
                        {p.name} {p.muted && "🔇"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* FLOATING CONTROLS BAR */}
          <div
            className="d-flex align-items-center justify-content-center gap-3 p-3 rounded-pill glass-card bg-dark bg-opacity-75 shadow-lg mb-2"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* MUTE MIC BUTTON */}
            <button
              className={`btn ${isMuted ? "btn-warning text-dark" : "btn-outline-light text-white"} rounded-circle d-flex align-items-center justify-content-center`}
              style={{ width: "50px", height: "50px", fontSize: "20px" }}
              onClick={toggleGroupMute}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>

            {/* TOGGLE CAMERA BUTTON (Video call only) */}
            {callType === "video" && (
              <button
                className={`btn ${!isVideoEnabled ? "btn-warning text-dark" : "btn-outline-light text-white"} rounded-circle d-flex align-items-center justify-content-center`}
                style={{ width: "50px", height: "50px", fontSize: "20px" }}
                onClick={toggleGroupVideo}
                title={isVideoEnabled ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoEnabled ? "📹" : "🙈"}
              </button>
            )}

            {/* LEAVE CALL BUTTON */}
            <button
              className="btn btn-danger rounded-pill px-4 d-flex align-items-center justify-content-center gap-2 shadow-lg fw-bold"
              style={{ height: "50px", fontSize: "15px" }}
              onClick={leaveGroupCall}
              title="Leave Group Call"
            >
              🔴 Leave Call
            </button>
          </div>
        </div>
      )}

      {/* 2. CHAT SCROLL STREAM CONTAINER */}
      <div
        ref={scrollContainerRef}
        className="flex-grow-1 p-2 p-sm-3"
        style={{
          overflowY: "auto",
          background: "#0d0d0d",
          minHeight: 0,
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
              const isMe = msg.sender?._id === currentUserId;
              const hasAttachment = !!msg.fileUrl;
              const isImage = hasAttachment && (
                msg.fileType?.startsWith("image/") ||
                msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)
              );

              // Seen indicator calculation
              const otherRead = msg.seen || (msg.readBy && msg.readBy.some(id => id && currentUserId && id.toString() !== currentUserId.toString()));
              const seenLabel = otherRead ? "Seen" : "Sent";

              return (
                <div
                  key={msg._id}
                  className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}
                  style={{ width: "100%" }}
                >
                  <div
                    className={`d-flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                    style={{ maxWidth: "84%" }}
                  >
                    {/* Render Receiver avatar */}
                    {!isMe && (
                      <Link to={`/profile/${msg.sender?._id}`} className="mt-1 flex-shrink-0">
                        <Avatar src={msg.sender?.profileImage} size={32} />
                      </Link>
                    )}

                    <div className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`} style={{ minWidth: 0 }}>
                      {/* Name header for receiver */}
                      {!isMe && (
                        <span className="text-secondary mb-1 ps-1" style={{ fontSize: "11px" }}>
                          {msg.sender?.name || "Traveler"}
                        </span>
                      )}

                      {/* Chat Bubble */}
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
                          fontSize: "14px",
                          lineHeight: "1.45",
                          cursor: "pointer",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "pre-wrap",
                          minWidth: 0,
                          maxWidth: "100%"
                        }}
                      >
                        {/* 1. TEXT */}
                        {msg.message && <div className="mb-1" style={{ minWidth: 0 }}>{msg.message}</div>}

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

                      {/* POPUP REACTIONS PICKER */}
                      {activeReactionMenuId === msg._id && (
                        <div
                          className="d-flex align-items-center gap-2 p-2 bg-dark border border-secondary mt-1 rounded-pill shadow-lg animate-fade"
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
                          {isMe && (
                            <div className="d-flex align-items-center gap-2 border-start border-secondary ps-2 ms-1" style={{ borderColor: "rgba(255,255,255,0.15) !important" }}>
                              <button
                                className="btn btn-link p-0 text-info hover-lift text-decoration-none"
                                onClick={() => handleStartEdit(msg)}
                                style={{ fontSize: "15px" }}
                                title="Edit message"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-link p-0 text-danger hover-lift text-decoration-none"
                                onClick={() => handleDeleteMessage(msg._id)}
                                style={{ fontSize: "15px" }}
                                title="Delete message"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
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

      {/* 4. REAL-TIME TYPING INDICATOR */}
      {typingUser && (
        <div className="px-3 py-1 bg-black d-flex align-items-center gap-2 border-top border-secondary flex-shrink-0" style={{ borderTopColor: "rgba(255,255,255,0.03) !important" }}>
          <small className="text-warning fw-semibold">{typingUser}</small>
          <div className="d-flex gap-1 align-items-center">
            <span className="typing-indicator-dot" />
            <span className="typing-indicator-dot" />
            <span className="typing-indicator-dot" />
          </div>
        </div>
      )}

      {/* PREVIEW BARS PANEL */}
      {/* A. Document or Image attachment preview */}
      {file && (
        <div
          className="p-3 border-top border-secondary bg-dark d-flex align-items-center justify-content-between flex-shrink-0"
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

      {/* B. Voice recording clip preview */}
      {audioPreviewUrl && (
        <div
          className="p-3 border-top border-secondary bg-dark d-flex align-items-center justify-content-between flex-shrink-0"
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

      {/* C. Editing message preview */}
      {editingMessageId && (
        <div
          className="p-3 border-top border-secondary bg-dark d-flex align-items-center justify-content-between flex-shrink-0"
          style={{ background: "#1a1a1a", borderTopColor: "rgba(255,255,255,0.08) !important" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "14px" }}>✏️ Editing Message:</span>
            <span className="text-secondary small text-truncate" style={{ maxWidth: "350px" }}>"{editMessageText}"</span>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={handleCancelEdit}>
            Cancel ✖
          </button>
        </div>
      )}

      {/* 5. MESSAGE COMPOSER PANEL */}
      <div
        className="p-2 p-sm-3 border-top border-secondary flex-shrink-0"
        style={{
          background: "rgba(20, 20, 20, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06) !important",
          zIndex: 1000,
        }}
      >
        <div className="d-flex align-items-end gap-2 w-100">
          {/* Emoji button popover trigger */}
          <div className="position-relative flex-shrink-0">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="btn btn-outline-secondary p-0 text-warning border-0 d-flex align-items-center justify-content-center"
              style={{ fontSize: "18px", width: "38px", height: "38px" }}
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
          <div className="flex-shrink-0">
            <label
              htmlFor="chat-attachment-input"
              className="btn btn-outline-secondary p-0 border-0 d-flex align-items-center justify-content-center m-0"
              style={{ cursor: "pointer", fontSize: "18px", width: "38px", height: "38px" }}
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
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                }
              }
            }}
            style={{ 
              resize: "none", 
              borderRadius: "20px", 
              padding: "9px 15px", 
              maxHeight: "140px", 
              overflowY: "auto",
              flexGrow: 1,
              minWidth: 0,
              fontSize: "14px"
            }}
          />

          {/* Recording / Send actions toggle button */}
          {isRecording ? (
            <button 
              className="btn btn-danger flex-shrink-0 d-flex align-items-center justify-content-center p-0" 
              onClick={stopRecording} 
              style={{ borderRadius: "50%", width: "40px", height: "40px" }}
              title="Stop Recording"
            >
              ⏹
            </button>
          ) : !message.trim() && !file && !audioBlob ? (
            <button 
              className="btn btn-outline-warning flex-shrink-0 d-flex align-items-center justify-content-center p-0" 
              onClick={startRecording} 
              style={{ borderRadius: "50%", width: "40px", height: "40px" }} 
              title="Record Voice"
            >
              🎤
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={sending}
              className="btn btn-warning text-dark fw-bold flex-shrink-0 d-flex align-items-center justify-content-center p-0"
              style={{ borderRadius: "50%", width: "40px", height: "40px" }}
              title="Send Message"
            >
              {sending ? "..." : "➤"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
