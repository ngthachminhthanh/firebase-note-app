import { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletePopup, setDeletePopup] = useState({ show: false, noteId: null });
  const [editPopup, setEditPopup] = useState({ show: false, note: null });
  const [editText, setEditText] = useState("");

  // Hàm lấy token Firebase
  const getToken = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    return currentUser ? await currentUser.getIdToken() : null;
  };

  // Lấy danh sách ghi chú
  useEffect(() => {
    if (!user?.uid) return;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await axios.get(`http://localhost:5000/notes/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data);
        setError("");
      } catch (err) {
        console.error("🔥 Lỗi khi tải ghi chú:", err);
        setError("Lỗi tải ghi chú. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  // Thêm ghi chú
  const addNote = async () => {
    if (!text.trim()) {
      setError("Ghi chú không được để trống!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const newNote = { text, uid: user.uid };

      const res = await axios.post("http://localhost:5000/notes", newNote, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((prevNotes) => [res.data, ...prevNotes]);
      setText("");
    } catch (err) {
      console.error("🔥 Lỗi khi thêm ghi chú:", err);
      setError("Lỗi khi thêm ghi chú!");
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận xóa ghi chú
  const confirmDelete = (noteId) => {
    setDeletePopup({ show: true, noteId });
  };

  // Xóa ghi chú
  const deleteNote = async () => {
    try {
      const token = await getToken();
      await axios.delete(
        `http://localhost:5000/notes/${user.uid}/${deletePopup.noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== deletePopup.noteId)
      );
      setDeletePopup({ show: false, noteId: null });
    } catch (err) {
      console.error("🔥 Lỗi khi xóa ghi chú:", err);
      setError("Lỗi khi xóa ghi chú!");
    }
  };

  // Mở popup sửa ghi chú
  const openEditPopup = (note) => {
    setEditPopup({ show: true, note });
    setEditText(note.text);
  };

  // Cập nhật ghi chú
  const updateNote = async () => {
    if (!editText.trim()) return;

    try {
      const token = await getToken();
      await axios.put(
        `http://localhost:5000/notes/${user.uid}/${editPopup.note.id}`,
        { newText: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editPopup.note.id ? { ...note, text: editText } : note
        )
      );
      setEditPopup({ show: false, note: null });
    } catch (err) {
      console.error("🔥 Lỗi khi cập nhật ghi chú:", err);
      setError("Lỗi khi cập nhật ghi chú!");
    }
  };

  // Đóng các popup
  const closePopups = () => {
    setDeletePopup({ show: false, noteId: null });
    setEditPopup({ show: false, note: null });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ghi chú của bạn</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="flex space-x-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập ghi chú..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          onKeyPress={(e) => e.key === "Enter" && addNote()}
        />
        <button
          onClick={addNote}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang thêm...
            </span>
          ) : (
            "Thêm"
          )}
        </button>
      </div>

      {loading && notes.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>Bạn chưa có ghi chú nào</p>
        </div>
      ) : (
        <ul className="space-y-4 mt-6">
          {notes.map((note) => (
            <li
              key={note.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <p className="text-gray-800 mb-3">{note.text}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditPopup(note)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Sửa
                </button>
                <button
                  onClick={() => confirmDelete(note.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Popup xác nhận xóa */}
      {deletePopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa ghi chú này không?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closePopups}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={deleteNote}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup sửa ghi chú */}
      {editPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sửa ghi chú
            </h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all mb-4 h-32 resize-none"
              placeholder="Nhập nội dung ghi chú..."
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closePopups}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={updateNote}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
