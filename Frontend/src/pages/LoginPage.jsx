import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Create an account</h2>
        <p className="text-gray-500 mb-6">Sign up with Google or use the form below</p>
        <button
          className="google-btn flex items-center justify-center gap-2 w-full bg-white border border-gray-300 rounded px-4 py-2 font-semibold text-gray-700 hover:shadow mb-4"
          onClick={handleGoogleSignIn}
          type="button"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" className="w-5 h-5" />
          <span>Sign up with Google</span>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fname" className="block font-semibold text-gray-700">First Name</label>
            <input id="fname" type="text" required value={form.fname} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="lname" className="block font-semibold text-gray-700">Last Name</label>
            <input id="lname" type="text" required value={form.lname} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="email" className="block font-semibold text-gray-700">Email</label>
            <input id="email" type="email" required value={form.email} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label htmlFor="password" className="block font-semibold text-gray-700">Password</label>
            <input id="password" type="password" required value={form.password} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" type="submit">Sign Up</button>
        </form>
        {status && <div className="mt-4 text-center text-red-500 font-semibold">{status}</div>}
      </div>
    </div>
  );
};

export default LoginPage; 