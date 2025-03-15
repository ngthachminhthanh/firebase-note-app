import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signInWithGoogle, logout } from "./components/Auth";
import Notes from "./components/Notes";

function App() {
  const [user] = useAuthState(auth);

  // console.log(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-3xl font-bold text-white">Ứng dụng Ghi chú</h1>
        </div>

        <div className="p-8">
          {user ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full border-2 border-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  Đăng xuất
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <Notes user={user} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-indigo-500 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Vui lòng đăng nhập để sử dụng ứng dụng
              </h2>
              <button
                onClick={signInWithGoogle}
                className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"
                  />
                </svg>
                Đăng nhập với Google
              </button>
            </div>
          )}
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} - Ứng dụng Ghi chú
        </div>
      </div>
    </div>
  );
}

export default App;
