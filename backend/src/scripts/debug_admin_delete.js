const axios = require("axios");

async function debugAdminDelete() {
    const token = ""; // Insert admin token here or fetch from login
    const fileId = ""; // Insert target file id here

    if (!token || !fileId) {
        console.log("Please provide token and fileId");

        // Let's try to get them automatically
        try {
            const loginRes = await axios.post("http://localhost:4001/api/auth/login", {
                email: "admin@minidrive.com",
                password: "adminpassword"
            });
            const adminToken = loginRes.data.token;
            console.log("Admin logged in.");

            const filesRes = await axios.get("http://localhost:4001/api/files/admin/all", {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            if (filesRes.data.length === 0) {
                console.log("No files to delete.");
                return;
            }

            const targetFile = filesRes.data[0];
            console.log(`Attempting to delete file: ${targetFile.originalName} (${targetFile._id})`);

            const delRes = await axios.delete(`http://localhost:4001/api/files/admin/${targetFile._id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            console.log("Delete response:", delRes.data);

            const verifyRes = await axios.get("http://localhost:4001/api/files/admin/all", {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const stillExists = verifyRes.data.find(f => f._id === targetFile._id);
            if (!stillExists) {
                console.log("SUCCESS: File deleted and verified gone.");
            } else {
                console.log("FAILURE: File still exists in the system.");
            }

        } catch (err) {
            console.error("Debug failed:", err.response?.data || err.message);
        }
    }
}

debugAdminDelete();
