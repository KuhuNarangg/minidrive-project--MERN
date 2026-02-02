import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/signup", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError("Signup failed. Try a different email.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-slate-200">
      
      {/* --- Left Side: Content & Form --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-2 mb-8 group w-fit">
             <div className="h-6 w-6 bg-sky-500 rounded flex items-center justify-center group-hover:rotate-45 transition-transform">
                <div className="h-3 w-3 bg-black rounded-sm" />
             </div>
             <span className="font-bold tracking-tighter text-white">MiniDrive</span>
          </Link>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Start Storing
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Join thousands of users managing files securely.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">Email Address</label>
            <input
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all"
              placeholder="you@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">Create Password</label>
            <input
              type="password"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-4 mt-4 bg-sky-500 text-black rounded-2xl font-bold hover:bg-sky-400 hover:scale-[1.02] transition active:scale-95 shadow-xl shadow-sky-500/10">
            Create Free Account
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400 font-bold hover:underline underline-offset-4 transition-all">
            Log in here
          </Link>
        </p>
      </div>

      {/* --- Right Side: The "Storage" Visual --- */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a0a] border-l border-white/5 items-center justify-center overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 w-[60%] space-y-4">
          {/* Mockup UI Elements */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-end mb-4">
               <div>
                 <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Cloud Capacity</p>
                 <p className="text-2xl font-bold text-white leading-none">10 GB Free</p>
               </div>
               <div className="text-sky-500 text-xs font-bold">85% Available</div>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
               <div className="h-full w-[15%] bg-sky-500 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
               <p className="text-[9px] uppercase tracking-tighter text-slate-500">Transfer Speed</p>
               <p className="text-lg font-bold text-white">∞ MB/s</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
               <p className="text-[9px] uppercase tracking-tighter text-slate-500">File Limit</p>
               <p className="text-lg font-bold text-white">Unlimited</p>
            </div>
          </div>
        </div>

        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>
    </div>
  );
}