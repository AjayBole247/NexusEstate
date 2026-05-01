"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, X } from "lucide-react";

interface Message {
  senderId: string;
  text: string;
  timestamp: number;
}

interface NegotiationRoomProps {
  roomId: string;
  userId: string;
  onClose: () => void;
}

export default function NegotiationRoom({ roomId, userId, onClose }: NegotiationRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to Node backend WebSocket
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("join_negotiation", roomId);

    newSocket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const msgData: Message & { roomId: string } = {
      roomId,
      senderId: userId,
      text: input,
      timestamp: Date.now(),
    };

    socket.emit("send_message", msgData);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-10">
      <div className="bg-neutral-800 p-4 flex items-center justify-between border-b border-neutral-700">
        <div>
          <h3 className="font-semibold text-white text-sm">Negotiation Room</h3>
          <p className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </p>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-neutral-500 my-auto">
            Direct peer-to-peer connection established. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                    isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-neutral-800 text-neutral-200 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-neutral-800 border-t border-neutral-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
