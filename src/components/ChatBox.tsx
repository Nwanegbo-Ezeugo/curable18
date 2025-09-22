import React, { useState } from "react";
import axios from "axios";
 

export default function ChatBox({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ FIXED: Changed URL to point to your FastAPI backend on port 8000
      const res = await axios.post("https://curable.onrender.com/chat", { // ← Changed to port 8000 and /chat
        user_id: userId,
        message: input,
      });

      const aiMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: could not reach server. Make sure the backend is running on port 8000." }, // ← Better error message
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[80%] ${
              m.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-gray-900 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="text-gray-400 italic">Assistant is typing...</div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 border rounded-xl px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          Send
        </button>
      </form>
    </div>
  );
}
