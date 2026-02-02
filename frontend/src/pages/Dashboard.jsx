
import { useEffect, useState } from "react";
import API from "../services/api";
import ShareModal from "../components/ShareModal";
import FileViewer from "../components/FileViewer";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [activeTab, setActiveTab] = useState("My Files"); // "My Files" | "Shared" | "Recent"
  const [fileToShare, setFileToShare] = useState(null);
  const [fileToView, setFileToView] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= FETCH FILES ================= */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const endpoint = activeTab === "Shared"
          ? "/files/shared"
          : "/files";

        const res = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((file) => {
          let reqPermission = "edit";
          if (activeTab === "Shared" && user) {
            const shareInfo = file.sharedWith?.find(s => s.email === user.email.toLowerCase());
            reqPermission = shareInfo ? shareInfo.permission : "view";
          }

          return {
            id: file._id,
            name: file.originalName,
            storedFilename: file.filename,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            type: file.mimetype,
            date: new Date(file.createdAt).toLocaleDateString(),
            owner: file.owner?.email,
            permission: reqPermission
          };
        });

        setFiles(mapped);
      } catch (err) {
        console.error("Failed to fetch files", err);
        setFiles([]);
      }
    };

    if (token) fetchFiles();
  }, [token, activeTab, user]);

  /* ================= UPLOAD ================= */
  const handleFileSelect = (e) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await API.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newFile = {
        id: res.data._id,
        name: res.data.originalName,
        storedFilename: res.data.filename,
        size: (res.data.size / 1024 / 1024).toFixed(2) + " MB",
        type: res.data.mimetype,
        date: "Just now",
        owner: "Me",
        permission: "edit"
      };

      if (activeTab === "My Files") setFiles([newFile, ...files]);
      setSelectedFile(null);
      document.getElementById('file-upload').value = null;
    } catch (err) {
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("PERMANENT DELETE: Are you sure?")) return;
    try {
      await API.delete(`/files/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setFiles(prev => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return '📁';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📁';
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const navItems = [
    { name: 'My Files', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
    { name: 'Shared', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { name: 'Recent', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex font-sans selection:bg-sky-500/30">

      {fileToShare && <ShareModal file={fileToShare} onClose={() => setFileToShare(null)} />}
      {fileToView && (
        <FileViewer
          file={fileToView}
          onClose={() => setFileToView(null)}
          canEdit={fileToView.permission === "edit"}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col p-8 space-y-10 h-screen sticky top-0 bg-[#080808]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <div className="h-5 w-5 bg-black rounded rotate-45" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">MiniDrive</span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.name
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] translate-x-1'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 hover:translate-x-1'
                }`}
            >
              <span className={`${activeTab === item.name ? 'text-sky-400' : 'text-slate-600'}`}>
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </nav>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-600/5 hover:bg-red-600/10 text-red-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-red-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Admin Portal
            </button>
          </div>
        )}

        <div className="mt-auto space-y-6">
          <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl group transition-all hover:bg-white/[0.05]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">System Usage</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full mb-3 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full group-hover:w-1/2 transition-all duration-1000" />
            </div>
            <p className="text-[11px] text-slate-400 font-bold">1.2 GB <span className="text-slate-600">of 10 GB (12%)</span></p>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-xs font-black text-sky-400 border border-white/5">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="text-[11px]">
                <p className="text-white font-black truncate max-w-[100px] uppercase tracking-tighter" title={user?.email}>{user?.email?.split('@')[0] || "User"}</p>
                <p className="text-slate-500 font-bold uppercase tracking-widest">{user?.role || "Member"}</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} className="p-2 text-slate-500 hover:text-red-400 transition" title="Logout">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto h-screen scrollbar-hide">

        {/* TOP BAR: Search & Upload */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-xl py-4 -mt-4">
          <div className="flex-1 relative group w-full">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-600 group-focus-within:text-sky-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search your library..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-sky-500/30 focus:bg-white/[0.05] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input id="file-upload" type="file" className="hidden" onChange={handleFileSelect} />
            <label
              htmlFor="file-upload"
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer border ${selectedFile ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/10'}`}
            >
              {selectedFile ? (
                <span className="max-w-[120px] truncate">{selectedFile.name}</span>
              ) : (
                <>SELECT FILE <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></>
              )}
            </label>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-black rounded-2xl text-sm font-black uppercase tracking-tighter shadow-lg shadow-sky-500/20 active:scale-95 transition disabled:opacity-50"
              >
                {loading ? "..." : "UPLOAD"}
              </button>
            )}
          </div>
        </div>

        {uploadError && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold uppercase tracking-widest">{uploadError}</div>}

        <section className="animate-in fade-in duration-700">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{activeTab}</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 ml-1">Archive {files.length} Assets</p>
            </div>

            <div className="bg-white/[0.03] p-1.5 rounded-2xl flex border border-white/5">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
              <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center text-3xl mb-6 opacity-30">📂</div>
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No assets available in this scope</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group relative p-6 bg-white/[0.03] border border-white/5 rounded-[32px] hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => setFileToView(file)}
                >
                  <div className="h-16 w-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:bg-sky-500/10 transition-all duration-500">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-white font-black text-sm tracking-tight truncate group-hover:text-sky-400 transition-colors" title={file.name}>{file.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>{file.size}</span>
                      <span className="h-1 w-1 bg-slate-700 rounded-full" />
                      <span>{file.date}</span>
                    </div>
                    {file.owner && <div className="pt-2 text-[10px] text-slate-600 font-bold uppercase truncate">Source: {file.owner}</div>}
                  </div>

                  <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    {activeTab === "My Files" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setFileToShare(file); }} className="h-9 w-9 bg-white/10 hover:bg-sky-500 hover:text-black rounded-xl flex items-center justify-center text-slate-300 transition-all shadow-xl">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="h-9 w-9 bg-white/10 hover:bg-red-600 hover:text-white rounded-xl flex items-center justify-center text-slate-300 transition-all shadow-xl">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => setFileToView(file)}
                >
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:bg-sky-500/10 transition-colors">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-black text-sm truncate group-hover:text-sky-400 transition-colors">{file.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      <span>{file.size}</span>
                      <span className="h-1 w-1 bg-slate-800 rounded-full" />
                      <span>{file.date}</span>
                      {file.owner && <span className="text-slate-700 ml-2">@{file.owner.split('@')[0]}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === "My Files" && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setFileToShare(file); }} className="p-2 hover:bg-sky-500/10 text-slate-500 hover:text-sky-400 transition-colors rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}