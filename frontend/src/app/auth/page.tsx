"use client";

import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Building2, Home, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/store/useAppStore";

// Ensure you use your actual Google Client ID here
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

export default function AuthPage() {
  const [role, setRole] = useState<"Nomad" | "Investor" | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    if (!role) {
      toast.error("Please select a role first!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
          role,
        }),
      });

      if (!res.ok) throw new Error("Authentication failed");
      const data = await res.json();
      
      // Save token (in a real app, use HTTP-only cookies or secure storage)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Update global store state instantly
      useAppStore.getState().setUser(data.user);
      
      toast.success("Successfully logged in!");
      // Redirect based on role or to dashboard
      window.location.href = "/swap";
    } catch (error) {
      toast.error("Failed to authenticate with backend.");
      console.error(error);
    }
  };

  const handleDemoLogin = async () => {
    if (!role) {
      toast.error("Please select a role first!");
      return;
    }
    
    // Simulate a successful Google token
    handleSuccess({ credential: "mock-google-jwt-token" });
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-light text-white mb-2">Welcome to NexusEstate</h1>
            <p className="text-neutral-400">Select your path to continue</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => setRole("Nomad")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                role === "Nomad" 
                  ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                  : "border-neutral-800 bg-neutral-800/50 text-neutral-500 hover:border-neutral-700"
              }`}
            >
              <Home size={32} />
              <span className="font-medium">Nomad</span>
            </button>

            <button
              onClick={() => setRole("Investor")}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-4 ${
                role === "Investor" 
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                  : "border-neutral-800 bg-neutral-800/50 text-neutral-500 hover:border-neutral-700"
              }`}
            >
              <Building2 size={32} />
              <span className="font-medium">Investor</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            {role ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-center gap-4">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                    toast.error("Google Login Failed");
                  }}
                  theme="filled_black"
                  shape="pill"
                />
                
                <div className="relative w-full flex items-center py-2">
                  <div className="flex-grow border-t border-neutral-800"></div>
                  <span className="flex-shrink-0 mx-4 text-neutral-600 text-xs">OR</span>
                  <div className="flex-grow border-t border-neutral-800"></div>
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full max-w-[240px] bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2.5 px-4 rounded-full transition-colors border border-neutral-700 text-sm"
                >
                  Bypass with Demo Account
                </button>
              </div>
            ) : (
              <div className="text-neutral-500 text-sm flex items-center gap-2">
                Choose a role to unlock login <ArrowRight size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
