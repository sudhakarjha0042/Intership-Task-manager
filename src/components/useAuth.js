import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged from Firebase Authentication
import { auth } from "./firebase"; // Make sure to import your Firebase authentication instance

function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return { user };
}

export default useAuth;
