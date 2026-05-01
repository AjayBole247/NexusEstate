"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft, Lock, CheckCircle, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import NegotiationRoom from "@/components/NegotiationRoom";

export default function SwapDashboard() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [commitMode, setCommitMode] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [readyUsers, setReadyUsers] = useState<string[]>([]);
  const [transactionId] = useState("mock-tx-12345"); // In reality, this comes from backend CTE match
  
  // Mock User
  const currentUser = { id: "user-A", name: "Alice (You)" };
  
  // Mock Chain A -> B -> C -> A
  const swapChain = [
    { id: "user-A", name: "Alice", property: "Downtown Loft", role: "Nomad" },
    { id: "user-B", name: "Bob", property: "Suburban House", role: "Nomad" },
    { id: "user-C", name: "Charlie", property: "Beach Condo", role: "Nomad" }
  ];

  useEffect(() => {
    if (commitMode) {
      const newSocket = io("http://localhost:3001");
      setSocket(newSocket);
      newSocket.emit("join_swap_room", transactionId);

      newSocket.on("user_ready", (data) => {
        setReadyUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      });

      newSocket.on("swap_committed", () => {
        toast.success("All parties committed! Lease swapped successfully.");
        setCommitMode(false);
      });

      // Countdown timer logic
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            toast.error("Transaction expired! Rolled back.");
            setCommitMode(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        newSocket.disconnect();
        clearInterval(timer);
      };
    } else {
      setCountdown(60);
      setReadyUsers([]);
    }
  }, [commitMode, transactionId]);

  const handleReadyToCommit = async () => {
    if (!socket) return;
    
    // Optimistically update UI
    if (!readyUsers.includes(currentUser.id)) {
      setReadyUsers((prev) => [...prev, currentUser.id]);
    }
    
    // Notify room via socket
    socket.emit("user_ready_to_commit", { transactionId, userId: currentUser.id });
    toast.success("You have locked your commitment.");

    // Check if we are the last one (mocking the backend trigger here for visual demo)
    // In a real flow, the node server would check if all are ready and execute the `/api/swaps/commit` route.
    if (readyUsers.length + 1 === swapChain.length) {
      try {
        const res = await fetch("http://localhost:3001/api/swaps/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        // Server will emit 'swap_committed'
      } catch (err: any) {
        toast.error(err.message || "Commit failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8 text-neutral-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light text-white mb-2 flex items-center gap-3">
              <ArrowRightLeft className="text-blue-500" />
              NomadSwap Dashboard
            </h1>
            <p className="text-neutral-400">Review your multi-node closed loop swap chain.</p>
          </div>
          <button 
            onClick={() => setCommitMode(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Lock size={18} />
            Enter Commitment Room
          </button>
        </div>

        {/* Swap Chain Visualization */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <h2 className="text-xl font-medium text-white mb-8">Pending 3-Way Arbitrage Loop</h2>
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            {swapChain.map((node, i) => (
              <div key={node.id} className="flex-1 flex flex-col items-center">
                
                <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-2xl w-full text-center hover:border-blue-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-neutral-700 mx-auto flex items-center justify-center text-lg font-medium text-white mb-4 group-hover:scale-110 transition-transform">
                    {node.name.charAt(0)}
                  </div>
                  <h3 className="font-medium text-white">{node.name}</h3>
                  <p className="text-sm text-blue-400 mt-1">{node.property}</p>
                  
                  <button 
                    onClick={() => setActiveChat(`room-${node.id}`)}
                    className="mt-4 flex items-center gap-2 text-xs text-neutral-400 hover:text-white mx-auto transition-colors"
                  >
                    <MessageSquare size={14} /> Message
                  </button>
                </div>
                
                {/* Visual Arrow for Chain */}
                <div className="text-neutral-600 mt-6">
                  {i < swapChain.length - 1 ? (
                     <ArrowRightLeft className="animate-pulse text-blue-500" />
                  ) : (
                     <ArrowRightLeft className="opacity-50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Room Modal overlay */}
        {commitMode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800">
                <div 
                  className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-light text-white flex items-center gap-2">
                    <Lock className="text-blue-500" /> ACID Commitment Room
                  </h2>
                  <p className="text-neutral-400 text-sm mt-1">All parties must lock in simultaneously.</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`text-4xl font-mono ${countdown < 15 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    00:{countdown.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">T-Minus to Rollback</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {swapChain.map((node) => {
                  const isReady = readyUsers.includes(node.id);
                  const isMe = node.id === currentUser.id;
                  return (
                    <div key={node.id} className={`flex items-center justify-between p-4 rounded-xl border ${isReady ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-neutral-800 bg-neutral-800/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isReady ? 'bg-emerald-500 text-white' : 'bg-neutral-700 text-neutral-400'}`}>
                          {node.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${isReady ? 'text-white' : 'text-neutral-400'}`}>
                          {node.name}
                        </span>
                      </div>
                      <div>
                        {isReady ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                            <CheckCircle size={16} /> Locked
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <Clock size={16} className="animate-spin-slow" /> Pending...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8 border-t border-neutral-800 pt-6">
                <div className="flex items-center gap-2 text-xs text-neutral-500 max-w-xs">
                  <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                  Locking initiates a SELECT ... FOR UPDATE database transaction.
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCommitMode(false)}
                    className="px-6 py-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleReadyToCommit}
                    disabled={readyUsers.includes(currentUser.id)}
                    className={`px-8 py-2 rounded-lg font-medium transition-all ${
                      readyUsers.includes(currentUser.id)
                        ? "bg-emerald-600 text-white opacity-50 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                    }`}
                  >
                    {readyUsers.includes(currentUser.id) ? "Committed" : "Lock My Lease"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeChat && (
        <NegotiationRoom 
          roomId={activeChat} 
          userId={currentUser.id} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}
