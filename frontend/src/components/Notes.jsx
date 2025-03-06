import { useState, useEffect } from "react";
import axios from "axios";

function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.uid) {
      axios
        .get(`http://localhost:5000/notes/${user.uid}`)
        .then((res) => setNotes(res.data))
        .catch((err) => {
          console.error("🔥 Lỗi khi tải ghi chú:", err);
          setError("Lỗi tải ghi chú. Vui lòng thử lại!");
        });
    }
  }, [user]);

  const addNote = async () => {
    if (!text.trim()) {
      setError("Ghi chú không được để trống!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newNote = { text, uid: user.uid };
      const res = await axios.post("http://localhost:5000/notes", newNote);

      setNotes([res.data, ...notes]); // Thêm ghi chú vào danh sách
      setText("");
    } catch (err) {
      console.error("🔥 Lỗi khi thêm ghi chú:", err);
      setError("Lỗi khi thêm ghi chú!");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/notes/${id}`);
      setNotes(notes.filter((note) => note.id !== id)); // Xóa khỏi danh sách
    } catch (err) {
      console.error("🔥 Lỗi khi xóa ghi chú:", err);
      setError("Lỗi khi xóa ghi chú!");
    }
  };

  return (
    <div>
      <h2>Ghi chú của bạn</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập ghi chú..."
        disabled={loading}
      />
      <button onClick={addNote} disabled={loading}>
        {loading ? "Đang thêm..." : "Thêm"}
      </button>

      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <p>{note.text}</p>
            <button onClick={() => deleteNote(note.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
