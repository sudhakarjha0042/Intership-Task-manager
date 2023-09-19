import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Authentication/forms.css';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordReset = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSuccessMessage('Password reset email sent. Check your inbox.');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <div className='center'>
      <div className='auth'>
        <h1>Forgot Password</h1>
        {error && <div className='auth__error'>{error}</div>}
        {successMessage && <div className='auth__success'>{successMessage}</div>}
        <input
          type='email'
          value={email}
          required
          placeholder='Enter your email'
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handlePasswordReset}>Reset Password</button>
        <p>
          Remember your password? <Link to='/login'>Log in</Link>
        </p>
        <p>
          Don't have an account? <Link to='/register'>Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
