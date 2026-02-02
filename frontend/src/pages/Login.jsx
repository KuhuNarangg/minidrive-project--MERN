import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-slate-200 relative">

      {/* Mobile Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-xs uppercase tracking-widest text-slate-500 hover:text-white transition lg:hidden"
      >
        ← Home
      </Link>

      {/* --- Left Side: Form --- */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="mb-10">
          {/* Brand / Home */}
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="h-6 w-6 bg-sky-500 rounded flex items-center justify-center group-hover:rotate-45 transition-transform">
              <div className="h-3 w-3 bg-black rounded-sm" />
            </div>
            <span className="font-bold tracking-tighter text-white">
              MiniDrive
            </span>
          </Link>

          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Enter your credentials to access your cloud.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.07] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-4 mt-4 bg-white text-black rounded-2xl font-bold hover:scale-[1.02] transition active:scale-95 shadow-xl shadow-white/5">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-sm text-slate-500">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-sky-400 font-bold hover:underline underline-offset-4"
          >
            Create one for free
          </Link>
        </p>
      </div>

      {/* --- Right Side: Visual Polish --- */}
      <div className="hidden lg:flex flex-1 relative bg-[#0a0a0a] border-l border-white/5 items-center justify-center overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 text-center">
          <div className="inline-block p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <svg
              className="w-12 h-12 text-sky-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Secured by AES-256
          </h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            Your data is encrypted before it even leaves your browser.
          </p>
        </div>

        {/* Floating Card */}
        <div className="absolute bottom-12 right-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500/50" />
            <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
            <div className="h-2 w-2 rounded-full bg-green-500/50" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-1 w-32 bg-white/10 rounded" />
            <div className="h-1 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}