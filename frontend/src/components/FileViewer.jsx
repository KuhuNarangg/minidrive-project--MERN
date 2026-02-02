import { useState, useEffect } from "react";
import API from "../services/api";

export default function FileViewer({ file, onClose, canEdit }) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editableContent, setEditableContent] = useState("");
    const [error, setError] = useState(null);

    const isImage = file.type.startsWith("image/");
    const isText = file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".js") || file.name.endsWith(".json");
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    const fileUrl = `http://localhost:4001/uploads/${file.name}`; // Direct access if static serving matches filename. 
    // Wait, backend serves uploads via /uploads but filename in DB is "timestamp-name". 
    // Frontend mapping in Dashboard uses file.originalName for display, but we need the actual filename for URL.
    // Dashboard mapping: id: file._id, name: file.originalName ...
    // We need to pass the actual stored filename or fetch it. 
    // Let's assume we need to update Dashboard to pass 'filename' (the stored one) too.

    // Actually, let's fix the Dashboard mapping first to ensure we have the stored filename.
    // But for now, let's assume we'll fix it.

    useEffect(() => {
        if (isText) {
            fetchContent();
        } else {
            setLoading(false);
        }
    }, [file]);

    const fetchContent = async () => {
        try {
            // We can fetch via the static URL if public, or via an auth'd API endpoint if private.
            // Currently /uploads is static public in index.js: app.use("/uploads", express.static(...))
            // So fetch should work.
            // Ideally should be authenticated but for now let's use the static path.
            // We need the ACTUAL filename from the backend response.
            // "filename" in DB is like "17384...-test.txt".

            const res = await fetch(`http://localhost:4001/uploads/${file.storedFilename}`);
            if (!res.ok) throw new Error("Failed to load content");
            const text = await res.text();
            setContent(text);
            setEditableContent(text);
        } catch (err) {
            setError("Could not load file content.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.put(`/files/${file.id}/content`, { content: editableContent }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setContent(editableContent);
            setEditMode(false);
            alert("Saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-lg font-bold text-white truncate px-2">{file.name}</h2>
                    <div className="flex gap-2">
                        {isText && canEdit && !editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded-lg text-sm font-bold transition"
                            >
                                Edit
                            </button>
                        )}
                        {editMode && (
                            <>
                                <button
                                    onClick={() => setEditMode(false)}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 rounded-lg text-sm font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-3 py-1.5 bg-green-500 text-black hover:bg-green-400 rounded-lg text-sm font-bold transition"
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-[#0a0a0a] relative flex items-center justify-center">
                    {loading && <div className="text-sky-500 animate-pulse">Loading...</div>}

                    {!loading && error && <div className="text-red-400">{error}</div>}

                    {!loading && !error && (
                        <>
                            {isImage && (
                                <img
                                    src={`http://localhost:4001/uploads/${file.storedFilename}`}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                />
                            )}

                            {isText && (
                                editMode ? (
                                    <textarea
                                        className="w-full h-full bg-[#0a0a0a] text-slate-200 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                                        value={editableContent}
                                        onChange={(e) => setEditableContent(e.target.value)}
                                    />
                                ) : (
                                    <pre className="w-full h-full p-6 text-slate-300 font-mono text-sm overflow-auto whitespace-pre-wrap">
                                        {content}
                                    </pre>
                                )
                            )}

                            {isPDF && (
                                <iframe
                                    src={`http://localhost:4001/uploads/${file.storedFilename}`}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            )}

                            {!isImage && !isText && !isPDF && (
                                <div className="text-center text-slate-500">
                                    <div className="text-4xl mb-2">📄</div>
                                    <p>Preview not available for this file type.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
