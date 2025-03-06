import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { signInWithGoogle, logout } from "./components/Auth";
import Notes from "./components/Notes";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="app">
      {user ? (
        <>
          <button onClick={logout}>Đăng xuất</button>
          <Notes user={user} />
        </>
      ) : (
        <button onClick={signInWithGoogle}>Đăng nhập với Google</button>
      )}
    </div>
  );
}

export default App;
