import React, {useContext} from 'react'
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "../firebase";// Import onAuthStateChanged from Firebase Authentication

const AuthContext = React.createContext()

export function AuthProvider({children, value}) {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
    
  )
}

export function useAuthValue(){
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return { user } , useContext(AuthContext);
}
