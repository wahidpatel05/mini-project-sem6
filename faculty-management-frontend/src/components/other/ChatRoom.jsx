import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Send, X, MessageCircle } from "lucide-react";
import { apiService } from "../../utils/apiService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

/**
 * ChatRoom
 *
 * Props:
 *  - roomId        {string}  e.g. "direct_<id1>_<id2>" or "task_<taskId>"
 *  - roomLabel     {string}  display name shown in the header
 *  - currentUser   { id, name, role }
 *  - onClose       {function} called when the user dismisses the panel
 */
const ChatRoom = ({ roomId, roomLabel, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  /* ── Socket setup ─────────────────────────────────────────── */
  useEffect(() => {
    if (!roomId) return;

    // Fetch history from REST
    const loadHistory = async () => {
      try {
        const history = await apiService.getMessages(roomId);
        if (Array.isArray(history)) {
          setMessages(history);
        }
      } catch {
        // history unavailable — start fresh
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();

    // Open WebSocket
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [roomId]);

  /* ── Auto-scroll to bottom ───────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send message ────────────────────────────────────────── */
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit("send-message", {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
    });

    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── UI ──────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span className="font-semibold text-sm truncate max-w-[200px]">{roomLabel}</span>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-slate-400"}`} />
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {loadingHistory ? (
          <p className="text-center text-slate-400 text-sm mt-6">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-400 text-sm mt-6">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUser.id;
            return (
              <div key={msg._id || idx} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  isOwn
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                }`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold text-slate-500 mb-1">{msg.senderName}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="text-xs text-slate-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {new Date(msg.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-200 bg-white">
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          disabled={!connected}
          className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !inputText.trim()}
          className="p-2 rounded-lg bg-slate-900 text-white disabled:opacity-40 hover:bg-slate-700 transition"
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
};

export default ChatRoom;
