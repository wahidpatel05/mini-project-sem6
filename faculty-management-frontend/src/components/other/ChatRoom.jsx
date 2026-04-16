import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Send, X, MessageCircle } from "lucide-react";
import { apiService } from "../../utils/apiService";

const SOCKET_URL = (() => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL.replace("/api", "");
  return "http://localhost:5000";
})();

/**
 * ChatRoom
 *
 * Props:
 *  - roomId        {string}  e.g. "direct_<id1>_<id2>" or "task_<taskId>"
 *  - roomLabel     {string}  display name shown in the header
 *  - currentUser   { id, name, role }
 *  - onClose       {function} called when the user dismisses the panel
 *  - whatsappMode  {boolean} controls UI styling
 */
const ChatRoom = ({ roomId, roomLabel, currentUser, onClose, whatsappMode = false }) => {
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
    <div className={`flex flex-col h-full overflow-hidden ${whatsappMode ? "bg-[#efeae2]" : "bg-white border rounded-2xl shadow-xl"} relative`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${whatsappMode ? "bg-[#00a884] text-white" : "bg-slate-900 border-b border-slate-200 text-white"}`}>
        <div className="flex items-center gap-3">
          {whatsappMode ? (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg flex-shrink-0">
              {roomLabel ? roomLabel.charAt(0).toUpperCase() : <MessageCircle size={18} />}
            </div>
          ) : (
            <MessageCircle size={18} />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-base truncate max-w-[200px] leading-tight">{roomLabel}</span>
            <span className="text-[11px] opacity-80 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? (whatsappMode ? "bg-white" : "bg-emerald-400") : "bg-slate-400"}`} />
              {connected ? "online" : "offline"}
            </span>
          </div>
        </div>
        {!whatsappMode && onClose && (
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Message List */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${whatsappMode ? "bg-[#efeae2]" : "bg-slate-50"}`}
        style={whatsappMode ? {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d8cfc4' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        } : {}}
      >
        {loadingHistory ? (
          <p className={`text-center text-sm mt-6 ${whatsappMode ? "text-slate-500 bg-white/50 py-1 px-3 rounded-md mx-auto w-max shadow-sm" : "text-slate-400"}`}>Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mt-6">
            <p className={`text-center text-sm ${whatsappMode ? "bg-[#ffeecd] text-slate-600 px-4 py-2 rounded-lg shadow-sm" : "text-slate-400"}`}>
              Check encryption. This chat is secured end-to-end.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderId === currentUser.id;
            return (
              <div key={msg._id || idx} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 text-sm relative shadow-sm ${
                  whatsappMode 
                    ? (isOwn ? "bg-[#d9fdd3] text-slate-800 rounded-lg rounded-tr-none" : "bg-white text-slate-800 rounded-lg rounded-tl-none")
                    : (isOwn ? "bg-slate-900 text-white rounded-xl rounded-br-none" : "bg-white border border-slate-200 text-slate-800 rounded-xl rounded-bl-none")
                }`}>
                  {!whatsappMode && !isOwn && (
                    <p className="text-xs font-semibold text-slate-500 mb-1">{msg.senderName}</p>
                  )}
                  {whatsappMode && !isOwn && currentUser.role !== "employee" && (
                    <p className="text-[11px] font-bold text-emerald-600 mb-0.5">{msg.senderName}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  <span className={`text-[10px] block mt-1 text-right ${whatsappMode ? "text-slate-500" : (isOwn ? "text-slate-300" : "text-slate-400")}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`flex items-center gap-2 px-3 py-3 ${whatsappMode ? "bg-[#f0f2f5]" : "border-t border-slate-200 bg-white"}`}>
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          disabled={!connected}
          className={`flex-1 resize-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50 ${whatsappMode ? "rounded-full bg-white border-none shadow-sm" : "rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-300"}`}
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !inputText.trim()}
          className={`p-2.5 rounded-full flex items-center justify-center transition disabled:opacity-40 ${whatsappMode ? "bg-[#00a884] text-white hover:bg-[#008f6f]" : "bg-slate-900 text-white hover:bg-slate-700"}`}
        >
          <Send size={18} className={whatsappMode ? "ml-0.5" : ""} />
        </button>
      </div>

    </div>
  );
};

export default ChatRoom;
