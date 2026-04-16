const Message = require("../models/Message");

// GET /api/messages/:roomId — fetch chat history for a room
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(200);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
