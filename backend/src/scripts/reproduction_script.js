const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:4001/api';

async function testConfig() {
    console.log("Testing API Health...");
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@minidrive.com', password: 'adminpassword' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        console.log("✅ Login successful");
        const token = loginData.token;

        // Create dummy file
        const filePath = path.join(__dirname, 'testfile.txt');
        fs.writeFileSync(filePath, 'Hello World');

        const formData = new FormData();
        const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
        formData.append('file', blob, 'testfile.txt');

        console.log("Uploading file...");
        const uploadRes = await fetch(`${API_URL}/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!uploadRes.ok) {
            const txt = await uploadRes.text();
            throw new Error(`Upload failed: ${uploadRes.status} ${txt}`);
        }
        const fileData = await uploadRes.json();
        console.log("✅ Upload successful", fileData._id);

        console.log("Sharing file...");
        const shareRes = await fetch(`${API_URL}/files/share/${fileData._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: 'recipient@example.com', permission: 'view' })
        });

        if (!shareRes.ok) {
            const txt = await shareRes.text();
            throw new Error(`Share failed: ${shareRes.status} ${txt}`);
        }
        const shareData = await shareRes.json();
        console.log("✅ Share successful", shareData);

        // Test Content Update
        console.log("Updating file content...");
        const updateRes = await fetch(`${API_URL}/files/${fileData._id}/content`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: "Updated Content Details" })
        });

        if (!updateRes.ok) {
            const txt = await updateRes.text();
            throw new Error(`Update failed: ${updateRes.status} ${txt}`);
        }
        console.log("✅ Update successful");

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (e) {
        console.error("❌ Link in chain failed:", e);
    }
}

testConfig();
