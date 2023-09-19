import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Authentication/Register';
import VerifyEmail from './components/Authentication/VerifyEmail';
import Login from './components/Authentication/Login';
import { useState, useEffect } from 'react';
import { AuthProvider } from './components/Authentication/AuthContext';
import { auth } from './components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Taskpage from './components/Taskpage';
import Forgotpassword from './components/Forgotpassword';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [timeActive, setTimeActive] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <Router>
      <AuthProvider value={{ currentUser, timeActive, setTimeActive }}>
        <Routes>
          <Route
            path="/"
            element={
              currentUser?.emailVerified ? (
                <Navigate to="/taskpage" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          
          <Route
            path="/taskpage"
            element={
              currentUser?.emailVerified ? (
                <Taskpage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
