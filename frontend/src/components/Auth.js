import { 
  GoogleAuthProvider, 
  // FacebookAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Luôn hiển thị hộp thoại chọn tài khoản
});

// const facebookProvider = new FacebookAuthProvider();
// facebookProvider.setCustomParameters({
//   prompt: 'select_account', 
// });

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({
  prompt: 'select_account', 
});

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      if (email) {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        alert(`Email này (${email}) đã được đăng ký với phương thức ${methods.join(', ')}. Vui lòng đăng nhập bằng phương thức đó trước.`);
      }
    } else {
      console.error("Lỗi đăng nhập Google:", error);
    }
  }
};

// export const signInWithFacebook = async () => {
//   try {
//     await signInWithPopup(auth, facebookProvider);
//   } catch (error) {
//     if (error.code === "auth/account-exists-with-different-credential") {
//       const email = error.customData?.email;
//       if (email) {
//         const methods = await fetchSignInMethodsForEmail(auth, email);
//         alert(`Email này (${email}) đã được đăng ký với phương thức ${methods.join(', ')}. Vui lòng đăng nhập bằng phương thức đó trước.`);
//       }
//     } else {
//       console.error("Lỗi đăng nhập Google:", error);
//     }
//   }
// };

export const signInWithGithub = async () => {
  try {
    await signInWithPopup(auth, githubProvider);
  } catch (error) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      if (email) {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        alert(`Email này (${email}) đã được đăng ký với phương thức ${methods.join(', ')}. Vui lòng đăng nhập bằng phương thức đó trước.`);
      }
    } else {
      console.error("Lỗi đăng nhập GitHub:", error);
    }
  }
};

export const logout = async () => {
  await signOut(auth);
};