import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import FileViewer from "../components/FileViewer";

export default function AdminDashboard() {
    const [files, setFiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("files"); // "files" | "users"
    const [fileToView, setFileToView] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewingUserFiles, setViewingUserFiles] = useState(null); // { id, email } or null

    const token = localStorage.getItem("token");
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /* ================= DATA FETCHING ================= */
    const fetchAllFiles = async () => {
        if (!token) return;
        try {
            const res = await API.get("/files/admin/all", { headers: { Authorization: `Bearer ${token}` } });
            const mapped = res.data.map((file) => ({
                id: file._id,
                name: file.originalName,
                storedFilename: file.filename,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.mimetype,
                date: new Date(file.createdAt).toLocaleDateString(),
                owner: file.owner?.email || "Unknown",
            }));
            setFiles(mapped);
            setViewingUserFiles(null);
        } catch (err) {
            console.error("Failed to fetch admin files", err);
        }
    };

    const fetchUserFiles = async (targetUser) => {
        if (!token) return;
        try {
            const res = await API.get(`/files/admin/users/${targetUser._id}`, { headers: { Authorization: `Bearer ${token}` } });
            const mapped = res.data.map((file) => ({
                id: file._id,
                name: file.originalName,
                storedFilename: file.filename,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.mimetype,
                date: new Date(file.createdAt).toLocaleDateString(),
                owner: file.owner?.email || targetUser.email,
            }));
            setFiles(mapped);
            setViewingUserFiles({ id: targetUser._id, email: targetUser.email });
            setActiveTab("files");
        } catch (err) {
            console.error("Failed to fetch user files", err);
            alert("Failed to load files for this user.");
        }
    };

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await API.get("/auth/users", { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        if (activeTab === "files" && !viewingUserFiles) {
            fetchAllFiles();
        } else if (activeTab === "users") {
            fetchUsers();
        }
    }, [token, activeTab]);

    /* ================= ACTIONS ================= */
    const handleDeleteFile = async (id) => {
        if (!window.confirm("ADMIN DELETE: Irreversible action. Confirm?")) return;
        try {
            await API.delete(`/files/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setFiles(prev => prev.filter((f) => f.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete file. Check console for details.");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("DELETE USER: This will remove the user account. Confirm?")) return;
        try {
            await API.delete(`/auth/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.filter((u) => u._id !== id));
        } catch (err) {
            alert("Failed to delete user.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    /* ================= SEARCH FILTERING ================= */
    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (mimeType) => {
        if (!mimeType) return '📁';
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType === 'application/pdf') return '📄';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        return '📁';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 flex font-sans">

            {fileToView && (
                <div className="fixed inset-0 z-50">
                    <FileViewer
                        file={fileToView}
                        onClose={() => setFileToView(null)}
                        canEdit={true}
                    />
                </div>
            )}

            {/* --- Sidebar --- */}
            <aside className="hidden lg:flex w-64 border-r border-white/5 flex-col p-6 space-y-8 h-screen sticky top-0">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-6 bg-red-600 rounded flex items-center justify-center">
                        <div className="h-3 w-3 bg-black rounded-sm" />
                    </div>
                    <span className="font-bold tracking-tighter text-white uppercase flex flex-col">
                        <span>MiniDrive</span>
                        <span className="text-red-500 text-[10px] -mt-1 font-black">Admin Panel</span>
                    </span>
                </div>

                <nav className="space-y-1">
                    <button
                        onClick={() => { setActiveTab("files"); setViewingUserFiles(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === 'files' && !viewingUserFiles ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        All Files
                    </button>
                    <button
                        onClick={() => { setActiveTab("users"); setViewingUserFiles(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === 'users' ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Users
                    </button>
                    <div className="h-8"></div>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-sky-500/10 hover:text-sky-400 transition border border-transparent hover:border-sky-500/20"
                        onClick={() => navigate('/dashboard')}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        User Dashboard
                    </button>
                </nav>

                <div className="mt-auto">
                    <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg">
                                {user?.email?.[0].toUpperCase() || "A"}
                            </div>
                            <div className="text-[10px]">
                                <p className="text-white font-black max-w-[80px] truncate uppercase tracking-tighter" title={user?.email}>{user?.email?.split('@')[0] || "Admin"}</p>
                                <p className="text-red-500 font-bold tracking-widest uppercase">System Admin</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition" title="Logout">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 p-8 overflow-y-auto h-screen relative">

                {/* Search Bar Floating at Top */}
                <div className="sticky top-0 z-30 flex items-center gap-4 mb-8 bg-[#050505]/80 backdrop-blur-md py-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-500 group-focus-within:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder={activeTab === 'files' ? "Search files or owners..." : "Search users by email..."}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition placeholder:text-slate-600 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            {viewingUserFiles ? `Files for ${viewingUserFiles.email}` : activeTab === "files" ? "Global Files" : "User Management"}
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                            {viewingUserFiles ? "Viewing restricted user scope" : activeTab === "files" ? "Monitoring all uploaded system assets" : "Managing user access and roles"}
                        </p>
                    </div>
                    {viewingUserFiles && (
                        <button
                            onClick={fetchAllFiles}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition"
                        >
                            Back to All Files
                        </button>
                    )}
                </header>

                <div className="flex flex-col space-y-1.5">
                    {/* LIST HEADER */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5 mb-2">
                        {activeTab === "files" ? (
                            <>
                                <div className="col-span-1">MIME</div>
                                <div className="col-span-4">Asset Name</div>
                                <div className="col-span-3">Owner Identity</div>
                                <div className="col-span-2">Payload Size</div>
                                <div className="col-span-2 text-right">Operations</div>
                            </>
                        ) : (
                            <>
                                <div className="col-span-1">Level</div>
                                <div className="col-span-5">Identity (Email)</div>
                                <div className="col-span-2 text-center">Status</div>
                                <div className="col-span-4 text-right">Operations</div>
                            </>
                        )}
                    </div>

                    {/* CONTENT LIST */}
                    {activeTab === "files" ? (
                        filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] border border-transparent hover:border-white/5 rounded-2xl items-center hover:bg-white/[0.04] transition-all cursor-pointer"
                                    onClick={() => setFileToView(file)}
                                >
                                    <div className="col-span-1 text-2xl drop-shadow-lg">{getFileIcon(file.type)}</div>
                                    <div className="col-span-4 truncate text-sm font-bold text-white tracking-tight" title={file.name}>{file.name}</div>
                                    <div className="col-span-3 text-xs font-medium text-slate-400 group-hover:text-red-400/80 transition-colors truncate" title={file.owner}>{file.owner}</div>
                                    <div className="col-span-2 text-xs font-mono text-slate-500 group-hover:text-slate-300">{file.size}</div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button
                                            title="Delete permanently"
                                            className="px-4 py-1.5 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-[10px] font-black transition-all"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                                        >
                                            DEL
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center font-bold text-slate-600 uppercase tracking-widest text-xs">No assets found matching query</div>
                        )
                    ) : (
                        filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <div key={u._id} className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.02] border border-transparent hover:border-white/5 rounded-2xl items-center hover:bg-white/[0.04] transition-all">
                                    <div className="col-span-1">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black ${u.role === 'admin' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400 border border-white/5'}`}>
                                            {u.role === 'admin' ? 'ADM' : 'USR'}
                                        </div>
                                    </div>
                                    <div className="col-span-5 truncate text-sm font-bold text-white tracking-tight">{u.email}</div>
                                    <div className="col-span-2 text-center">
                                        <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-500 font-black tracking-widest uppercase">Active</span>
                                    </div>
                                    <div className="col-span-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => fetchUserFiles(u)}
                                            className="px-4 py-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white border border-sky-500/20 rounded-xl text-[10px] font-black transition-all"
                                        >
                                            FILES
                                        </button>
                                        <button
                                            title="Remove access"
                                            disabled={u.role === 'admin'}
                                            className="px-4 py-1.5 bg-red-600/5 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-[10px] font-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-500"
                                            onClick={() => handleDeleteUser(u._id)}
                                        >
                                            REMOVE
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center font-bold text-slate-600 uppercase tracking-widest text-xs">No users found matching query</div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}
