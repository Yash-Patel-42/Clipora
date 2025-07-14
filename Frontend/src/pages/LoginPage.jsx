import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Landing_Page/Navbar';

const LoginPage = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const [form, setForm] = useState({ fname: '', lname: '', email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/edit');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      setStatus('');
    } catch (error) {
      setStatus('❌ Google Sign-In failed.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo: just redirect
    setStatus('');
    navigate('/edit');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-background/90 text-foreground rounded-2xl shadow-xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold mb-2 text-center text-foreground">Sign in to Sniply</h2>
          <p className="text-gray-500 mb-6 text-center">Welcome back! Sign in to continue editing your videos.</p>
          <button
            className="flex items-center justify-center gap-2 w-full bg-white border border-blue-200 rounded-lg px-4 py-2 font-semibold text-blue-700 hover:shadow mb-4 transition"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-blue-100" />
            <span className="mx-3 text-blue-300 text-sm">or</span>
            <div className="flex-1 h-px bg-blue-100" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="fname" className="block font-semibold text-foreground">First Name</label>
                <input id="fname" type="text" required value={form.fname} onChange={handleChange} className="mt-1 w-full border border-blue-100 rounded px-3 py-2 bg-white text-blue-900" />
              </div>
              <div className="flex-1">
                <label htmlFor="lname" className="block font-semibold text-foreground">Last Name</label>
                <input id="lname" type="text" required value={form.lname} onChange={handleChange} className="mt-1 w-full border border-blue-100 rounded px-3 py-2 bg-white text-blue-900" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block font-semibold text-foreground">Email</label>
              <input id="email" type="email" required value={form.email} onChange={handleChange} className="mt-1 w-full border border-blue-100 rounded px-3 py-2 bg-white text-blue-900" />
            </div>
            <div>
              <label htmlFor="password" className="block font-semibold text-foreground">Password</label>
              <input id="password" type="password" required value={form.password} onChange={handleChange} className="mt-1 w-full border border-blue-100 rounded px-3 py-2 bg-white text-blue-900" />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition" type="submit">Sign In</button>
          </form>
          {status && <div className="mt-4 text-center text-red-500 font-semibold">{status}</div>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 