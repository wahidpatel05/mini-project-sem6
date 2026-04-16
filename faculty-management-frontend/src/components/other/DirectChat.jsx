import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import { MessageCircle, Search, ArrowLeft } from "lucide-react";

/**
 * DirectChat
 * Lets an admin select an employee and open a 1-on-1 chat with them (WhatsApp UI style).
 *
 * Props:
 *  - employees     {Array}   list of employee objects { _id, firstName }
 *  - currentUser   { id, name, role }
 */
const DirectChat = ({ employees, currentUser }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Mobile view: "contacts" | "chat"
  const [mobileView, setMobileView] = useState("contacts");

  const selectedEmployee = employees?.find((e) => e._id === selectedEmployeeId);

  // Room id: "direct_<smaller_id>_<larger_id>" for deterministic room name
  const getRoomId = (id1, id2) => {
    if (!id1 || !id2) return "";
    const [a, b] = [id1, id2].sort();
    return `direct_${a}_${b}`;
  };

  const filteredEmployees = employees?.filter((emp) =>
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("contacts");
  };

  // Shared sidebar content
  const SidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <MessageCircle size={18} className="text-emerald-600" />
          Messages
        </h3>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b bg-white" style={{ borderColor: "var(--border)" }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border-none"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto w-full">
        {filteredEmployees?.length > 0 ? (
          filteredEmployees.map((emp) => {
            const isSelected = selectedEmployeeId === emp._id;
            return (
              <div
                key={emp._id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectEmployee(emp._id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectEmployee(emp._id); } }}
                className={`cursor-pointer p-3 border-b flex items-center gap-3 transition-all min-h-[56px] ${
                  isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500" : "hover:bg-slate-100 border-l-4 border-l-transparent"
                }`}
                style={{ borderBottomColor: "var(--border)" }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold">
                  {emp.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm font-semibold truncate ${isSelected ? "text-emerald-800" : "text-slate-800"}`}>
                      {emp.firstName}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-sm text-slate-500">
            No contacts found.
          </div>
        )}
      </div>
    </>
  );

  // Shared chat area content
  const ChatContent = () => (
    selectedEmployeeId ? (
      <div className="flex-1 flex flex-col h-full relative">
        <ChatRoom
          roomId={getRoomId(currentUser.id, selectedEmployeeId)}
          roomLabel={selectedEmployee?.firstName}
          currentUser={currentUser}
          onClose={() => {}}
          whatsappMode={true}
        />
      </div>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-medium text-slate-700 mb-2">Faculty Messages</h2>
        <p className="text-sm text-slate-500 px-8 text-center max-w-md">
          Select an employee from the sidebar to view their direct chat history or send a new message.
        </p>
      </div>
    )
  );

  return (
    <>
      {/* ── Desktop layout (md+): two-panel side-by-side ── */}
      <div className="hidden md:flex h-[75vh] bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {/* Sidebar */}
        <div className="w-1/3 min-w-[250px] border-r flex flex-col bg-slate-50" style={{ borderColor: "var(--border)" }}>
          <SidebarContent />
        </div>
        {/* Main Chat Area */}
        <div className="w-2/3 flex flex-col bg-[#efeae2]">
          <ChatContent />
        </div>
      </div>

      {/* ── Mobile layout (< md): single panel, contacts or chat ── */}
      <div className="flex md:hidden flex-col bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)", height: "75vh" }}>
        {mobileView === "contacts" ? (
          <div className="flex flex-col h-full bg-slate-50">
            <SidebarContent />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Back bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 bg-slate-100 border-b flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-slate-700 min-h-[44px] pr-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <span className="text-sm font-semibold text-slate-800 truncate">
                {selectedEmployee?.firstName}
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-[#efeae2]">
              <ChatContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DirectChat;
