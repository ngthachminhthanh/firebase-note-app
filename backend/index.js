require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Khởi tạo Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Bật CORS
app.use(express.json()); // Cho phép gửi JSON

// 🔹 API: Lấy danh sách ghi chú theo UID người dùng
app.get("/notes/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "Thiếu UID" });

    const snapshot = await db.collection("notes").where("uid", "==", uid).orderBy("createdAt", "desc").get();
    const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(notes);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi lấy ghi chú" });
  }
});

// 🔹 API: Thêm ghi chú
app.post("/notes", async (req, res) => {
  try {
    const { text, uid } = req.body;
    if (!text || !uid) return res.status(400).json({ error: "Thiếu nội dung hoặc UID" });

    const newNote = {
      text,
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("notes").add(newNote);
    res.json({ id: docRef.id, ...newNote });
  } catch (error) {
    console.error("🔥 Lỗi khi thêm ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi thêm ghi chú" });
  }
});

// 🔹 API: Xóa ghi chú
app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("notes").doc(id).delete();
    res.json({ message: "Xóa ghi chú thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi xóa ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi xóa ghi chú" });
  }
});

app.listen(PORT, () => console.log(`🔥 Server chạy tại http://localhost:${PORT}`));
