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

app.use(cors());
app.use(express.json());

// Middleware xác thực token từ client
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Thiếu token xác thực" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token không hợp lệ" });
  }
}

// API: Lấy danh sách ghi chú của user
app.get("/notes/:uid", authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Không có quyền truy cập" });
    }

    const userDoc = await db.collection("notes").doc(uid).get();
    if (!userDoc.exists) {
      return res.json([]);
    }

    res.json(userDoc.data().notes || []);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi lấy ghi chú" });
  }
});

// API: Thêm ghi chú
app.post("/notes", authenticateToken, async (req, res) => {
  try {
    const { text, uid } = req.body;
    if (!text || !uid) return res.status(400).json({ error: "Thiếu dữ liệu" });

    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Không có quyền thêm ghi chú" });
    }

    const userRef = db.collection("notes").doc(uid);
    const userDoc = await userRef.get();

    // Tạo timestamp trước
    const createdAt = new Date();

    const newNote = {
      id: Date.now().toString(),
      text,
      createdAt,
    };

    if (userDoc.exists) {
      await userRef.update({
        notes: admin.firestore.FieldValue.arrayUnion(newNote),
      });
    } else {
      await userRef.set({ notes: [newNote] });
    }

    res.json(newNote);
  } catch (error) {
    console.error("🔥 Lỗi khi thêm ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi thêm ghi chú" });
  }
});

// API: Xóa ghi chú
app.delete("/notes/:uid/:noteId", authenticateToken, async (req, res) => {
  try {
    const { uid, noteId } = req.params;

    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Không có quyền xóa ghi chú" });
    }

    const userRef = db.collection("notes").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    const updatedNotes = userDoc.data().notes.filter((note) => note.id !== noteId);
    await userRef.update({ notes: updatedNotes });

    res.json({ message: "Xóa ghi chú thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi xóa ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi xóa ghi chú" });
  }
});

// API: Cập nhật ghi chú
app.put("/notes/:uid/:noteId", authenticateToken, async (req, res) => {
  try {
    const { uid, noteId } = req.params;
    const { newText } = req.body;

    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Không có quyền cập nhật ghi chú" });
    }

    const userRef = db.collection("notes").doc(uid);
    const userDoc = await userRef.get();

    const updatedNotes = userDoc.data().notes.map((note) =>
      note.id === noteId ? { ...note, text: newText } : note
    );

    await userRef.update({ notes: updatedNotes });

    res.json({ message: "Cập nhật ghi chú thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật ghi chú:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật ghi chú" });
  }
});

app.listen(PORT, () => console.log(`🔥 Server chạy tại http://localhost:${PORT}`));
