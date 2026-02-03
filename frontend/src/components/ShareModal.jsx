import { useState } from "react";
import API from "../services/api";

export default function ShareModal({ file, onClose }) {
    const [email, setEmail] = useState("");
    const [permission, setPermission] = useState("view");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleShare = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await API.post(
                `/files/share/${file.id}`,
                { email, permission },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setMessage("Shared successfully!");
            setEmail("");
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error(err);
            setMessage("Failed to share.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-2">Share "{file.name}"</h2>
                <p className="text-slate-400 text-sm mb-6">
                    Grant access to another user via their email address.
                </p>

                <form onSubmit={handleShare} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                            User Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                            placeholder="friend@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                            Permission
                        </label>
                        <div className="relative">
                            <select
                                value={permission}
                                onChange={(e) => setPermission(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none cursor-pointer font-medium"
                            >
                                <option value="view" className="bg-[#1a1a1a] text-white py-2">Can View</option>
                                <option value="edit" className="bg-[#1a1a1a] text-white py-2">Can Edit</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`text-sm font-bold ${message.includes("success") ? "text-green-400" : "text-red-400"
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-black rounded-xl font-bold transition disabled:opacity-50"
                        >
                            {loading ? "Sharing..." : "Share Access"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
