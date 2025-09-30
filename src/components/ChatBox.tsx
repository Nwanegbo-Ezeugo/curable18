import React, { useState, useEffect, useRef } from "react";

export default function ChatBox({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Error loading saved messages:", error);
      }
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setLoading(true);

    // Determine API URL based on environment
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:8000'
      : 'https://curable.onrender.com';

    console.log('Sending to:', `${API_URL}/chat-stream`);

    try {
      const res = await fetch(`${API_URL}/chat-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: userInput }),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      const decoder = new TextDecoder();
      let aiContent = "";

      // Add an empty assistant message to fill as stream comes in
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      console.log('Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete');
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        aiContent += chunk;

        // Update only the last assistant message progressively
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: aiContent };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat stream error:", err);
      setMessages(prev => {
        // Remove empty assistant message if it exists
        const filtered = prev.filter(m => m.content !== "");
        return [
          ...filtered,
          {
            role: "assistant",
            content: "⚠️ Sorry, I'm having trouble right now. Please try again later.",
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  }

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`chatMessages_${userId}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl rounded-2xl p-6 flex flex-col h-[600px] border border-gray-700">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-red-900/30"
          >
            Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-lg font-medium text-white">Hello! How can I help you today?</p>
            <p className="text-sm mt-2">Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      m.role === "user" ? "text-blue-100" : "text-gray-300"
                    }`}
                  >
                    {m.role === "user" ? "You" : "Assistant"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                  {m.role === "assistant" && m.content === "" && (
                    <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-gray-700 border border-gray-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-3 pt-4 border-t border-gray-700">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}