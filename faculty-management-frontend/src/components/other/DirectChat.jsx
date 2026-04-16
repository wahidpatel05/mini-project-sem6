import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

/**
 * DirectChat
 * Lets an admin select an employee and open a 1-on-1 chat with them.
 *
 * Props:
 *  - employees     {Array}   list of employee objects { _id, firstName }
 *  - currentUser   { id, name, role }
 */
const DirectChat = ({ employees, currentUser }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const selectedEmployee = employees?.find((e) => e._id === selectedEmployeeId);

  // Room id: "direct_<smaller_id>_<larger_id>" for deterministic room name
  const getRoomId = (id1, id2) => {
    const [a, b] = [id1, id2].sort();
    return `direct_${a}_${b}`;
  };

  const handleSelect = (e) => {
    setSelectedEmployeeId(e.target.value);
    setChatOpen(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm space-y-3">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={18} className="text-slate-600" />
        <h3 className="font-semibold text-slate-800 text-sm">Direct Message</h3>
      </div>

      {/* Employee selector */}
      <select
        value={selectedEmployeeId}
        onChange={handleSelect}
        className="input-ui text-sm"
      >
        <option value="">Select an employee to message…</option>
        {employees?.map((emp) => (
          <option key={emp._id} value={emp._id}>
            {emp.firstName}
          </option>
        ))}
      </select>

      {/* Open/Close chat toggle */}
      {selectedEmployeeId && (
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-500 font-medium transition"
        >
          {chatOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {chatOpen ? "Close Chat" : `Chat with ${selectedEmployee?.firstName}`}
        </button>
      )}

      {/* Chat panel */}
      {selectedEmployeeId && chatOpen && (
        <div className="h-80">
          <ChatRoom
            roomId={getRoomId(currentUser.id, selectedEmployeeId)}
            roomLabel={`Chat with ${selectedEmployee?.firstName}`}
            currentUser={currentUser}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}

    </div>
  );
};

export default DirectChat;
